import { Transform } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @Transform(({ value }) => value.trim())
  email: string;

  @IsString()
  @Transform(({ value }) => value.trim())
  password: string;
}
