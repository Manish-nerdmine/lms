import { PartialType, ApiProperty, OmitType } from '@nestjs/swagger';
import { CreateVideoDto, JourneyStepDto, InfoSectionDto, AccordionItemDto, FaqDto, OverviewItemDto } from './create-video.dto';
import { IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateJourneyStepDto extends PartialType(JourneyStepDto) { }
class UpdateInfoSectionDto extends PartialType(InfoSectionDto) { }
class UpdateAccordionItemDto extends PartialType(AccordionItemDto) { }
class UpdateFaqDto extends PartialType(FaqDto) { }
class UpdateOverviewItemDto extends PartialType(OverviewItemDto) { }

export class UpdateVideoDto extends PartialType(
    OmitType(CreateVideoDto, ['journeySteps', 'infoSections', 'accordions', 'faqs', 'overview'] as const),
) {
    @ApiProperty({ description: 'Journey steps for the video', required: false, type: [UpdateJourneyStepDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateJourneyStepDto)
    journeySteps?: UpdateJourneyStepDto[];

    @ApiProperty({ description: 'Info sections for the video', required: false, type: [UpdateInfoSectionDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateInfoSectionDto)
    infoSections?: UpdateInfoSectionDto[];

    @ApiProperty({ description: 'Accordions for the video', required: false, type: [UpdateAccordionItemDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateAccordionItemDto)
    accordions?: UpdateAccordionItemDto[];

    @ApiProperty({ description: 'FAQs for the video', required: false, type: [UpdateFaqDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateFaqDto)
    faqs?: UpdateFaqDto[];

    @ApiProperty({ description: 'Overview/introduction items', required: false, type: [UpdateOverviewItemDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateOverviewItemDto)
    overview?: UpdateOverviewItemDto[];
}
