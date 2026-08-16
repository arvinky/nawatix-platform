import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTicketDto, UpdateTicketDto } from './dto/tickets.dto';
import { UserRole } from '../../common/enums';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async findByEvent(eventId: string) {
    return this.prisma.ticketCategory.findMany({
      where: { eventId },
      orderBy: { price: 'asc' },
    });
  }

  async create(currentUser: { id: string; role: UserRole }, dto: CreateTicketDto) {
    const event = await this.prisma.event.findUnique({ where: { id: dto.eventId } });
    if (!event) {
      throw new NotFoundException('Associated event not found.');
    }
    if (currentUser.role !== UserRole.SUPER_ADMIN && event.organizerId !== currentUser.id) {
      throw new ForbiddenException('Only the organizing entity or Admin can create tickets for this event.');
    }
    return this.prisma.ticketCategory.create({
      data: {
        eventId: dto.eventId,
        name: dto.name,
        price: dto.price,
        quota: dto.quota,
      },
    });
  }

  async update(id: string, currentUser: { id: string; role: UserRole }, dto: UpdateTicketDto) {
    const ticket = await this.prisma.ticketCategory.findUnique({
      where: { id },
      include: { event: true },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket category not found.');
    }
    if (currentUser.role !== UserRole.SUPER_ADMIN && ticket.event.organizerId !== currentUser.id) {
      throw new ForbiddenException('Unauthorized to update this ticket category.');
    }
    if (dto.quota !== undefined && dto.quota < ticket.sold) {
      throw new BadRequestException(`New quota cannot be lower than tickets already sold (${ticket.sold}).`);
    }
    return this.prisma.ticketCategory.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, currentUser: { id: string; role: UserRole }) {
    const ticket = await this.prisma.ticketCategory.findUnique({
      where: { id },
      include: { event: true },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket category not found.');
    }
    if (currentUser.role !== UserRole.SUPER_ADMIN && ticket.event.organizerId !== currentUser.id) {
      throw new ForbiddenException('Unauthorized to delete this ticket category.');
    }
    if (ticket.sold > 0) {
      throw new BadRequestException('Cannot delete ticket category that already has completed order sales.');
    }
    return this.prisma.ticketCategory.delete({ where: { id } });
  }
}
