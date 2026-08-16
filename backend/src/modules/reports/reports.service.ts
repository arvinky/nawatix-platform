import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole, PaymentStatus, RegistrationStatus } from '../../common/enums';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(currentUser: { id: string; role: UserRole }) {
    const eventFilter = currentUser.role === UserRole.ADMIN ? { organizerId: currentUser.id } : {};
    const orderFilter = currentUser.role === UserRole.ADMIN ? { event: { organizerId: currentUser.id } } : {};
    const participantFilter = currentUser.role === UserRole.ADMIN ? { event: { organizerId: currentUser.id } } : {};

    const [
      totalEvents,
      totalParticipants,
      paidOrders,
      pendingOrders,
      registeredParticipants,
      notRegisteredParticipants,
      bibIssued,
    ] = await Promise.all([
      this.prisma.event.count({ where: eventFilter }),
      this.prisma.participant.count({ where: participantFilter }),
      this.prisma.order.findMany({ where: { ...orderFilter, status: PaymentStatus.PAID }, select: { total: true, createdAt: true } }),
      this.prisma.order.count({ where: { ...orderFilter, status: PaymentStatus.PENDING } }),
      this.prisma.participant.count({ where: { ...participantFilter, status: RegistrationStatus.COMPLETED } }),
      this.prisma.participant.count({ where: { ...participantFilter, status: RegistrationStatus.NOT_REGISTERED_YET } }),
      this.prisma.bib.count({ where: currentUser.role === UserRole.ADMIN ? { event: { organizerId: currentUser.id } } : {} }),
    ]);

    const totalRevenue = paidOrders.reduce((acc, order) => acc + order.total, 0);
    const paidParticipantsCount = paidOrders.length;

    // Monthly Revenue breakdown for the current year
    const monthlyRevenueMap = new Array(12).fill(0);
    const participantGrowthMap = new Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    paidOrders.forEach(order => {
      const d = new Date(order.createdAt);
      if (d.getFullYear() === currentYear) {
        monthlyRevenueMap[d.getMonth()] += order.total;
        participantGrowthMap[d.getMonth()] += 1;
      }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue = months.map((month, idx) => ({ month, revenue: monthlyRevenueMap[idx] }));
    const participantGrowth = months.map((month, idx) => ({ month, participants: participantGrowthMap[idx] }));

    return {
      totalEvents,
      totalParticipants,
      paidParticipants: paidParticipantsCount,
      pendingPayments: pendingOrders,
      registeredParticipants,
      notRegisteredParticipants,
      bibIssued,
      revenue: totalRevenue,
      monthlyRevenue,
      participantGrowth,
    };
  }

  async exportReport(currentUser: { id: string; role: UserRole }, reportType: string, format: string) {
    const orderFilter = currentUser.role === UserRole.ADMIN ? { event: { organizerId: currentUser.id } } : {};
    
    let rows: string[] = [];
    if (reportType === 'revenue' || reportType === 'payment') {
      const orders = await this.prisma.order.findMany({
        where: orderFilter,
        include: { user: true, event: true, ticketCategory: true },
      });
      rows.push('Invoice,Participant Name,Event,Ticket Tier,Total Amount (IDR),Payment Status,Date');
      orders.forEach(o => {
        rows.push(`${o.invoice},"${o.user.name}", "${o.event.name}", "${o.ticketCategory.name}", ${o.total}, ${o.status}, ${new Date(o.createdAt).toISOString().split('T')[0]}`);
      });
    } else {
      // Participants report
      const participants = await this.prisma.participant.findMany({
        where: currentUser.role === UserRole.ADMIN ? { event: { organizerId: currentUser.id } } : {},
        include: { event: true, order: true },
      });
      rows.push('Registration Number,Participant Name,Email,Phone,Event,Payment Status,Registration Status,BIB Number');
      participants.forEach(p => {
        rows.push(`${p.registrationNumber},"${p.name}", ${p.email}, "${p.phone || ''}", "${p.event.name}", ${p.order.status}, ${p.status}, ${p.bibNumber || '-'}`);
      });
    }

    const content = rows.join('\n');
    const filename = `${reportType}_report_${Date.now()}.${format === 'csv' ? 'csv' : 'txt'}`;

    return {
      filename,
      content,
      mimetype: 'text/csv',
    };
  }
}
