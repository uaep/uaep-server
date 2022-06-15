import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { REVIEW_REPORT } from 'config/constants';

export class ReviewDto {
  @IsInt()
  @Type(() => Number)
  @Min(0)
  @Max(5)
  @IsNotEmpty()
  rate: number;

  @IsOptional()
  @IsArray()
  @IsEnum(REVIEW_REPORT, { each: true })
  reports?: REVIEW_REPORT[];
}
