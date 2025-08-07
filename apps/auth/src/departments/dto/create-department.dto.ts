import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ description: 'Name of the department' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the department', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Department code', required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ description: 'Whether the department is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiProperty({ description: 'Manager ID', required: false })
  @IsOptional()
  @IsString()
  managerId?: string;

  @ApiProperty({ description: 'Department location', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'Number of employees', default: 0 })
  @IsOptional()
  @IsNumber()
  employeeCount?: number = 0;
} 