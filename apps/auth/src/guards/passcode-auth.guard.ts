import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PasscodeService } from '../passcode/passcode.service';

@Injectable()
export class PasscodeAuthGuard implements CanActivate {
  constructor(private readonly passcodeService: PasscodeService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const passcode =
      context.switchToHttp().getRequest()?.Authentication ||
      context.switchToHttp().getRequest()?.authentication;

    try {
      const passcodeDetail = await this.passcodeService.getPasscodeUser({ passcode });
      context.switchToHttp().getRequest().user = passcodeDetail?.user;
      if (!passcodeDetail) {
        throw new UnauthorizedException();
      }
      return passcodeDetail ? true : false;
    } catch (err) {
      throw new UnauthorizedException(err);
    }
  }
}
