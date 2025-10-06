import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGroupDto {
  @ApiProperty({ 
    description: 'Name of the group', 
    required: false,
    example: 'Engineering Team'
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ 
    description: 'Description of the group', 
    required: false,
    example: 'Group for engineering team members'
  })
  @IsOptional()
  @IsString()
  description?: string;
}
