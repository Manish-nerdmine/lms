import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { LoginAuthDto } from '../dto';

export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    // transform the request object to class instance
    const body = plainToInstance(LoginAuthDto, request.body);

    // get a list of errors
    const errors = await validate(body);

    // extract error messages from the errors array
    const errorMessages = errors.flatMap(({ constraints }) => Object.values(constraints));

    if (errorMessages.length > 0) {
      throw new UnauthorizedException();
    }

    return super.canActivate(context) as boolean | Promise<boolean>;
  }
}
