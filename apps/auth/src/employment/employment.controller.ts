import { Controller, Post, Body, Get, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EmploymentService } from './employment.service';
import { CreateEmploymentDto } from './dto/create-employment.dto';
import { LoginEmploymentDto } from './dto/login-employment.dto';

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

  @Get()
  @ApiOperation({ summary: 'Get all employments' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter employments by userId' })
  @ApiResponse({ status: 200, description: 'List of all employments' })
  async getAllEmployments(@Query('userId') userId?: string) {
    return await this.employmentService.getAllEmployments(userId);
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
}

