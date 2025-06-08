import { Prop, Schema } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { SchemaTypes, Types } from 'mongoose';

@Schema()
export class AbstractDocument {
  @Prop({ type: SchemaTypes.ObjectId, default: () => new ObjectId() })
  _id: Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  status?: boolean;

  @Prop({ type: Boolean, default: false })
  deleted?: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;

  @Prop({ type: Date, default: null })
  deletedAt?: Date;
}
