import { Module } from '@nestjs/common';
import { DatabaseModule, UserTypeDocument, UserTypeSchema } from '@app/common';
import { UserTypeRepository } from './userType.repository';

import { UserTypeService } from './userType.service';
import { UserTypeController } from './userType.controller';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([{ name: UserTypeDocument.name, schema: UserTypeSchema }]),
  ],
  controllers: [UserTypeController],
  providers: [UserTypeService, UserTypeRepository],
  exports: [UserTypeService, UserTypeRepository],
})
export class UserTypeModule {}
