import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VerifyParticipantDto } from './dto/registration.dto';
import { RegistrationStatus, UserRole } from '../../common/enums';

@Injectable()
export class RegistrationService {
  constructor(private prisma: PrismaService) {}

  async searchParticipant(currentUser: { id: string; role: UserRole }, query: { search: string; eventId?: string }) {
    if (!query.search || query.search.trim() === '') {
      throw new BadRequestException('Search parameter (QR, REG number, Name, or Email) is required.');
    }

    const where: any = {
      OR: [
        { registrationNumber: { equals: query.search.trim() } },
        { id: { equals: query.search.trim() } },
        { name: { contains: query.search.trim() } },
        { email: { contains: query.search.trim() } },
      ],
    };

    if (query.eventId) {
      where.eventId = query.eventId;
    }

    if (currentUser.role === UserRole.ADMIN) {
      where.event = { organizerId: currentUser.id };
    }

    const participants = await this.prisma.participant.findMany({
      where,
      include: {
        event: { select: { id: true, name: true, date: true, location: true, organizerId: true } },
        order: { select: { id: true, invoice: true, status: true, ticketCategory: { select: { name: true, price: true } } } },
        verifiedBy: { select: { name: true, email: true } },
      },
      take: 20,
    });

    return participants;
  }

  async verifyParticipant(currentUser: { id: string; role: UserRole }, dto: VerifyParticipantDto) {
    const participant = await this.prisma.participant.findFirst({
      where: {
        OR: [
          { id: dto.participantIdOrRegNumber },
          { registrationNumber: dto.participantIdOrRegNumber },
        ],
      },
      include: {
        event: true,
        order: true,
      },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found.');
    }

    if (currentUser.role === UserRole.ADMIN && participant.event.organizerId !== currentUser.id) {
      throw new ForbiddenException('You cannot verify participants for events managed by another organizer.');
    }

    if (participant.order.status !== 'PAID') {
      throw new BadRequestException('Cannot complete registration check-in: payment status is not PAID.');
    }

    if (participant.status === RegistrationStatus.COMPLETED) {
      throw new BadRequestException(`Participant is already verified with BIB #${participant.bibNumber}.`);
    }

    // Verify BIB uniqueness for this event
    const bibExists = await this.prisma.bib.findFirst({
      where: {
        eventId: participant.eventId,
        bibNumber: dto.bibNumber.trim(),
      },
    });

    if (bibExists) {
      throw new BadRequestException(`BIB Number #${dto.bibNumber} is already assigned to another participant in this event!`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.participant.update({
        where: { id: participant.id },
        data: {
          status: RegistrationStatus.COMPLETED,
          bibNumber: dto.bibNumber.trim(),
          verifiedById: currentUser.id,
          verifiedAt: new Date(),
        },
        include: {
          event: true,
          order: { include: { ticketCategory: true } },
          verifiedBy: { select: { name: true } },
        },
      });

      await tx.bib.create({
        data: {
          eventId: participant.eventId,
          participantId: participant.id,
          bibNumber: dto.bibNumber.trim(),
          assignedAt: new Date(),
        },
      });

      return updated;
    });
  }

  async findMyTickets(userId: string) {
    return this.prisma.participant.findMany({
      where: { userId },
      include: {
        event: { select: { id: true, name: true, location: true, date: true, banner: true, sportCategory: true } },
        order: { select: { id: true, invoice: true, status: true, ticketCategory: { select: { name: true, price: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllManagedParticipants(currentUser: { id: string; role: UserRole }, query?: { eventId?: string; status?: RegistrationStatus }) {
    const where: any = {};
    if (currentUser.role === UserRole.ADMIN) {
      where.event = { organizerId: currentUser.id };
    }
    if (query?.eventId) {
      where.eventId = query.eventId;
    }
    if (query?.status) {
      where.status = query.status;
    }

    return this.prisma.participant.findMany({
      where,
      include: {
        event: { select: { id: true, name: true } },
        order: { select: { invoice: true, status: true, ticketCategory: { select: { name: true } } } },
        verifiedBy: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteParticipant(id: string, currentUser: { id: string; role: UserRole }) {
    const participant = await this.prisma.participant.findUnique({
      where: { id },
      include: { event: true },
    });
    if (!participant) throw new NotFoundException('Participant not found');

    if (currentUser.role === UserRole.ADMIN && participant.event.organizerId !== currentUser.id) {
      throw new ForbiddenException('Cannot delete participant from an event you do not manage');
    }

    await this.prisma.bib.deleteMany({ where: { participantId: id } });
    return this.prisma.participant.delete({ where: { id } });
  }
}
