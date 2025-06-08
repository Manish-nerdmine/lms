import { Module } from '@nestjs/common';
import {
  DatabaseModule,
  UserPasscodeDocument,
} from '@app/common';



import { PasscodeService } from './passcode.service';
import { PasscodeRepository } from './passcode.repository';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([{ name: UserPasscodeDocument.name, schema: UserPasscodeDocument }]),
  ],
  providers: [PasscodeService, PasscodeRepository],
  exports: [PasscodeService],
})
export class PasscodeModule {}
