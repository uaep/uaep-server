import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DOMAIN } from 'config/constants';
import { EmailService } from 'src/email/email.service';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UserEntity } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private code: string;
  private email: string;
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly emailService: EmailService,
  ) {}

  async createUser(user: CreateUserDto): Promise<void> {
    if (user.password !== user.password_check) {
      throw new BadRequestException('Password confirmation does not match');
    }
    const newUser = this.userRepository.create({ email: this.email, ...user });
    await this.userRepository.save(newUser);
  }

  async emailValidityCheck(email: string): Promise<void> {
    // domain validity check(ex.gmail, naver, nate ...)
    const emailData = email.split('@');
    const domain = emailData[1];
    const domainCheck = DOMAIN.includes(domain);
    if (!domainCheck) {
      throw new UnprocessableEntityException(
        `Unvalid Email Domain : ${domain}.`,
      );
    }
    // email duplicate check
    const userExist = await this.userRepository.findOne({ email });
    if (userExist) {
      throw new UnprocessableEntityException('This email is already taken.');
    }
    this.email = email;
    this.code = await this.emailService.sendVerificationCode(email);
  }

  emailVerify(inputCode: string) {
    if (inputCode !== this.code) {
      throw new BadRequestException('This code is not valid.');
    }
  }

  async login({ email, password }: LoginDto) {
    const user = await this.userRepository.findOne({ email });
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      throw new BadRequestException('Incorrect email or password.');
    }
  }
}
