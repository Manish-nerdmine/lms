import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { AbstractDocument } from '@app/common';

export type EmploymentDocumentType = EmploymentDocument & Document;

@Schema({ timestamps: true, versionKey: false })
export class EmploymentDocument extends AbstractDocument {
  @Prop({ type: String, required: true, maxLength: 100 })
  fullName: string;

  @Prop({ type: String, lowercase: true, required: true, maxLength: 255 })
  email: string;

  @Prop({ type: String, required: false, maxLength: 1000, select: false, default: null })
  password?: string;

  @Prop({ type: String, default: '' })
  role: string;


  @Prop({ type: SchemaTypes.ObjectId, ref: 'Group', required: false })
  groupId?: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: false })
  userId?: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isActive?: boolean;

  @Prop({ type: Date, default: null })
  lastLoggedIn?: Date;
}

export const EmploymentSchema = SchemaFactory.createForClass(EmploymentDocument);

EmploymentSchema.index({ email: 1 }, { unique: true });

EmploymentSchema.pre('save', async function (next) {
  if (this.email == null) {
    this.email = undefined;
  }
  next();
});
