import { PrismaClient } from '@prisma/client';
import { UserRole, SportCategory, EventStatus, TicketStatus, PaymentStatus, RegistrationStatus, DiscountType, VoucherStatus } from '../src/common/enums';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Athletix...');

  // Clean existing tables to prevent duplicate errors during re-seeding
  await prisma.bib.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.ticketCategory.deleteMany();
  await prisma.event.deleteMany();
  await prisma.organizationSetting.deleteMany();
  await prisma.user.deleteMany();

  const saltRounds = 10;
  const defaultPasswordHash = await bcrypt.hash('12345678', saltRounds);
  const superAdminPasswordHash = await bcrypt.hash('superadmin15', saltRounds);
  const adminPasswordHash = await bcrypt.hash('nawatix15', saltRounds);

  // 1. Create Super Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin 15',
      email: 'superadmin15@gmail.com',
      password: superAdminPasswordHash,
      role: UserRole.SUPER_ADMIN,
      phone: '+628111222333',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    },
  });
  console.log(`✅ Created Super Admin: ${admin.email}`);

  // 2. Create 3 Admin Accounts (formerly Organizer)
  const organizer1 = await prisma.user.create({
    data: {
      name: 'Admin Nawatix',
      email: 'admin@nawatix.com',
      password: adminPasswordHash,
      role: UserRole.ADMIN,
      phone: '+6281234567890',
      organizationName: 'Admin 15 Organizer',
      organizationDescription: 'Premier marathon and road run administrators in Indonesia since 2018.',
      organizationLogo: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=200&q=80',
    },
  });

  const organizer2 = await prisma.user.create({
    data: {
      name: 'Nusa Cycling Club Admin',
      email: 'admin2@athletix.com',
      password: defaultPasswordHash,
      role: UserRole.ADMIN,
      phone: '+6281345678910',
      organizationName: 'Nusa Cycling Indonesia',
      organizationDescription: 'Administrators of the toughest cycling events and grand tours.',
      organizationLogo: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=200&q=80',
    },
  });

  const organizer3 = await prisma.user.create({
    data: {
      name: 'Garuda Smash Sports Admin',
      email: 'admin3@athletix.com',
      password: defaultPasswordHash,
      role: UserRole.ADMIN,
      phone: '+6281456789123',
      organizationName: 'Garuda Sports Management',
      organizationDescription: 'Specialized in Badminton, Basketball, and indoor sports tournaments.',
      organizationLogo: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=200&q=80',
    },
  });
  console.log('✅ Created 3 Admin accounts.');

  // 3. Create 10 User Accounts
  const participants = [];
  for (let i = 1; i <= 10; i++) {
    const p = await prisma.user.create({
      data: {
        name: i === 1 ? 'Arvin' : `Athlete User ${i}`,
        email: i === 1 ? 'arvin@gmail.com' : `user${i}@athletix.com`,
        password: defaultPasswordHash,
        role: UserRole.USER,
        phone: `+62821000000${i.toString().padStart(2, '0')}`,
        avatar: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80`,
      },
    });
    participants.push(p);
  }
  console.log('✅ Created 10 User accounts.');

  // 4. Create Vouchers
  const voucher1 = await prisma.voucher.create({
    data: {
      code: 'ATHLETIX2026',
      discountType: DiscountType.FIXED_AMOUNT,
      value: 50000,
      usageLimit: 500,
      usedCount: 2,
      startDate: new Date(),
      expiredDate: new Date('2026-12-31T23:59:59Z'),
      status: VoucherStatus.ACTIVE,
    },
  });

  const voucher2 = await prisma.voucher.create({
    data: {
      code: 'SPORTPROMO',
      discountType: DiscountType.PERCENTAGE,
      value: 15,
      usageLimit: 200,
      usedCount: 1,
      startDate: new Date(),
      expiredDate: new Date('2026-12-31T23:59:59Z'),
      status: VoucherStatus.ACTIVE,
    },
  });

  const voucher3 = await prisma.voucher.create({
    data: {
      code: 'VIPRUN50',
      discountType: DiscountType.FIXED_AMOUNT,
      value: 100000,
      usageLimit: 50,
      usedCount: 0,
      startDate: new Date(),
      expiredDate: new Date('2026-12-31T23:59:59Z'),
      status: VoucherStatus.ACTIVE,
    },
  });
  console.log('✅ Created sample Vouchers.');

  // 5. Create Events across different sports categories
  const eventsData = [
    {
      name: 'Jakarta International Marathon 2026',
      organizerId: organizer1.id,
      sportCategory: SportCategory.RUNNING,
      location: 'Gelora Bung Karno Stadium, Jakarta',
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      description: 'Join over 15,000 runners across the scenic landmarks of downtown Jakarta. Features certified full marathon, half marathon, and 10K courses with hydration stations every 2.5 kilometers. Exclusive finisher medals and high-tech DRI-FIT race tees included.',
      banner: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80',
      status: EventStatus.OPEN,
      tickets: [
        { name: 'Early Bird (10K / 21K)', price: 250000, quota: 500, sold: 120 },
        { name: 'Regular Registration', price: 400000, quota: 1500, sold: 300 },
        { name: 'VIP Gold Access & Lounge', price: 850000, quota: 100, sold: 45 },
      ]
    },
    {
      name: 'Tour de Bali Mountain Challenge 100KM',
      organizerId: organizer2.id,
      sportCategory: SportCategory.CYCLING,
      location: 'Ubud to Kintamani Highland, Bali',
      date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      description: 'Conquer the thrilling volcanic climbs and panoramic rice terrace descents of Bali in this grueling 100km Gran Fondo cycling marathon. Open for road bikes and gravel endurance riders.',
      banner: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80',
      status: EventStatus.CLOSING_SOON,
      tickets: [
        { name: 'Early Bird Ride Pass', price: 450000, quota: 200, sold: 195 },
        { name: 'Regular Endurance Pass', price: 650000, quota: 600, sold: 420 },
        { name: 'VIP Support Vehicle & Accommodation', price: 2200000, quota: 50, sold: 48 },
      ]
    },
    {
      name: 'Indonesia Smash Badminton Open 2026',
      organizerId: organizer3.id,
      sportCategory: SportCategory.BADMINTON,
      location: 'Istora Senayan Sports Complex, Jakarta',
      date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      description: 'The ultimate amateur badminton tournament for men and women singles and doubles. Compete for professional trophies, YONEX racket bundles, and over IDR 100,000,000 in total prize pools.',
      banner: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
      status: EventStatus.OPEN,
      tickets: [
        { name: 'Early Bird Singles Entry', price: 180000, quota: 100, sold: 60 },
        { name: 'Regular Doubles Team Pass', price: 350000, quota: 200, sold: 140 },
        { name: 'VIP All-Access Club Entry', price: 750000, quota: 40, sold: 15 },
      ]
    },
    {
      name: 'Metropolitan Basketball 3v3 Street Rumble',
      organizerId: organizer3.id,
      sportCategory: SportCategory.BASKETBALL,
      location: 'Senayan Park Outdoor Court, Jakarta',
      date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      description: 'High-octane urban street basketball tournament featuring 64 competitive squads, guest DJ performances, slam-dunk contests, and streetwear pop-up booths.',
      banner: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
      status: EventStatus.OPEN,
      tickets: [
        { name: 'Early Bird Squad Registration', price: 500000, quota: 30, sold: 10 },
        { name: 'Regular Squad Pass (4 Players)', price: 750000, quota: 50, sold: 22 },
        { name: 'VIP Courtside Team Lounge', price: 1500000, quota: 10, sold: 4 },
      ]
    },
    {
      name: 'Nusantara National Championship Football Cup',
      organizerId: organizer1.id,
      sportCategory: SportCategory.FOOTBALL,
      location: 'Manahan Stadium, Solo',
      date: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000),
      description: 'National invitational football championship for amateur league club runners. 11-a-side format with international level referees, live broadcast streaming, and VAR technology integration.',
      banner: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
      status: EventStatus.OPEN,
      tickets: [
        { name: 'Early Bird Team Entry (22 Players)', price: 3500000, quota: 16, sold: 8 },
        { name: 'Regular Club Registration', price: 5000000, quota: 24, sold: 12 },
        { name: 'VIP Franchise Suite Package', price: 8500000, quota: 8, sold: 3 },
      ]
    },
    {
      name: 'Super Futsal League Jakarta Open 2026',
      organizerId: organizer3.id,
      sportCategory: SportCategory.FUTSAL,
      location: 'Tangerang Grand Futsal Center, Banten',
      date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      description: 'Fast-paced indoor 5-a-side futsal league for corporate and university teams. Weekend fixture schedules with live statistical player tracking and professional photography coverage.',
      banner: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1200&q=80',
      status: EventStatus.SOLD_OUT,
      tickets: [
        { name: 'Early Bird Futsal Squad', price: 800000, quota: 20, sold: 20 },
        { name: 'Regular Team Pass', price: 1200000, quota: 30, sold: 30 },
        { name: 'VIP Corporate Team Bundle', price: 2000000, quota: 10, sold: 10 },
      ]
    }
  ];

  const createdEvents = [];
  for (const item of eventsData) {
    const event = await prisma.event.create({
      data: {
        name: item.name,
        organizerId: item.organizerId,
        sportCategory: item.sportCategory,
        location: item.location,
        date: item.date,
        description: item.description,
        banner: item.banner,
        status: item.status,
        ticketCategories: {
          create: item.tickets.map(t => ({
            name: t.name,
            price: t.price,
            quota: t.quota,
            sold: t.sold,
            status: TicketStatus.ACTIVE
          }))
        }
      },
      include: {
        ticketCategories: true
      }
    });
    createdEvents.push(event);
  }
  console.log(`✅ Created ${createdEvents.length} Events with Early Bird, Regular, and VIP Ticket Categories.`);

  // 6. Create Sample Orders, Paid Participants, Registration Numbers, and BIBs
  const marathomEvent = createdEvents[0]; // Jakarta International Marathon
  const regularTicket = marathomEvent.ticketCategories[1];

  // Sample 1: Completed & BIB Assigned (Already registered on-site)
  const order1 = await prisma.order.create({
    data: {
      invoice: 'INV-20260001',
      userId: participants[0].id,
      eventId: marathomEvent.id,
      ticketCategoryId: regularTicket.id,
      voucherId: voucher1.id,
      subtotal: 400000,
      discount: 50000,
      total: 350000,
      status: PaymentStatus.PAID,
      paymentMethod: 'Midtrans Snap (Bank Transfer)',
      snapToken: 'test_snap_token_001',
      payments: {
        create: {
          transactionId: 'midtrans_trx_001',
          paymentType: 'bank_transfer',
          grossAmount: 350000,
          status: 'settlement',
          rawResponse: '{"status_code":"200","transaction_status":"settlement"}'
        }
      },
      participant: {
        create: {
          registrationNumber: 'REG-202600001',
          userId: participants[0].id,
          eventId: marathomEvent.id,
          name: participants[0].name,
          email: participants[0].email,
          phone: participants[0].phone,
          status: RegistrationStatus.COMPLETED,
          bibNumber: '1057',
          verifiedById: organizer1.id,
          verifiedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // Verified 2 hours ago
        }
      }
    },
    include: { participant: true }
  });

  // Also record BIB in Bib table
  if (order1.participant) {
    await prisma.bib.create({
      data: {
        eventId: marathomEvent.id,
        participantId: order1.participant.id,
        bibNumber: '1057',
        assignedAt: new Date()
      }
    });
  }

  // Sample 2: Paid but NOT REGISTERED YET (For live verification testing in Admin/Organizer console!)
  const order2 = await prisma.order.create({
    data: {
      invoice: 'INV-20260002',
      userId: participants[1].id,
      eventId: marathomEvent.id,
      ticketCategoryId: regularTicket.id,
      subtotal: 400000,
      discount: 0,
      total: 400000,
      status: PaymentStatus.PAID,
      paymentMethod: 'Midtrans Snap (Credit Card)',
      snapToken: 'test_snap_token_002',
      payments: {
        create: {
          transactionId: 'midtrans_trx_002',
          paymentType: 'credit_card',
          grossAmount: 400000,
          status: 'capture',
          rawResponse: '{"status_code":"200","transaction_status":"capture"}'
        }
      },
      participant: {
        create: {
          registrationNumber: 'REG-202600002',
          userId: participants[1].id,
          eventId: marathomEvent.id,
          name: participants[1].name,
          email: participants[1].email,
          phone: participants[1].phone,
          status: RegistrationStatus.NOT_REGISTERED_YET,
          bibNumber: null,
        }
      }
    }
  });

  // Sample 3: Paid and completed for Cycling event
  const cyclingEvent = createdEvents[1];
  const cyclingTicket = cyclingEvent.ticketCategories[0];
  const order3 = await prisma.order.create({
    data: {
      invoice: 'INV-20260003',
      userId: participants[2].id,
      eventId: cyclingEvent.id,
      ticketCategoryId: cyclingTicket.id,
      subtotal: 450000,
      discount: 0,
      total: 450000,
      status: PaymentStatus.PAID,
      paymentMethod: 'Midtrans Snap (QRIS)',
      snapToken: 'test_snap_token_003',
      payments: {
        create: {
          transactionId: 'midtrans_trx_003',
          paymentType: 'qris',
          grossAmount: 450000,
          status: 'settlement'
        }
      },
      participant: {
        create: {
          registrationNumber: 'REG-202600003',
          userId: participants[2].id,
          eventId: cyclingEvent.id,
          name: participants[2].name,
          email: participants[2].email,
          phone: participants[2].phone,
          status: RegistrationStatus.NOT_REGISTERED_YET,
          bibNumber: null
        }
      }
    }
  });

  // Sample 4: Pending Order
  await prisma.order.create({
    data: {
      invoice: 'INV-20260004',
      userId: participants[3].id,
      eventId: createdEvents[2].id,
      ticketCategoryId: createdEvents[2].ticketCategories[1].id,
      subtotal: 350000,
      discount: 0,
      total: 350000,
      status: PaymentStatus.PENDING,
      paymentMethod: 'Midtrans Snap',
      snapToken: 'test_snap_token_pending_004',
    }
  });

  console.log('✅ Created Sample Orders, Payments, Paid Participants (with REG-2026xxxx numbers), and BIB assignments.');

  // 7. Create Organization Platform Settings
  await prisma.organizationSetting.create({
    data: {
      name: 'Athletix Platform',
      theme: 'dark',
      logo: '/logo.svg',
      generalSettings: JSON.stringify({
        tagline: 'One Platform for Every Sports Event',
        supportEmail: 'support@athletix.com',
        enableSandbox: true,
        currency: 'IDR'
      })
    }
  });
  console.log('✅ Created Organization Settings.');

  console.log('🎉 Athletix Database Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
