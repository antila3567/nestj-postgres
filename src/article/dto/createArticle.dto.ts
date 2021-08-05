import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateArticleDto {
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @IsNotEmpty()
  readonly body: string;

  @IsString({ each: true })
  @IsOptional()
  readonly tagList?: string[];
}
