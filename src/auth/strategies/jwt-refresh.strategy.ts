import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromHeader('REFRESH_TOKEN'),
      ignoreExpiration: true,
      secretOrKey: config.get('REFRESH_TOKEN_SECRET_KEY'),
      passReqToCallback: true,
    });
  }
}
