import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as Joi from 'joi';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GamesModule } from './games/games.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'dev'
          ? '.env.development.local'
          : '.env.test.local',
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().required().valid('dev', 'prod'),
        BASE_URL: Joi.string().required(),
        PORT: Joi.number().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        ACCESS_TOKEN_SECRET_KEY: Joi.string().required(),
        ACCESS_TOKEN_EXPIRATION_TIME: Joi.number().required(),
        REFRESH_TOKEN_SECRET_KEY: Joi.string().required(),
        REFRESH_TOKEN_EXPIRATION_TIME: Joi.number().required(),
        POSITION_CHANGE_POINT: Joi.number().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [],
      useFactory: (config: ConfigService) => ({
        type: 'mariadb',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        synchronize: process.env.NODE_ENV !== 'prod',
        dropSchema: process.env.NODE_ENV !== 'prod',
        logging: process.env.NODE_ENV === 'dev',
        entities: ['dist/**/*.entity{ .ts,.js}'],
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    GamesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
