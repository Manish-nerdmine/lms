import { Controller, Post, Body, Get, Param, UseGuards, Request, Query, UseInterceptors, UploadedFile, Put, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmploymentService } from './employment.service';
import { CreateEmploymentDto } from './dto/create-employment.dto';
import { LoginEmploymentDto } from './dto/login-employment.dto';
import { UpdateEmploymentDto } from './dto/update-employment.dto';

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
}

