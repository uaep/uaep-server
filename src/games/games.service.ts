import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  MethodNotAllowedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FORMATIONS_5v5,
  FORMATIONS_6v6,
  GAME_STATUS,
  GENDER,
  LEVEL,
  LEVEL_LIMIT,
  LEVEL_POINT,
  PLAYER_NUMBERS,
  PROVINCE,
  REGION_FILTER,
  REVIEW_STATUS,
} from 'config/constants';
import { UserEntity } from 'src/users/entities/user.entity';
import { Between, Repository } from 'typeorm';
import { CreateGameDto } from './dto/create-game.dto';
import { ReviewEntity } from '../reviews/entities/review.entity';
import { GameEntity } from './entities/game.entity';
import { convert, LocalDate, LocalDateTime } from '@js-joda/core';
import { UserService } from 'src/users/users.service';
import { FORMATIONS_DETAIL, LEVEL_DISTRIBUTION } from 'config/config';
import { QueryFiltersDto } from './dto/query-filters.dto';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(GameEntity)
    private readonly gameRepository: Repository<GameEntity>,
    @InjectRepository(ReviewEntity)
    private readonly reviewRepository: Repository<ReviewEntity>,
    private readonly userService: UserService,
  ) {}

  async getAllGames(filters: QueryFiltersDto) {
    const conditions = {
      where: [],
    };
    if (filters.region) {
      const regions = [];
      switch (filters.region) {
        case REGION_FILTER.SEOUL:
          regions.push(PROVINCE.SEOUL);
          break;
        case REGION_FILTER.GYEONGGI_GANGWON:
          regions.push(PROVINCE.GYEONGGI);
          regions.push(PROVINCE.GANGWON);
          break;
        case REGION_FILTER.INCHEON:
          regions.push(PROVINCE.INCHEON);
          break;
        case REGION_FILTER.DAEJEON_SEJONG_CHUNGCHEONG:
          regions.push(PROVINCE.DAEJEON);
          regions.push(PROVINCE.SEJONG);
          regions.push(PROVINCE.CHUNGCHEONGBUK);
          regions.push(PROVINCE.CHUNGCHEONGNAM);
          break;
        case REGION_FILTER.DAEGU_GYEONGSANGBUK:
          regions.push(PROVINCE.DAEGU);
          regions.push(PROVINCE.GYEONGSANGBUK);
          break;
        case REGION_FILTER.BUSAN_ULSAN_GYEONGSANGNAM:
          regions.push(PROVINCE.BUSAN);
          regions.push(PROVINCE.ULSAN);
          regions.push(PROVINCE.GYEONGSANGNAM);
          break;
        case REGION_FILTER.GWANGJU_JEOLLA:
          regions.push(PROVINCE.GWANGJU);
          regions.push(PROVINCE.JEOLLABUK);
          regions.push(PROVINCE.JEOLLANAM);
          break;
        case REGION_FILTER.JEJU:
          regions.push(PROVINCE.JEJU);
          break;
      }
      regions.forEach((currentElement, index) => {
        conditions.where[index] = {
          date: Between(
            convert(
              LocalDate.of(
                LocalDate.now()['_year'],
                filters.month,
                filters.day,
              ),
            ).toDate(),
            convert(
              LocalDate.of(
                LocalDate.now()['_year'],
                filters.month,
                filters.day + 1,
              ),
            ).toDate(),
          ),
        };
        Object.assign(conditions.where[index], {
          province: currentElement,
        });
      });
    } else {
      conditions.where[0] = {
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
      };
    }

    if (filters.gender) {
      conditions.where.forEach((currentElement, index) => {
        Object.assign(conditions.where[index], { gender: filters.gender });
      });
    }
    if (filters.status) {
      conditions.where.forEach((currentElement, index) => {
        Object.assign(conditions.where[index], { status: filters.status });
      });
    }
    if (filters.number_of_users) {
      conditions.where.forEach((currentElement, index) => {
        Object.assign(conditions.where[index], {
          number_of_users: filters.number_of_users,
        });
      });
    }
    if (filters.level_limit) {
      conditions.where.forEach((currentElement, index) => {
        Object.assign(conditions.where[index], {
          level_limit: filters.level_limit,
        });
      });
    }

    Object.assign(conditions, {
      order: {
        date: 'ASC',
      },
    });
    const games = await this.gameRepository.find(conditions);
    const gameLists = [];
    games.forEach((game) => {
      const {
        id,
        host,
        teamA,
        teamB,
        users,
        number_of_seats,
        review_flag,
        level_distribution,
        meanOfLevelPoint,
        standardDeviation,
        ...gameInfo
      } = game;
      gameLists.push(gameInfo);
    });
    return gameLists;
  }

  async getGame(user, gameId: string) {
    const currentUser = await this.userRepository.findOne({
      email: user.email,
    });
    const game = await this.gameRepository.findOne({ uuid: gameId });
    if (!game) {
      throw new NotFoundException(`Game ${gameId} doesn't exist`);
    }
    if (game.gender !== GENDER.ANY && game.gender !== currentUser.gender) {
      throw new ForbiddenException(
        `You can't enter this game : only for ${game.gender}`,
      );
    }
    if (game.level_limit) {
      if (game.level_limit === LEVEL_LIMIT.BELOW_B3) {
        if (currentUser.level_point >= LEVEL_POINT[LEVEL.A1]) {
          throw new ForbiddenException(
            `You can't enter this game - Level limit ${LEVEL_LIMIT.BELOW_B3}`,
          );
        }
      } else if (game.level_limit === LEVEL_LIMIT.HIGHER_SP1) {
        if (currentUser.level_point < LEVEL_POINT[LEVEL.SP1]) {
          throw new ForbiddenException(
            `You can't enter this game - Level limit ${LEVEL_LIMIT.HIGHER_SP1}`,
          );
        }
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
    const numberOfUsers = game.number_of_users.split('v');
    const numberOfSeats = Number(numberOfUsers[0]) + Number(numberOfUsers[1]);

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
      province: host.province,
      town: host.town,
      place: game.place,
      number_of_users: game.number_of_users,
      number_of_seats: numberOfSeats,
      gender: game.gender,
    });
    if (game.number_of_users === PLAYER_NUMBERS.v5) {
      if (host.level_point < LEVEL_POINT[LEVEL.SP1]) {
        throw new ForbiddenException(
          `5vs5 game can only be created by users with ${LEVEL.SP1} level or higher.`,
        );
      }
      if (game.level_limit !== LEVEL_LIMIT.HIGHER_SP1) {
        throw new BadRequestException(
          `When you chooses 5vs5 game, level_limit must be ${LEVEL_LIMIT.HIGHER_SP1}.`,
        );
      }
      newGame.level_limit = game.level_limit;
      newGame.level_distribution = LEVEL_DISTRIBUTION[LEVEL_LIMIT.HIGHER_SP1];
    } else {
      if (game.level_limit && game.level_limit !== LEVEL_LIMIT.ALL) {
        if (game.level_limit === LEVEL_LIMIT.BELOW_B3) {
          if (host.level_point >= LEVEL_POINT[LEVEL.A1]) {
            throw new ForbiddenException(
              `You can't create this game - Level limit ${LEVEL_LIMIT.BELOW_B3}`,
            );
          }
          newGame.level_distribution = LEVEL_DISTRIBUTION[LEVEL_LIMIT.BELOW_B3];
        } else if (game.level_limit === LEVEL_LIMIT.HIGHER_SP1) {
          if (host.level_point < LEVEL_POINT[LEVEL.SP1]) {
            throw new ForbiddenException(
              `You can't create this game - Level limit ${LEVEL_LIMIT.HIGHER_SP1}`,
            );
          }
          newGame.level_distribution =
            LEVEL_DISTRIBUTION[LEVEL_LIMIT.HIGHER_SP1];
        }
        newGame.level_limit = game.level_limit;
      } else {
        newGame.level_distribution = LEVEL_DISTRIBUTION[LEVEL_LIMIT.ALL];
      }
    }

    return await this.gameRepository.save(newGame);
  }

  async selectFormation(
    user,
    gameId: string,
    teamType: string,
    formation: string,
  ) {
    if (teamType !== 'A' && teamType !== 'B') {
      throw new BadRequestException(`TeamType is invalid format : ${teamType}`);
    }
    const game = await this.gameRepository.findOne({ uuid: gameId });
    if (!game) {
      throw new NotFoundException(`Game ${gameId} is not exist`);
    }
    const opponentType = teamType === 'A' ? 'B' : 'A';
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

    if (game.number_of_users === PLAYER_NUMBERS.v6) {
      switch (FORMATIONS_6v6[formation]) {
        case FORMATIONS_6v6.F131:
          game[`team${teamType}`] =
            FORMATIONS_DETAIL[PLAYER_NUMBERS.v6][FORMATIONS_6v6.F131];
          break;
        case FORMATIONS_6v6.F212:
          game[`team${teamType}`] =
            FORMATIONS_DETAIL[PLAYER_NUMBERS.v6][FORMATIONS_6v6.F212];
          break;
        case FORMATIONS_6v6.F221:
          game[`team${teamType}`] =
            FORMATIONS_DETAIL[PLAYER_NUMBERS.v6][FORMATIONS_6v6.F221];
          break;
        default:
          throw new NotFoundException(
            `${formation} is an unsupported formation`,
          );
      }
    } else if (game.number_of_users === PLAYER_NUMBERS.v5) {
      switch (FORMATIONS_5v5[formation]) {
        case FORMATIONS_5v5.F202:
          game[`team${teamType}`] =
            FORMATIONS_DETAIL[PLAYER_NUMBERS.v5][FORMATIONS_5v5.F202];
          break;
        case FORMATIONS_5v5.F211:
          game[`team${teamType}`] =
            FORMATIONS_DETAIL[PLAYER_NUMBERS.v5][FORMATIONS_5v5.F211];
          break;
        case FORMATIONS_5v5.F121:
          game[`team${teamType}`] =
            FORMATIONS_DETAIL[PLAYER_NUMBERS.v5][FORMATIONS_5v5.F121];
          break;
        case FORMATIONS_5v5.F112:
          game[`team${teamType}`] =
            FORMATIONS_DETAIL[PLAYER_NUMBERS.v5][FORMATIONS_5v5.F112];
          break;
        default:
          throw new NotFoundException(
            `${formation} is an unsupported formation`,
          );
      }
    }

    // TODO : test용 GK 생성 -> 삭제해야함
    // game[`team${teamType}`]['GK'] = {
    //   uuid: 'test',
    //   email: 'testGK@gmail.com',
    //   name: '테스트 골키퍼',
    //   gender: '남성',
    //   address: '테스트',
    //   position: 'GK',
    //   level_point: 0,
    // };
    // game.number_of_seats -= 1;

    game[`team${teamType}`]['CAPTAIN'] = await this.userService.getProfile(
      user.email,
    );
    return await this.gameRepository.save(game);
  }

  async captainAppointment(
    user,
    gameId: string,
    teamType: string,
    newCaptainName: string,
  ) {
    if (teamType !== 'A' && teamType !== 'B') {
      throw new BadRequestException(`TeamType is invalid format : ${teamType}`);
    }
    const game = await this.gameRepository.findOne({ uuid: gameId });
    if (!game) {
      throw new NotFoundException(`Game ${gameId} is not exist`);
    }
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
    gameId: string,
    teamType: string,
    position: string,
  ) {
    if (teamType !== 'A' && teamType !== 'B') {
      throw new BadRequestException(`TeamType is invalid format : ${teamType}`);
    }
    const game = await this.gameRepository.findOne(
      { uuid: gameId },
      { relations: ['users'] },
    );
    if (!game) {
      throw new NotFoundException(`Game ${gameId} is not exist`);
    }

    if (game[`team${teamType}`] === null) {
      throw new NotFoundException(`team${teamType} doesn't have formation yet`);
    }

    if (!Object.keys(game[`team${teamType}`]).includes(position)) {
      throw new NotFoundException(`Invalid Position : ${position}`);
    }

    const currentUser = await this.userRepository.findOne({
      email: user.email,
    });

    if (game[`team${teamType}`][position] !== null) {
      if (game[`team${teamType}`][position].email !== user.email) {
        return await this.userService.getProfile(
          game[`team${teamType}`][position].email,
        );
      } else {
        game[`team${teamType}`][position] = null;
        switch (game.level_limit) {
          case LEVEL_LIMIT.ALL:
            for (const [key, value] of Object.entries(
              game.level_distribution,
            )) {
              if (key === currentUser.level.slice(0, -1)) {
                game.level_distribution[key] =
                  (value * game.users.length - 1) / (game.users.length - 1)
                    ? (value * game.users.length - 1) / (game.users.length - 1)
                    : 0;
              } else {
                game.level_distribution[key] =
                  (value * game.users.length) / (game.users.length - 1)
                    ? (value * game.users.length) / (game.users.length - 1)
                    : 0;
              }
            }
            break;
          case LEVEL_LIMIT.BELOW_B3:
          case LEVEL_LIMIT.HIGHER_SP1:
            for (const [key, value] of Object.entries(
              game.level_distribution,
            )) {
              if (key === currentUser.level) {
                game.level_distribution[key] =
                  (value * game.users.length - 1) / (game.users.length - 1)
                    ? (value * game.users.length - 1) / (game.users.length - 1)
                    : 0;
              } else {
                game.level_distribution[key] =
                  (value * game.users.length) / (game.users.length - 1)
                    ? (value * game.users.length) / (game.users.length - 1)
                    : 0;
              }
            }
            break;
        }
        game.meanOfLevelPoint =
          game.users.length > 1
            ? (game.meanOfLevelPoint * game.users.length -
                currentUser.level_point) /
              (game.users.length - 1)
            : 0;
        game.users = game.users.filter((gamer) => {
          return gamer.email !== user.email;
        });
        if (game.users.length === 0) {
          return await this.gameRepository.remove(game);
        }
        let sumOfDeviation = 0;
        for (const user of game.users) {
          sumOfDeviation +=
            (user.level_point - game.meanOfLevelPoint) *
            (user.level_point - game.meanOfLevelPoint);
        }
        game.standardDeviation =
          game.users.length !== 0
            ? Math.sqrt(sumOfDeviation / game.users.length)
            : 0;
        game.number_of_seats += 1;
        if (game.status === GAME_STATUS.CLOSED) {
          game.status = GAME_STATUS.AVAILABLE;
        }
        return await this.gameRepository.save(game);
      }
    }

    if (position.replace(/[0-9]/g, '') !== currentUser.position) {
      throw new ForbiddenException(
        `Your position is ${
          currentUser.position
        }, but you choose ${position.replace(/[0-9]/g, '')}`,
      );
    }
    const opponentType = teamType === 'A' ? 'B' : 'A';
    if (game[`team${teamType}`]) {
      for (const [key, value] of Object.entries(game[`team${teamType}`])) {
        if (key !== 'CAPTAIN') {
          if (key.replace(/[0-9]/g, '') === currentUser.position) {
            if (value === null) {
              continue;
            }
            if (value['email'] === currentUser.email) {
              throw new ConflictException(
                `You already select team${teamType} : ${key}`,
              );
            }
          }
        }
      }
    }
    if (game[`team${opponentType}`]) {
      for (const [key, value] of Object.entries(game[`team${opponentType}`])) {
        if (key !== 'CAPTAIN') {
          if (key.replace(/[0-9]/g, '') === currentUser.position) {
            if (value === null) {
              continue;
            }
            if (value['email'] === currentUser.email) {
              throw new ConflictException(
                `You already select team${opponentType} : ${key}`,
              );
            }
          }
        } else {
          if (value['email'] === currentUser.email) {
            throw new ConflictException(
              `You are the captain of team${opponentType}`,
            );
          }
        }
      }
    }

    game[`team${teamType}`][position] = await this.userService.getProfile(
      currentUser.email,
    );
    if (!game.users.includes(currentUser)) {
      switch (game.level_limit) {
        case LEVEL_LIMIT.ALL:
          for (const [key, value] of Object.entries(game.level_distribution)) {
            if (key === currentUser.level.slice(0, -1)) {
              game.level_distribution[key] =
                (value * game.users.length + 1) / (game.users.length + 1);
            } else {
              game.level_distribution[key] =
                (value * game.users.length) / (game.users.length + 1);
            }
          }
          break;
        case LEVEL_LIMIT.BELOW_B3:
        case LEVEL_LIMIT.HIGHER_SP1:
          for (const [key, value] of Object.entries(game.level_distribution)) {
            if (key === currentUser.level) {
              game.level_distribution[key] =
                (value * game.users.length + 1) / (game.users.length + 1);
            } else {
              game.level_distribution[key] =
                (value * game.users.length) / (game.users.length + 1);
            }
          }
          break;
      }
      game.meanOfLevelPoint =
        (game.meanOfLevelPoint * game.users.length + currentUser.level_point) /
        (game.users.length + 1);
      game.users.push(currentUser);
      let sumOfDeviation = 0;
      for (const user of game.users) {
        sumOfDeviation +=
          (user.level_point - game.meanOfLevelPoint) *
          (user.level_point - game.meanOfLevelPoint);
      }
      game.standardDeviation = Math.sqrt(sumOfDeviation / game.users.length);
      game.number_of_seats -= 1;
    }
    if (game.number_of_seats === 0) {
      game.status = GAME_STATUS.CLOSED;
    }
    return await this.gameRepository.save(game);
  }

  async finishGame(user, gameId: string, teamType: string) {
    if (teamType !== 'A' && teamType !== 'B') {
      throw new BadRequestException(`TeamType is invalid format : ${teamType}`);
    }
    const opponentType = teamType === 'A' ? 'B' : 'A';
    const game = await this.gameRepository.findOne(
      { uuid: gameId },
      { relations: ['users'] },
    );
    if (!game) {
      throw new NotFoundException(`Game ${gameId} is not exist`);
    }
    if (game[`team${teamType}`]['CAPTAIN'].email !== user.email) {
      throw new ForbiddenException(
        `Authority Required : Captain of team${teamType}`,
      );
    }
    if (game.date > convert(LocalDateTime.now()).toDate()) {
      throw new ForbiddenException('The game is not over');
    }
    let review;
    if (!game.review_flag) {
      const newReview = this.reviewRepository.create({
        id: game.id,
        date: game.date,
        place: game.place,
        number_of_users: game.number_of_users,
        gender: game.gender,
        host: game.host,
        teamA: game.teamA,
        teamB: game.teamB,
      });
      newReview[`team${teamType}_status`] = REVIEW_STATUS.REVIEW;
      if (newReview[`team${teamType}`]['GK'].rating === undefined) {
        for (const [key, value] of Object.entries(
          newReview[`team${teamType}`],
        )) {
          if (key === 'CAPTAIN' || value === null) {
            continue;
          }
          Object.assign(newReview[`team${teamType}`][`${key}`], {
            rating: {},
            report: {},
          });
        }

        for (const [key, value] of Object.entries(
          newReview[`team${opponentType}`],
        )) {
          if (key === 'CAPTAIN' || value === null) {
            continue;
          }
          Object.assign(newReview[`team${opponentType}`][`${key}`], {
            rating: {},
            report: {},
          });
        }
      }
      game.review_flag = true;
      review = await this.reviewRepository.save(newReview);
    }
    if (!review) {
      review = await this.reviewRepository.findOne({ id: game.id });
      review[`team${teamType}_status`] = REVIEW_STATUS.REVIEW;
      await this.reviewRepository.save(review);
    }

    for (const [key, value] of Object.entries(game[`team${teamType}`])) {
      // TODO : key === 'GK' 삭제 + value === null일 수가 없음 -------> 게임 시작 전까지 인원이 다 모이지 않은 경우 예외 처리
      if (key === 'CAPTAIN' || key === 'GK' || value === null) {
        continue;
      }
      const playedUser = await this.userRepository.findOne(
        {
          email: value['email'],
        },
        { relations: ['reviews'] },
      );
      playedUser['reviews'].push(review);
      await this.userRepository.save(playedUser);
      game.users = game.users.filter((user) => {
        return user.email !== value['email'];
      });
      await this.gameRepository.save(game);
    }
    if (game.users.length === 0) {
      await this.gameRepository.remove(game);
    }
  }

  async recommendGames(user) {
    const currentUser = await this.userRepository.findOne({
      email: user.email,
    });
    const gameConditions = {
      where: [],
      relations: ['users'],
    };
    const where1 = [];
    if (currentUser.level_point < LEVEL_POINT[LEVEL.A1]) {
      where1.push({ level_limit: LEVEL_LIMIT.BELOW_B3 });
    } else if (currentUser.level_point >= LEVEL_POINT[LEVEL.SP1]) {
      where1.push({ level_limit: LEVEL_LIMIT.HIGHER_SP1 });
    }
    where1.push({ level_limit: LEVEL_LIMIT.ALL });
    const where2 = JSON.parse(JSON.stringify(where1));
    where1.forEach((condition) => {
      Object.assign(condition, {
        gender: GENDER.ANY,
        status: GAME_STATUS.AVAILABLE,
        province: currentUser.province,
        town: currentUser.town,
      });
      gameConditions.where.push(condition);
    });
    where2.forEach((condition) => {
      Object.assign(condition, {
        gender: currentUser.gender,
        status: GAME_STATUS.AVAILABLE,
        province: currentUser.province,
        town: currentUser.town,
      });
      gameConditions.where.push(condition);
    });
    const games = await this.gameRepository.find(gameConditions);
    const recommendGames = [];
    games.forEach((game) => {
      let alreadyExist = false;
      let availableSeat = false;
      if (game.teamA) {
        for (const [key, value] of Object.entries(game.teamA)) {
          if (key.replace(/[0-9]/g, '') === currentUser.position) {
            if (value !== null && value.email === currentUser.email) {
              alreadyExist = true;
              break;
            }
            if (value === null) {
              availableSeat = true;
            }
          }
        }
      }
      if (game.teamB) {
        for (const [key, value] of Object.entries(game.teamB)) {
          if (key.replace(/[0-9]/g, '') === currentUser.position) {
            if (value !== null && value.email === currentUser.email) {
              alreadyExist = true;
              break;
            }
            if (value === null) {
              availableSeat = true;
            }
          }
        }
      }
      if (!alreadyExist && availableSeat) {
        recommendGames.push(game);
      }
    });
    const recommendGameByMean = [];
    for (const game of recommendGames) {
      if (Math.abs(game.meanOfLevelPoint - currentUser.level_point) < 10) {
        recommendGameByMean.push(game);
      }
    }
    let recommendGame;
    for (const game of recommendGameByMean) {
      if (!recommendGame) {
        recommendGame = game;
      } else {
        if (recommendGame.standardDeviation > game.standardDeviation) {
          recommendGame = game;
        }
      }
    }
    if (recommendGame) {
      const {
        id,
        host,
        teamA,
        teamB,
        users,
        number_of_seats,
        review_flag,
        level_distribution,
        meanOfLevelPoint,
        standardDeviation,
        ...recommendGameInfo
      } = recommendGame;
      return recommendGameInfo;
    }
    return null;
  }
}
