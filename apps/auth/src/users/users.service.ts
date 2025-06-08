import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { LoginAuthDto } from './dto/loginAuth.dto';
import { UsersRepository } from './users.repository';
import { PasscodeService } from '../passcode/passcode.service';
import { getHashKeys, comparePassword } from '../utils/common.utils'

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository, 
    private readonly passcodeService: PasscodeService
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      await this.validateCreateUserDto(createUserDto);
      return await this.usersRepository.createUser(createUserDto);
    } catch (err) {
      throw new UnprocessableEntityException(err.message);
    }
  }
  

  private async validateCreateUserDto(createUserDto: CreateUserDto) {
    try {
      await this.usersRepository.findOne({ email: createUserDto.email });
    } catch (err) {
      return;
    }
    throw new UnprocessableEntityException('Email already exists.');
  }

  async Login(loginAuthDto: LoginAuthDto) {
    const user = await this.usersRepository.findOne({ email: loginAuthDto?.email }, {password: 1, _id: 1});
    if (!user) {
      throw new UnprocessableEntityException('Invalid Email.');
    }
    const passwordIsValid = await comparePassword(loginAuthDto?.password, user.password);
    if (!passwordIsValid) {
      throw new UnprocessableEntityException('Invald Passeord .');
    }
 
    const passcode = await getHashKeys();
    const passcodePayload = {
      user: user._id,
      passcode,
    };
    const passcodeInfo = await this.passcodeService.create(passcodePayload)
    return {
      user: user?._id,
      passcode: passcodeInfo.passcode,
    };
  }

  async getUser(getUserDto: GetUserDto) {
    return this.usersRepository.findOne(getUserDto);
  }
}
