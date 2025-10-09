import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Employee extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  role: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: string;

}

export const EmployeeSchema = SchemaFactory.createForClass(Employee); 