const fs = require('fs');
const path = require('path');

const enumsDts = `
export enum UserRole { SUPER_ADMIN = 'SUPER_ADMIN', ADMIN = 'ADMIN', USER = 'USER' }
export enum SportCategory { RUNNING = 'RUNNING', CYCLING = 'CYCLING', BADMINTON = 'BADMINTON', BASKETBALL = 'BASKETBALL', VOLLEYBALL = 'VOLLEYBALL', FOOTBALL = 'FOOTBALL', FUTSAL = 'FUTSAL', SWIMMING = 'SWIMMING', MARTIAL_ARTS = 'MARTIAL_ARTS', OTHERS = 'OTHERS' }
export enum EventStatus { OPEN = 'OPEN', CLOSING_SOON = 'CLOSING_SOON', SOLD_OUT = 'SOLD_OUT', DRAFT = 'DRAFT' }
export enum TicketStatus { ACTIVE = 'ACTIVE', INACTIVE = 'INACTIVE' }
export enum PaymentStatus { PENDING = 'PENDING', PAID = 'PAID', EXPIRED = 'EXPIRED', FAILED = 'FAILED' }
export enum RegistrationStatus { NOT_REGISTERED_YET = 'NOT_REGISTERED_YET', COMPLETED = 'COMPLETED' }
export enum DiscountType { PERCENTAGE = 'PERCENTAGE', FIXED_AMOUNT = 'FIXED_AMOUNT' }
export enum VoucherStatus { ACTIVE = 'ACTIVE', EXPIRED = 'EXPIRED', DISABLED = 'DISABLED' }
`;

const enumsJs = `
exports.UserRole = { SUPER_ADMIN: 'SUPER_ADMIN', ADMIN: 'ADMIN', USER: 'USER' };
exports.SportCategory = { RUNNING: 'RUNNING', CYCLING: 'CYCLING', BADMINTON: 'BADMINTON', BASKETBALL: 'BASKETBALL', VOLLEYBALL: 'VOLLEYBALL', FOOTBALL: 'FOOTBALL', FUTSAL: 'FUTSAL', SWIMMING: 'SWIMMING', MARTIAL_ARTS: 'MARTIAL_ARTS', OTHERS: 'OTHERS' };
exports.EventStatus = { OPEN: 'OPEN', CLOSING_SOON: 'CLOSING_SOON', SOLD_OUT: 'SOLD_OUT', DRAFT: 'DRAFT' };
exports.TicketStatus = { ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' };
exports.PaymentStatus = { PENDING: 'PENDING', PAID: 'PAID', EXPIRED: 'EXPIRED', FAILED: 'FAILED' };
exports.RegistrationStatus = { NOT_REGISTERED_YET: 'NOT_REGISTERED_YET', COMPLETED: 'COMPLETED' };
exports.DiscountType = { PERCENTAGE: 'PERCENTAGE', FIXED_AMOUNT: 'FIXED_AMOUNT' };
exports.VoucherStatus = { ACTIVE: 'ACTIVE', EXPIRED: 'EXPIRED', DISABLED: 'DISABLED' };
`;

const pathsToPatch = [
  { dts: '../node_modules/@prisma/client/index.d.ts', js: '../node_modules/@prisma/client/index.js' },
  { dts: '../node_modules/.prisma/client/index.d.ts', js: '../node_modules/.prisma/client/index.js' },
];

for (const target of pathsToPatch) {
  const dtsPath = path.join(__dirname, target.dts);
  const jsPath = path.join(__dirname, target.js);

  if (fs.existsSync(dtsPath)) {
    let content = fs.readFileSync(dtsPath, 'utf8');
    if (content.includes('export enum UserRole')) {
      content = content.replace(/export enum UserRole \{[^}]+\}/g, "export enum UserRole { SUPER_ADMIN = 'SUPER_ADMIN', ADMIN = 'ADMIN', USER = 'USER' }");
      fs.writeFileSync(dtsPath, content);
      console.log('Updated existing DTS enums:', dtsPath);
    } else {
      fs.appendFileSync(dtsPath, enumsDts);
      console.log('Patched DTS with enums:', dtsPath);
    }
  }
  if (fs.existsSync(jsPath)) {
    let content = fs.readFileSync(jsPath, 'utf8');
    if (content.includes('exports.UserRole')) {
      content = content.replace(/exports\.UserRole = \{[^}]+\};/g, "exports.UserRole = { SUPER_ADMIN: 'SUPER_ADMIN', ADMIN: 'ADMIN', USER: 'USER' };");
      fs.writeFileSync(jsPath, content);
      console.log('Updated existing JS enums:', jsPath);
    } else {
      fs.appendFileSync(jsPath, enumsJs);
      console.log('Patched JS with enums:', jsPath);
    }
  }
}
console.log('Successfully patched both @prisma/client and .prisma/client with SUPER_ADMIN, ADMIN, and USER roles!');
