import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { AbstractDocument } from '@app/common';

@Schema({ timestamps: true, versionKey: false })
export class UserPasscodeDocument extends AbstractDocument {
  @Prop({ type: String, required: true, maxLength: 500 })
  passcode: string;

  @Prop({ type: Object }) // Use Object data type to store a JSON object
  signature: Record<string, any>; // The structure of the JSON object

  @Prop({ type: SchemaTypes.ObjectId, ref: 'UserDocument' })
  user: Types.ObjectId;
}

export const UserPasscodeSchema = SchemaFactory.createForClass(UserPasscodeDocument);

UserPasscodeSchema.index({ createdAt: 1 });
