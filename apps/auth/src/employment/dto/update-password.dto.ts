import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({ 
    example: 'oldPassword123', 
    description: 'Current password of the employee',
    minLength: 6
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Current password must be at least 6 characters long' })
  currentPassword: string;

  @ApiProperty({ 
    example: 'newPassword456', 
    description: 'New password for the employee',
    minLength: 6
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  newPassword: string;
}

