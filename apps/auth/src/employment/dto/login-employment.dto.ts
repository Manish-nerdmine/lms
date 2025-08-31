import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class LoginEmploymentDto {
  @ApiProperty({ example: 'john.doe@company.com', description: 'Email address' })
  @IsEmail()
  @Transform(({ value }) => (value ? value?.toLowerCase() : value))
  email: string;

  @ApiProperty({ example: '1234567890', description: 'Password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

