import {
  BadRequestException,
  Injectable,
  MethodNotAllowedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DOMAIN } from 'config/constants';
import { EmailService } from 'src/email/email.service';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import { VerificationEntity } from '../email/entities/verification.entity';
import * as uuid from 'uuid';
import { EditUserDto } from './dto/edit-user.dto';

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

  async testCreateUser(users) {
    users.forEach(async (user) => {
      const newUser = this.userRepository.create(user);
      await this.userRepository.save(newUser);
    });
  }

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

  async getProfile(email: string, requester?) {
    const user = await this.userRepository.findOne(
      { email },
      { relations: ['games'] },
    );
    if (requester === email) {
      const {
        id,
        password,
        createdAt,
        updatedAt,
        currentHashedRefreshToken,
        ...profile
      } = user;
      return profile;
    } else {
      const {
        id,
        password,
        createdAt,
        updatedAt,
        currentHashedRefreshToken,
        position_change_point,
        games,
        ...profile
      } = user;
      return profile;
    }
  }

  async editProfile(email: string, user: EditUserDto) {
    const userProfile = await this.userRepository.findOne(
      { email },
      { relations: ['games'] },
    );

    if (user.position !== userProfile.position) {
      if (userProfile.games.length !== 0) {
        throw new MethodNotAllowedException(
          'Precondition : Deselect positions in all participating games',
        );
      }
      if (
        userProfile.position_change_point <
        this.config.get('POSITION_CHANGE_POINT')
      ) {
        throw new BadRequestException(
          `Not enough points : ${userProfile.position_change_point}`,
        );
      }
      userProfile.position_change_point -= this.config.get(
        'POSITION_CHANGE_POINT',
      );
      userProfile.position = user.position;
    }

    if (user.name && user.name !== userProfile.name) {
      const existedName = await this.userRepository.findOne({
        name: user.name,
      });
      if (existedName) {
        throw new UnprocessableEntityException('This name is already taken.');
      }
    }

    userProfile.name = user.name ? user.name : userProfile.name;
    userProfile.address = user.address ? user.address : userProfile.address;
    await this.userRepository.save(userProfile);
    return this.getProfile(email, email);
  }

  async getAllReviews(email: string) {
    const user = await this.userRepository.findOne(
      { email },
      { relations: ['reviews'] },
    );
    return user.reviews;
  }
}
