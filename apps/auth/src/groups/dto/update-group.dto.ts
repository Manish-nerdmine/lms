import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGroupDto {
  @ApiProperty({ description: 'Name of the group', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Description of the group', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
