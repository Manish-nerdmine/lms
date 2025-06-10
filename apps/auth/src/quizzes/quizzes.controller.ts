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
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { PasscodeAuthGuard } from '@app/common/auth/passcode-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('quizzes')
@Controller('courses/:courseId/quizzes')
@UseGuards(PasscodeAuthGuard)
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new quiz' })
  @ApiResponse({ status: 201, description: 'Quiz created successfully' })
  create(
    @Param('courseId') courseId: string,
    @Body() createQuizDto: CreateQuizDto,
  ) {
    return this.quizzesService.create(courseId, createQuizDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all quizzes for a course' })
  findAll(@Param('courseId') courseId: string) {
    return this.quizzesService.findAll(courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific quiz' })
  findOne(@Param('id') id: string) {
    return this.quizzesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a quiz' })
  update(
    @Param('id') id: string,
    @Body() updateQuizDto: Partial<CreateQuizDto>,
  ) {
    return this.quizzesService.update(id, updateQuizDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a quiz' })
  remove(@Param('id') id: string) {
    return this.quizzesService.remove(id);
  }

  @Post(':id/evaluate')
  @ApiOperation({ summary: 'Evaluate a quiz submission' })
  @ApiResponse({ status: 200, description: 'Quiz evaluated successfully' })
  evaluateQuiz(
    @Param('id') id: string,
    @Body('answers') answers: number[],
  ) {
    return this.quizzesService.evaluateQuiz(id, answers);
  }
} 