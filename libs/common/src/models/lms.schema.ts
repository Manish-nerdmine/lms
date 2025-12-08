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

  @Prop({ default: false })
  isSuperAdminCourse?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

@Schema({ timestamps: true })
export class Video extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  subtitle: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  videoUrl: string;

  @Prop()
  thumbnail: string;

  @Prop()
  duration: number; // in seconds

  @Prop()
  fileSize: number; // in bytes

  @Prop()
  format: string; // e.g., 'mp4', 'webm', 'avi'

  @Prop()
  resolution: string; // e.g., '1920x1080', '1280x720'

  @Prop()
  quality: string; // e.g., 'HD', 'Full HD', '4K', 'SD'

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
  courseId: Course;

  @Prop({ default: 0 })
  order: number;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({
    type: String,
    enum: ['draft', 'processing', 'ready', 'failed', 'archived'],
    default: 'draft'
  })
  status: string;

  @Prop()
  transcript: string; // Full text transcript of the video

  @Prop()
  captionsUrl: string; // URL to VTT or SRT caption file

  @Prop({ default: false })
  hasCaption: boolean;

  @Prop({ default: false })
  isPreviewAvailable: boolean;

  @Prop()
  previewUrl: string; // Short preview/trailer URL

  @Prop({ default: true })
  isPublished: boolean;

  @Prop()
  publishedAt: Date;

  @Prop()
  uploadedBy: string; // User ID who uploaded the video

  @Prop({ default: 0 })
  viewCount: number;

  @Prop({ default: 0 })
  completionCount: number;

  @Prop()
  language: string; // e.g., 'en', 'es', 'fr'

  @Prop({ default: false })
  isDownloadable: boolean;

  @Prop({ default: false })
  isSuperAdminVideo?: boolean;

  @Prop({ type: Object })
  metadata: Record<string, any>; // Additional custom metadata

  // UI Section Fields
  @Prop({
    type: [{
      _id: false,
      id: { type: String },
      title: { type: String },
      description: { type: String },
      order: { type: Number }
    }],
    default: []
  })
  journeySteps: Array<{
    id: string;
    title: string;
    description: string;
    order: number;
  }>;

  @Prop({
    type: [{
      _id: false,
      id: { type: String },
      title: { type: String },
      content: { type: String },
      order: { type: Number }
    }],
    default: []
  })
  infoSections: Array<{
    id: string;
    title: string;
    content: string;
    order: number;
  }>;

  @Prop({
    type: [{
      _id: false,
      id: { type: String },
      sectionTitle: { type: String },
      items: {
        type: [{
          _id: false,
          id: { type: String },
          title: { type: String },
          content: { type: String }
        }],
        default: []
      },
      isExpanded: { type: Boolean, default: false },
      order: { type: Number }
    }],
    default: []
  })
  accordions: Array<{
    id: string;
    sectionTitle: string;
    items: Array<{
      id: string;
      title: string;
      content: string;
    }>;
    isExpanded: boolean;
    order: number;
  }>;

  @Prop({
    type: [{
      _id: false,
      id: { type: String },
      question: { type: String },
      answer: { type: String },
      order: { type: Number }
    }],
    default: []
  })
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
    order: number;
  }>;

  @Prop()
  moduleUrl: string;

  @Prop({
    type: [{
      _id: false,
      id: { type: String },
      title: { type: String },
      description: { type: String }
    }],
    default: []
  })
  overview: Array<{
    id: string;
    title: string;
    description: string;
  }>;

  createdAt?: Date;
  updatedAt?: Date;
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
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  userId?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'EmploymentDocument', required: false })
  employmentId?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
  courseId: Course;

  @Prop({ type: [{ type: String }] })
  completedVideos: string[];

  @Prop({ type: [{ type: String }] })
  completedQuizzes: string[];

  @Prop({ default: 0 })
  progressPercentage: number;

  @Prop({ default: false })
  isCourseCompleted: boolean;
}

@Schema({ timestamps: true })
export class QuizAttempt extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  userId?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'EmploymentDocument', required: false })
  employmentId?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Quiz', required: true })
  quizId: Quiz;

  @Prop({ type: [{ type: Number }] })
  userAnswers: number[];

  @Prop({ default: 0 })
  score: number;

  @Prop({ default: 0 })
  totalQuestions: number;

  @Prop({ default: 0 })
  correctAnswers: number;

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