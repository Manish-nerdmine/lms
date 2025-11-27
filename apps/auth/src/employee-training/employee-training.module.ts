import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeeTrainingController } from './employee-training.controller';
import { EmployeeTrainingService } from './employee-training.service';
import {
    EmployeeTraining,
    EmployeeTrainingSchema,
} from '@app/common/models/employee-training.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: EmployeeTraining.name, schema: EmployeeTrainingSchema },
        ]),
    ],
    controllers: [EmployeeTrainingController],
    providers: [EmployeeTrainingService],
    exports: [EmployeeTrainingService],
})
export class EmployeeTrainingModule { }
