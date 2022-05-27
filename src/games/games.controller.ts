import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateGameDto } from './dto/create-game.dto';
import { GameEntity } from './entities/game.entity';
import { GamesService } from './games.service';

@Controller('games')
@UseGuards(JwtAuthGuard)
export class GamesController {
  constructor(
    private readonly gameService: GamesService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  async getAllGames(): Promise<GameEntity[]> {
    return await this.gameService.getAllGames();
  }

  @Post()
  async createGame(@Req() req, @Body() game: CreateGameDto) {
    const createdGame = await this.gameService.createGame(req.user, game);
    return { url: `${this.config.get('BASE_URL')}/games/${createdGame.id}` };
  }

  @Get('/:id')
  async getGame(@Param('id') id: number): Promise<GameEntity> {
    return await this.gameService.getGame(id);
  }

  @Patch('/:id/:teamType/captain')
  async captainAppointment(
    @Req() req,
    @Param('id') id: number,
    @Param('teamType') teamType: string,
    @Body() { name },
  ) {
    await this.gameService.captainAppointment(req.user, id, teamType, name);
  }

  @Patch('/:id/:teamType/:position')
  async selectPosition(
    @Req() req,
    @Param('id') id: number,
    @Param('teamType') teamType: string,
    @Param('position') position: string,
  ) {
    return await this.gameService.selectPosition(
      req.user,
      id,
      teamType,
      position,
    );
  }

  @Patch('/:id/:teamType')
  async selectFormation(
    @Req() req,
    @Param('id') id: number,
    @Param('teamType') teamType: string,
    @Body() { formation },
  ) {
    return await this.gameService.selectFormation(
      req.user,
      id,
      teamType,
      formation,
    );
  }

  @Delete('/:id')
  async finishGame(@Req() req, @Param('id') id: number) {
    await this.gameService.finishGame(req.user, id);
  }
}
