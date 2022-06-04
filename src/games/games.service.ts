import {
  ConflictException,
  ForbiddenException,
  Injectable,
  MethodNotAllowedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FORMATIONS, GAME_STATUS, GENDER } from 'config/constants';
import { UserEntity } from 'src/users/entities/user.entity';
import { Between, Repository } from 'typeorm';
import { CreateGameDto } from './dto/create-game.dto';
import { GameReviewEntity } from './entities/game-review.entity';
import { GameEntity } from './entities/game.entity';
import { convert, LocalDate, LocalDateTime } from '@js-joda/core';
import { UserService } from 'src/users/users.service';
import { FORMATIONS_DETAIL } from 'config/formations.config';
import { QueryFiltersDto } from './dto/query-filters.dto';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(GameEntity)
    private readonly gameRepository: Repository<GameEntity>,
    @InjectRepository(GameReviewEntity)
    private readonly reviewRepository: Repository<GameReviewEntity>,
    private readonly userService: UserService,
  ) {}

  async getAllGames(filters: QueryFiltersDto) {
    const conditions = {
      where: {
        date: Between(
          convert(
            LocalDate.of(LocalDate.now()['_year'], filters.month, filters.day),
          ).toDate(),
          convert(
            LocalDate.of(
              LocalDate.now()['_year'],
              filters.month,
              filters.day + 1,
            ),
          ).toDate(),
        ),
      },
    };
    if (filters.gender) {
      Object.assign(conditions.where, { gender: filters.gender });
    }
    if (filters.status) {
      Object.assign(conditions.where, { status: filters.status });
    }
    if (filters.number_of_users) {
      Object.assign(conditions.where, {
        number_of_users: filters.number_of_users,
      });
    }
    const games = await this.gameRepository.find(conditions);
    const gameLists = [];
    games.forEach((game) => {
      const { teamA, teamB, ...gameInfo } = game;
      gameLists.push(gameInfo);
    });
    return gameLists;
  }

  async getGame(user, gameId: number) {
    const currentUser = await this.userRepository.findOne({
      email: user.email,
    });
    const game = await this.gameRepository.findOne({ id: gameId });
    if (game) {
      if (game.gender !== GENDER.ANY && game.gender !== currentUser.gender) {
        throw new ForbiddenException(
          `You can't enter the game : only for ${game.gender}`,
        );
      }
    }
    return game;
  }

  async createGame(user, game: CreateGameDto) {
    const host = await this.userRepository.findOne({ email: user.email });
    if (game.gender !== host.gender && game.gender !== GENDER.ANY) {
      throw new ForbiddenException(
        `You can't create a game for ${game.gender}`,
      );
    }
    const newGame = this.gameRepository.create({
      host: host.name,
      date: convert(
        LocalDateTime.of(
          game.year,
          game.month,
          game.day,
          game.hour,
          game.minute,
          1,
        ),
      ).toDate(),
      place: game.place,
      number_of_users: game.number_of_users,
      gender: game.gender,
    });
    return await this.gameRepository.save(newGame);
  }

  async selectFormation(
    user,
    gameId: number,
    teamType: string,
    formation: string,
  ) {
    const opponentType = teamType === 'A' ? 'B' : 'A';
    const game = await this.gameRepository.findOne({ id: gameId });
    if (game[`team${opponentType}`] !== null) {
      for (const [key, value] of Object.entries(game[`team${opponentType}`])) {
        if (value === null) {
          continue;
        }
        if (value['email'] === user.email) {
          if (key === 'CAPTAIN') {
            throw new MethodNotAllowedException(
              `Can't select team${teamType}'s formation : You are captain of team${opponentType}`,
            );
          } else {
            throw new MethodNotAllowedException(
              `Can't select team${teamType}'s formation : You already belong to team${opponentType}`,
            );
          }
        }
      }
    }

    if (
      game[`team${teamType}`] &&
      game[`team${teamType}`]['CAPTAIN'].email !== user.email
    ) {
      throw new ForbiddenException(
        `Authority Required : Captain of team${teamType}`,
      );
    }

    if (game[`team${teamType}`]) {
      for (const [key, value] of Object.entries(game[`team${teamType}`])) {
        if (key === 'CAPTAIN') {
          continue;
        }
        if (value !== null) {
          throw new MethodNotAllowedException(
            `Can't change team${teamType}'s formation`,
          );
        }
      }
    }

    switch (FORMATIONS[formation]) {
      case FORMATIONS.F131:
        game[`team${teamType}`] = FORMATIONS_DETAIL[FORMATIONS.F131];
        break;
      case FORMATIONS.F212:
        game[`team${teamType}`] = FORMATIONS_DETAIL[FORMATIONS.F212];
        break;
      case FORMATIONS.F221:
        game[`team${teamType}`] = FORMATIONS_DETAIL[FORMATIONS.F221];
        break;
      default:
        throw new NotFoundException(`${formation} is an unsupported formation`);
    }
    game[`team${teamType}`]['CAPTAIN'] = await this.userService.getProfile(
      user.email,
    );
    return await this.gameRepository.save(game);
  }

  async captainAppointment(
    user,
    gameId: number,
    teamType: string,
    newCaptainName: string,
  ) {
    const game = await this.gameRepository.findOne({ id: gameId });
    if (game[`team${teamType}`]['CAPTAIN'].email !== user.email) {
      throw new ForbiddenException(
        `Authority Required : Captain of team${teamType}`,
      );
    }
    for (const value of Object.values(game[`team${teamType}`])) {
      if (value === null) {
        continue;
      }
      if (value['name'] === newCaptainName) {
        const newCaptain = await this.userRepository.findOne({
          name: newCaptainName,
        });
        game[`team${teamType}`]['CAPTAIN'] = await this.userService.getProfile(
          newCaptain.email,
        );
        await this.gameRepository.save(game);
        return;
      }
    }
    throw new NotFoundException(
      `There is no user who named ${newCaptainName} in team${teamType}`,
    );
  }

  async selectPosition(
    user,
    gameId: number,
    teamType: string,
    position: string,
  ) {
    const game = await this.gameRepository.findOne(
      { id: gameId },
      { relations: ['users'] },
    );

    const numberOfUsers = game.number_of_users.split('v');
    let numberOfSeats = Number(numberOfUsers[0]) + Number(numberOfUsers[1]);

    if (game[`team${teamType}`] === null) {
      throw new NotFoundException(`team${teamType} doesn't have formation yet`);
    }

    if (!Object.keys(game[`team${teamType}`]).includes(position)) {
      throw new NotFoundException(`Invalid Position : ${position}`);
    }

    if (game[`team${teamType}`][position] !== null) {
      if (game[`team${teamType}`][position].email !== user.email) {
        return game[`team${teamType}`][position];
      } else {
        game[`team${teamType}`][position] = null;
        game.users = game.users.filter((gamer) => {
          return gamer.email !== user.email;
        });
        return await this.gameRepository.save(game);
      }
    }

    const currentUser = await this.userRepository.findOne({
      email: user.email,
    });

    if (position.replace(/[0-9]/g, '') !== currentUser.position) {
      throw new ForbiddenException(
        `Your position is ${
          currentUser.position
        }, but you choose ${position.replace(/[0-9]/g, '')}`,
      );
    }

    if (game['teamA']) {
      for (const [key, value] of Object.entries(game['teamA'])) {
        if (key !== 'CAPTAIN' && value !== null) {
          numberOfSeats -= 1;
        }
        if (key.replace(/[0-9]/g, '') === currentUser.position) {
          if (value === null) {
            continue;
          }
          if (value['email'] === currentUser.email) {
            throw new ConflictException(`You already select teamA : ${key}`);
          }
        }
      }
    }
    if (game['teamB']) {
      for (const [key, value] of Object.entries(game['teamB'])) {
        if (key !== 'CAPTAIN' && value !== null) {
          numberOfSeats -= 1;
        }
        if (key.replace(/[0-9]/g, '') === currentUser.position) {
          if (value === null) {
            continue;
          }
          if (value['email'] === currentUser.email) {
            throw new ConflictException(`You already select teamB : ${key}`);
          }
        }
      }
    }

    game[`team${teamType}`][position] = await this.userService.getProfile(
      currentUser.email,
    );
    if (!game.users.includes(currentUser)) {
      game.users.push(currentUser);
    }
    if (numberOfSeats === 0) {
      game.status = GAME_STATUS.CLOSED;
    }
    return await this.gameRepository.save(game);
  }

  async finishGame(user, gameId: number, teamType: string) {
    const game = await this.gameRepository.findOne(
      { id: gameId },
      { relations: ['users'] },
    );
    if (game[`team${teamType}`]['CAPTAIN'].email !== user.email) {
      throw new ForbiddenException(
        `Authority Required : Captain of team${teamType}`,
      );
    }
    if (game.date > convert(LocalDateTime.now()).toDate()) {
      throw new ForbiddenException('The game is not over');
    }
    const newReview = this.reviewRepository.create({
      id: game.id,
      date: game.date,
      place: game.place,
      number_of_users: game.number_of_users,
      host: game.host,
      teamA: game.teamA,
      teamB: game.teamB,
    });
    const review = await this.reviewRepository.save(newReview);

    Object.values(game[`team${teamType}`]).forEach(async (playUser) => {
      const playedUser = await this.userRepository.findOne(
        {
          email: playUser['email'],
        },
        { relations: ['reviews'] },
      );
      playedUser['reviews'].push(review);
      await this.userRepository.save(playedUser);
      game.users = game.users.filter((user) => {
        return user.email !== playUser['email'];
      });
      await this.gameRepository.save(game);
    });

    if (game.users.length === 0) {
      await this.gameRepository.remove(game);
    }
  }
}
