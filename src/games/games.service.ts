import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FORMATIONS } from 'config/constants';
import { UserEntity } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateGameDto } from './dto/create-game.dto';
import { GameReviewEntity } from './entities/game-review.entity';
import { GameEntity } from './entities/game.entity';
import { convert, LocalDateTime } from '@js-joda/core';
import { UserService } from 'src/users/users.service';
import { FORMATIONS_DETAIL } from 'config/formations.config';

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

  async getAllGames() {
    const games = await this.gameRepository.find();
    const gameLists = [];
    games.forEach((game) => {
      const { teamA, teamB, ...gameInfo } = game;
      gameLists.push(gameInfo);
    });
    return gameLists;
  }

  async getGame(gameId: number) {
    const users = await this.gameRepository.findOne({ id: gameId });
    return users;
  }

  async createGame(user, game: CreateGameDto) {
    const host = await this.userRepository.findOne({ email: user.email });
    const newGame = this.gameRepository.create({
      host: host.name,
      date: convert(
        LocalDateTime.of(
          game.year,
          game.month,
          game.day,
          game.hour,
          game.minute,
          0,
        ),
      ).toDate(),
      place: game.place,
      number_of_users: game.number_of_users,
    });
    return await this.gameRepository.save(newGame);
  }

  async selectFormation(
    user,
    gameId: number,
    teamType: string,
    formation: string,
  ) {
    const game = await this.gameRepository.findOne({ id: gameId });
    if (
      game[`team${teamType}`] &&
      game[`team${teamType}`]['CAPTAIN'].email !== user.email
    ) {
      throw new ForbiddenException(
        `Authority Required : Captain of team${teamType}`,
      );
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
        break;
      }
    }
  }

  async selectPosition(
    user,
    gameId: number,
    teamType: string,
    position: string,
  ) {
    // TODO : A팀 captain인 경우 B팀 captain이 될 수 없음
    // TODO : A팀 captain인 경우 B팀으로 변경 불가 -> A팀 팀원에 captain 양도 후 B팀으로 변경 가능
    // TODO : 팀원(본인 포함)이 있는 경우는 포메이션 변경 불가
    // TODO : 내가 이미 포지션을 선택 한 경우, 취소하기 전에는 다른 포지션 선택 불가

    const game = await this.gameRepository.findOne({ id: gameId });

    if (!Object.keys(game[`team${teamType}`]).includes(position)) {
      throw new NotFoundException(`Invalid Position : ${position}`);
    }

    if (game[`team${teamType}`][position] !== null) {
      if (game[`team${teamType}`][position].email !== user.email) {
        return game[`team${teamType}`][position];
      } else {
        game[`team${teamType}`][position] = null;
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
    game[`team${teamType}`][position] = await this.userService.getProfile(
      currentUser.email,
    );
    return await this.gameRepository.save(game);
  }

  async finishGame(user, gameId: number) {
    const game = await this.gameRepository.findOne({ id: gameId });
    if (game.date > convert(LocalDateTime.now()).toDate()) {
      throw new ForbiddenException('The game is not over');
    }
    // TODO : user가 captain인지 권한 확인
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

    // TODO : game.teamA가 존재하지 않을 경우
    Object.keys(game.teamA).forEach(async (position) => {
      const playedUser = await this.userRepository.findOne(
        {
          email: game.teamA[position].email,
        },
        { relations: ['reviews'] },
      );
      playedUser['reviews'].push(review);
      await this.userRepository.save(playedUser);
    });

    Object.keys(game.teamB).forEach(async (position) => {
      const playedUser = await this.userRepository.findOne(
        {
          email: game.teamB[position].email,
        },
        { relations: ['reviews'] },
      );
      playedUser['reviews'].push(review);
      await this.userRepository.save(playedUser);
    });

    await this.gameRepository.remove(game);
  }
}
