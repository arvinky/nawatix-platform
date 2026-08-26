import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto/events.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, SportCategory, EventStatus } from '../../common/enums';

@ApiTags('Events Catalog & Management')
@Controller('api/events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get('dashboard/my-events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Organizer/Admin: List managed events with order and participant analytics' })
  async getDashboardEvents(@CurrentUser() user: any) {
    return this.eventsService.findDashboardEvents(user);
  }

  @Get()
  @ApiOperation({ summary: 'Public: Browse all active events with optional filtering and search' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for name or location' })
  @ApiQuery({ name: 'sportCategory', enum: SportCategory, required: false })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'status', enum: EventStatus, required: false })
  async findAll(
    @Query('search') search?: string,
    @Query('sportCategory') sportCategory?: SportCategory,
    @Query('location') location?: string,
    @Query('status') status?: EventStatus,
  ) {
    return this.eventsService.findAllPublic({ search, sportCategory, location, status });
  }

  @Get('dashboard/my-events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Organizer/Admin: Get dashboard events with full details' })
  async getDashboardEvents(@CurrentUser() user: any) {
    return this.eventsService.findDashboardEvents(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Public: Get deep event detail including organizer profile and ticket classes' })
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Organizer/Admin: Create a new sports event and tickets' })
  async create(@CurrentUser() user: any, @Body() dto: CreateEventDto) {
    return this.eventsService.create(user, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Organizer/Admin: Update existing event details' })
  async update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, user, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Organizer/Admin: Delete sports event and associated ticket categories' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.eventsService.remove(id, user);
  }
}
