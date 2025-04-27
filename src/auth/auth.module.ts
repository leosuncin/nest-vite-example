import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UserSubscriber } from './user.subscriber';
import { IsNotRegisterConstraint } from './is-not-register.validator';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserSubscriber, AuthService, IsNotRegisterConstraint],
  controllers: [AuthController],
})
export class AuthModule {}
