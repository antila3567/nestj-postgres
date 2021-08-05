import { UpdateUserDto } from './dto/updateUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import {
  EMAIL_IS_EXIST,
  NAME_IS_EXIST,
  USER_NOT_FOUND,
  INCORRECT_PASSWORD,
} from './user.constants';
import { IUserResponse } from './types/userResponse.interface';
import { JWT_SECRET } from './../config';
import { UserEntity } from './user.entity';
import { CreateUserDto } from './dto/createUser.dto';
import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { compare } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createUser(dto: CreateUserDto): Promise<UserEntity> {
    const userByEmail = await this.userRepository.findOne({
      email: dto.email,
    });
    const userByName = await this.userRepository.findOne({
      username: dto.username,
    });

    if (userByEmail) {
      throw new HttpException(EMAIL_IS_EXIST, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    if (userByName) {
      throw new HttpException(NAME_IS_EXIST, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const newUser = new UserEntity();
    Object.assign(newUser, dto);
    return await this.userRepository.save(newUser);
  }

  async loginUser(user: LoginUserDto): Promise<UserEntity> {
    const userByEmail = await this.userRepository.findOne(
      {
        email: user.email,
      },
      { select: ['bio', 'email', 'id', 'image', 'password', 'username'] },
    );

    const isCorrectPassword = await compare(
      user.password,
      userByEmail.password,
    );

    if (!userByEmail) {
      throw new UnauthorizedException(USER_NOT_FOUND);
    }

    if (!isCorrectPassword) {
      throw new UnauthorizedException(INCORRECT_PASSWORD);
    }

    delete userByEmail.password;

    return userByEmail;
  }

  async updateProfile(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.findById(userId);
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  findById(id: number): Promise<UserEntity> {
    return this.userRepository.findOne(id);
  }

  generateJwt(user: UserEntity): string {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
    );
  }

  buildUserResponse(user: UserEntity): IUserResponse {
    return {
      user: {
        ...user,
        token: this.generateJwt(user),
      },
    };
  }
}
