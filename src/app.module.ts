import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import cookies from './config/cookies';
import minio from './config/minio';
import typeorm from './config/typeorm';
import { MinioModule } from './shared/minio.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [cookies, minio],
    }),
    TypeOrmModule.forRootAsync(typeorm.asProvider()),
    MinioModule.forRootAsync(minio.asProvider()),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
