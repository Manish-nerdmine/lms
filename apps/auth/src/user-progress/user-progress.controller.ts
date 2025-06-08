import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UserProgressService } from './user-progress.service';
import { PasscodeAuthGuard } from '@app/common/auth/passcode-auth.guard';
import { User } from '@app/common/decorators/user.decorator';

@Controller('courses/:courseId/progress')
@UseGuards(PasscodeAuthGuard)
export class UserProgressController {
  constructor(private readonly userProgressService: UserProgressService) {}

  @Get()
  async getProgress(
    @Param('courseId') courseId: string,
    @User('_id') userId: string,
  ) {
    return this.userProgressService.getUserProgress(userId, courseId);
  }

  @Post('videos/:videoId/complete')
  async markVideoComplete(
    @Param('courseId') courseId: string,
    @Param('videoId') videoId: string,
    @User('_id') userId: string,
  ) {
    return this.userProgressService.markVideoComplete(userId, courseId, videoId);
  }

  @Post('quizzes/:quizId/complete')
  async markQuizComplete(
    @Param('courseId') courseId: string,
    @Param('quizId') quizId: string,
    @User('_id') userId: string,
  ) {
    return this.userProgressService.markQuizComplete(userId, courseId, quizId);
  }
} 