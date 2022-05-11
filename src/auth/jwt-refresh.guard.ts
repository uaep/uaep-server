import {
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { TOKEN_ERROR } from './jwt-auth.guard';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh-token') {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly authService: AuthService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    const { access_token, refresh_token } = req.cookies;

    if (access_token === undefined) {
      throw new UnauthorizedException('Access token not sent');
    } else if (refresh_token === undefined) {
      throw new UnauthorizedException('Refresh token not sent');
    }

    try {
      const payload = this.jwtService.decode(access_token);
      await this.authService.getUserRefreshTokenMatches(
        payload['email'],
        refresh_token,
      );
      req.user = this.jwtService.verify(refresh_token, {
        secret: this.config.get('REFRESH_TOKEN_SECRET_KEY'),
      });
    } catch (e) {
      switch (e.message) {
        case TOKEN_ERROR.INVALID_TOKEN:
          throw new UnauthorizedException('Invalid refresh token');

        case TOKEN_ERROR.EXPIRED_TOKEN:
          throw new UnauthorizedException('Expired refresh token');

        default:
          throw new InternalServerErrorException();
      }
    }
    return true;
  }
}
