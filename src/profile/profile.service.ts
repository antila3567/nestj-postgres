import { FollowEntity } from './follow.entity';
import { USER_NOT_FOUND } from './../user/user.constants';
import { ProfileType } from './types/profile.type';
import { IProfileResponse } from './types/profileResponse.interface';
import { UserEntity } from '@app/user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { USER_CANT_BE_EQUAL } from './profile.constants';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
  ) {}

  async getProfile(userId: number, username: string): Promise<ProfileType> {
    const profile = await this.userRepository.findOne({ username });

    if (!profile) {
      throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const follow = await this.followRepository.findOne({
      followerId: userId,
      followingId: profile.id,
    });

    delete profile.email;

    return { ...profile, following: !!follow };
  }

  async followProfile(userId: number, username: string): Promise<ProfileType> {
    const profile = await this.userRepository.findOne({ username });

    if (!profile) {
      throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (userId === profile.id) {
      throw new HttpException(USER_CANT_BE_EQUAL, HttpStatus.BAD_REQUEST);
    }

    const follow = await this.followRepository.findOne({
      followerId: userId,
      followingId: profile.id,
    });

    if (!follow) {
      const followToCreate = new FollowEntity();
      followToCreate.followerId = userId;
      followToCreate.followingId = profile.id;
      await this.followRepository.save(followToCreate);
    }

    delete profile.email;

    return { ...profile, following: true };
  }

  async unFollowProfile(
    userId: number,
    username: string,
  ): Promise<ProfileType> {
    const profile = await this.userRepository.findOne({ username });

    if (!profile) {
      throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (userId === profile.id) {
      throw new HttpException(USER_CANT_BE_EQUAL, HttpStatus.BAD_REQUEST);
    }

    await this.followRepository.delete({
      followerId: userId,
      followingId: profile.id,
    });

    return { ...profile, following: false };
  }

  buildProfileResponse(profile: ProfileType): IProfileResponse {
    return { profile };
  }
}
