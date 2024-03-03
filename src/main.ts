import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { OpenapiConfigService } from './config/openapi-config.service';
import { ConfigService } from '@nestjs/config';
import { INestApplication, Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Main');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const apiDocPath = setupOpenApi(app, configService);

  const port = configService.get('API_PORT');
  await app.listen(port);

  logger.log(`Application is running on port ${port}`);
  logger.log(`OpenAPI doc available here: ${await app.getUrl()}/${apiDocPath}`);
}
bootstrap();

function setupOpenApi(
  app: INestApplication,
  configService: ConfigService,
): string {
  const openApiConfigService = app.get(OpenapiConfigService);
  const document = SwaggerModule.createDocument(
    app,
    openApiConfigService.getDocumentConfig(),
  );
  const apiDocPath = configService.get('API_DOC_PATH');
  SwaggerModule.setup(apiDocPath, app, document);
  return apiDocPath;
}
