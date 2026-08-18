import { Controller, Get, Post, Body, Param, UseGuards, Query, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/orders.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, PaymentStatus } from '../../common/enums';

@ApiTags('Ticket Orders & Checkout')
@Controller('api/orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create new ticket order and request Midtrans Snap Token' })
  @ApiResponse({ status: 201, description: 'Order created with snap token and invoice' })
  async createOrder(@CurrentUser() user: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(user, dto);
  }

  @Get('my-orders')
  @ApiOperation({ summary: 'Get current logged-in participant orders' })
  async getMyOrders(@CurrentUser() user: any) {
    return this.ordersService.findUserOrders(user.id);
  }

  @Get('manage')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin/Organizer: Get orders scoped by permission hierarchy' })
  @ApiQuery({ name: 'status', enum: PaymentStatus, required: false })
  @ApiQuery({ name: 'eventId', required: false })
  async getManagedOrders(@CurrentUser() user: any, @Query('status') status?: PaymentStatus, @Query('eventId') eventId?: string) {
    return this.ordersService.findAdminOrOrganizerOrders(user, { status, eventId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of specific order and participant status' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ordersService.findOne(id, user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin/Organizer: Delete an order and its related records' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ordersService.removeOrder(id, user);
  }
}
