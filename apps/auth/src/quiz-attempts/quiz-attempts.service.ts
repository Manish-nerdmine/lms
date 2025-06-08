import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuizAttempt, Quiz, Question } from '@app/common/models/lms.schema';

@Injectable()
export class QuizAttemptsService {
  private readonly logger = new Logger(QuizAttemptsService.name);

  constructor(
    @InjectModel(QuizAttempt.name)
    private readonly quizAttemptModel: Model<QuizAttempt>,
    @InjectModel(Quiz.name)
    private readonly quizModel: Model<Quiz>,
  ) {}

  async submitQuiz(
    userId: string,
    quizId: string,
    userAnswers: number[],
  ): Promise<QuizAttempt> {
    const quiz = await this.quizModel
      .findById(quizId)
      .populate('questions')
      .exec();

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    const score = this.calculateScore(quiz.questions, userAnswers);
    const isPassed = score >= quiz.passingScore;

    const attempt = new this.quizAttemptModel({
      userId,
      quizId,
      userAnswers,
      score,
      isPassed,
      completedAt: new Date(),
    });

    return attempt.save();
  }

  private calculateScore(questions: Question[], userAnswers: number[]): number {
    let totalScore = 0;
    let maxScore = 0;

    questions.forEach((question, index) => {
      maxScore += question.points;
      if (userAnswers[index] === question.correctAnswer) {
        totalScore += question.points;
      }
    });

    return (totalScore / maxScore) * 100;
  }

  async getUserAttempts(userId: string, quizId: string): Promise<QuizAttempt[]> {
    return this.quizAttemptModel
      .find({ userId, quizId })
      .sort({ completedAt: -1 })
      .exec();
  }

  async getAttemptDetails(attemptId: string): Promise<QuizAttempt> {
    const attempt = await this.quizAttemptModel
      .findById(attemptId)
      .populate({
        path: 'quizId',
        populate: {
          path: 'questions',
        },
      })
      .exec();

    if (!attempt) {
      throw new NotFoundException('Quiz attempt not found');
    }

    return attempt;
  }
} 