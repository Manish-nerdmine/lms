import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Department extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  code: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  managerId: string;

  @Prop()
  location: string;

  @Prop({ default: 0 })
  employeeCount: number;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department); 