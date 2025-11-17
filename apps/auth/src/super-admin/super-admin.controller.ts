import { Controller, Post, Get, Body, Param, Patch, Delete, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SuperAdminService } from './super-admin.service';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { PasscodeAuthGuard } from '@app/common/auth/passcode-auth.guard';
import { SuperAdminGuard } from '@app/common/auth/super-admin.guard';
import { Response } from 'express';

@ApiTags('Super Admin')
@Controller('super-admin')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new super admin user' })
  @ApiResponse({ 
    status: 201, 
    description: 'Super admin created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Super admin created successfully' },
        superAdmin: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  async createSuperAdmin(@Body() createSuperAdminDto: CreateSuperAdminDto) {
    return await this.superAdminService.createSuperAdmin(createSuperAdminDto);
  }

  @Get()
  @UseGuards(PasscodeAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all super admins (Super admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all super admins',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 3 },
        superAdmins: { type: 'array', items: { type: 'object' } }
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Access denied. Super admin privileges required.' })
  async getAllSuperAdmins() {
    return await this.superAdminService.getAllSuperAdmins();
  }

  @Patch('toggle/:userId')
  @UseGuards(PasscodeAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle super admin status for a user (Super admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Super admin status toggled successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User promoted to super admin successfully' },
        userId: { type: 'string' },
        isSuperAdmin: { type: 'boolean' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Access denied. Super admin privileges required.' })
  async toggleSuperAdminStatus(
    @Param('userId') userId: string,
    @Body('isSuperAdmin') isSuperAdmin: boolean,
  ) {
    return await this.superAdminService.toggleSuperAdminStatus(userId, isSuperAdmin);
  }

  @Delete(':userId')
  @UseGuards(PasscodeAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove super admin status from a user (Super admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Super admin status removed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Super admin status removed successfully' },
        userId: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'User is not a super admin' })
  @ApiResponse({ status: 403, description: 'Access denied. Super admin privileges required.' })
  async removeSuperAdmin(@Param('userId') userId: string) {
    return await this.superAdminService.removeSuperAdmin(userId);
  }

  @Get('dashboard/stats/:userId')
  @ApiOperation({ summary: 'Get dashboard statistics (Super admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Dashboard statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalUsers: { type: 'number', example: 150 },
        totalCourses: { type: 'number', example: 25 },
        totalEmployedUsers: { type: 'number', example: 120 }
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Access denied. Super admin privileges required.' })
  async getDashboardStats(@Param('userId') userId: string) {
    return await this.superAdminService.getDashboardStats(userId);
  }

  @Get('user/:userId/export')
  @UseGuards(PasscodeAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export user complete information to Excel (Super admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Excel file generated successfully',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Access denied. Super admin privileges required.' })
  async exportUserToExcel(@Param('userId') userId: string, @Res() res: Response) {
    const result = await this.superAdminService.exportUserToExcel(userId);
    
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.buffer);
  }

  @Get('user/:userId')
  @UseGuards(PasscodeAuthGuard, SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get complete user information (Super admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'User details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        user: { type: 'object' },
        employment: { type: 'object' },
        progress: { type: 'array', items: { type: 'object' } }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Access denied. Super admin privileges required.' })
  async getUserDetails(@Param('userId') userId: string) {
    return await this.superAdminService.getUserDetails(userId);
  }
}

