import { IsEnum } from 'class-validator';
import { GAME_STATUS, GENDER } from 'config/constants';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  Generated,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'game' })
export class GameEntity {
  // TODO : @PrimaryGeneratedColumn('uuid')
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Generated('uuid')
  uuid: string;

  @Column()
  date: Date;

  @Column()
  place: string;

  @Column()
  number_of_users: string;

  @Column({ type: 'enum', enum: GENDER })
  @IsEnum(GENDER)
  gender: GENDER;

  @Column()
  host: string;

  @ManyToMany((type) => UserEntity, (user) => user.games)
  users?: UserEntity[];

  @Column({ type: 'json', nullable: true })
  teamA?: object;

  @Column({ type: 'json', nullable: true })
  teamB?: object;

  @Column({ type: 'enum', enum: GAME_STATUS, default: GAME_STATUS.AVAILABLE })
  @IsEnum(GAME_STATUS)
  status: GAME_STATUS;

  @Column({ default: false })
  review_flag: boolean;
}
