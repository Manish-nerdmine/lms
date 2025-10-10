import { Module } from '@nestjs/common';
import { DatabaseModule, UserDocument, UserSchema } from '@app/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { PasscodeModule } from '../passcode/passcode.module';
import { Group, GroupSchema } from '@app/common/models/group.schema';
import { Department, DepartmentSchema } from '@app/common/models/department.schema';
import { EmploymentDocument, EmploymentSchema } from '@app/common/models/employment.schema';
import { GroupsModule } from '../groups/groups.module';
import { EmploymentModule } from '../employment/employment.module';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
      { name: Group.name, schema: GroupSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: EmploymentDocument.name, schema: EmploymentSchema }
    ]),
    PasscodeModule,
    GroupsModule,
    EmploymentModule
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
