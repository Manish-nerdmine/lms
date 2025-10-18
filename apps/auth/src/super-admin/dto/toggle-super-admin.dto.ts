import { IsMongoId, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ToggleSuperAdminDto {
  @ApiProperty({ example: '657e902c4b628d1f0fc8f09d', description: 'User ID to toggle super admin status' })
  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}

