import { IsEmail, IsNotEmpty, IsBoolean, MinLength, IsString, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class CreateUserDto {
  //@ApiProperty({ example: '657e902c4b628d1f0fc8f09e', description: 'User Type ID' })
  @ApiProperty({ example: 'user', description: 'Type of user (user/admin)' })
  @IsString()
  @IsNotEmpty()
  userType: string;

  @ApiProperty({ example: 'Manish', description: 'Full name of the user' })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'manish67@gmail.com', description: 'Email address' })
  @IsEmail()
  @Transform(({ value }) => (value ? value?.toLowerCase() : value))
  email: string;

  @ApiProperty({ example: '9876543210', description: 'Phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: '1234567890', description: 'Password' })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ example: true, description: 'User has accepted terms and conditions' })
  @IsBoolean()
  isTermsAccepted: boolean;

  @ApiProperty({ example: '657e902c4b628d1f0fc8f09e', description: 'Group ID (optional)', required: false })
  @IsOptional()
  @IsMongoId()
  groupId?: string;
}