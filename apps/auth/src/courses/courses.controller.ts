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
import { UpdateCourseDto } from './dto/update-course.dto';
import { PasscodeAuthGuard } from '@app/common/auth/passcode-auth.guard';
import { ApiTags, ApiConsumes, ApiBody, ApiParam, ApiResponse, ApiQuery } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { CourseUsersProgressResponseDto } from './dto/course-users-progress.dto';
import { CertificateResponseDto } from './dto/certificate.dto';

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
        userId: {
          type: 'string',
          description: 'User ID',
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
  @ApiQuery({ name: 'userId', required: false, description: 'Filter courses by userId' })
  @ApiResponse({ status: 200, description: 'List of all courses' })
  findAll(@Query('userId') userId: string) {
    return this.coursesService.findAll(userId);
  }

  @Get(':courseId/thumbnails/:filename')
  async getCourseThumbnail(
    @Param('courseId') courseId: string,
    @Param('filename') filename: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    console.log('🎯 THUMBNAIL ENDPOINT HIT!');
    console.log('🔍 Route: /courses/:courseId/thumbnails/:filename');
    
    // Decode the filename to handle URL encoding
    const decodedFilename = decodeURIComponent(filename);
    const uploadDir = this.coursesService.getUploadDir();
    let filepath = path.join(uploadDir, decodedFilename);
    
    console.log('Course ID:', courseId);
    console.log('Original filename:', filename);
    console.log('Decoded filename:', decodedFilename);
    console.log('Upload directory:', uploadDir);
    console.log('Looking for thumbnail file:', filepath);
    console.log('File exists:', fs.existsSync(filepath));
    
    // If the exact filename doesn't exist, try to find a file that ends with this filename
    if (!fs.existsSync(filepath)) {
      try {
        const files = fs.readdirSync(uploadDir);
        console.log('Available files in thumbnails directory:', files);
        
        // Look for a file that ends with the requested filename (for UUID-prefixed files)
        const matchingFile = files.find(file => file.endsWith(decodedFilename));
        if (matchingFile) {
          filepath = path.join(uploadDir, matchingFile);
          console.log('Found matching file with UUID prefix:', matchingFile);
          console.log('New filepath:', filepath);
          console.log('File exists:', fs.existsSync(filepath));
        }
      } catch (error) {
        console.error('Error reading thumbnails directory:', error);
      }
    }
    
    if (!fs.existsSync(filepath)) {
      console.error('Thumbnail not found at path:', filepath);
      throw new NotFoundException('Thumbnail not found');
    }

    const stream = fs.createReadStream(filepath);
    
    // Determine content type based on file extension
    const extension = path.extname(decodedFilename).toLowerCase();
    let contentType = 'image/jpeg'; // default
    
    switch (extension) {
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
    }
    
    response.set({
      'Content-Type': contentType,
      'Content-Disposition': 'inline',
    });
    return new StreamableFile(stream);
  }

  // Keep the old endpoint for backward compatibility
  @Get('thumbnails/:filename')
  async getThumbnail(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    console.log('🔄 LEGACY THUMBNAIL ENDPOINT HIT!');
    console.log('🔍 Route: /courses/thumbnails/:filename');
    return this.getCourseThumbnail('legacy', filename, response);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Course ID' })
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
  @ApiResponse({
    status: 200,
    description: 'Course updated successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        userId: { type: 'string' },
        thumbnail: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  @UseInterceptors(FileInterceptor('thumbnail'))
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
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
    description: 'Returns all employees associated with the course through groups and their progress',
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

  @Get('user/:userId/completed')
  @ApiTags('courses')
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns all completed courses for the user',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          courseId: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          thumbnail: { type: 'string' },
          dueDate: { type: 'string', format: 'date-time' },
          progressPercentage: { type: 'number' },
          completedVideos: { type: 'array', items: { type: 'string' } },
          completedQuizzes: { type: 'array', items: { type: 'string' } },
          videoCount: { type: 'number' },
          completedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found or no group assigned',
  })
  getUserCompletedCourses(@Param('userId') userId: string) {
    return this.coursesService.getUserCompletedCourses(userId);
  }

  @Get('user/:userId/todo')
  @ApiTags('courses')
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns all pending/todo courses for the user',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          courseId: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          thumbnail: { type: 'string' },
          dueDate: { type: 'string', format: 'date-time' },
          progressPercentage: { type: 'number' },
          completedVideos: { type: 'array', items: { type: 'string' } },
          completedQuizzes: { type: 'array', items: { type: 'string' } },
          videoCount: { type: 'number' },
          daysRemaining: { type: 'number' },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found or no group assigned',
  })
  getUserTodoCourses(@Param('userId') userId: string) {
    return this.coursesService.getUserTodoCourses(userId);
  }

  @Get('user/:userId/overdue')
  @ApiTags('courses')
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns all overdue courses for the user',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          courseId: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          thumbnail: { type: 'string' },
          dueDate: { type: 'string', format: 'date-time' },
          progressPercentage: { type: 'number' },
          completedVideos: { type: 'array', items: { type: 'string' } },
          completedQuizzes: { type: 'array', items: { type: 'string' } },
          videoCount: { type: 'number' },
          daysOverdue: { type: 'number' },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found or no group assigned',
  })
  getUserOverdueCourses(@Param('userId') userId: string) {
    return this.coursesService.getUserOverdueCourses(userId);
  }

  @Get('user/:userId/status')
  @ApiTags('courses')
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns comprehensive course status for the user including completed, todo, overdue courses and summary',
    schema: {
      type: 'object',
      properties: {
        completed: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              courseId: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              thumbnail: { type: 'string' },
              dueDate: { type: 'string', format: 'date-time' },
              progressPercentage: { type: 'number' },
              completedVideos: { type: 'array', items: { type: 'string' } },
              completedQuizzes: { type: 'array', items: { type: 'string' } },
              videoCount: { type: 'number' },
              completedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        todo: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              courseId: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              thumbnail: { type: 'string' },
              dueDate: { type: 'string', format: 'date-time' },
              progressPercentage: { type: 'number' },
              completedVideos: { type: 'array', items: { type: 'string' } },
              completedQuizzes: { type: 'array', items: { type: 'string' } },
              videoCount: { type: 'number' },
              daysRemaining: { type: 'number' },
            },
          },
        },
        overdue: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              courseId: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              thumbnail: { type: 'string' },
              dueDate: { type: 'string', format: 'date-time' },
              progressPercentage: { type: 'number' },
              completedVideos: { type: 'array', items: { type: 'string' } },
              completedQuizzes: { type: 'array', items: { type: 'string' } },
              videoCount: { type: 'number' },
              daysOverdue: { type: 'number' },
            },
          },
        },
        summary: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            completed: { type: 'number' },
            pending: { type: 'number' },
            overdue: { type: 'number' },
            completionRate: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found or no group assigned',
  })
  getUserCourseStatus(@Param('userId') userId: string) {
    return this.coursesService.getUserCourseStatus(userId);
  }

  @Get('employment/:employmentId/status')
  @ApiTags('courses')
  @ApiParam({ name: 'employmentId', description: 'Employment ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns comprehensive course status for the employee including completed, todo, overdue courses and summary',
    schema: {
      type: 'object',
      properties: {
        employmentId: { type: 'string' },
        userId: { type: 'string' },
        employeeName: { type: 'string' },
        employeeEmail: { type: 'string' },
        completed: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              courseId: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              thumbnail: { type: 'string' },
              dueDate: { type: 'string', format: 'date-time' },
              progressPercentage: { type: 'number' },
              completedVideos: { type: 'array', items: { type: 'string' } },
              completedQuizzes: { type: 'array', items: { type: 'string' } },
              videoCount: { type: 'number' },
              completedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        todo: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              courseId: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              thumbnail: { type: 'string' },
              dueDate: { type: 'string', format: 'date-time' },
              progressPercentage: { type: 'number' },
              completedVideos: { type: 'array', items: { type: 'string' } },
              completedQuizzes: { type: 'array', items: { type: 'string' } },
              videoCount: { type: 'number' },
              daysRemaining: { type: 'number' },
            },
          },
        },
        overdue: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              courseId: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              thumbnail: { type: 'string' },
              dueDate: { type: 'string', format: 'date-time' },
              progressPercentage: { type: 'number' },
              completedVideos: { type: 'array', items: { type: 'string' } },
              completedQuizzes: { type: 'array', items: { type: 'string' } },
              videoCount: { type: 'number' },
              daysOverdue: { type: 'number' },
            },
          },
        },
        summary: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            completed: { type: 'number' },
            pending: { type: 'number' },
            overdue: { type: 'number' },
            completionRate: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Employment not found or no group assigned',
  })
  getEmploymentCourseStatus(@Param('employmentId') employmentId: string) {
    return this.coursesService.getEmploymentCourseStatus(employmentId);
  }

  @Get('user/:userId/unassigned')
  @ApiTags('courses')
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the group name for the user',
    schema: {
      type: 'object',
      properties: {
        groupName: { 
          type: 'string',
          description: 'Name of the user\'s group (null if no group)',
          example: 'Manish_1'
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  getUnassignedCourses(@Param('userId') userId: string) {
    return this.coursesService.getUnassignedCourses(userId);
  }

  @Get('certificate')
  @ApiTags('courses')
  @ApiQuery({ name: 'userId', required: true, description: 'User ID' })
  @ApiQuery({ name: 'courseId', required: true, description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns certificate data with course name and user name',
    type: CertificateResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User or course not found, or course not completed',
  })
  getCertificate(
    @Query('userId') userId: string,
    @Query('courseId') courseId: string,
  ): Promise<CertificateResponseDto> {
    return this.coursesService.getCertificate(userId, courseId);
  }
} 