import { Transform } from 'class-transformer';
import { IsNotEmpty, IsEmail, IsString } from 'class-validator';
export class LoginAuthDto {
  @IsEmail()
  @Transform(({ value }) => (value ? value?.toLowerCase() : value))
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

}
