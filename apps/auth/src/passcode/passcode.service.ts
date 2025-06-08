import { Injectable } from '@nestjs/common';
import { PasscodeRepository } from './passcode.repository';

@Injectable()
export class PasscodeService {
  constructor(private readonly passcodeRepository: PasscodeRepository) {}

  async create(creatPasscodeDto) {
    return this.passcodeRepository.createPasscode(creatPasscodeDto);
  }

  async getPasscodeUser(passcodeDetailDto) {
    return this.passcodeRepository.getPasscodeUser(passcodeDetailDto);
  }
}
