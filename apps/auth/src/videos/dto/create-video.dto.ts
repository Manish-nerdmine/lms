import { IsNotEmpty, IsOptional, IsString, IsArray, IsUrl, IsNumber, IsBoolean, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class JourneyStepDto {
  @ApiProperty({ description: 'Icon URL for the journey step', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: 'Title of the journey step' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Description of the journey step', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Order of the journey step', required: false })
  @IsOptional()
  @IsNumber()
  order?: number;
}

class InfoSectionDto {
  @ApiProperty({ description: 'Title of the info section' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Content of the info section', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: 'Order of the info section', required: false })
  @IsOptional()
  @IsNumber()
  order?: number;
}

class AccordionDto {
  @ApiProperty({ description: 'Title of the accordion' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Content of the accordion', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: 'Whether the accordion is expanded by default', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isExpanded?: boolean;

  @ApiProperty({ description: 'Order of the accordion', required: false })
  @IsOptional()
  @IsNumber()
  order?: number;
}

class FaqDto {
  @ApiProperty({ description: 'FAQ question' })
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiProperty({ description: 'FAQ answer', required: false })
  @IsOptional()
  @IsString()
  answer?: string;

  @ApiProperty({ description: 'Order of the FAQ', required: false })
  @IsOptional()
  @IsNumber()
  order?: number;
}

export class CreateVideoDto {
  @ApiProperty({ description: 'Title of the video' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Subtitle of the video', required: false })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiProperty({ description: 'Description of the video', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'URL of the video (if not uploading a file)', required: false })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiProperty({ description: 'Thumbnail URL', required: false })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiProperty({ description: 'Tags for the video', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'Language of the video', required: false })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ description: 'Journey steps for the video', required: false, type: [JourneyStepDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JourneyStepDto)
  journeySteps?: JourneyStepDto[];

  @ApiProperty({ description: 'Info sections for the video', required: false, type: [InfoSectionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InfoSectionDto)
  infoSections?: InfoSectionDto[];

  @ApiProperty({ description: 'Accordions for the video', required: false, type: [AccordionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AccordionDto)
  accordions?: AccordionDto[];

  @ApiProperty({ description: 'FAQs for the video', required: false, type: [FaqDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqDto)
  faqs?: FaqDto[];

  @ApiProperty({ description: 'Module URL', required: false })
  @IsOptional()
  @IsUrl()
  moduleUrl?: string;

  @ApiProperty({ description: 'Overview/introduction text', required: false })
  @IsOptional()
  @IsString()
  overview?: string;
}