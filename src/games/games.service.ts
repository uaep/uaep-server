import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { UserService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { CreateGameDto } from './dto/create-game.dto';
import { GameEntity } from './entities/game.entity';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(GameEntity)
    private readonly gameRepository: Repository<GameEntity>,
    private readonly userService: UserService,
  ) {}

  async getAllGames() {
    const games = await this.gameRepository.find({ relations: ['users'] });
    return games;
  }

  async getGame(id: number) {
    const users = await this.gameRepository.findOne(id, {
      loadRelationIds: true,
    });
    return users;
    // const users = await this.gameRepository.findOne({
    //   where: { id },
    //   relations: ['users'],
    // });
    // const userProfiles = await Promise.all(
    //   users['users'].map(async (user) => {
    //     return await this.userService.getProfile(user.email);
    //   }),
    // );
    // return userProfiles;
  }

  async createGame(user, game: CreateGameDto) {
    const host = await this.userRepository.find({ email: user.email });
    const newGame = this.gameRepository.create({
      users: host,
      ...game,
    });
    await this.gameRepository.save(newGame);
  }

  async join(user, gameId: number) {
    const game = await this.gameRepository.findOne(
      { id: gameId },
      { relations: ['users'] },
    );
    const currentUser = await this.userRepository.findOne({
      email: user.email,
    });
    const updatedGame = this.gameRepository.create({
      id: game.id,
      date: game.date,
      place: game.place,
      users: [currentUser, ...game.users],
    });
    await this.gameRepository.save(updatedGame);
    //await this.gameRepository.update({ id: gameId }, { users: [currentUser] });
  }
}
