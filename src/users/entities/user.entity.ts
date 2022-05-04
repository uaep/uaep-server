import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { IsEmail, IsEnum } from 'class-validator';
import { GENDER, POSITION } from 'config/constants';
import { InternalServerErrorException } from '@nestjs/common';

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  uid: number;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column()
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  token: string;

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
