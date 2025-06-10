import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from '@app/common/models/lms.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);
  private readonly uploadDir = path.join(process.cwd(), 'apps/auth/src/courses/thumbnails');

  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
  ) {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async create(createCourseDto: CreateCourseDto, file?: Express.Multer.File): Promise<Course> {
    let thumbnailUrl = createCourseDto.thumbnail;

    if (file) {
      const filename = `${uuidv4()}-${file.originalname}`;
      const filepath = path.join(this.uploadDir, filename);
      thumbnailUrl = `/courses/thumbnails/${filename}`;

      try {
        fs.writeFileSync(filepath, new Uint8Array(file.buffer));
        this.logger.log(`Thumbnail saved successfully at ${filepath}`);
      } catch (error) {
        this.logger.error(`Failed to save thumbnail: ${error.message}`);
        throw new Error('Failed to save thumbnail');
      }
    }

    const course = new this.courseModel({
      ...createCourseDto,
      thumbnail: thumbnailUrl,
    });

    return course.save();
  }

  async findAll(): Promise<Course[]> {
    return this.courseModel.find().populate('videos').populate('quizzes').exec();
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseModel
      .findById(id)
      .populate('videos')
      .populate('quizzes')
      .exec();

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async update(id: string, updateCourseDto: Partial<CreateCourseDto>, file?: Express.Multer.File): Promise<Course> {
    const course = await this.findOne(id);
    let thumbnailUrl = updateCourseDto.thumbnail;

    if (file) {
      // Delete old thumbnail if exists
      if (course.thumbnail) {
        const oldFilename = path.basename(course.thumbnail);
        const oldFilepath = path.join(this.uploadDir, oldFilename);
        if (fs.existsSync(oldFilepath)) {
          fs.unlinkSync(oldFilepath);
        }
      }

      // Save new thumbnail
      const filename = `${uuidv4()}-${file.originalname}`;
      const filepath = path.join(this.uploadDir, filename);
      thumbnailUrl = `/courses/thumbnails/${filename}`;

      try {
        fs.writeFileSync(filepath, new Uint8Array(file.buffer));
        this.logger.log(`Thumbnail saved successfully at ${filepath}`);
      } catch (error) {
        this.logger.error(`Failed to save thumbnail: ${error.message}`);
        throw new Error('Failed to save thumbnail');
      }
    }

    const updatedCourse = await this.courseModel
      .findByIdAndUpdate(
        id,
        { ...updateCourseDto, thumbnail: thumbnailUrl },
        { new: true }
      )
      .exec();

    if (!updatedCourse) {
      throw new NotFoundException('Course not found');
    }

    return updatedCourse;
  }

  async remove(id: string): Promise<void> {
    const course = await this.findOne(id);
    
    // Delete thumbnail if exists
    if (course.thumbnail) {
      const filename = path.basename(course.thumbnail);
      const filepath = path.join(this.uploadDir, filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    const result = await this.courseModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Course not found');
    }
  }
} 