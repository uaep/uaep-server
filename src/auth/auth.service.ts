import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
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
    return user.email;
  }

  async login(email: any) {
    const payload = { email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
