import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus, RegistrationStatus } from '../../common/enums';
import * as midtransClient from 'midtrans-client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private snap: any;
  private isSimulation: boolean;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY') || 'SB-Mid-server-TEST';
    const clientKey = this.configService.get<string>('MIDTRANS_CLIENT_KEY') || 'SB-Mid-client-TEST';
    const isProduction = this.configService.get<string>('MIDTRANS_IS_PRODUCTION') === 'true';
    this.isSimulation = this.configService.get<string>('MIDTRANS_IS_SIMULATION') !== 'false'; // Default to true in test

    try {
      this.snap = new midtransClient.Snap({
        isProduction,
        serverKey,
        clientKey,
      });
    } catch (e) {
      this.logger.error('Failed to initialize midtrans SDK:', e);
    }
  }

  async createSnapTransaction(order: {
    id: string;
    invoice: string;
    total: number;
    user: { name: string; email: string; phone?: string | null };
    event: { name: string };
  }): Promise<{ snapToken: string; redirectUrl: string }> {
    if (this.isSimulation) {
      this.logger.log(`Simulation mode active for Invoice ${order.invoice}. Returning simulated snap token.`);
      return {
        snapToken: `SIM_SNAP_TOKEN_${order.invoice}_${Date.now()}`,
        redirectUrl: `http://localhost:5173/payment-simulator/${order.id}`,
      };
    }

    const parameter = {
      transaction_details: {
        order_id: order.invoice,
        gross_amount: Math.round(order.total),
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: order.user.name,
        email: order.user.email,
        phone: order.user.phone || '+62810000000',
      },
      item_details: [
        {
          id: order.id,
          price: Math.round(order.total),
          quantity: 1,
          name: order.event.name.substring(0, 50), // Midtrans max length constraint
        },
      ],
    };

    try {
      const response = await this.snap.createTransaction(parameter);
      return {
        snapToken: response.token,
        redirectUrl: response.redirect_url,
      };
    } catch (error) {
      this.logger.error('Midtrans API error, falling back to Simulation mode:', error);
      return {
        snapToken: `SIM_SNAP_TOKEN_${order.invoice}`,
        redirectUrl: `http://localhost:5173/payment-simulator/${order.id}`,
      };
    }
  }

  async handleWebhook(payload: any) {
    this.logger.log(`Received payment webhook notification for order: ${payload.order_id}`);
    const invoice = payload.order_id;
    const transactionStatus = payload.transaction_status;
    const paymentType = payload.payment_type;

    const order = await this.prisma.order.findUnique({
      where: { invoice },
      include: { user: true, event: true, ticketCategory: true },
    });

    if (!order) {
      throw new NotFoundException(`Order with invoice ${invoice} not found.`);
    }

    let newStatus = order.status;
    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      newStatus = PaymentStatus.PAID;
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      newStatus = transactionStatus === 'expire' ? PaymentStatus.EXPIRED : PaymentStatus.FAILED;
    }

    await this.prisma.$transaction(async (tx) => {
      // 1. Log payment
      await tx.payment.create({
        data: {
          orderId: order.id,
          transactionId: payload.transaction_id || `TRX-${Date.now()}`,
          paymentType: paymentType || 'online_payment',
          grossAmount: Number(payload.gross_amount) || order.total,
          status: transactionStatus || 'settlement',
          rawResponse: JSON.stringify(payload),
        },
      });

      // 2. Update order status
      if (order.status !== newStatus) {
        await tx.order.update({
          where: { id: order.id },
          data: { status: newStatus, paymentMethod: `Midtrans Snap (${paymentType || 'Instant'})` },
        });

        // 3. If turning PAID and participant not created yet, generate sequential registration number
        if (newStatus === PaymentStatus.PAID) {
          const existingParticipant = await tx.participant.findUnique({
            where: { orderId: order.id },
          });

          if (!existingParticipant) {
            const regNumber = await this.generateRegistrationNumber(tx);
            await tx.participant.create({
              data: {
                registrationNumber: regNumber,
                orderId: order.id,
                userId: order.userId,
                eventId: order.eventId,
                name: order.user.name,
                email: order.user.email,
                phone: order.user.phone,
                status: RegistrationStatus.NOT_REGISTERED_YET,
              },
            });

            // Increment sold counter on TicketCategory
            await tx.ticketCategory.update({
              where: { id: order.ticketCategoryId },
              data: { sold: { increment: 1 } },
            });
          }
        }
      }
    });

    return { success: true };
  }

  async simulatePaymentCompletion(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, event: true },
    });
    if (!order) {
      throw new NotFoundException('Order not found for payment simulation.');
    }
    if (order.status === PaymentStatus.PAID) {
      return { success: true, message: 'Order is already paid.' };
    }

    // Trigger fake webhook with settlement
    return this.handleWebhook({
      order_id: order.invoice,
      transaction_status: 'settlement',
      payment_type: 'bank_transfer',
      gross_amount: order.total,
      transaction_id: `SIM_TRX_${Date.now()}`,
    });
  }

  private async generateRegistrationNumber(tx: any): Promise<string> {
    const year = new Date().getFullYear(); // e.g. 2026
    const prefix = `REG-${year}`;

    // Find highest registration number starting with REG-2026
    const lastParticipant = await tx.participant.findFirst({
      where: { registrationNumber: { startsWith: prefix } },
      orderBy: { registrationNumber: 'desc' },
    });

    let seq = 1;
    if (lastParticipant) {
      const parts = lastParticipant.registrationNumber.split('-');
      if (parts.length >= 2) {
        // e.g. 202600001 -> remove year prefix
        const numPart = parts[1].substring(4);
        const parsed = parseInt(numPart, 10);
        if (!isNaN(parsed)) {
          seq = parsed + 1;
        }
      }
    }

    return `${prefix}${seq.toString().padStart(5, '0')}`;
  }
}
