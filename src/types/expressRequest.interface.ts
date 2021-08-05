import { UserEntity } from './../user/user.entity';
import { Request } from 'express';

export interface IExpressRequestInterface extends Request {
  user?: UserEntity;
}
