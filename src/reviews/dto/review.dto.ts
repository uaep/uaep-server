import { Type } from 'class-transformer';
import {
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
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rate: number;

  @IsEnum(REVIEW_REPORT)
  @IsOptional()
  report?: REVIEW_REPORT;
}
