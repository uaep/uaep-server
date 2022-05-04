import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { GENDER, POSITION } from 'config/constants';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  password_check: string;

  @IsEnum(GENDER)
  @IsNotEmpty()
  gender: GENDER;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsEnum(POSITION)
  @IsNotEmpty()
  position: POSITION;
}
