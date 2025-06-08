import { Injectable } from '@nestjs/common';
import { UserDocument, getRandomCharacter } from '@app/common';

import { PasscodeService } from './passcode/passcode.service';

@Injectable()
export class AuthService {
  constructor(private readonly passcodeService: PasscodeService) {}

  // async login(user: UserDocument) {
  //   const passcodePayload = {
  //     user: user._id,
  //     passcode: await bcrypt.hash(getRandomCharacter(20), 10),
  //   };

  //   const passcodeInfo = await this.passcodeService.create(passcodePayload);

  //   return {
  //     access_token: passcodeInfo.passcode,
  //     user_info: passcodeInfo.user,
  //   };
  // }
}
