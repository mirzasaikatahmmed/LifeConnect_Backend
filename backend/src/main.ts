import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import 'dotenv/config';
import * as cors from "cors";

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cors({
    origin: "*"
  }))

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

void bootstrap();
