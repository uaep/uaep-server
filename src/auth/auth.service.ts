import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async validateUser(email: string, pw: string) {
    const user = await this.userRepository.findOne({ email });
    if (!user) {
      throw new BadRequestException('User not Found: Incorrect email.');
    }
    const checkPassword = await user.checkPassword(pw);
    if (!checkPassword) {
      throw new BadRequestException('Incorrect password.');
    }
    return user;
  }

  getAccessToken(email: string) {
    const payload = { email };
    const access_token = this.jwtService.sign(payload, {
      secret: this.config.get('ACCESS_TOKEN_SECRET_KEY'),
      expiresIn: `${this.config.get('ACCESS_TOKEN_EXPIRATION_TIME')}s`,
    });
    return access_token;
  }

  getRefreshToken(email: string) {
    const payload = { email };
    const Refresh_token = this.jwtService.sign(payload, {
      secret: this.config.get('REFRESH_TOKEN_SECRET_KEY'),
      expiresIn: `${this.config.get('REFRESH_TOKEN_EXPIRATION_TIME')}s`,
    });
    return Refresh_token;
  }

  async getUserRefreshTokenMatches(email: string, refresh_token: string) {
    const user = await this.userRepository.findOne({ email });
    const isRefreshTokenMatch = await bcrypt.compare(
      refresh_token,
      user.currentHashedRefreshToken,
    );
    if (isRefreshTokenMatch) {
      return true;
    } else {
      throw new UnauthorizedException('Invalid Signature');
    }
  }

  async login(email: string) {
    const refresh_token = this.getRefreshToken(email);
    const currentHashedRefreshToken = await bcrypt.hash(refresh_token, 10);
    await this.userRepository.update(
      { email },
      {
        currentHashedRefreshToken,
      },
    );
    return {
      access_token: this.getAccessToken(email),
      refresh_token: refresh_token,
    };
  }

  async logout(email: string) {
    await this.userRepository.update(
      { email },
      {
        currentHashedRefreshToken: null,
      },
    );
  }
}
