import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums';

export class LoginDto {
  @ApiProperty({ example: 'admin@athletix.com', description: 'User account email address' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password@123', description: 'Account secret password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'Budi Santoso', description: 'Full participant or organizer name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'newuser@athletix.com', description: 'Unique email address' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password@123', description: 'Password (min 6 characters)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: '+62812345678', description: 'Phone number for SMS/WhatsApp notices' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.USER, description: 'Requested user role (Admin or User)' })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ example: 'Jakarta Athletics Club', description: 'Organization name if role is Organizer' })
  @IsOptional()
  @IsString()
  organizationName?: string;
}
