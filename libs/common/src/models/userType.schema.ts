import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';
import { Model } from 'mongoose';

export enum UserTypeCode {
  ADMIN = 'admin',
  USER = "user"
}

export type UserTypeDocumentType = UserTypeDocument & Document;

@Schema({ versionKey: false })
export class UserTypeDocument extends AbstractDocument {
  @Prop({ type: String, required: true, maxLength: 100 })
  name: string;

  @Prop({ type: String, enum: Object.values(UserTypeCode), required: true })
  code: string;

  @Prop({ type: String, maxLength: 255 })
  description: string;
}

export const UserTypeSchema = SchemaFactory.createForClass(UserTypeDocument);

export interface UserModel extends Model<UserTypeDocument> {
  getActive(): Promise<UserTypeDocument[]>;
}

UserTypeSchema.statics.getActive = async function (): Promise<UserTypeDocument[]> {
  return this.find({ status: true, deleted: false });
};