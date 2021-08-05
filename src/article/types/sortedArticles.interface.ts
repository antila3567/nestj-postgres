import { ArticleType } from './article.type';

export interface ISortedArticleResponse {
  articles: ArticleType[];
  articlesCount: number;
}
