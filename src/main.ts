import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

// @ts-expect-error Vite client
if (import.meta.env.PROD) {
  async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(3000);
  }

  void bootstrap();
}

export const app = NestFactory.create(AppModule);
