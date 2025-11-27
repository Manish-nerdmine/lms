import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
  Put,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';

const ALLOWED_VIDEO_FORMATS = [
  'video/mp4',
  'video/x-msvideo', // AVI
  'video/quicktime', // MOV
  'video/x-ms-wmv', // WMV
  'video/x-matroska', // MKV
  'video/webm', // WebM
  'video/x-flv', // FLV
];

@ApiTags('videos')
@Controller('courses/:courseId/videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) { }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        video: {
          type: 'string',
          format: 'binary',
          description: 'Video file (MP4, AVI, MOV, WMV, MKV, WebM, or FLV)',
        },
        title: {
          type: 'string',
          description: 'Title of the video',
        },
        subtitle: {
          type: 'string',
          description: 'Subtitle of the video',
        },
        description: {
          type: 'string',
          description: 'Description of the video',
        },
        videoUrl: {
          type: 'string',
          description: 'URL of the video (if not uploading a file)',
        },
        thumbnail: {
          type: 'string',
          description: 'Thumbnail URL',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags for the video',
        },
        language: {
          type: 'string',
          description: 'Language of the video',
        },
        journeySteps: {
          type: 'array',
          description: 'Journey steps for the video',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Unique identifier' },
              title: { type: 'string', description: 'Step title' },
              description: { type: 'string', description: 'Step description' },
              order: { type: 'number', description: 'Step order' },
            },
          },
        },
        infoSections: {
          type: 'array',
          description: 'Info sections for the video',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Unique identifier' },
              title: { type: 'string', description: 'Section title' },
              content: { type: 'string', description: 'Section content' },
              order: { type: 'number', description: 'Section order' },
            },
          },
        },
        accordions: {
          type: 'array',
          description: 'Accordions for the video',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Unique identifier' },
              title: { type: 'string', description: 'Accordion title' },
              content: { type: 'string', description: 'Accordion content' },
              isExpanded: { type: 'boolean', description: 'Is expanded by default' },
              order: { type: 'number', description: 'Accordion order' },
            },
          },
        },
        faqs: {
          type: 'array',
          description: 'FAQs for the video',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Unique identifier' },
              question: { type: 'string', description: 'FAQ question' },
              answer: { type: 'string', description: 'FAQ answer' },
              order: { type: 'number', description: 'FAQ order' },
            },
          },
        },
        moduleUrl: {
          type: 'string',
          description: 'Module URL',
        },
        overview: {
          type: 'array',
          description: 'Overview/introduction items',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Unique identifier' },
              title: { type: 'string', description: 'Overview title' },
              description: { type: 'string', description: 'Overview description' },
            },
          },
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('video'))
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body() createVideoDto: CreateVideoDto,
    @Param('courseId') courseId: string,
  ) {
    try {
      if (!file && !createVideoDto.videoUrl) {
        throw new BadRequestException('Either video file or videoUrl must be provided');
      }

      const result = await this.videosService.uploadVideo(file, createVideoDto, courseId);

      return {
        success: true,
        message: 'Video uploaded successfully',
        data: result,
        streamingUrl: (result as any).streamingUrl,
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to upload video');
    }
  }

  @Get()
  async findAll(@Param('courseId') courseId: string) {
    return this.videosService.findAll(courseId);
  }

  @Get('drafts')
  async findAllDrafts(@Param('courseId') courseId: string) {
    return this.videosService.findAllDrafts(courseId);
  }

  @Post(':id/draft')
  async saveDraft(
    @Param('courseId') courseId: string,
    @Param('id') id: string,
    @Body() updateData: UpdateVideoDto,
  ) {
    return this.videosService.saveDraft(id, updateData);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.videosService.findOne(id);
  }

  @Get('stream/:filename')
  async streamVideo(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { stream, mimeType } = await this.videosService.getVideoStream(filename);
    response.set({
      'Content-Type': mimeType,
      'Content-Disposition': 'inline',
    });
    return new StreamableFile(stream);
  }

  @Put(':id/order')
  async updateOrder(
    @Param('id') id: string,
    @Body('order') order: number,
  ) {
    return this.videosService.updateOrder(id, order);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.videosService.remove(id);
  }

  @Get('check/:filename')
  async checkVideoExists(@Param('filename') filename: string) {
    try {
      const { stream, mimeType } = await this.videosService.getVideoStream(filename);
      return {
        exists: true,
        filename,
        mimeType,
        message: 'Video file found',
      };
    } catch (error) {
      return {
        exists: false,
        filename,
        message: 'Video file not found',
        error: error.message,
      };
    }
  }

  @Put(':id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Title of the video' },
        subtitle: { type: 'string', description: 'Subtitle of the video' },
        description: { type: 'string', description: 'Description of the video' },
        thumbnail: { type: 'string', description: 'Thumbnail URL' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Tags for the video' },
        language: { type: 'string', description: 'Language of the video' },
        journeySteps: {
          type: 'array',
          description: 'Journey steps for the video',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              order: { type: 'number' },
            },
          },
        },
        infoSections: {
          type: 'array',
          description: 'Info sections for the video',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              content: { type: 'string' },
              order: { type: 'number' },
            },
          },
        },
        accordions: {
          type: 'array',
          description: 'Accordions for the video',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              content: { type: 'string' },
              isExpanded: { type: 'boolean' },
              order: { type: 'number' },
            },
          },
        },
        faqs: {
          type: 'array',
          description: 'FAQs for the video',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              question: { type: 'string' },
              answer: { type: 'string' },
              order: { type: 'number' },
            },
          },
        },
        moduleUrl: { type: 'string', description: 'Module URL' },
        overview: {
          type: 'array',
          description: 'Overview/introduction items',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async updateVideoDetails(
    @Param('id') id: string,
    @Body() updateData: UpdateVideoDto,
  ) {
    return this.videosService.updateVideoDetails(id, updateData);
  }
} 