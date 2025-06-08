import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { AbstractDocument } from '@app/common';

import { AutoIncrementID } from '@typegoose/auto-increment';


export type UserDocumentType = UserDocument & Document;

@Schema({ timestamps: true, versionKey: false })
export class UserDocument extends AbstractDocument {
  @Prop({ type: Number })
  companyId?: number;


  @Prop({ type: String, enum: ['user', 'admin'], default: 'user' })
  userType: string;


  @Prop({ type: String, required: true, maxLength: 100 })
  fullName: string;


  @Prop({ type: String, lowercase: true, unique: true, maxLength: 255, sparse: true })
  email?: string;

  @Prop({ type: String, required: false, maxLength: 1000, select: false, default: null })
  password?: string;

  @Prop({ type: Date, default: null })
  lastLoggedIn?: Date;

  @Prop({ type: String, maxLength: 500 })
  companyName?: string;

  @Prop({ type: Boolean, default: false })
  isTermsAccepted?: boolean;

  @Prop({ type: String, maxLength: 200 })
  country?: string;
;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);

UserSchema.index({ email: 1 }, { unique: true, sparse: true });

UserSchema.plugin(AutoIncrementID, { field: 'companyId', startAt: 1000 });

UserSchema.pre('save', async function (next) {
  if (this.email == null) {
    this.email = undefined;
  }
  next();
});
