import { NOT_AUTHORIZE } from './../user.constants';
import { IExpressRequestInterface } from './../../types/expressRequest.interface';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<IExpressRequestInterface>();

    if (request.user) {
      return true;
    }

    throw new HttpException(NOT_AUTHORIZE, HttpStatus.UNAUTHORIZED);
  }
}
