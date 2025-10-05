import { IsEmail, IsNotEmpty, IsBoolean, MinLength, IsString, IsOptional, IsMongoId, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class CreateEmploymentDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the employee' })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'john.doe@company.com', description: 'Email address (can be existing user email)' })
  @IsEmail()
  @Transform(({ value }) => (value ? value?.toLowerCase() : value))
  email: string;

  @ApiProperty({ example: '1234567890', description: 'Password for employee login' })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ example: 'user', description: 'Role of the employee' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({ example: true, description: 'Employee has accepted terms and conditions' })
  @IsBoolean()
  isTermsAccepted: boolean;

  @ApiProperty({ example: '657e902c4b628d1f0fc8f09', description: 'Group ID (optional)', required: false })
  @IsOptional()
  @IsMongoId()
  groupId?: string;
}

