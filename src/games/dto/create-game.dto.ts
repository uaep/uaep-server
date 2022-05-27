import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PLAYER_NUMBERS } from 'config/constants';

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
  @IsNotEmpty()
  place: string;

  @IsEnum(PLAYER_NUMBERS)
  @IsNotEmpty()
  number_of_users: PLAYER_NUMBERS;
}
