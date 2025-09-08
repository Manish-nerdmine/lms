import { Body, Controller, Get, Post, UseGuards, UseInterceptors, UploadedFile, Param, Query, Res, Put, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';

import { CurrentUser, UserDocument, PasscodeAuthGuard } from '@app/common';
import { LoginAuthDto } from './dto/loginAuth.dto';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { GroupsService } from '../groups/groups.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly groupsService: GroupsService
  ) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('login')
  async login(@Body()  loginAuthDto: LoginAuthDto) {
    return await this.usersService.Login(loginAuthDto)
  }

  @Get()
  @UseGuards(PasscodeAuthGuard)
  async getUser(@CurrentUser() user: UserDocument) {
    return user;
  }

  @Get('all')
 // @UseGuards(PasscodeAuthGuard)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
   // @Query('search') search?: string,
  ) {
    return this.usersService.getAllUsers(page, limit);
  }

  @Get('group/:groupId')
  @UseGuards(PasscodeAuthGuard)
  @ApiOperation({ summary: 'Get users by group ID' })
  @ApiResponse({ status: 200, description: 'List of users in the group' })
  async getUsersByGroup(
    @Param('groupId') groupId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.usersService.getUsersByGroup(groupId, page, limit);
  }

  @Get('department/:departmentId')
  @UseGuards(PasscodeAuthGuard)
  @ApiOperation({ summary: 'Get users by department ID' })
  @ApiResponse({ status: 200, description: 'List of users in the department' })
  async getUsersByDepartment(
    @Param('departmentId') departmentId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.usersService.getUsersByDepartment(departmentId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Put(':id')

  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')

  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Post('upload-excel')

  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Excel file with user data',
        },
      },
    },
  })
  @ApiOperation({ 
    summary: 'Upload users from Excel file',
    description: 'Upload users from Excel file. Required columns: fullName, email, password. Optional columns: userType, companyName, country, isTermsAccepted, groupId, departmentId. groupId and departmentId must be valid MongoDB ObjectIds of existing groups and departments.'
  })
  @ApiResponse({ status: 201, description: 'Users uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file format or data' })
  async uploadUsersFromExcel(@UploadedFile() file: Express.Multer.File) {
    return this.usersService.uploadUsersFromExcel(file);
  }

  @Get('download-template')
  @ApiOperation({ 
    summary: 'Download Excel template for user upload',
    description: 'Download an Excel template with sample data including all required and optional fields: fullName, email, password, userType, companyName, country, isTermsAccepted, groupId, departmentId'
  })
  async downloadTemplate(@Res() res: Response) {
    const template = await this.usersService.downloadTemplate();
    
    res.set({
      'Content-Type': template.contentType,
      'Content-Disposition': `attachment; filename="${template.filename}"`,
    });
    
    res.send(template.buffer);
  }

  @Get('available-groups')
  @UseGuards(PasscodeAuthGuard)
  @ApiOperation({ 
    summary: 'Get all available groups for Excel upload reference',
    description: 'Get a list of all groups with their IDs, names, and other details to help users fill the groupId field in Excel uploads'
  })
  @ApiResponse({ status: 200, description: 'List of available groups' })
  async getAvailableGroups() {
    return this.groupsService.findAll();
  }
}
