import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CheckVoucherDto, CreateVoucherDto, UpdateVoucherDto } from './dto/vouchers.dto';
import { VoucherStatus, DiscountType } from '../../common/enums';

@Injectable()
export class VouchersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.voucher.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });
  }

  async validateAndCalculateDiscount(dto: CheckVoucherDto) {
    const voucher = await this.prisma.voucher.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (!voucher) {
      throw new NotFoundException('Voucher code not found.');
    }

    if (voucher.status !== VoucherStatus.ACTIVE || new Date(voucher.expiredDate) < new Date()) {
      throw new BadRequestException('This voucher has expired or is disabled.');
    }

    if (voucher.usedCount >= voucher.usageLimit) {
      throw new BadRequestException('Voucher usage quota has reached its maximum limit.');
    }

    let discount = 0;
    if (voucher.discountType === DiscountType.FIXED_AMOUNT) {
      discount = Math.min(dto.subtotal, voucher.value);
    } else {
      discount = (dto.subtotal * voucher.value) / 100;
    }

    const total = Math.max(0, dto.subtotal - discount);

    return {
      voucherId: voucher.id,
      code: voucher.code,
      discountType: voucher.discountType,
      value: voucher.value,
      discount: Math.round(discount),
      subtotal: dto.subtotal,
      total: Math.round(total),
    };
  }

  async create(dto: CreateVoucherDto) {
    const exists = await this.prisma.voucher.findUnique({
      where: { code: dto.code.toUpperCase() },
    });
    if (exists) {
      throw new BadRequestException('Voucher code already exists.');
    }

    return this.prisma.voucher.create({
      data: {
        code: dto.code.toUpperCase(),
        discountType: dto.discountType,
        value: dto.value,
        usageLimit: dto.usageLimit,
        expiredDate: new Date(dto.expiredDate),
        status: VoucherStatus.ACTIVE,
      },
    });
  }

  async update(id: string, dto: UpdateVoucherDto) {
    const data: any = { ...dto };
    if (dto.expiredDate) {
      data.expiredDate = new Date(dto.expiredDate);
    }
    return this.prisma.voucher.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.voucher.delete({
      where: { id },
    });
  }
}
