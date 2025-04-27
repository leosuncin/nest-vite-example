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

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.ACCEPTED)
  register(@Body() newUser: Register) {
    return this.authService.register(newUser);
  }
}
