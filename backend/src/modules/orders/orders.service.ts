import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import { CreateOrderDto } from './dto/orders.dto';
import { PaymentStatus, UserRole, VoucherStatus, DiscountType } from '../../common/enums';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private paymentsService: PaymentsService,
  ) {}

  async createOrder(currentUser: any, dto: CreateOrderDto) {
    const event = await this.prisma.event.findUnique({ where: { id: dto.eventId } });
    if (!event) {
      throw new NotFoundException('Event not found.');
    }

    const ticket = await this.prisma.ticketCategory.findUnique({
      where: { id: dto.ticketCategoryId },
    });
    if (!ticket || ticket.eventId !== event.id || ticket.status !== 'ACTIVE') {
      throw new BadRequestException('Invalid or inactive ticket category.');
    }

    if (ticket.sold >= ticket.quota) {
      throw new BadRequestException('Sorry, this ticket category is sold out.');
    }

    let subtotal = ticket.price;
    let discount = 0;
    let voucherId: string | undefined = undefined;

    if (dto.voucherCode) {
      const voucher = await this.prisma.voucher.findUnique({
        where: { code: dto.voucherCode.toUpperCase() },
      });
      if (voucher && voucher.status === VoucherStatus.ACTIVE && new Date(voucher.expiredDate) >= new Date() && voucher.usedCount < voucher.usageLimit) {
        voucherId = voucher.id;
        if (voucher.discountType === DiscountType.FIXED_AMOUNT) {
          discount = Math.min(subtotal, voucher.value);
        } else {
          discount = (subtotal * voucher.value) / 100;
        }
      }
    }

    const total = Math.max(0, subtotal - discount);
    const invoice = await this.generateInvoiceNumber();

    const order = await this.prisma.order.create({
      data: {
        invoice,
        userId: currentUser.id,
        eventId: event.id,
        ticketCategoryId: ticket.id,
        voucherId,
        subtotal,
        discount,
        total,
        status: PaymentStatus.PENDING,
        paymentMethod: 'Midtrans Snap',
      },
      include: {
        user: true,
        event: true,
        ticketCategory: true,
      },
    });

    if (voucherId) {
      await this.prisma.voucher.update({
        where: { id: voucherId },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Call PaymentsService to generate Snap Token
    const snapResponse = await this.paymentsService.createSnapTransaction({
      id: order.id,
      invoice: order.invoice,
      total: order.total,
      user: { name: dto.participantName || currentUser.name, email: dto.participantEmail || currentUser.email, phone: dto.participantPhone || currentUser.phone },
      event: { name: event.name },
    });

    const updatedOrder = await this.prisma.order.update({
      where: { id: order.id },
      data: {
        snapToken: snapResponse.snapToken,
        snapRedirectUrl: snapResponse.redirectUrl,
      },
      include: {
        event: true,
        ticketCategory: true,
        participant: true,
      },
    });

    return updatedOrder;
  }

  async findUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        event: true,
        ticketCategory: true,
        participant: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAdminOrOrganizerOrders(currentUser: { id: string; role: UserRole }, query?: { status?: PaymentStatus; eventId?: string }) {
    const where: any = {};
    if (currentUser.role === UserRole.ADMIN) {
      where.event = { organizerId: currentUser.id };
    }
    if (query?.status) {
      where.status = query.status;
    }
    if (query?.eventId) {
      where.eventId = query.eventId;
    }

    return this.prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        event: { select: { id: true, name: true, date: true, location: true } },
        ticketCategory: { select: { id: true, name: true, price: true } },
        participant: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, currentUser?: { id: string; role: UserRole }) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        event: true,
        ticketCategory: true,
        participant: true,
        payments: true,
      },
    });
    if (!order) {
      throw new NotFoundException('Order not found.');
    }
    if (currentUser && currentUser.role === UserRole.USER && order.userId !== currentUser.id) {
      throw new ForbiddenException('You cannot access orders of other participants.');
    }
    if (currentUser && currentUser.role === UserRole.ADMIN && order.event.organizerId !== currentUser.id) {
      throw new ForbiddenException('This order belongs to an event managed by another admin.');
    }
    return order;
  }

  async removeOrder(id: string, currentUser: { id: string; role: UserRole }) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { event: true },
    });
    if (!order) {
      throw new NotFoundException('Order not found.');
    }
    if (currentUser.role === UserRole.ADMIN && order.event.organizerId !== currentUser.id) {
      throw new ForbiddenException('You cannot delete an order for an event you do not manage.');
    }
    return this.prisma.order.delete({ where: { id } });
  }

  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}`;

    const lastOrder = await this.prisma.order.findFirst({
      where: { invoice: { startsWith: prefix } },
      orderBy: { invoice: 'desc' },
    });

    let seq = 1;
    if (lastOrder && lastOrder.invoice.length >= 11) {
      const numPart = lastOrder.invoice.split('-')[1]?.substring(4) || lastOrder.invoice.substring(lastOrder.invoice.length - 4);
      const parsed = parseInt(numPart, 10);
      if (!isNaN(parsed)) {
        seq = parsed + 1;
      }
    }

    return `${prefix}${seq.toString().padStart(4, '0')}`;
  }
}
