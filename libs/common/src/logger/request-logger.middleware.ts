// request-logging.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from 'nestjs-pino';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(private readonly loggerService: Logger) {}

  use(req: Request, res: Response, next: () => void) {
    const { method, originalUrl, body } = req;
    const { statusCode } = res;

    this.loggerService.log(
      {
        method,
        originalUrl,
        request: body,
        response: statusCode,
      },
      'HTTP Request',
    );

    next();
  }
}
