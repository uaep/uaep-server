import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { IsEmail, IsEnum } from 'class-validator';
import {
  GENDER,
  LEVEL,
  LEVEL_POINT,
  MANNER_POINT,
  POSITION,
  PROVINCE,
} from 'config/constants';
import { InternalServerErrorException } from '@nestjs/common';
import { Exclude } from 'class-transformer';
import { ReviewEntity } from 'src/reviews/entities/review.entity';
import { GameEntity } from 'src/games/entities/game.entity';

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Generated('uuid')
  uuid: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column({ unique: true })
  name: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: GENDER })
  @IsEnum(GENDER)
  gender: GENDER;

  @Column({ type: 'enum', enum: PROVINCE })
  @IsEnum(PROVINCE)
  province: PROVINCE;

  @Column()
  town: string;

  @Column({ type: 'enum', enum: POSITION })
  @IsEnum(POSITION)
  position: POSITION;

  @Column({ type: 'float' })
  level_point: number;

  @Column({ type: 'enum', enum: LEVEL })
  @IsEnum(LEVEL)
  level: LEVEL;

  @Column({ default: MANNER_POINT })
  manner_point: number;

  @Column({ nullable: true })
  account_unlock_date?: Date;

  @Column({ default: 0 })
  position_change_point: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  @Exclude()
  currentHashedRefreshToken?: string;

  @ManyToMany(() => ReviewEntity)
  @JoinTable()
  reviews?: ReviewEntity[];

  @ManyToMany((type) => GameEntity, (game) => game.users)
  @JoinTable()
  games?: GameEntity[];

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  updateLevel() {
    switch (true) {
      case this.level_point >= LEVEL_POINT[LEVEL.S1] &&
        this.level_point < LEVEL_POINT[LEVEL.S2]:
        this.level = LEVEL.S1;
        break;
      case this.level_point < LEVEL_POINT[LEVEL.S3]:
        this.level = LEVEL.S2;
        break;
      case this.level_point < LEVEL_POINT[LEVEL.B1]:
        this.level = LEVEL.S3;
        break;
      case this.level_point < LEVEL_POINT[LEVEL.B2]:
        this.level = LEVEL.B1;
        break;
      case this.level_point < LEVEL_POINT[LEVEL.B3]:
        this.level = LEVEL.B2;
        break;
      case this.level_point < LEVEL_POINT[LEVEL.A1]:
        this.level = LEVEL.B3;
        break;
      case this.level_point < LEVEL_POINT[LEVEL.A2]:
        this.level = LEVEL.A1;
        break;
      case this.level_point < LEVEL_POINT[LEVEL.A3]:
        this.level = LEVEL.A2;
        break;
      case this.level_point < LEVEL_POINT[LEVEL.SP1]:
        this.level = LEVEL.A3;
        break;
      case this.level_point < LEVEL_POINT[LEVEL.SP2]:
        this.level = LEVEL.SP1;
        break;
      case this.level_point < LEVEL_POINT[LEVEL.SP3]:
        this.level = LEVEL.SP2;
        break;
      case this.level_point < LEVEL_POINT[LEVEL.P1]:
        this.level = LEVEL.SP3;
        break;
      case this.level_point < LEVEL_POINT[LEVEL.P2]:
        this.level = LEVEL.P1;
        break;
      case this.level_point < LEVEL_POINT[LEVEL.P3]:
        this.level = LEVEL.P2;
        break;
      case this.level_point >= LEVEL_POINT[LEVEL.P3]:
        this.level = LEVEL.P3;
        break;
    }
  }

  async checkPassword(checkPW: string): Promise<boolean> {
    try {
      const checkPassword = await bcrypt.compare(checkPW, this.password);
      return checkPassword;
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }
}
