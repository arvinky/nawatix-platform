import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyParticipantDto {
  @ApiProperty({ example: 'REG-202600001 or UUID of participant' })
  @IsString()
  @IsNotEmpty()
  participantIdOrRegNumber: string;

  @ApiProperty({ example: '1057', description: 'BIB Number assigned during race pack collection' })
  @IsString()
  @IsNotEmpty()
  bibNumber: string;
}
