import { ConfigService } from '@nestjs/config';
import { NestApplication } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ENUM_APP_ENVIRONMENT, SWAGGER_DOC_END_POINT } from '../constants';

export async function swaggerInit(app: NestApplication, basePrefix: string) {
  const configService = app.get(ConfigService);

  const docTitle = configService.get<string>('DOC_TITLE');
  const docDesc = configService.get<string>('DOC_DESCRIPTION');
  const docVersion = configService.get<string>('DOC_VERSION');
  const env = configService.get<string>('ENV');

  if (env === ENUM_APP_ENVIRONMENT.DEVELOPMENT) {
    const options = new DocumentBuilder()
      .setTitle(docTitle)
      .setDescription(docDesc)
      .setVersion(docVersion)
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup(`${basePrefix}${SWAGGER_DOC_END_POINT}`, app, document);
  }
}
