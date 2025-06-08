import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { QuizAttemptsService } from './quiz-attempts.service';
import { PasscodeAuthGuard } from '@app/common/auth/passcode-auth.guard';
import { User } from '@app/common/decorators/user.decorator';

@Controller('quizzes/:quizId/attempts')
@UseGuards(PasscodeAuthGuard)
export class QuizAttemptsController {
  constructor(private readonly quizAttemptsService: QuizAttemptsService) {}

  @Post()
  async submitQuiz(
    @Param('quizId') quizId: string,
    @Body('answers') answers: number[],
    @User('_id') userId: string,
  ) {
    return this.quizAttemptsService.submitQuiz(userId, quizId, answers);
  }

  @Get()
  async getUserAttempts(
    @Param('quizId') quizId: string,
    @User('_id') userId: string,
  ) {
    return this.quizAttemptsService.getUserAttempts(userId, quizId);
  }

  @Get(':attemptId')
  async getAttemptDetails(@Param('attemptId') attemptId: string) {
    return this.quizAttemptsService.getAttemptDetails(attemptId);
  }
} 