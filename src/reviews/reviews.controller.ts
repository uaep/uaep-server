import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ReviewEntity } from './entities/review.entity';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewService: ReviewsService) {}

  @Get()
  async getAllReviews(@Req() req) {
    return await this.reviewService.getAllReviews(req.user);
  }

  @Get('/:id')
  async getReview(@Req() req, @Param('id') id: string): Promise<ReviewEntity> {
    return await this.reviewService.getReview(req.user, id);
  }

  @Patch('/:reviewId/:teamType/:position')
  async reviewUser(
    @Req() req,
    @Param('reviewId') reviewId: string,
    @Param('teamType') teamType: string,
    @Param('position') position: string,
    @Body() { rate },
  ) {
    return await this.reviewService.review(
      req.user,
      reviewId,
      teamType,
      position,
      rate,
    );
  }
}
