import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  readonly username: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 30)
  readonly password: string;
}
