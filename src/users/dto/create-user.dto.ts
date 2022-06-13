import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { GENDER, LEVEL, POSITION, PROVINCE } from 'config/constants';

export class CreateUserDto {
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  name: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  password: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  password_check: string;

  @IsEnum(GENDER)
  @IsNotEmpty()
  gender: GENDER;

  @IsEnum(PROVINCE)
  @IsNotEmpty()
  province: PROVINCE;

  @IsString()
  @IsNotEmpty()
  town: string;

  @IsEnum(POSITION)
  @IsNotEmpty()
  position: POSITION;

  @Transform(({ value }) => value + '1')
  @IsEnum(LEVEL)
  @IsNotEmpty()
  level: LEVEL;
}
