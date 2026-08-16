import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketStatus } from '../../../common/enums';

export class CreateTicketDto {
  @ApiProperty({ example: '3a75... (Event ID)' })
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({ example: 'VIP All Access' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 650000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(1)
  quota: number;
}

export class UpdateTicketDto {
  @ApiPropertyOptional({ example: 'VIP Gold Access' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 700000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quota?: number;

  @ApiPropertyOptional({ enum: TicketStatus })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;
}
