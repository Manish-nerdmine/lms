import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserProgress } from '@app/common/models/lms.schema';

@Injectable()
export class UserProgressService {
  private readonly logger = new Logger(UserProgressService.name);

  constructor(
    @InjectModel(UserProgress.name)
    private readonly userProgressModel: Model<UserProgress>,
  ) {}

  async createOrUpdate(userId: string, courseId: string): Promise<UserProgress> {
    let progress = await this.userProgressModel
      .findOne({ userId, courseId })
      .exec();

    if (!progress) {
      progress = new this.userProgressModel({
        userId,
        courseId,
        completedVideos: [],
        completedQuizzes: [],
        progressPercentage: 0,
      });
    }

    return progress.save();
  }

  async markVideoComplete(
    userId: string,
    courseId: string,
    videoId: string,
  ): Promise<UserProgress> {
    const progress = await this.userProgressModel
      .findOne({ userId, courseId })
      .exec();

    if (!progress) {
      throw new NotFoundException('Progress not found');
    }

    if (!progress.completedVideos.includes(videoId)) {
      progress.completedVideos.push(videoId);
      await this.updateProgressPercentage(progress);
    }

    return progress.save();
  }

  async markQuizComplete(
    userId: string,
    courseId: string,
    quizId: string,
  ): Promise<UserProgress> {
    const progress = await this.userProgressModel
      .findOne({ userId, courseId })
      .exec();

    if (!progress) {
      throw new NotFoundException('Progress not found');
    }

    if (!progress.completedQuizzes.includes(quizId)) {
      progress.completedQuizzes.push(quizId);
      await this.updateProgressPercentage(progress);
    }

    return progress.save();
  }

  private async updateProgressPercentage(progress: UserProgress): Promise<void> {
    console.log('progress', progress);
    const totalVideos = progress.completedVideos.length;
    const totalQuizzes = progress.completedQuizzes.length;
    const totalItems = totalVideos + totalQuizzes;
    console.log('totalItems', totalItems);
    console.log('totalVideos', totalVideos);
    console.log('totalQuizzes', totalQuizzes);

    if (totalItems > 0) {
      progress.progressPercentage = (totalItems / (totalVideos + totalQuizzes)) * 100;
    } else {
      progress.progressPercentage = 0;
    }
  }

  async getUserProgress(userId: string, courseId: string): Promise<UserProgress> {
    const progress = await this.userProgressModel
      .findOne({ userId, courseId })
      .exec();

    if (!progress) {
      throw new NotFoundException('Progress not found');
    }

    return progress;
  }
} 