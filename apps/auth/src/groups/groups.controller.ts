import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Put,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AssignCourseDto } from './dto/assign-course.dto';
import { PasscodeAuthGuard } from '@app/common/auth/passcode-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('groups')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new group' })
  @ApiResponse({ status: 201, description: 'Group created successfully' })
  @ApiResponse({ status: 409, description: 'Group with this name already exists' })
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(createGroupDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all groups' })
  findAll() {
    return this.groupsService.findAll();
  }

  @Get('all-with-stats')
  @ApiOperation({ summary: 'Get all groups with user statistics' })
  @ApiResponse({ status: 200, description: 'List of all groups with user counts' })
  findAllWithStats(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.groupsService.findAllWithStats(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific group' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  findOne(@Param('id') id: string) {
    return this.groupsService.findOneWithUsers(id);
  }

  @Get(':id/with-users')
  @ApiOperation({ summary: 'Get a specific group with associated users' })
  @ApiResponse({ status: 200, description: 'Group with users data' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  findOneWithUsers(@Param('id') id: string) {
    return this.groupsService.findOneWithUsers(id);
  }

  @Post(':id/assign-course')
  @ApiOperation({ summary: 'Assign a course to a group and send email notifications' })
  @ApiResponse({ status: 201, description: 'Course assigned successfully' })
  @ApiResponse({ status: 404, description: 'Group or course not found' })
  @ApiResponse({ status: 409, description: 'Course already assigned to group' })
  assignCourseToGroup(
    @Param('id') groupId: string,
    @Body() assignCourseDto: AssignCourseDto,
  ) {
    return this.groupsService.assignCourseToGroup(groupId, assignCourseDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a group' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({ status: 409, description: 'Group with this name already exists' })
  update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    return this.groupsService.update(id, updateGroupDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a group' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  remove(@Param('id') id: string) {
    return this.groupsService.remove(id);
  }
} 