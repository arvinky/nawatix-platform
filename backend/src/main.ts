import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('AthletixBootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS for Vite frontend
  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'https://nawatix.com';
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:5173', 'http://localhost:3000', 'https://nawatix.com', 'https://www.nawatix.com', '*'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global validation pipes for DTO class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Serve image static uploads
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  // Swagger OpenAPI Documentation Configuration
  const config = new DocumentBuilder()
    .setTitle('Athletix API')
    .setDescription(
      'REST API Documentation for Athletix - One Platform for Every Sports Event. Handles multi-organizer RBAC, Midtrans Snap checkout, and live BIB check-ins.',
    )
    .setVersion('1.0.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Athletix API Documentation',
  });

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 Athletix Backend running on: http://localhost:${port}`);
  logger.log(`📚 Swagger API Docs accessible at: http://localhost:${port}/api/docs`);
}
bootstrap();
