import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { IsEmail, IsEnum } from 'class-validator';
import { GENDER, POSITION } from 'config/constants';
import { InternalServerErrorException } from '@nestjs/common';
import { Exclude } from 'class-transformer';
import { GameReviewEntity } from 'src/games/entities/game-review.entity';
import { GameEntity } from 'src/games/entities/game.entity';

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column()
  address: string;

  @Column({ type: 'enum', enum: POSITION })
  @IsEnum(POSITION)
  position: POSITION;

  @Column({ default: 0 })
  level_point: number;

  @Column({ default: 0 })
  position_change_point: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  @Exclude()
  currentHashedRefreshToken?: string;

  @ManyToMany(() => GameReviewEntity)
  @JoinTable()
  reviews?: GameReviewEntity[];

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

  async checkPassword(checkPW: string): Promise<boolean> {
    try {
      const checkPassword = await bcrypt.compare(checkPW, this.password);
      return checkPassword;
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }
}
