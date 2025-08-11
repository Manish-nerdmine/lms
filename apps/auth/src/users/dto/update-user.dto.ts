import { IsEmail, IsOptional, IsBoolean, MinLength, IsString, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @ApiProperty({ example: 'user', description: 'Type of user (user/admin)', enum: ['user', 'admin'], required: false })
  @IsOptional()
  @IsString()
  userType?: string;

  @ApiProperty({ example: 'Manish', description: 'Full name of the user', required: false })
  @IsOptional()
  fullName?: string;

  @ApiProperty({ example: 'manish67@gmail.com', description: 'Email address', required: false })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => (value ? value?.toLowerCase() : value))
  email?: string;

  @ApiProperty({ example: 'manish12', description: 'User password', required: false })
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiProperty({ example: true, description: 'User has accepted terms and conditions', required: false })
  @IsOptional()
  @IsBoolean()
  isTermsAccepted?: boolean;

  @ApiProperty({ example: '657e902c4b628d1f0fc8f09e', description: 'Group ID (optional)', required: false })
  @IsOptional()
  @IsMongoId()
  groupId?: string;
}
