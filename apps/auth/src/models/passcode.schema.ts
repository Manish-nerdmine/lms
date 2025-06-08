import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { AbstractDocument } from '@app/common';

@Schema({ timestamps: true, versionKey: false })
export class PasscodeDocument extends AbstractDocument {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserDocument', required: true })
  user: string;

  @Prop()
  passcode: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  deletedAt?: Date;
}

export const PasscodeSchema = SchemaFactory.createForClass(PasscodeDocument);
PasscodeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 20 });
