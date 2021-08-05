import { ISortedArticleResponse } from './types/sortedArticles.interface';
import { User } from '@app/user/decorators/user.decorator';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { UserEntity } from '@app/user/user.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/createArticle.dto';
import { UpdateArticleDto } from './dto/updateArticle.dto';
import { IArticleResponseInterface } from './types/articleResponse.interface';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @User('id') userId: number,
    @Query() query: any,
  ): Promise<ISortedArticleResponse> {
    return await this.articleService.findAll(userId, query);
  }

  @UsePipes(new ValidationPipe())
  @Post()
  @UseGuards(AuthGuard)
  async create(
    @User() currentUser: UserEntity,
    @Body('article') createArticleDto: CreateArticleDto,
  ): Promise<IArticleResponseInterface> {
    const article = await this.articleService.createArticle(
      currentUser,
      createArticleDto,
    );

    return this.articleService.buildArticleResponse(article);
  }

  @Get(':slug')
  async getArticle(
    @Param('slug') slug: string,
  ): Promise<IArticleResponseInterface> {
    const article = await this.articleService.findBySlug(slug);
    return this.articleService.buildArticleResponse(article);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  async deleteArticle(@Param('slug') slug: string, @User('id') id: number) {
    return await this.articleService.deleteArticle(slug, id);
  }

  @UsePipes(new ValidationPipe())
  @Put(':slug')
  @UseGuards(AuthGuard)
  async updateArticle(
    @Param('slug') slug: string,
    @User('id') id: number,
    @Body('article') dto: UpdateArticleDto,
  ): Promise<IArticleResponseInterface> {
    const article = await this.articleService.updateArticle(slug, id, dto);
    return this.articleService.buildArticleResponse(article);
  }

  @Post(':slug/favorite')
  @UseGuards(AuthGuard)
  async addArticleFavorites(
    @User('id') id: number,
    @Param('slug') slug: string,
  ): Promise<IArticleResponseInterface> {
    const article = await this.articleService.addArticleToFavorites(slug, id);
    return this.articleService.buildArticleResponse(article);
  }

  @Delete(':slug/favorite')
  @UseGuards(AuthGuard)
  async deleteArticleFromFavorites(
    @User('id') id: number,
    @Param('slug') slug: string,
  ): Promise<IArticleResponseInterface> {
    const article = await this.articleService.deleteArticleFromFavorites(
      slug,
      id,
    );
    return this.articleService.buildArticleResponse(article);
  }
}
