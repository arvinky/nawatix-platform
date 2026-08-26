import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VouchersService } from './vouchers.service';
import { CheckVoucherDto, CreateVoucherDto, UpdateVoucherDto } from './dto/vouchers.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Promotional Vouchers')
@Controller('api/vouchers')
export class VouchersController {
  constructor(private vouchersService: VouchersService) {}

  @Post('validate')
  @ApiOperation({ summary: 'Validate a voucher code and compute discounted cart totals' })
  async validateVoucher(@Body() dto: CheckVoucherDto) {
    return this.vouchersService.validateAndCalculateDiscount(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiBearerAuth()
  @ApiQuery({ name: 'eventId', required: false, type: String })
  @ApiOperation({ summary: 'Admin/Organizer: List promotional vouchers' })
  async findAll(@Query('eventId') eventId?: string) {
    return this.vouchersService.findAll(eventId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin/Organizer: Create a discount voucher' })
  async create(@Body() dto: CreateVoucherDto) {
    return this.vouchersService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin/Organizer: Modify voucher attributes' })
  async update(@Param('id') id: string, @Body() dto: UpdateVoucherDto) {
    return this.vouchersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ORGANIZER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin/Organizer: Delete voucher' })
  async remove(@Param('id') id: string) {
    return this.vouchersService.remove(id);
  }
}
