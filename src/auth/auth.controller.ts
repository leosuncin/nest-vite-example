import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ParseFilePipeBuilder,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

import { CurrentUser } from './auth.decorator';
import { AuthService } from './auth.service';
import { CurrentUserInterceptor } from './current-user.interceptor';
import { JwtStrategy } from './jwt.strategy';
import { Login } from './login.dto';
import { RefreshStrategy } from './refresh.strategy';
import { Register } from './register.dto';
import { TokenInterceptor } from './token.interceptor';
import { UpdateUser } from './update-user.dto';
import { User } from './user.entity';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseInterceptors(TokenInterceptor)
  register(@Body() newUser: Register) {
    return this.authService.register(newUser);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(TokenInterceptor)
  login(@Body() credentials: Login) {
    return this.authService.findUserBy('email', credentials.email);
  }

  @Get('me')
  @UseGuards(AuthGuard(JwtStrategy.name))
  getCurrentUser(@CurrentUser() user: User) {
    return user;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard(RefreshStrategy.name))
  @UseInterceptors(TokenInterceptor)
  refresh(@CurrentUser() user: User) {
    return user;
  }

  @Patch('me')
  @UseGuards(AuthGuard(JwtStrategy.name))
  @UseInterceptors(FileInterceptor('image'), CurrentUserInterceptor)
  updateUser(
    @CurrentUser()
    user: User,
    @Body()
    changes: UpdateUser,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fallbackToMimetype: true,
          fileType: 'image/jpeg',
        })
        .addMaxSizeValidator({ maxSize: 2 ** 20 /* 1 mb */ })
        .build({ fileIsRequired: false }),
    )
    image?: Express.Multer.File,
  ) {
    return this.authService.updateUser(user, changes, image);
  }
}
