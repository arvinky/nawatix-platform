import { IsOptional, IsString, MinLength, IsEnum, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Budi Athlete Revised' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '+628999888777' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ example: 'NewSecret@2026' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ example: 'Jakarta Running Hub Revised' })
  @IsOptional()
  @IsString()
  organizationName?: string;

  @ApiPropertyOptional({ example: 'Updated description of our sports community.' })
  @IsOptional()
  @IsString()
  organizationDescription?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-logo.jpg' })
  @IsOptional()
  @IsString()
  organizationLogo?: string;
}

export class CreateUserDto {
  @ApiProperty({ example: 'Organizer Partner' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'partner@athletix.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password@123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.ADMIN })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ example: 'Partner Sports Group' })
  @IsOptional()
  @IsString()
  organizationName?: string;

  @ApiPropertyOptional({ example: '+628111222333' })
  @IsOptional()
  @IsString()
  phone?: string;
}
