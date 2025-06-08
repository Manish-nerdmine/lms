import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiBody, ApiTags } from '@nestjs/swagger';

import { Response } from 'express';
import { CurrentUser, UserDocument } from '@app/common';
import { AuthService } from './auth.service';
import { PasscodeAuthGuard } from './guards/passcode-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginAuthDto } from './dto/login-auth.dto';

@ApiTags('Auth')
@Controller('')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @ApiBody({ type: LoginAuthDto })
  // @Post('login')
  // async login(@CurrentUser() user: UserDocument, @Res({ passthrough: true }) response: Response) {
  //   const accessInfo = await this.authService.login(user);
  //   response.send(accessInfo);
  // }

  // @UseGuards(PasscodeAuthGuard)
  // @MessagePattern('authenticate')
  // async authenticate(@Payload() data: any) {
  //   return data.user;
  // }
}
