import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { GENDER, LEVEL_LIMIT, PLAYER_NUMBERS } from 'config/constants';

export class CreateGameDto {
  @IsNumber()
  @IsNotEmpty()
  year: number;

  @IsNumber()
  @IsNotEmpty()
  month: number;

  @IsNumber()
  @IsNotEmpty()
  day: number;

  @IsNumber()
  @IsNotEmpty()
  hour: number;

  @IsNumber()
  @IsNotEmpty()
  minute: number;

  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  place: string;

  @IsEnum(PLAYER_NUMBERS)
  @IsNotEmpty()
  number_of_users: PLAYER_NUMBERS;

  @IsEnum(GENDER)
  @IsNotEmpty()
  gender: GENDER;

  @IsNotEmpty()
  @IsEnum(LEVEL_LIMIT)
  level_limit: LEVEL_LIMIT;
}
