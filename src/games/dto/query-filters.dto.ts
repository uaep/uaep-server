import { LocalDate } from '@js-joda/core';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { GAME_STATUS, GENDER, PLAYER_NUMBERS } from 'config/constants';

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
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(PLAYER_NUMBERS)
  number_of_users?: PLAYER_NUMBERS;

  @IsOptional()
  @IsEnum(GENDER)
  gender?: GENDER;

  @IsOptional()
  @IsEnum(GAME_STATUS)
  status?: GAME_STATUS;
}
