import {
  BadRequestException,
  Injectable,
  MethodNotAllowedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DOMAIN, LEVEL, LEVEL_POINT } from 'config/constants';
import { EmailService } from 'src/email/email.service';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import { VerificationEntity } from '../email/entities/verification.entity';
import * as uuid from 'uuid';
import { EditUserDto } from './dto/edit-user.dto';
import { TOWN_ALL } from 'config/config';

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
      // user.level = user.level + '1';
      const level_point = LEVEL_POINT[user.level];
      // switch (user.level) {
      //   case LEVEL.S1:
      //     level_point = LEVEL_POINT[LEVEL.S1];
      //     break;
      //   case LEVEL.B1:
      //     level_point = LEVEL_POINT[LEVEL.B1];
      //     break;
      //   case LEVEL.A1:
      //     level_point = LEVEL_POINT[LEVEL.A1];
      //     break;
      //   case LEVEL.SP1:
      //     level_point = LEVEL_POINT[LEVEL.SP1];
      //     break;
      //   case LEVEL.P1:
      //     level_point = LEVEL_POINT[LEVEL.P1];
      //     break;
      //   default:
      //     throw new BadRequestException(`${user.level} is not exist`);
      // }
      const newUser = this.userRepository.create({
        level_point: level_point,
        ...user,
      });
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
    let level_point;
    switch (user.level) {
      case LEVEL.S1:
        level_point = LEVEL_POINT[LEVEL.S1];
        break;
      case LEVEL.B1:
        level_point = LEVEL_POINT[LEVEL.B1];
        break;
      case LEVEL.A1:
        level_point = LEVEL_POINT[LEVEL.A1];
        break;
      case LEVEL.SP1:
        level_point = LEVEL_POINT[LEVEL.SP1];
        break;
      case LEVEL.P1:
        level_point = LEVEL_POINT[LEVEL.P1];
        break;
      default:
        throw new BadRequestException(`${user.level} is not exist`);
    }

    let town_flag = false;
    for (const value of Object.values(TOWN_ALL[user.province])) {
      if (value === user.town) {
        town_flag = true;
        break;
      }
    }
    if (!town_flag) {
      throw new BadRequestException(
        `The address ${user.province} ${user.town} is invalid format`,
      );
    }
    const newUser = this.userRepository.create({
      email: verification.email,
      level_point: level_point,
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
        level_point,
        createdAt,
        updatedAt,
        currentHashedRefreshToken,
        reviews,
        ...profile
      } = user;
      return profile;
    } else {
      const {
        id,
        password,
        level_point,
        createdAt,
        updatedAt,
        currentHashedRefreshToken,
        position_change_point,
        games,
        reviews,
        ...profile
      } = user;
      return profile;
    }
  }

  async editProfile(email: string, newUserInfo: EditUserDto) {
    const userProfile = await this.userRepository.findOne(
      { email },
      { relations: ['games'] },
    );

    if (newUserInfo.province) {
      if (!newUserInfo.town) {
        throw new BadRequestException(`No detailed region selected.`);
      }
      let town_flag = false;
      for (const value of Object.values(TOWN_ALL[newUserInfo.province])) {
        if (value === newUserInfo.town) {
          town_flag = true;
          break;
        }
      }
      if (!town_flag) {
        throw new BadRequestException(
          `The address ${newUserInfo.province} ${newUserInfo.town} is invalid format.`,
        );
      }
      userProfile.province = newUserInfo.province;
      userProfile.town = newUserInfo.town;
    }

    if (newUserInfo.position !== userProfile.position) {
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
      userProfile.position = newUserInfo.position;
    }

    if (newUserInfo.name && newUserInfo.name !== userProfile.name) {
      const existedName = await this.userRepository.findOne({
        name: newUserInfo.name,
      });
      if (existedName) {
        throw new UnprocessableEntityException('This name is already taken.');
      }
    }

    userProfile.name = newUserInfo.name ? newUserInfo.name : userProfile.name;
    await this.userRepository.save(userProfile);
    return await this.getProfile(email, email);
  }

  async getRanks() {
    const allUsers = await this.userRepository.find({
      order: { level_point: 'DESC', manner_point: 'DESC' },
      take: 10,
    });
    return allUsers;
  }
}
