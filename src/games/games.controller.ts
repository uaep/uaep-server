import {
  Body,
  Controller,
  Get,
  Param,
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
    await this.gameService.createGame(req.user, game);
  }

  @Get('/:id')
  async getGame(@Param('id') id: number): Promise<GameEntity> {
    return await this.gameService.getGame(id);
  }

  @Post(':id')
  async join(@Req() req, @Param('id') id: number) {
    await this.gameService.join(req.user, id);
    return { url: `${this.config.get('BASE_URL')}/games/${id}` };
  }
}
