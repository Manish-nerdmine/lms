import { IsEmail, IsOptional, IsBoolean, MinLength, IsString, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @ApiProperty({ 
    example: '657e902c4b628d1f0fc8f09', 
    description: 'User type ID', 
    required: false 
  })
  @IsOptional()
  @IsMongoId()
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
    example: '657e902c4b628d1f0fc8f09', 
    description: 'Group ID (optional)', 
    required: false 
  })
  @IsOptional()
  @IsMongoId()
  groupId?: string;
}
