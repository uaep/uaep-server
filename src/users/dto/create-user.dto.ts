import { IsEnum, IsString } from 'class-validator';

enum GENDER {
  MALE = 'male',
  FEMALE = 'female',
}

export class CreateUserDto {
  @IsString()
  name: string;

  @IsString()
  password: string;

  @IsString()
  password_check: string;

  @IsEnum(GENDER)
  gender: GENDER;
}
