import { AuthGuard } from '@app/user/guards/auth.guard';
import { ProfileService } from './profile.service';
import { IProfileResponse } from './types/profileResponse.interface';
import { User } from '@app/user/decorators/user.decorator';
import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}
  @Get(':username')
  @UseGuards(AuthGuard)
  async getProfile(
    @User('id') userId: number,
    @Param('username') username: string,
  ): Promise<IProfileResponse> {
    const profile = await this.profileService.getProfile(userId, username);

    return this.profileService.buildProfileResponse(profile);
  }

  @Post(':username/follow')
  @UseGuards(AuthGuard)
  async followProfile(
    @User('id') userId: number,
    @Param('username') username: string,
  ): Promise<IProfileResponse> {
    const profile = await this.profileService.followProfile(userId, username);

    return this.profileService.buildProfileResponse(profile);
  }

  @Delete(':username/follow')
  @UseGuards(AuthGuard)
  async unFollowProfile(
    @User('id') userId: number,
    @Param('username') username: string,
  ): Promise<IProfileResponse> {
    const profile = await this.profileService.unFollowProfile(userId, username);

    return this.profileService.buildProfileResponse(profile);
  }
}
