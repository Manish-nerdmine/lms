import { Module } from '@nestjs/common';
import { CoursesModule } from '../courses/courses.module';
import { QuizzesModule } from '../quizzes/quizzes.module';
import { QuestionsModule } from '../questions/questions.module';
import { UserProgressModule } from '../user-progress/user-progress.module';
import { QuizAttemptsModule } from '../quiz-attempts/quiz-attempts.module';
import { VideosModule } from '../videos/videos.module';

@Module({
  imports: [
    CoursesModule,
    QuizzesModule,
    QuestionsModule,
    UserProgressModule,
    QuizAttemptsModule,
    VideosModule,
  ],
  exports: [
    CoursesModule,
    QuizzesModule,
    QuestionsModule,
    UserProgressModule,
    QuizAttemptsModule,
    VideosModule,
  ],
})
export class LmsModule {} 