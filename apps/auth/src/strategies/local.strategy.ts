// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy } from 'passport-local';
// import { UsersService } from '../users/users.service';

// @Injectable()
// export class LocalStategy extends PassportStrategy(Strategy, 'local') {
//   constructor(private readonly usersService: UsersService) {
//     super({ usernameField: 'emailOrPhoneNumber' });
//   }

//   async validate(emailOrPhoneNumber: string, password: string) {
//     try {
//       return await this.usersService.verifyUser(emailOrPhoneNumber, password);
//     } catch (err) {
//       throw new UnauthorizedException();
//     }
//   }
// }
