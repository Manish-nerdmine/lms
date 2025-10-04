import { IsEmail, IsOptional, IsBoolean, MinLength, IsString, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @ApiProperty({ 
    example: 'user', 
    description: 'Type of user (user/admin)', 
    required: false 
  })
  @IsOptional()
  @IsString()
  userType?: string;

  @ApiProperty({ 
    example: 'Manish', 
    description: 'Full name of the user', 
    required: false 
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ 
    example: 'manish67@gmail.com', 
    description: 'Email address', 
    required: false 
  })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => (value ? value?.toLowerCase() : value))
  email?: string;

  @ApiProperty({ 
    example: '9876543210', 
    description: 'Phone number', 
    required: false 
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ 
    example: 'Example Corp', 
    description: 'Company name', 
    required: false 
  })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({ 
    example: 'USA', 
    description: 'Country', 
    required: false 
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ 
    example: true, 
    description: 'User has accepted terms and conditions', 
    required: false 
  })
  @IsOptional()
  @IsBoolean()
  isTermsAccepted?: boolean;

  @ApiProperty({ 
    example: '657e902c4b628d1f0fc8f09', 
    description: 'Group ID (optional)', 
    required: false 
  })
  @IsOptional()
  @IsMongoId()
  groupId?: string;

  @ApiProperty({ 
    example: '657e902c4b628d1f0fc8f09', 
    description: 'Department ID (optional)', 
    required: false 
  })
  @IsOptional()
  @IsMongoId()
  departmentId?: string;
}
