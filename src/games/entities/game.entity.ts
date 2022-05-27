import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'game' })
export class GameEntity {
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

  // TODO : 모든 user가 방을 나간 경우를 판단하기 위한 Column 필요
  // ex. 방 안에 존재하는 모든 user를 가지고 있는 array?

  @Column({ type: 'json', nullable: true })
  teamA?: object;

  @Column({ type: 'json', nullable: true })
  teamB?: object;

  // @ManyToMany((type) => UserEntity)
  // @JoinTable()
  // teamAMember?: UserEntity[];

  // @ManyToMany((type) => UserEntity)
  // @JoinTable()
  // teamBMember?: UserEntity[];

  // @ManyToMany((type) => UserEntity, (user) => user.game)
  // @JoinTable()
  // teamMember?: UserEntity[];
}
