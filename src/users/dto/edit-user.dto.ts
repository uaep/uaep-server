import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { POSITION, PROVINCE } from 'config/constants';

export class EditUserDto {
  @IsOptional()
  @Transform(({ value }) => value.trim())
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(PROVINCE)
  province?: PROVINCE;

  @IsOptional()
  town?: string;

  @IsOptional()
  @IsEnum(POSITION)
  position?: POSITION;
}
