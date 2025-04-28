import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function setup() {
  const app = await NestFactory.create(AppModule);

  app
    .use(cookieParser(process.env.COOKIE_SECRET))
    .useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    .enableCors();
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  return app;
}

// @ts-expect-error Vite client
if (import.meta.env.PROD) {
  void setup().then((app) => app.listen(process.env.PORT ?? 3000));
}

export const app = setup();
