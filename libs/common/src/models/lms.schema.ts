import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Course extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop()
  thumbnail: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Video' }] })
  videos: Video[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Quiz' }] })
  quizzes: Quiz[];

  @Prop({ default: true })
  isActive: boolean;
}

@Schema({ timestamps: true })
export class Video extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  videoUrl: string;

  @Prop()
  duration: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
  courseId: Course;

  @Prop({ default: 0 })
  order: number;
}

@Schema({ timestamps: true })
export class Option extends Document {
  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  isCorrect: boolean;

  @Prop({ default: 0 })
  id: number;


}

@Schema({ timestamps: true })
export class Quiz extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Question' }] })
  questions: Question[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
  courseId: Course;

  @Prop({ default: 0 })
  passingScore: number;

  @Prop({ default: 0 })
  timeLimit?: number; // in minutes
}

@Schema({ timestamps: true })
export class Question extends Document {
  @Prop({ required: true })
  question: string;

  @Prop({ type: [Option], required: true })
  options: Option[];

  @Prop({ required: true })
  correctAnswer: number; // index of the correct option

  @Prop({ default: 1 })
  points: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Quiz', required: true })
  quizId: Quiz;
}

@Schema({ timestamps: true })
export class UserProgress extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
  courseId: Course;

  @Prop({ type: [{ type: String }] })
  completedVideos: string[];

  @Prop({ type: [{ type: String }] })
  completedQuizzes: string[];

  @Prop({ default: 0 })
  progressPercentage: number;
}

@Schema({ timestamps: true })
export class QuizAttempt extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Quiz', required: true })
  quizId: Quiz;

  @Prop({ type: [{ type: Number }] })
  userAnswers: number[];

  @Prop({ default: 0 })
  score: number;

  @Prop({ default: false })
  isPassed: boolean;

  @Prop()
  completedAt: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
export const VideoSchema = SchemaFactory.createForClass(Video);
export const QuizSchema = SchemaFactory.createForClass(Quiz);
export const QuestionSchema = SchemaFactory.createForClass(Question);
export const UserProgressSchema = SchemaFactory.createForClass(UserProgress);
export const QuizAttemptSchema = SchemaFactory.createForClass(QuizAttempt);