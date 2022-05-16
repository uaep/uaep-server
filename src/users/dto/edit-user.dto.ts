import { IsEnum, IsOptional, IsString } from 'class-validator';
import { POSITION } from 'config/constants';

export class EditUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(POSITION)
  position?: POSITION;
}
