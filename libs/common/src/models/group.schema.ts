import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Group extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop({
    type: [{
      courseId: { type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true },
      dueDate: { type: Date, required: true }
    }],
    default: []
  })
  courses: Array<{
    courseId: string;
    dueDate: Date;
  }>;
  
}

export const GroupSchema = SchemaFactory.createForClass(Group); 