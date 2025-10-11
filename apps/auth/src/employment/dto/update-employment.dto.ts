import { IsEmail, IsString, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateEmploymentDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the employee', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ example: 'john.doe@company.com', description: 'Email address', required: false })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => (value ? value?.toLowerCase() : value))
  email?: string;

  @ApiProperty({ example: 'manager', description: 'Role of the employee', required: false })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({ example: '657e902c4b628d1f0fc8f09', description: 'Group ID', required: false })
  @IsOptional()
  @IsMongoId()
  groupId?: string;
}

