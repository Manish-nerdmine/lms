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
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { PasscodeAuthGuard } from '@app/common/auth/passcode-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('departments')
@Controller('departments')
@UseGuards(PasscodeAuthGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({ status: 201, description: 'Department created successfully' })
  @ApiResponse({ status: 409, description: 'Department with this name already exists' })
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all departments' })
  findAll() {
    return this.departmentsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active departments' })
  findActive() {
    return this.departmentsService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific department' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a department' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiResponse({ status: 409, description: 'Department with this name already exists' })
  update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: Partial<CreateDepartmentDto>,
  ) {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a department' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }

  @Patch(':id/employee-count')
  @ApiOperation({ summary: 'Update employee count for a department' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  updateEmployeeCount(
    @Param('id') id: string,
    @Body('count') count: number,
  ) {
    return this.departmentsService.updateEmployeeCount(id, count);
  }
} 