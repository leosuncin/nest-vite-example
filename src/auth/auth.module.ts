import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { IsNotRegisterConstraint } from './is-not-register.validator';
import { IsValidCredentialConstraint } from './is-valid-credential.validator';
import { User } from './user.entity';
import { UserSubscriber } from './user.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    UserSubscriber,
    AuthService,
    IsNotRegisterConstraint,
    IsValidCredentialConstraint,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
