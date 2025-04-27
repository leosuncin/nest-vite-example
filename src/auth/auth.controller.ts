import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpStatus,
  HttpCode,
  Post,
  UseInterceptors,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { Register } from './register.dto';
import { Login } from './login.dto';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.ACCEPTED)
  register(@Body() newUser: Register) {
    return this.authService.register(newUser);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() credentials: Login) {
    return this.authService.findUserBy('email', credentials.email);
  }
}
