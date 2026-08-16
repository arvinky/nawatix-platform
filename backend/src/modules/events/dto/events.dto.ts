import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SportCategory, EventStatus, TicketStatus } from '../../../common/enums';

export class CreateTicketCategoryDto {
  @ApiProperty({ example: 'Early Bird' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 250000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(1)
  quota: number;
}

export class CreateEventDto {
  @ApiProperty({ example: 'Jakarta City Marathon 2026' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1530549387789-4c1017266635' })
  @IsOptional()
  @IsString()
  banner?: string;

  @ApiPropertyOptional({ enum: SportCategory, default: SportCategory.RUNNING })
  @IsOptional()
  @IsEnum(SportCategory)
  sportCategory?: SportCategory;

  @ApiProperty({ example: 'Gelora Bung Karno Stadium, Jakarta' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: '2026-10-15T06:00:00.000Z' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Full marathon and half marathon race across central Jakarta landmarks.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ enum: EventStatus, default: EventStatus.OPEN })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional({ example: 'Tegal City Run' })
  @IsOptional()
  @IsString()
  organizerName?: string;

  @ApiPropertyOptional({ example: '+6287777331817' })
  @IsOptional()
  @IsString()
  organizerPhone?: string;

  @ApiPropertyOptional({ example: 'https://tegalcityrun.com' })
  @IsOptional()
  @IsString()
  organizerWebsite?: string;

  @ApiPropertyOptional({ type: [CreateTicketCategoryDto], description: 'Initial ticket tiers' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTicketCategoryDto)
  tickets?: CreateTicketCategoryDto[];
}

export class UpdateEventDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  banner?: string;

  @ApiPropertyOptional({ enum: SportCategory })
  @IsOptional()
  @IsEnum(SportCategory)
  sportCategory?: SportCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: EventStatus })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organizerName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organizerPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organizerWebsite?: string;
}
