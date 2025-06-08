import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser, UserDocument, PasscodeAuthGuard } from '@app/common';
import { LoginAuthDto } from './dto/loginAuth.dto';

import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('login')
  async login(@Body()  loginAuthDto: LoginAuthDto) {
    return await this.usersService.Login(loginAuthDto)
  }

  @Get()
  @UseGuards(PasscodeAuthGuard)
  async getUser(@CurrentUser() user: UserDocument) {
    return user;
  }
}
