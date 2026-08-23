import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus, RegistrationStatus } from '../../common/enums';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private isSimulation: boolean;
  private dokuClientId: string;
  private dokuSecretKey: string;
  private dokuBaseUrl: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.dokuClientId = this.configService.get<string>('DOKU_CLIENT_ID') || 'TEST-CLIENT-ID';
    this.dokuSecretKey = this.configService.get<string>('DOKU_SECRET_KEY') || 'TEST-SECRET-KEY';
    const isProduction = this.configService.get<string>('DOKU_IS_PRODUCTION') === 'true';
    this.isSimulation = this.configService.get<string>('DOKU_IS_SIMULATION') !== 'false'; // Default to true in test
    this.dokuBaseUrl = isProduction ? 'https://api.doku.com' : 'https://api-sandbox.doku.com';
  }

  private generateSignature(requestTarget: string, reqBody: any, timestamp: string, requestId: string): string {
    const digest = crypto.createHash('sha256').update(JSON.stringify(reqBody)).digest('base64');
    const componentSignature = `Client-Id:${this.dokuClientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`;
    
    const hmac = crypto.createHmac('sha256', this.dokuSecretKey);
    return 'HMACSHA256=' + hmac.update(componentSignature).digest('base64');
  }

  async createDokuCheckoutUrl(order: {
    id: string;
    invoice: string;
    total: number;
    user: { name: string; email: string; phone?: string | null };
    event: { name: string };
  }): Promise<{ snapToken: string; redirectUrl: string }> {
    if (this.isSimulation) {
      this.logger.log(`Simulation mode active for Invoice ${order.invoice}. Returning simulated Doku URL.`);
      return {
        snapToken: `SIM_DOKU_TOKEN_${order.invoice}_${Date.now()}`,
        redirectUrl: `http://localhost:5173/payment-simulator/${order.id}`,
      };
    }

    const requestBody = {
      order: {
        amount: Math.round(order.total),
        invoice_number: order.invoice,
        callback_url: `${this.configService.get<string>('FRONTEND_URL')}/order-success/${order.id}`,
      },
      payment: {
        payment_due_date: 60, // 60 minutes
      },
      customer: {
        name: order.user.name,
        email: order.user.email,
        phone: order.user.phone || '0810000000',
      }
    };

    const requestId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const requestTarget = '/checkout/v1/payment';

    try {
      const response = await axios.post(`${this.dokuBaseUrl}${requestTarget}`, requestBody, {
        headers: {
          'Client-Id': this.dokuClientId,
          'Request-Id': requestId,
          'Request-Timestamp': timestamp,
          'Signature': this.generateSignature(requestTarget, requestBody, timestamp, requestId),
          'Content-Type': 'application/json',
        }
      });

      return {
        snapToken: response.data?.response?.payment?.token_id || `DOKU_TOKEN_${order.invoice}`,
        redirectUrl: response.data?.response?.payment?.url || `http://localhost:5173/payment-simulator/${order.id}`,
      };
    } catch (error: any) {
      this.logger.error('Doku API error, falling back to Simulation mode:', error.response?.data || error.message);
      return {
        snapToken: `SIM_DOKU_TOKEN_${order.invoice}`,
        redirectUrl: `http://localhost:5173/payment-simulator/${order.id}`,
      };
    }
  }

  async handleWebhook(payload: any) {
    this.logger.log(`Received Doku webhook notification for order: ${payload.order?.invoice_number}`);
    const invoice = payload.order?.invoice_number;
    
    // Jokul transaction status mapping
    // SUCCESS, FAILED
    const transactionStatus = payload.transaction?.status;
    const paymentType = payload.transaction?.payment_type_name || 'DOKU Payment';

    if (!invoice) {
      throw new BadRequestException('Invalid payload: invoice_number missing');
    }

    const order = await this.prisma.order.findUnique({
      where: { invoice },
      include: { user: true, event: true, ticketCategory: true },
    });

    if (!order) {
      throw new NotFoundException(`Order with invoice ${invoice} not found.`);
    }

    let newStatus = order.status;
    if (transactionStatus === 'SUCCESS') {
      newStatus = PaymentStatus.PAID;
    } else if (transactionStatus === 'FAILED' || transactionStatus === 'EXPIRED') {
      newStatus = transactionStatus === 'EXPIRED' ? PaymentStatus.EXPIRED : PaymentStatus.FAILED;
    }

    await this.prisma.$transaction(async (tx) => {
      // 1. Log payment
      await tx.payment.create({
        data: {
          orderId: order.id,
          transactionId: payload.transaction?.original_request_id || `DOKU-TRX-${Date.now()}`,
          paymentType: paymentType,
          grossAmount: Number(payload.order?.amount) || order.total,
          status: transactionStatus || 'SUCCESS',
          rawResponse: JSON.stringify(payload),
        },
      });

      // 2. Update order status
      if (order.status !== newStatus) {
        await tx.order.update({
          where: { id: order.id },
          data: { status: newStatus, paymentMethod: `DOKU Jokul (${paymentType})` },
        });

        // 3. If turning PAID and participant not created yet, generate sequential registration number
        if (newStatus === PaymentStatus.PAID) {
          const existingParticipant = await tx.participant.findUnique({
            where: { orderId: order.id },
          });

          if (!existingParticipant) {
            const regNumber = await this.generateRegistrationNumber(tx);
            await tx.participant.create({
              data: {
                registrationNumber: regNumber,
                orderId: order.id,
                userId: order.userId,
                eventId: order.eventId,
                name: order.user.name,
                email: order.user.email,
                phone: order.user.phone,
                status: RegistrationStatus.NOT_REGISTERED_YET,
              },
            });

            // Increment sold counter on TicketCategory
            await tx.ticketCategory.update({
              where: { id: order.ticketCategoryId },
              data: { sold: { increment: 1 } },
            });
          }
        }
      }
    });

    return { success: true };
  }

  async simulatePaymentCompletion(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, event: true },
    });
    if (!order) {
      throw new NotFoundException('Order not found for payment simulation.');
    }
    if (order.status === PaymentStatus.PAID) {
      return { success: true, message: 'Order is already paid.' };
    }

    // Trigger fake Doku webhook with SUCCESS
    return this.handleWebhook({
      order: {
        invoice_number: order.invoice,
        amount: order.total
      },
      transaction: {
        status: 'SUCCESS',
        payment_type_name: 'Simulated Payment',
        original_request_id: `SIM_TRX_${Date.now()}`
      }
    });
  }

  private async generateRegistrationNumber(tx: any): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `REG-${year}`;

    const lastParticipant = await tx.participant.findFirst({
      where: { registrationNumber: { startsWith: prefix } },
      orderBy: { registrationNumber: 'desc' },
    });

    let seq = 1;
    if (lastParticipant) {
      const parts = lastParticipant.registrationNumber.split('-');
      if (parts.length >= 2) {
        const numPart = parts[1].substring(4);
        const parsed = parseInt(numPart, 10);
        if (!isNaN(parsed)) {
          seq = parsed + 1;
        }
      }
    }

    return `${prefix}${seq.toString().padStart(5, '0')}`;
  }
}
