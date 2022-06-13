import { LocalDate } from '@js-joda/core';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import {
  GAME_STATUS,
  GENDER,
  LEVEL_LIMIT,
  PLAYER_NUMBERS,
  REGION_FILTER,
} from 'config/constants';

export class QueryFiltersDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  month?: number = LocalDate.now()['_month'];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  day?: number = LocalDate.now()['_day'];

  @IsOptional()
  @IsEnum(REGION_FILTER)
  region?: REGION_FILTER;

  @IsOptional()
  @IsEnum(PLAYER_NUMBERS)
  number_of_users?: PLAYER_NUMBERS;

  @IsOptional()
  @IsEnum(GENDER)
  gender?: GENDER;

  @IsOptional()
  @IsEnum(GAME_STATUS)
  status?: GAME_STATUS;

  @IsOptional()
  @IsEnum(LEVEL_LIMIT)
  level_limit?: LEVEL_LIMIT;
}
