import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Res,
  StreamableFile,
  Put,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { PasscodeAuthGuard } from '@app/common/auth/passcode-auth.guard';
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
//@UseGuards(PasscodeAuthGuard)
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        video: {
          type: 'string',
          format: 'binary',
          description: 'Video file (MP4, AVI, MOV, WMV, MKV, WebM, or FLV) or PPT file (PPT, PPTX)',
        },
        title: {
          type: 'string',
          description: 'Title of the video',
        },
        description: {
          type: 'string',
          description: 'Description of the video',
        },
        videoUrl: {
          type: 'string',
          description: 'URL of the video (if not uploading a file)',
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
  async updateVideoDetails(
    @Param('id') id: string,
    @Body() updateData: { title?: string; description?: string },
  ) {
    return this.videosService.updateVideoDetails(id, updateData);
  }
} 