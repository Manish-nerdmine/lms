import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Video } from '@app/common/models/lms.schema';
import { CreateVideoDto } from './dto/create-video.dto';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VideosService {
  private readonly logger = new Logger(VideosService.name);
  private readonly uploadDir = path.join(process.cwd(), 'apps/auth/src/videos/uploads');

  constructor(
    @InjectModel(Video.name) private readonly videoModel: Model<Video>,
  ) {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadVideo(file: Express.Multer.File, createVideoDto: CreateVideoDto, courseId: string): Promise<Video> {
    const filename = `${uuidv4()}-${file.originalname}`;
    const filepath = path.join(this.uploadDir, filename);
    let videoUrl = '';
    if (createVideoDto.videoUrl) {
      videoUrl = createVideoDto.videoUrl;
    } else {
      videoUrl = `/videos/stream/${filename}`;
    }
    // Save file to disk
    try {
      fs.writeFileSync(filepath, file.buffer);
      this.logger.log(`Video file saved successfully at ${filepath}`);
    } catch (error) {
      this.logger.error(`Failed to save video file: ${error.message}`);
      throw new Error('Failed to save video file');
    }

    // Create video document
    const video = new this.videoModel({
      ...createVideoDto,
      videoUrl: videoUrl, // URL to stream the video
      courseId,
      order: await this.getNextOrder(courseId),
    });

    return video.save();
  }

  private async getNextOrder(courseId: string): Promise<number> {
    const lastVideo = await this.videoModel
      .findOne({ courseId })
      .sort({ order: -1 })
      .exec();
    return lastVideo ? lastVideo.order + 1 : 0;
  }

  async findAll(courseId: string): Promise<Video[]> {
    return this.videoModel.find({ courseId }).sort({ order: 1 }).exec();
  }

  async findOne(id: string): Promise<Video> {
    const video = await this.videoModel.findById(id).exec();
    if (!video) {
      throw new NotFoundException('Video not found');
    }
    return video;
  }

  async remove(id: string): Promise<void> {
    const video = await this.findOne(id);
    
    // Delete file from disk
    const filename = path.basename(video.videoUrl);
    const filepath = path.join(this.uploadDir, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    // Delete from database
    await this.videoModel.deleteOne({ _id: id }).exec();
  }

  async getVideoStream(filename: string): Promise<{ stream: fs.ReadStream; mimeType: string }> {
    const filepath = path.join(this.uploadDir, filename);
    
    if (!fs.existsSync(filepath)) {
      throw new NotFoundException('Video file not found');
    }

    const stream = fs.createReadStream(filepath);
    const mimeType = 'video/mp4'; // You might want to determine this based on the file extension

    return { stream, mimeType };
  }

  async updateOrder(videoId: string, newOrder: number): Promise<Video> {
    const video = await this.findOne(videoId);
    const oldOrder = video.order;

    // Update the order of the target video
    video.order = newOrder;
    await video.save();

    // Adjust orders of other videos
    if (newOrder > oldOrder) {
      await this.videoModel.updateMany(
        {
          courseId: video.courseId,
          order: { $gt: oldOrder, $lte: newOrder },
          _id: { $ne: videoId }
        },
        { $inc: { order: -1 } }
      ).exec();
    } else {
      await this.videoModel.updateMany(
        {
          courseId: video.courseId,
          order: { $gte: newOrder, $lt: oldOrder },
          _id: { $ne: videoId }
        },
        { $inc: { order: 1 } }
      ).exec();
    }

    return video;
  }
} 