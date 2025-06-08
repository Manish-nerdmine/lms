import { Controller, Get } from '@nestjs/common';
import { UserTypeService } from './userType.service';

@Controller('userType')
export class UserTypeController {
  constructor(private readonly userTypeService: UserTypeService) {}

  @Get()
  async getAllActiveUsers() {
    return this.userTypeService.getAllActiveUserTypes();
  }
}