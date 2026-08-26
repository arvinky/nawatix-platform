import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyParticipantDto {
  @ApiProperty({ example: 'REG-202600001 or UUID of participant' })
  @IsString()
  @IsNotEmpty()
  participantIdOrRegNumber: string;

  @ApiPropertyOptional({ example: '1057', description: 'BIB Number (optional, will be auto-generated if not provided)' })
  @IsString()
  @IsOptional()
  bibNumber?: string;
}
