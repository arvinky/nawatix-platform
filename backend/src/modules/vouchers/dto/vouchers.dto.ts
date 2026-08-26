import { IsString, IsNotEmpty, IsNumber, Min, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType, VoucherStatus } from '../../../common/enums';

export class CheckVoucherDto {
  @ApiProperty({ example: 'ATHLETIX2026' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'uuid-event-id' })
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({ example: 400000 })
  @IsNumber()
  @Min(0)
  subtotal: number;
}

export class CreateVoucherDto {
  @ApiProperty({ example: 'SUMMERRUN' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'uuid-event-id' })
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({ enum: DiscountType, default: DiscountType.FIXED_AMOUNT })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Min(1)
  value: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(1)
  usageLimit: number;

  @ApiProperty({ example: '2026-12-31T23:59:59Z' })
  @IsDateString()
  expiredDate: string;
}

export class UpdateVoucherDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  usageLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiredDate?: string;

  @ApiPropertyOptional({ enum: VoucherStatus })
  @IsOptional()
  @IsEnum(VoucherStatus)
  status?: VoucherStatus;
}
