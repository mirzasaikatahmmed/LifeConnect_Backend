import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import 'dotenv/config';

dotenv.config();
let server: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      validateCustomDecorators: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

export default async function handler(req, res) {
  if (!server) {
    server = await bootstrap();
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  return server(req, res);
}

void bootstrap();
