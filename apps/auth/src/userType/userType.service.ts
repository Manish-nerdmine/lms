import { Injectable } from '@nestjs/common';
import { UserTypeRepository } from './userType.repository';

@Injectable()
export class UserTypeService {
  constructor(private readonly userRepository: UserTypeRepository) {}

  async getAllActiveUserTypes() {
    return this.userRepository.findAllActive();
  }
}