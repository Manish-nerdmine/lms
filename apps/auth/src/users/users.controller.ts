import { Body, Controller, Get, Post, UseGuards, UseInterceptors, UploadedFile, Param, Query, Res, Patch, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';

import { CurrentUser, UserDocument, PasscodeAuthGuard } from '@app/common';
import { LoginAuthDto } from './dto/loginAuth.dto';

import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
  @UseGuards(PasscodeAuthGuard)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('department') department?: string,
  ) {
    return this.usersService.getAllUsers(page, limit, search, department);
  }

  @Get(':id')
  @UseGuards(PasscodeAuthGuard)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Patch(':id')
  @UseGuards(PasscodeAuthGuard)
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<CreateUserDto>,
  ) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(PasscodeAuthGuard)
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Post('upload-excel')
  @UseGuards(PasscodeAuthGuard)
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
  @ApiOperation({ summary: 'Upload users from Excel file' })
  @ApiResponse({ status: 201, description: 'Users uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file format or data' })
  async uploadUsersFromExcel(@UploadedFile() file: Express.Multer.File) {
    return this.usersService.uploadUsersFromExcel(file);
  }

  @Get('download-template')
  @UseGuards(PasscodeAuthGuard)
  @ApiOperation({ summary: 'Download Excel template for user upload' })
  async downloadTemplate(@Res() res: Response) {
    const template = await this.usersService.downloadTemplate();
    
    res.set({
      'Content-Type': template.contentType,
      'Content-Disposition': `attachment; filename="${template.filename}"`,
    });
    
    res.send(template.buffer);
  }
}
