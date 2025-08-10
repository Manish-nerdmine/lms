import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { PasscodeAuthGuard } from '@app/common/auth/passcode-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('groups')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new group' })
  @ApiResponse({ status: 201, description: 'Group created successfully' })
  @ApiResponse({ status: 409, description: 'Group with this name already exists for this course' })
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(createGroupDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all groups' })
  findAll() {
    return this.groupsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active groups' })
  findActive() {
    return this.groupsService.findActive();
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get all groups for a specific course' })
  findByCourse(@Param('courseId') courseId: string) {
    return this.groupsService.findByCourse(courseId);
  }

  @Get('department/:departmentId')
  @ApiOperation({ summary: 'Get all groups for a specific department' })
  findByDepartment(@Param('departmentId') departmentId: string) {
    return this.groupsService.findByDepartment(departmentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific group' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a group' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({ status: 409, description: 'Group with this name already exists for this course' })
  update(
    @Param('id') id: string,
    @Body() updateGroupDto: Partial<CreateGroupDto>,
  ) {
    return this.groupsService.update(id, updateGroupDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a group' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  remove(@Param('id') id: string) {
    return this.groupsService.remove(id);
  }

  @Post(':id/users')
  @ApiOperation({ summary: 'Add users to a group' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({ status: 400, description: 'Adding users would exceed maximum participants limit' })
  addUsers(
    @Param('id') id: string,
    @Body('userIds') userIds: string[],
  ) {
    return this.groupsService.addUsers(id, userIds);
  }

  @Delete(':id/users')
  @ApiOperation({ summary: 'Remove users from a group' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  removeUsers(
    @Param('id') id: string,
    @Body('userIds') userIds: string[],
  ) {
    return this.groupsService.removeUsers(id, userIds);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update group status' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({ status: 400, description: 'Invalid status' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.groupsService.updateStatus(id, status);
  }
} 