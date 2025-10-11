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

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'UserDocument' })
  userId: string;

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
export class Quiz extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({
    type: [{
      question: { type: String, required: true },
      points: { type: Number, default: 1 },
      options: {
        type: [{
          text: { type: String, required: true },
          isCorrect: { type: Boolean, required: true },
          id: { type: Number, required: true }
        }],
        required: true
      },
      correctAnswer: { type: Number, required: true }
    }],
    required: true
  })
  questions: Array<{
    question: string;
    points: number;
    options: Array<{
      text: string;
      isCorrect: boolean;
      id: number;
    }>;
    correctAnswer: number;
  }>;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
  courseId: Course;

  @Prop({ default: 0 })
  passingScore: number;

  @Prop({ default: 0, required: false })
  timeLimit?: number; // in minutes
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
export const UserProgressSchema = SchemaFactory.createForClass(UserProgress);
export const QuizAttemptSchema = SchemaFactory.createForClass(QuizAttempt);