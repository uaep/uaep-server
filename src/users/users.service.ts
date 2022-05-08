import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DOMAIN } from 'config/constants';
import { EmailService } from 'src/email/email.service';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import { VerificationEntity } from './entities/verification.entity';
import * as uuid from 'uuid';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(VerificationEntity)
    private readonly verificationRepository: Repository<VerificationEntity>,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {}

  async createUser(
    signupVerifyToken: string,
    user: CreateUserDto,
  ): Promise<void> {
    if (user.password !== user.password_check) {
      throw new BadRequestException('Password confirmation does not match');
    }
    const verification = await this.verificationRepository.findOne({
      signupVerifyToken,
    });
    const newUser = this.userRepository.create({
      email: verification.email,
      ...user,
    });
    await this.userRepository.save(newUser);
    await this.verificationRepository.delete({ signupVerifyToken });
  }

  async emailValidityCheck(email: string) {
    const emailData = email.split('@');
    const domain = emailData[1];
    const domainCheck = DOMAIN.includes(domain);
    if (!domainCheck) {
      throw new UnprocessableEntityException(
        `Unvalid Email Domain : ${domain}.`,
      );
    }
    const userExist = await this.userRepository.findOne({ email });
    if (userExist) {
      throw new UnprocessableEntityException('This email is already taken.');
    }
    const signupVerifyToken = uuid.v1();
    const code = await this.emailService.sendVerificationCode(email);
    const newVerification = this.verificationRepository.create({
      email,
      signupVerifyToken,
      code,
    });
    await this.verificationRepository.save(newVerification);
    return signupVerifyToken;
  }

  async emailVerify(signupVerifyToken: string, inputCode: string) {
    const verification = await this.verificationRepository.findOne({
      signupVerifyToken,
    });
    if (inputCode !== verification.code) {
      throw new BadRequestException('This code is not valid.');
    }
  }

  async getProfile(email: string) {
    const user = await this.userRepository.findOne({ email });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { uid, password, createdAt, updatedAt, ...profile } = user;
    return profile;
  }
}
