export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER';

export type SportCategory =
  | 'RUNNING'
  | 'CYCLING'
  | 'BADMINTON'
  | 'BASKETBALL'
  | 'VOLLEYBALL'
  | 'FOOTBALL'
  | 'FUTSAL'
  | 'SWIMMING'
  | 'MARTIAL_ARTS'
  | 'OTHERS';

export type EventStatus = 'OPEN' | 'CLOSING_SOON' | 'SOLD_OUT' | 'DRAFT';

export type TicketStatus = 'ACTIVE' | 'INACTIVE';

export type PaymentStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED';

export type RegistrationStatus = 'NOT_REGISTERED_YET' | 'COMPLETED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  organizationName?: string;
  organizationDescription?: string;
  organizationLogo?: string;
  createdAt: string;
}

export interface TicketCategory {
  id: string;
  eventId: string;
  name: string;
  price: number;
  quota: number;
  sold: number;
  status: TicketStatus;
}

export interface Event {
  id: string;
  banner?: string;
  name: string;
  organizerId: string;
  sportCategory: SportCategory;
  location: string;
  date: string;
  description: string;
  organizerName?: string;
  organizerPhone?: string;
  organizerWebsite?: string;
  status: EventStatus;
  organizer?: User;
  ticketCategories?: TicketCategory[];
  startingPrice?: number;
  remainingQuota?: number;
  totalQuota?: number;
  totalSold?: number;
  _count?: {
    participants?: number;
    orders?: number;
  };
}

export interface Participant {
  id: string;
  registrationNumber: string;
  orderId: string;
  userId: string;
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  status: RegistrationStatus;
  bibNumber?: string | null;
  verifiedById?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
  event?: Event;
  order?: Order;
  verifiedBy?: { name: string };
}

export interface Order {
  id: string;
  invoice: string;
  userId: string;
  eventId: string;
  ticketCategoryId: string;
  subtotal: number;
  discount: number;
  total: number;
  status: PaymentStatus;
  paymentMethod: string;
  snapToken?: string;
  snapRedirectUrl?: string;
  createdAt: string;
  user?: User;
  event?: Event;
  ticketCategory?: TicketCategory;
  participant?: Participant;
}

export interface Voucher {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  usageLimit: number;
  usedCount: number;
  expiredDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'DISABLED';
}

export interface DashboardStats {
  totalEvents: number;
  totalParticipants: number;
  paidParticipants: number;
  pendingPayments: number;
  registeredParticipants: number;
  notRegisteredParticipants: number;
  bibIssued: number;
  revenue: number;
  monthlyRevenue: { month: string; revenue: number }[];
  participantGrowth: { month: string; participants: number }[];
}
