import { IArticleResponseInterface } from './../article/types/articleResponse.interface';
import { IUserResponse } from './../../dist/user/types/userResponse.interface.d';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from '@app/user/user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { User } from './decorators/user.decorator';
import { UserEntity } from './user.entity';
import { AuthGuard } from './guards/auth.guard';
import { UpdateUserDto } from './dto/updateUser.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}
  @UsePipes(new ValidationPipe())
  @Post('users')
  async createUser(
    @Body('user') createUserDto: CreateUserDto,
  ): Promise<IUserResponse> {
    const user = await this.userService.createUser(createUserDto);
    return this.userService.buildUserResponse(user);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('users/login')
  async login(@Body() loginUserDto: LoginUserDto): Promise<IUserResponse> {
    const user = await this.userService.loginUser(loginUserDto);
    return this.userService.buildUserResponse(user);
  }

  @Get('users/profile')
  @UseGuards(AuthGuard)
  async currentUser(@User() user: UserEntity): Promise<IUserResponse> {
    return this.userService.buildUserResponse(user);
  }

  @Put('users/update')
  @UseGuards(AuthGuard)
  async updateCurrentUser(
    @User('id') currentUserId: number,
    @Body('user') updateUserDto: UpdateUserDto,
  ): Promise<IUserResponse> {
    const user = await this.userService.updateProfile(
      currentUserId,
      updateUserDto,
    );
    return this.userService.buildUserResponse(user);
  }
}
