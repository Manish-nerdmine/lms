import { Validate, IsNotEmpty } from 'class-validator';
import { EmailOrPhoneNumberValidator } from '@app/common';

export class LoginAuthDto {
  @Validate(EmailOrPhoneNumberValidator)
  emailOrPhoneNumber?: string;

  @IsNotEmpty()
  password: string;
}
