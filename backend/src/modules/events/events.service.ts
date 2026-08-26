import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto/events.dto';
import { UserRole, EventStatus, SportCategory } from '../../common/enums';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAllPublic(query: {
    search?: string;
    sportCategory?: SportCategory;
    location?: string;
    status?: EventStatus;
  }) {
    const where: any = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { location: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.sportCategory && Object.values(SportCategory).includes(query.sportCategory as any)) {
      where.sportCategory = query.sportCategory;
    }
    if (query.location) {
      where.location = { contains: query.location, mode: 'insensitive' };
    }
    if (query.status && Object.values(EventStatus).includes(query.status as any)) {
      where.status = query.status;
    } else {
      where.status = { not: EventStatus.DRAFT };
    }

    const events = await this.prisma.event.findMany({
      where,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            organizationName: true,
            organizationLogo: true,
            avatar: true,
          },
        },
        ticketCategories: {
          select: {
            id: true,
            name: true,
            price: true,
            quota: true,
            sold: true,
            status: true,
          },
        },
        _count: {
          select: { participants: true },
        },
      },
      orderBy: { date: 'asc' },
    });

    // Decorate starting price and available status
    return events.map(ev => {
      const activeTickets = ev.ticketCategories.filter(t => t.status === 'ACTIVE');
      const minPrice = activeTickets.length > 0 ? Math.min(...activeTickets.map(t => t.price)) : 0;
      const totalQuota = activeTickets.reduce((acc, t) => acc + t.quota, 0);
      const totalSold = activeTickets.reduce((acc, t) => acc + t.sold, 0);
      return {
        ...ev,
        startingPrice: minPrice,
        totalQuota,
        totalSold,
        remainingQuota: Math.max(0, totalQuota - totalSold),
      };
    });
  }

  async findOne(id: string) {
    const ev = await this.prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            organizationName: true,
            organizationDescription: true,
            organizationLogo: true,
            avatar: true,
          },
        },
        ticketCategories: {
          orderBy: { price: 'asc' },
        },
        _count: {
          select: { participants: true, orders: true },
        },
      },
    });

    if (!ev) {
      throw new NotFoundException(`Event with ID ${id} not found.`);
    }

    const activeTickets = ev.ticketCategories;
    const startingPrice = activeTickets.length > 0 ? Math.min(...activeTickets.map(t => t.price)) : 0;

    return {
      ...ev,
      startingPrice,
    };
  }

  async findDashboardEvents(currentUser: { id: string; role: UserRole }) {
    const where = currentUser.role === UserRole.SUPER_ADMIN ? {} : { organizerId: currentUser.id };
    return this.prisma.event.findMany({
      where,
      include: {
        organizer: {
          select: { id: true, name: true, organizationName: true },
        },
        ticketCategories: true,
        vouchers: true,
        _count: {
          select: { orders: true, participants: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(currentUser: { id: string; role: UserRole }, dto: CreateEventDto) {
    if (currentUser.role !== UserRole.SUPER_ADMIN && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only Admins or Super Admin can create sports events.');
    }

    const { tickets, ...eventData } = dto;

    const event = await this.prisma.event.create({
      data: {
        ...eventData,
        sportCategory: eventData.sportCategory || 'RUNNING',
        date: new Date(eventData.date),
        organizerId: currentUser.id,
        ticketCategories: tickets
          ? {
              create: tickets.map(t => ({
                name: t.name,
                price: t.price,
                quota: t.quota,
              })),
            }
          : undefined,
      },
      include: { ticketCategories: true },
    });
    return event;
  }

  async update(id: string, currentUser: { id: string; role: UserRole }, dto: UpdateEventDto) {
    const ev = await this.prisma.event.findUnique({ where: { id } });
    if (!ev) {
      throw new NotFoundException('Event not found.');
    }
    if (currentUser.role !== UserRole.SUPER_ADMIN && ev.organizerId !== currentUser.id) {
      throw new ForbiddenException('You do not have authorization to modify this event.');
    }
    const data: any = { ...dto };
    if (dto.date) {
      data.date = new Date(dto.date);
    }
    return this.prisma.event.update({
      where: { id },
      data,
      include: { ticketCategories: true },
    });
  }

  async remove(id: string, currentUser: { id: string; role: UserRole }) {
    const ev = await this.prisma.event.findUnique({ where: { id } });
    if (!ev) {
      throw new NotFoundException('Event not found.');
    }
    if (currentUser.role !== UserRole.SUPER_ADMIN && ev.organizerId !== currentUser.id) {
      throw new ForbiddenException('You do not have authorization to delete this event.');
    }
    return this.prisma.event.delete({ where: { id } });
  }
}
