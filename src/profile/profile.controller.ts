import { Controller, Get, Param, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../auth/auth.decorator';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';
import { User } from '../auth/user.entity';
import { ProfileService } from './profile.service';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  @UseGuards(OptionalAuthGuard)
  getProfile(@Param('username') username: string, @CurrentUser() user?: User) {
    return this.profileService.getProfile(username, user);
  }
}
