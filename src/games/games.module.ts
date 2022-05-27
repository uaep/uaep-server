import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';
import { GameReviewEntity } from './entities/game-review.entity';
import { GameEntity } from './entities/game.entity';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    TypeOrmModule.forFeature([GameEntity]),
    TypeOrmModule.forFeature([GameReviewEntity]),
    AuthModule,
    UsersModule,
  ],
  controllers: [GamesController],
  providers: [GamesService],
})
export class GamesModule {}
