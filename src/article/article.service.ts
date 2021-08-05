import { ArticleEntity } from './article.entity';
import { ISortedArticleResponse } from './types/sortedArticles.interface';
import { ARTICLE_NOT_FOUND, ARTICLE_AUTHOR } from './article.constants';
import { UserEntity } from '@app/user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, getRepository, Repository } from 'typeorm';
import { CreateArticleDto } from './dto/createArticle.dto';
import { IArticleResponseInterface } from './types/articleResponse.interface';
import slugify from 'slugify';
import { UpdateArticleDto } from './dto/updateArticle.dto';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findAll(userId: number, query: any): Promise<ISortedArticleResponse> {
    const queryBuilder = getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();

    const author = await this.userRepository.findOne({
      username: query.author,
    });

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}%`,
      });
    }

    if (query.author) {
      queryBuilder.andWhere('articles.authorId = :id', {
        id: author.id,
      });
    }

    if (query.favorited) {
      const author = await this.userRepository.findOne(
        {
          username: query.favorited,
        },
        { relations: ['favorites'] },
      );
      const ids = author.favorites.map((el) => el.id);

      if (ids.length) {
        queryBuilder.andWhere('articles.authorId IN (:...ids)', { ids });
      } else {
        queryBuilder.andWhere('1=0');
      }
    }

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    let favoriteIds: number[] = [];

    if (userId) {
      const currentUser = await this.userRepository.findOne(userId, {
        relations: ['favorites'],
      });
      favoriteIds = currentUser.favorites.map((favorite) => favorite.id);
    }

    const articles = await queryBuilder.getMany();

    const articlesWithFavorited = articles.map((article) => {
      const favorited = favoriteIds.includes(article.id);
      return { ...article, favorited };
    });

    return { articles: articlesWithFavorited, articlesCount };
  }

  async createArticle(
    currentUser: UserEntity,
    createArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);
    if (!article.tagList) {
      article.tagList = [];
    }
    article.slug = this.generateSlug(createArticleDto.title);

    article.author = currentUser;

    return await this.articleRepository.save(article);
  }

  async findBySlug(slug: string): Promise<ArticleEntity> {
    return this.articleRepository.findOne({
      slug,
    });
  }

  async deleteArticle(slug: string, id: number): Promise<DeleteResult> {
    const article = await this.findBySlug(slug);

    if (!article) {
      throw new HttpException(ARTICLE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (article.author.id !== id) {
      throw new HttpException(ARTICLE_AUTHOR, HttpStatus.FORBIDDEN);
    }

    return await this.articleRepository.delete({
      slug,
    });
  }

  async updateArticle(
    slug: string,
    id: number,
    dto: UpdateArticleDto,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);

    if (!article) {
      throw new HttpException(ARTICLE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (article.author.id !== id) {
      throw new HttpException(ARTICLE_AUTHOR, HttpStatus.FORBIDDEN);
    }

    Object.assign(article, dto);

    return await this.articleRepository.save(article);
  }

  async addArticleToFavorites(
    slug: string,
    id: number,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne(id, {
      relations: ['favorites'],
    });

    const isNotFavorite =
      user.favorites.findIndex(
        (articleInFavorites) => articleInFavorites.id === article.id,
      ) === -1;

    if (isNotFavorite) {
      user.favorites.push(article);
      article.favoritesCount++;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  async deleteArticleFromFavorites(
    slug: string,
    id: number,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne(id, {
      relations: ['favorites'],
    });

    const articleIndex = user.favorites.findIndex(
      (articleInFavorites) => articleInFavorites.id === article.id,
    );

    if (articleIndex > -1) {
      user.favorites.splice(articleIndex, 1);
      article.favoritesCount--;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  buildArticleResponse(article: ArticleEntity): IArticleResponseInterface {
    return { article };
  }

  private generateSlug(title: string): string {
    return (
      slugify(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
}
