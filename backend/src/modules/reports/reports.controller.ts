import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums';
import { Response } from 'express';

@ApiTags('Analytics & Reports')
@Controller('api/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth()
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Admin/Organizer: Get aggregated real-time SaaS statistics and chart series' })
  async getDashboardStats(@CurrentUser() user: any) {
    return this.reportsService.getDashboardStats(user);
  }

  @Get('export')
  @ApiOperation({ summary: 'Admin/Organizer: Export Revenue, Participants, or Payment reports to CSV/Excel text' })
  @ApiQuery({ name: 'type', enum: ['revenue', 'participants', 'payment'], required: true })
  @ApiQuery({ name: 'format', enum: ['csv', 'excel', 'pdf'], required: true })
  async exportReport(
    @CurrentUser() user: any,
    @Query('type') type: string,
    @Query('format') format: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const report = await this.reportsService.exportReport(user, type || 'revenue', format || 'csv');
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${report.filename}"`,
    });
    return report.content;
  }
}
