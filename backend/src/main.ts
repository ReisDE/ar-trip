import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import { UPLOADS_DIR } from './uploads/uploads.service';
import { AppModule } from './app.module';

async function bootstrap() {
  if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api');
  app.useStaticAssets(UPLOADS_DIR, { prefix: '/uploads/' });
  const port = process.env.PORT ?? 3333;
  await app.listen(port);
  console.log(`AR Trip API rodando em http://localhost:${port}/api`);
}
bootstrap();
