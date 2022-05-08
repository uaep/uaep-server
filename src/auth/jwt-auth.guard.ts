import {
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

const TOKEN_ERROR = {
  INVALID_TOKEN: 'invalid signature',
  EXPIRED_TOKEN: 'jwt expired',
};

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    const { authorization } = req.headers;

    if (authorization === undefined) {
      throw new UnauthorizedException('Token not sent');
    }

    const token = authorization.replace('Bearer ', '');
    try {
      req.user = this.jwtService.verify(token, {
        secret: this.config.get('ACCESS_TOKEN_SECRET_KEY'),
      });
    } catch (e) {
      switch (e.message) {
        case TOKEN_ERROR.INVALID_TOKEN:
          throw new UnauthorizedException('Invalid token');

        case TOKEN_ERROR.EXPIRED_TOKEN:
          throw new UnauthorizedException('Expired token');

        default:
          throw new InternalServerErrorException();
      }
    }
    return true;
  }
}
