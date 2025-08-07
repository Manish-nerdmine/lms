import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Group extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
  courseId: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'UserDocument' }] })
  userIds: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Department' })
  departmentId: string;

  @Prop({ default: 0 })
  maxParticipants: number;

  @Prop({ default: 0 })
  currentParticipants: number;

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop({ default: 'pending' }) // pending, active, completed, cancelled
  status: string;
}

export const GroupSchema = SchemaFactory.createForClass(Group); 