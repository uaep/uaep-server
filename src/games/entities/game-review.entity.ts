import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'review' })
export class GameReviewEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: Date;

  @Column()
  place: string;

  @Column()
  number_of_users: string;

  @Column()
  host: string;

  @Column({ type: 'json', nullable: true })
  teamA?: object;

  @Column({ type: 'json', nullable: true })
  teamB?: object;
}
