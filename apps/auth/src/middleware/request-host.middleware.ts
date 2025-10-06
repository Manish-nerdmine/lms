import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ServerUtils } from '../utils/server.utils';

@Injectable()
export class RequestHostMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Automatically set the server host from every request
    const serverHost = `${req.protocol}://${req.get('host')}`;
    ServerUtils.setRequestHost(req);
    
    console.log(`Request to: ${req.method} ${req.originalUrl} - Server Host: ${serverHost}`);
    next();
  }
}

