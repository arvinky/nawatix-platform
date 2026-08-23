import { Controller, Post, Body, Param, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Payment & Webhooks')
@Controller('api/payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('doku/notification')
  @ApiOperation({ summary: 'DOKU Webhook notification endpoint for payment status updates' })
  @ApiResponse({ status: 200, description: 'Notification processed' })
  async dokuNotification(@Body() payload: any) {
    return this.paymentsService.handleWebhook(payload);
  }

  @Post('simulate-success/:orderId')
  @ApiOperation({ summary: 'Simulator endpoint to instantly complete payment for an order in development' })
  @ApiResponse({ status: 200, description: 'Order marked as paid and participant generated' })
  async simulateSuccess(@Param('orderId') orderId: string) {
    return this.paymentsService.simulatePaymentCompletion(orderId);
  }
}
