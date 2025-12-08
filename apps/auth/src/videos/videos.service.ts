import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Video, Course } from '@app/common/models/lms.schema';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as ffmpeg from 'fluent-ffmpeg';
import { ServerUtils } from '../utils/server.utils';

const ALLOWED_VIDEO_FORMATS = [
  'video/mp4',
  'video/x-msvideo', // AVI
  'video/quicktime', // MOV
  'video/x-ms-wmv', // WMV
  'video/x-matroska', // MKV
  'video/webm', // WebM
  'video/x-flv', // FLV
];

@Injectable()
export class VideosService {
  private readonly logger = new Logger(VideosService.name);
  private readonly uploadDir = path.join(process.cwd(), 'apps/auth/src/videos/uploads');

  constructor(
    @InjectModel(Video.name) private readonly videoModel: Model<Video>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
  ) {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }


  private async getVideoDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          this.logger.error(`Error getting video duration: ${err.message}`);
          reject(err);
          return;
        }
        const duration = metadata.format.duration;
        resolve(duration);
      });
    });
  }

  async uploadVideo(file: Express.Multer.File | undefined, createVideoDto: CreateVideoDto, courseId: string): Promise<Video> {
    let videoUrl = createVideoDto.videoUrl;
    let filename: string | undefined;
    let duration: number | undefined;

    if (file) {
      // Validate file type
      if (!ALLOWED_VIDEO_FORMATS.includes(file.mimetype)) {
        throw new Error(`Unsupported video format: ${file.mimetype}. Allowed formats: ${ALLOWED_VIDEO_FORMATS.join(', ')}`);
      }

      filename = `${uuidv4()}-${file.originalname}`;
      const filepath = path.join(this.uploadDir, filename);

      // Generate full URL for the video using server host
      videoUrl = ServerUtils.getVideoStreamUrl(courseId, filename);
      console.log('Video URL:', videoUrl);

      // Save file to disk
      try {
        fs.writeFileSync(filepath, file.buffer as any);
        this.logger.log(`Video file saved successfully at ${filepath}`);

        // Get video duration
        try {
          duration = await this.getVideoDuration(filepath);
          this.logger.log(`Video duration: ${duration} seconds`);
        } catch (error) {
          this.logger.error(`Failed to get video duration: ${error.message}`);
          // Continue without duration if it fails
        }
      } catch (error) {
        this.logger.error(`Failed to save video file: ${error.message}`);
        throw new Error('Failed to save video file');
      }
    }

    if (!videoUrl) {
      throw new Error('Either video file or videoUrl must be provided');
    }

    // Check if the course is a super admin course
    const course = await this.courseModel.findById(courseId).exec();
    const isSuperAdminVideo = course?.isSuperAdminCourse === true;

    // Log incoming DTO for debugging
    this.logger.log(`Creating video with DTO: ${JSON.stringify({ title: createVideoDto.title, subtitle: createVideoDto.subtitle })}`);

    // Create video document
    const video = new this.videoModel({
      ...createVideoDto,
      videoUrl,
      duration,
      courseId,
      order: await this.getNextOrder(courseId),
      isSuperAdminVideo,
    });

    const savedVideo = await video.save();

    // Return enhanced response with accessible URL
    return {
      ...savedVideo.toObject(),
      message: 'Video uploaded successfully',
      success: true,
      streamingUrl: videoUrl,
    } as any;
  }

  private async getNextOrder(courseId: string): Promise<number> {
    const lastVideo = await this.videoModel
      .findOne({ courseId })
      .sort({ order: -1 })
      .exec();
    return lastVideo ? lastVideo.order + 1 : 0;
  }

  async findAll(courseId: string): Promise<any[]> {
    const videos = await this.videoModel.find({ courseId }).sort({ order: 1 }).exec();

    // Enhance videos with streaming URLs
    return videos.map(video => {
      const videoObj = video.toObject();
      const filename = path.basename(videoObj.videoUrl);
      return {
        ...videoObj,
        streamingUrl: ServerUtils.getVideoStreamUrl(courseId, filename),
      };
    });
  }

  async findOne(id: string): Promise<any> {
    const video = await this.videoModel.findById(id).exec();
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    // Enhance video with streaming URL
    const videoObj = video.toObject();
    const filename = path.basename(videoObj.videoUrl);

    return {
      ...videoObj,
      streamingUrl: ServerUtils.getVideoStreamUrl(videoObj.courseId.toString(), filename),
    };
  }

  async remove(id: string): Promise<void> {
    const video = await this.findOne(id);

    // Check if video is a super admin video - prevent deletion
    if (video.isSuperAdminVideo) {
      throw new ForbiddenException('Cannot delete videos created by super admin. Only super admins can delete these videos.');
    }

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

    // Determine MIME type based on file extension
    const extension = path.extname(filename).toLowerCase();
    let mimeType = 'video/mp4'; // default

    switch (extension) {
      case '.mp4':
        mimeType = 'video/mp4';
        break;
      case '.avi':
        mimeType = 'video/x-msvideo';
        break;
      case '.mov':
        mimeType = 'video/quicktime';
        break;
      case '.wmv':
        mimeType = 'video/x-ms-wmv';
        break;
      case '.mkv':
        mimeType = 'video/x-matroska';
        break;
      case '.webm':
        mimeType = 'video/webm';
        break;
      case '.flv':
        mimeType = 'video/x-flv';
        break;
      default:
        mimeType = 'video/mp4';
    }

    return { stream, mimeType };
  }

  async updateOrder(videoId: string, newOrder: number): Promise<Video> {
    const video = await this.findOne(videoId);

    // Check if video is a super admin video - prevent reordering
    if (video.isSuperAdminVideo) {
      throw new ForbiddenException('Cannot reorder videos created by super admin. Only super admins can reorder these videos.');
    }

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

  async getVideoCountByCourseId(courseId: string): Promise<number> {
    return this.videoModel.countDocuments({ courseId }).exec();
  }

  async updateVideoDetails(
    videoId: string,
    updateData: UpdateVideoDto
  ): Promise<Video> {
    const video = await this.findOne(videoId);
    if (!video) {
      throw new Error('Video not found');
    }

    // Check if video is a super admin video - prevent editing
    if (video.isSuperAdminVideo) {
      throw new ForbiddenException('Cannot edit videos created by super admin. Only super admins can edit these videos.');
    }

    // If video is in draft status and we're doing a regular update (not draft save), change status to 'ready'
    const dataToUpdate = {
      ...updateData,
      ...(video.status === 'draft' ? { status: 'ready' } : {}),
    };

    return await this.videoModel.findOneAndUpdate({ _id: videoId }, dataToUpdate, { new: true }).exec();
  }

  async saveDraft(videoId: string, updateData: UpdateVideoDto): Promise<Video> {
    const video = await this.findOne(videoId);
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    // Check if video is a super admin video - prevent editing
    if (video.isSuperAdminVideo) {
      throw new ForbiddenException('Cannot edit videos created by super admin. Only super admins can edit these videos.');
    }

    // Set status to draft
    const draftData = {
      ...updateData,
      status: 'draft',
    };

    return await this.videoModel.findOneAndUpdate({ _id: videoId }, draftData, { new: true }).exec();
  }

  async findAllDrafts(courseId: string): Promise<any[]> {
    const videos = await this.videoModel
      .find({ courseId, status: 'draft' })
      .sort({ order: 1 })
      .exec();

    // Enhance videos with streaming URLs
    return videos.map(video => {
      const videoObj = video.toObject();
      const filename = path.basename(videoObj.videoUrl);
      return {
        ...videoObj,
        streamingUrl: ServerUtils.getVideoStreamUrl(courseId, filename),
      };
    });
  }
} 