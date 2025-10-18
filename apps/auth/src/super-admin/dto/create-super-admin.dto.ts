import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateSuperAdminDto {
  @ApiProperty({ example: 'Super Admin', description: 'Full name of the super admin' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'superadmin@lms.com', description: 'Email address' })
  @IsEmail()
  @Transform(({ value }) => (value ? value?.toLowerCase() : value))
  email: string;

  @ApiProperty({ example: 'SuperSecurePass123!', description: 'Strong password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: '1234567890', description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'LMS Platform', description: 'Company name', required: false })
  @IsOptional()
  @IsString()
  companyName?: string;
}

