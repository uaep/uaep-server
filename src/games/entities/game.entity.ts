import { IsEnum, IsOptional } from 'class-validator';
import { GAME_STATUS, GENDER, LEVEL_LIMIT, PROVINCE } from 'config/constants';
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
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Generated('uuid')
  uuid: string;

  @Column()
  date: Date;

  @Column({ type: 'enum', enum: PROVINCE })
  @IsEnum(PROVINCE)
  province: PROVINCE;

  @Column()
  town: string;

  @Column()
  place: string;

  @Column()
  number_of_users: string;

  @Column()
  number_of_seats: number;

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

  @Column({ type: 'enum', enum: LEVEL_LIMIT, default: LEVEL_LIMIT.ALL })
  @IsEnum(LEVEL_LIMIT)
  level_limit: LEVEL_LIMIT;

  @Column({ type: 'json', nullable: true })
  level_distribution?: object;

  @Column({ type: 'float', default: 0.0 })
  meanOfLevelPoint?: number;

  @Column({ type: 'float', default: 0.0 })
  standardDeviation?: number;
}
