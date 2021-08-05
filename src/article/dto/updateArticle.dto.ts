import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateArticleDto {
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsString()
  @IsNotEmpty()
  readonly description: string;

  @IsString()
  @IsNotEmpty()
  readonly body: string;

  @IsString({ each: true })
  @IsOptional()
  readonly tagList?: string[];
}
