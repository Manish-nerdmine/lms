import { ValidationPipe, VersioningType, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestApplication, NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';
import { Request, Response, NextFunction } from 'express';

import {
  AUTH_ROUTE_PREFIX,
  DEFAULT_AUTH_API_VERSION,
  APP_ROUTE_V1_PREFIX,
  swaggerInit,
  AllExceptionsFilter,
} from '@app/common';

import { AuthModule } from './auth.module';
import { ServerUtils } from './utils/server.utils';

async function bootstrap() {
  const app = await NestFactory.create<NestApplication>(AuthModule, { cors: true });
  const configService = app.get(ConfigService);

  // Global middleware to automatically set server host from request
  app.use((req: Request, res: Response, next: NextFunction) => {
    const serverHost = `${req.protocol}://${req.get('host')}`;
    ServerUtils.setRequestHost(req);
    console.log(`🌐 Request: ${req.method} ${req.originalUrl} - Server Host: ${serverHost}`);
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        console.error('❌ DTO Validation Error:', JSON.stringify(errors, null, 2));
        return new BadRequestException(errors);
      },
    }),
  );

  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: configService.get('TCP_HOST'),
      port: configService.get('TCP_PORT'),
    },
  });

  app
    .enableVersioning({
      type: VersioningType.URI,
      defaultVersion: DEFAULT_AUTH_API_VERSION,
    })
    .setGlobalPrefix(AUTH_ROUTE_PREFIX);
  app.useLogger(app.get(Logger));

  await app.startAllMicroservices();

  await swaggerInit(app, APP_ROUTE_V1_PREFIX);

  await app.listen(configService.get('HTTP_PORT'));
}
bootstrap();
