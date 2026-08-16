import { IsString, IsNotEmpty, IsOptional, IsPhoneNumber, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: 'Event ID string' })
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({ example: 'Ticket Category ID string' })
  @IsString()
  @IsNotEmpty()
  ticketCategoryId: string;

  @ApiPropertyOptional({ example: 'ATHLETIX2026' })
  @IsOptional()
  @IsString()
  voucherCode?: string;

  @ApiProperty({ example: 'Budi Athlete' })
  @IsString()
  @IsNotEmpty()
  participantName: string;

  @ApiProperty({ example: 'participant1@athletix.com' })
  @IsString()
  @IsNotEmpty()
  participantEmail: string;

  @ApiPropertyOptional({ example: '+62812345678' })
  @IsOptional()
  @IsString()
  participantPhone?: string;
}
