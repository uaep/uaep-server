import { IsEnum } from 'class-validator';
import { GENDER, REVIEW_STATUS } from 'config/constants';
import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';

@Entity({ name: 'review' })
export class ReviewEntity {
  @PrimaryColumn()
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

  @Column({ type: 'json', nullable: true })
  teamA?: object;

  @Column({ type: 'json', nullable: true })
  teamB?: object;

  @Column({
    type: 'enum',
    enum: REVIEW_STATUS,
    default: REVIEW_STATUS.REVIEW,
  })
  @IsEnum(REVIEW_STATUS)
  status: REVIEW_STATUS;

  @Column({
    type: 'enum',
    enum: REVIEW_STATUS,
    default: REVIEW_STATUS.NOT_FINISHED,
  })
  @IsEnum(REVIEW_STATUS)
  teamA_status: REVIEW_STATUS;

  @Column({
    type: 'enum',
    enum: REVIEW_STATUS,
    default: REVIEW_STATUS.NOT_FINISHED,
  })
  @IsEnum(REVIEW_STATUS)
  teamB_status: REVIEW_STATUS;

  @Column({ default: false })
  apply_flag: boolean;
}
