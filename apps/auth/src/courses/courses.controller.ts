import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { PasscodeAuthGuard } from '@app/common/auth/passcode-auth.guard';
import { ApiTags, ApiConsumes, ApiBody, ApiParam, ApiResponse, ApiQuery } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { CourseUsersProgressResponseDto } from './dto/course-users-progress.dto';

@ApiTags('courses')
@Controller('courses')
//@UseGuards(PasscodeAuthGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title of the course',
        },
        description: {
          type: 'string',
          description: 'Description of the course',
        },
        thumbnail: {
          type: 'string',
          format: 'binary',
          description: 'Course thumbnail image',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('thumbnail'))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createCourseDto: CreateCourseDto,
  ) {
    return this.coursesService.create(createCourseDto, file);
  }

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Get('thumbnails/:filename')
  async getThumbnail(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const filepath = path.join(process.cwd(), 'apps/auth/src/courses/thumbnails', filename);
    
    if (!fs.existsSync(filepath)) {
      throw new NotFoundException('Thumbnail not found');
    }

    const stream = fs.createReadStream(filepath);
    response.set({
      'Content-Type': 'image/jpeg',
      'Content-Disposition': 'inline',
    });
    return new StreamableFile(stream);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('thumbnail'))
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: Partial<CreateCourseDto>,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.coursesService.update(id, updateCourseDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }

  @Get(':id/users-progress')
  @ApiTags('courses')
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns all users associated with the course through groups and their progress',
    type: CourseUsersProgressResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  getCourseUsersWithProgress(
    @Param('id') id: string,
  ): Promise<CourseUsersProgressResponseDto> {
    return this.coursesService.getCourseUsersWithProgress(id);
  }
} 