import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quiz } from '@app/common/models/lms.schema';
import { CreateQuizDto } from './dto/create-quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectModel(Quiz.name) private readonly quizModel: Model<Quiz>,
  ) {}

  async create(courseId: string, createQuizDto: CreateQuizDto): Promise<Quiz> {
    const quiz = new this.quizModel({
      ...createQuizDto,
      courseId: courseId,
    });
    return quiz.save();
  }

  async findAll(courseId: string): Promise<Quiz[]> {
    return this.quizModel.find({ courseId }).exec();
  }

  async findOne(id: string): Promise<Quiz> {
    const quiz = await this.quizModel.findById(id).exec();
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
    return quiz;
  }

  async update(id: string, updateQuizDto: Partial<CreateQuizDto>): Promise<Quiz> {
    const quiz = await this.quizModel
      .findByIdAndUpdate(id, updateQuizDto, { new: true })
      .exec();
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
    return quiz;
  }

  async remove(id: string): Promise<void> {
    const result = await this.quizModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Quiz not found');
    }
  }

  async evaluateQuiz(quizId: string, answers: number[]): Promise<{
    score: number;
    totalPoints: number;
    passed: boolean;
    correctAnswers: number;
    totalQuestions: number;
  }> {
    const quiz = await this.findOne(quizId);
    let score = 0;
    let totalPoints = 0;
    let correctAnswers = 0;

    quiz.questions.forEach((question, index) => {
      totalPoints += question.points || 1;
      if (answers[index] === question.correctAnswer) {
        score += question.points || 1;
        correctAnswers++;
      }
    });

    const passed = score >= (quiz.passingScore || 0);

    return {
      score,
      totalPoints,
      passed,
      correctAnswers,
      totalQuestions: quiz.questions.length,
    };
  }
} 