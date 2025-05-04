import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import jwt from '../config/jwt';
import { MinioModule } from '../shared/minio.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import cookieNames from './cookie-names.config';
import { IsNotRegisterConstraint } from './is-not-register.validator';
import { IsValidCredentialConstraint } from './is-valid-credential.validator';
import { JwtStrategy } from './jwt.strategy';
import { RefreshStrategy } from './refresh.strategy';
import signOptions from './sign-options.config';
import { TokenService } from './token.service';
import { BUCKET_NAME } from './upload.constants';
import { User } from './user.entity';
import { UserSubscriber } from './user.subscriber';

@Module({
  imports: [
    MinioModule.forFeature(BUCKET_NAME),
    JwtModule.registerAsync(jwt.asProvider()),
    PassportModule,
    ConfigModule.forFeature(jwt),
    ConfigModule.forFeature(signOptions),
    ConfigModule.forFeature(cookieNames),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    UserSubscriber,
    AuthService,
    IsNotRegisterConstraint,
    IsValidCredentialConstraint,
    TokenService,
    JwtStrategy,
    RefreshStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
