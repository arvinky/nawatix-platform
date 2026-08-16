export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER'
}
export enum SportCategory {
  RUNNING = 'RUNNING',
  CYCLING = 'CYCLING',
  BADMINTON = 'BADMINTON',
  BASKETBALL = 'BASKETBALL',
  FOOTBALL = 'FOOTBALL',
  FUTSAL = 'FUTSAL'
}
export enum EventStatus {
  OPEN = 'OPEN',
  CLOSING_SOON = 'CLOSING_SOON',
  SOLD_OUT = 'SOLD_OUT',
  DRAFT = 'DRAFT'
}
export enum TicketStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}
export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT'
}
export enum VoucherStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  DISABLED = 'DISABLED'
}
export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  EXPIRED = 'EXPIRED',
  FAILED = 'FAILED',
  settlement = 'settlement',
  pending = 'pending',
  cancel = 'cancel',
  expire = 'expire'
}
export enum RegistrationStatus {
  NOT_REGISTERED_YET = 'NOT_REGISTERED_YET',
  COMPLETED = 'COMPLETED'
}
