import { Module } from '@nestjs/common';
import { AUTH_SERVICE, DatabaseModule, HealthModule, LoggerModule, UserPasscodeDocument, UserPasscodeSchema } from '@app/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from './users/users.module';
import { envValidationSchema } from './schema/config.schema';
import { PasscodeModule } from './passcode/passcode.module';
import { PasscodeService } from './passcode/passcode.service';
import { PasscodeRepository } from './passcode/passcode.repository';
import { UserTypeModule } from './userType/userType.module';
import { LmsModule } from './lms/lms.module';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([{ name: UserPasscodeDocument.name, schema: UserPasscodeSchema }]),
    LoggerModule,
    ConfigModule.forRoot({
      envFilePath: 'apps/auth/.env',
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    ClientsModule.registerAsync({
      clients: [
        {
          name: AUTH_SERVICE,
          useFactory: (configService: ConfigService) => ({
            transport: Transport.TCP,
            options: {
              host: configService.get('TCP_HOST'),
              port: configService.get('TCP_PORT'),
            },
          }),
          inject: [ConfigService],
        },
      ],
      isGlobal: true,
    }),
    UsersModule,
    PasscodeModule,
    HealthModule,
    UserTypeModule,
    LmsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, PasscodeService, PasscodeRepository, ClientsModule],
  exports: [AuthService],
})
export class AuthModule {}
