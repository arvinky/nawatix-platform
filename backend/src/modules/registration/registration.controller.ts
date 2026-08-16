import { Controller, Get, Post, Body, Param, Query, UseGuards, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RegistrationService } from './registration.service';
import { VerifyParticipantDto } from './dto/registration.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, RegistrationStatus } from '../../common/enums';

@ApiTags('On-Site Registration & BIB Distribution')
@Controller('api/registration')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RegistrationController {
  constructor(private registrationService: RegistrationService) {}

  @Get('search')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin/Organizer: Lookup participant via QR Code, REG number, name, or email' })
  @ApiQuery({ name: 'query', required: true, description: 'Search term' })
  @ApiQuery({ name: 'eventId', required: false })
  async search(@CurrentUser() user: any, @Query('query') query: string, @Query('eventId') eventId?: string) {
    return this.registrationService.searchParticipant(user, { search: query, eventId });
  }

  @Post('verify')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin/Organizer: Verify participant check-in and bind unique BIB Number' })
  async verify(@CurrentUser() user: any, @Body() dto: VerifyParticipantDto) {
    return this.registrationService.verifyParticipant(user, dto);
  }

  @Get('my-tickets')
  @ApiOperation({ summary: 'Participant: Get all owned event tickets and Registration status/BIB number' })
  async getMyTickets(@CurrentUser() user: any) {
    return this.registrationService.findMyTickets(user.id);
  }

  @Get('participants')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin/Organizer: List managed participants directory' })
  @ApiQuery({ name: 'eventId', required: false })
  @ApiQuery({ name: 'status', enum: RegistrationStatus, required: false })
  async getAllParticipants(@CurrentUser() user: any, @Query('eventId') eventId?: string, @Query('status') status?: RegistrationStatus) {
    return this.registrationService.findAllManagedParticipants(user, { eventId, status });
  }

  @Delete('participants/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin/Organizer: Delete a participant' })
  async deleteParticipant(@CurrentUser() user: any, @Param('id') id: string) {
    return this.registrationService.deleteParticipant(id, user);
  }
}
