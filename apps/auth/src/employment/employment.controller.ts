import { Controller, Post, Body, Get, Param, UseGuards, Request, Query, UseInterceptors, UploadedFile, Put, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmploymentService } from './employment.service';
import { CreateEmploymentDto } from './dto/create-employment.dto';
import { LoginEmploymentDto } from './dto/login-employment.dto';
import { UpdateEmploymentDto } from './dto/update-employment.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { MarkVideoCompleteDto } from './dto/mark-video-complete.dto';

@ApiTags('Employment')
@Controller('employment')
export class EmploymentController {
  constructor(private readonly employmentService: EmploymentService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Create employment record' })
  @ApiResponse({ status: 201, description: 'Employment record created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Employment record already exists' })
  async create(@Body() createEmploymentDto: CreateEmploymentDto) {
    return await this.employmentService.create(createEmploymentDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login employment' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 422, description: 'Invalid credentials' })
  async login(@Body() loginEmploymentDto: LoginEmploymentDto) {
    return await this.employmentService.login(loginEmploymentDto);
  }

  @Post('upload-excel')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'userId', required: true, description: 'User ID to assign all employments to' })
  @ApiQuery({ name: 'groupId', required: false, description: 'Group ID to assign all employments to (optional)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Excel file with employment data',
        },
      },
    },
  })
  @ApiOperation({ 
    summary: 'Upload employments from Excel file',
    description: 'Upload employments from Excel file. Required columns: fullName, email, role. userId and groupId are passed as query parameters.'
  })
  @ApiResponse({ status: 201, description: 'Employments uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file format or data' })
  async uploadEmploymentsFromExcel(
    @UploadedFile() file: Express.Multer.File,
    @Query('userId') userId: string,
    @Query('groupId') groupId?: string,
  ) {
    return this.employmentService.uploadEmploymentsFromExcel(file, userId, groupId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all employments with pagination and search' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter employments by userId' })
  @ApiQuery({ name: 'groupId', required: false, description: 'Filter employments by groupId' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name or email' })
  @ApiResponse({ status: 200, description: 'List of all employments with pagination' })
  async getAllEmployments(
    @Query('userId') userId?: string,
    @Query('groupId') groupId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return await this.employmentService.getAllEmployments(userId, groupId, page, limit, search);
  }

  @Get('user-info/:email')
  @ApiOperation({ summary: 'Get employment with user information' })
  @ApiResponse({ status: 200, description: 'Employment record with user info found' })
  @ApiResponse({ status: 404, description: 'Employment record not found' })
  async getEmploymentWithUserInfo(@Param('email') email: string) {
    return await this.employmentService.getEmploymentWithUserInfo(email);
  }

  @Get('group/:groupId')
  @ApiOperation({ summary: 'Get all employments by group' })
  @ApiResponse({ status: 200, description: 'Employments found' })
  async getEmploymentsByGroup(@Param('groupId') groupId: string) {
    return await this.employmentService.getEmploymentsByGroup(groupId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employment by ID' })
  @ApiResponse({ status: 200, description: 'Employment record found' })
  @ApiResponse({ status: 404, description: 'Employment record not found' })
  async getEmploymentById(@Param('id') id: string) {
    return await this.employmentService.getEmploymentById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update employment record' })
  @ApiResponse({ status: 200, description: 'Employment record updated successfully' })
  @ApiResponse({ status: 404, description: 'Employment record not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async updateEmployment(
    @Param('id') id: string,
    @Body() updateEmploymentDto: UpdateEmploymentDto,
  ) {
    return await this.employmentService.updateEmployment(id, updateEmploymentDto);
  }

  @Patch(':id/update-password')
  @ApiOperation({ summary: 'Update employee password' })
  @ApiResponse({ 
    status: 200, 
    description: 'Password updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Password updated successfully' },
        employmentId: { type: 'string', example: '657e902c4b628d1f0fc8f09e' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Employment record not found' })
  @ApiResponse({ status: 422, description: 'Current password is incorrect or validation error' })
  async updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return await this.employmentService.updatePassword(id, updatePasswordDto);
  }

  @Post(':id/submit-quiz')
  @ApiOperation({ summary: 'Submit quiz for employee (1 mark per question, minimum 8/10 to pass)' })
  @ApiResponse({ 
    status: 201, 
    description: 'Quiz submitted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Quiz passed successfully!' },
        attemptId: { type: 'string' },
        score: { type: 'number', example: 9 },
        totalQuestions: { type: 'number', example: 10 },
        correctAnswers: { type: 'number', example: 9 },
        wrongAnswers: { type: 'number', example: 1 },
        percentage: { type: 'number', example: 90 },
        isPassed: { type: 'boolean', example: true },
        passingThreshold: { type: 'number', example: 8 },
        requiredScore: { type: 'number', example: 8 },
        feedback: { type: 'string', example: 'Congratulations! You scored 9/10' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Employment, course, or quiz not found' })
  @ApiResponse({ status: 400, description: 'Quiz does not belong to the course' })
  async submitQuiz(
    @Param('id') employmentId: string,
    @Body() submitQuizDto: SubmitQuizDto,
  ) {
    return await this.employmentService.submitQuiz(
      employmentId,
      submitQuizDto.courseId,
      submitQuizDto.quizId,
      submitQuizDto.answers
    );
  }

  @Post(':id/mark-video-complete')
  @ApiOperation({ summary: 'Mark video as complete for employee' })
  @ApiResponse({ 
    status: 201, 
    description: 'Video marked as complete',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Video marked as complete' },
        progress: {
          type: 'object',
          properties: {
            completedVideos: { type: 'number', example: 5 },
            completedQuizzes: { type: 'number', example: 2 },
            progressPercentage: { type: 'number', example: 70 },
            isCourseCompleted: { type: 'boolean', example: false }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Employment or course not found' })
  @ApiResponse({ status: 400, description: 'Video does not belong to the course' })
  async markVideoComplete(
    @Param('id') employmentId: string,
    @Body() markVideoCompleteDto: MarkVideoCompleteDto,
  ) {
    return await this.employmentService.markVideoComplete(
      employmentId,
      markVideoCompleteDto.courseId,
      markVideoCompleteDto.videoId
    );
  }

  @Get(':id/progress/:courseId')
  @ApiOperation({ summary: 'Get employee progress for a specific course' })
  @ApiResponse({ 
    status: 200, 
    description: 'Employee progress retrieved',
    schema: {
      type: 'object',
      properties: {
        employmentId: { type: 'string' },
        courseId: { type: 'string' },
        courseName: { type: 'string', example: 'Cybersecurity Fundamentals' },
        progress: {
          type: 'object',
          properties: {
            completedVideos: { type: 'number', example: 5 },
            totalVideos: { type: 'number', example: 10 },
            completedQuizzes: { type: 'number', example: 2 },
            totalQuizzes: { type: 'number', example: 3 },
            progressPercentage: { type: 'number', example: 54 },
            isCourseCompleted: { type: 'boolean', example: false }
          }
        },
        quizAttempts: { type: 'array' },
        completedVideoIds: { type: 'array' },
        completedQuizIds: { type: 'array' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Employment or course not found' })
  async getEmployeeProgress(
    @Param('id') employmentId: string,
    @Param('courseId') courseId: string,
  ) {
    return await this.employmentService.getEmployeeProgress(employmentId, courseId);
  }

  @Get(':id/quiz-attempts')
  @ApiOperation({ summary: 'Get all quiz attempts for an employee' })
  @ApiQuery({ name: 'quizId', required: false, description: 'Filter by specific quiz ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Quiz attempts retrieved',
    schema: {
      type: 'object',
      properties: {
        totalAttempts: { type: 'number', example: 5 },
        attempts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              attemptId: { type: 'string' },
              quizId: { type: 'object' },
              score: { type: 'number', example: 9 },
              totalQuestions: { type: 'number', example: 10 },
              correctAnswers: { type: 'number', example: 9 },
              wrongAnswers: { type: 'number', example: 1 },
              percentage: { type: 'number', example: 90 },
              isPassed: { type: 'boolean', example: true },
              completedAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Employment not found' })
  async getEmployeeQuizAttempts(
    @Param('id') employmentId: string,
    @Query('quizId') quizId?: string,
  ) {
    return await this.employmentService.getEmployeeQuizAttempts(employmentId, quizId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete employment record' })
  @ApiResponse({ status: 200, description: 'Employment record deleted successfully' })
  @ApiResponse({ status: 404, description: 'Employment record not found' })
  async deleteEmployment(@Param('id') id: string) {
    return await this.employmentService.deleteEmployment(id);
  }
}

