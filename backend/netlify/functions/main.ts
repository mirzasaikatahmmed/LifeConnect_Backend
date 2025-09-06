import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';

let server: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.init();
  return app.getHttpAdapter().getInstance();
}

export async function handler(event, context) {
  if (!server) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    server = await bootstrap();
  }
  return server(event, context);
}
