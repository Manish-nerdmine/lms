import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class EmployeeTraining extends Document {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'EmploymentDocument', required: true })
    employmentId: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
    moduleId: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'UserDocument' })
    assignedBy: string;

    @Prop()
    dueDate: Date;

    @Prop({
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'overdue'],
        default: 'pending'
    })
    status: string;

    @Prop()
    completedAt: Date;

    @Prop({
        type: [{
            id: { type: String },
            title: { type: String },
            description: { type: String },
            isCompleted: { type: Boolean, default: false },
            completedAt: { type: Date }
        }],
        default: []
    })
    todoList: Array<{
        id: string;
        title: string;
        description: string;
        isCompleted: boolean;
        completedAt?: Date;
    }>;

    @Prop({ default: 0 })
    progressPercentage: number;

    createdAt?: Date;
    updatedAt?: Date;
}

export const EmployeeTrainingSchema = SchemaFactory.createForClass(EmployeeTraining);
