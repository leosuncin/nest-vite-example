import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function setup() {
  const app = await NestFactory.create(AppModule);

  app
    .useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    .enableCors();

  return app;
}

// @ts-expect-error Vite client
if (import.meta.env.PROD) {
  void setup().then((app) => app.listen(process.env.PORT ?? 3000));
}

export const app = setup();
