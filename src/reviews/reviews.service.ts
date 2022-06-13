import { LocalDateTime } from '@js-joda/core';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LEVEL, REVIEW_STATUS } from 'config/constants';
import { UserEntity } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { ReviewDto } from './dto/review.dto';
import { ReviewEntity } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ReviewEntity)
    private readonly reviewRepository: Repository<ReviewEntity>,
  ) {}
  async getAllReviews(user) {
    const reviewUser = await this.userRepository.findOne(
      { email: user.email },
      { relations: ['reviews'] },
    );
    for (const review of reviewUser['reviews']) {
      if (
        review.status === REVIEW_STATUS.REVIEW &&
        LocalDateTime.parse(review.date.toISOString().replace('Z', ''))
          .plusDays(1)
          .plusHours(9)
          .isBefore(LocalDateTime.now())
      ) {
        review.status = REVIEW_STATUS.DONE;
        review.teamA_status = REVIEW_STATUS.DONE;
        review.teamB_status = REVIEW_STATUS.DONE;
        if (!review.apply_flag) {
          for (const [key, value] of Object.entries(review.teamA)) {
            // TODO : value === null일 수 없음 + GK 삭제
            if (key === 'CAPTAIN' || value === null || key === 'GK') {
              continue;
            }
            const reviewedUser = await this.userRepository.findOne({
              email: value['email'],
            });
            if (value['rating'] && Object.keys(value['rating']).length !== 0) {
              let ratingSum = 0;
              for (const rateValue of Object.values(value['rating'])) {
                if (Number(rateValue) < 3) {
                  ratingSum += Number(rateValue) * 2 - 6;
                } else {
                  ratingSum += Number(rateValue) - 3;
                }
              }
              reviewedUser.level_point =
                reviewedUser.level_point +
                  ratingSum / Object.keys(value['rating']).length >
                0
                  ? reviewedUser.level_point +
                    ratingSum / Object.keys(value['rating']).length
                  : 0;
              reviewedUser.updateLevel();
              await this.userRepository.save(reviewedUser);
            }
          }
          for (const [key, value] of Object.entries(review.teamB)) {
            // TODO : value === null일 수 없음 + GK 삭제
            if (key === 'CAPTAIN' || value === null || key === 'GK') {
              continue;
            }
            const reviewedUser = await this.userRepository.findOne({
              email: value['email'],
            });
            if (value['rating'] && Object.keys(value['rating']).length !== 0) {
              let ratingSum = 0;
              for (const rateValue of Object.values(value['rating'])) {
                if (Number(rateValue) < 3) {
                  ratingSum += Number(rateValue) * 2 - 6;
                } else {
                  ratingSum += Number(rateValue) - 3;
                }
              }
              reviewedUser.level_point =
                reviewedUser.level_point +
                  ratingSum / Object.keys(value['rating']).length >
                0
                  ? reviewedUser.level_point +
                    ratingSum / Object.keys(value['rating']).length
                  : 0;
              reviewedUser.updateLevel();
              await this.userRepository.save(reviewedUser);
            }
          }
          review.apply_flag = true;
        }
        await this.reviewRepository.save(review);
      }
    }
    return reviewUser['reviews'];
  }

  async getReview(user, reviewId: string) {
    let teamType = 'B';
    const review = await this.reviewRepository.findOne({ uuid: reviewId });
    if (!review) {
      throw new NotFoundException(`Review ${reviewId} is not exist`);
    }
    for (const [key, value] of Object.entries(review.teamA)) {
      // TODO : value === null일 수 없음
      if (key === 'CAPTAIN' || value === null) {
        continue;
      }
      if (value['email'] === user.email) {
        teamType = 'A';
        break;
      }
    }
    if (review[`team${teamType}_status`] === REVIEW_STATUS.NOT_FINISHED) {
      throw new ForbiddenException(
        `Can't review games that haven't finished yet : ${review.uuid}`,
      );
    }
    return review;
  }

  async review(
    user,
    reviewId: string,
    teamType: string,
    position: string,
    reviewDto: ReviewDto,
  ) {
    if (teamType !== 'A' && teamType !== 'B') {
      throw new BadRequestException(`TeamType is invalid format : ${teamType}`);
    }
    const opponentType = teamType === 'A' ? 'B' : 'A';
    const currentUser = await this.userRepository.findOne({
      email: user.email,
    });
    const review = await this.reviewRepository.findOne({ uuid: reviewId });
    if (!review) {
      throw new NotFoundException(`Review ${reviewId} is not exist`);
    }
    if (
      LocalDateTime.parse(review.date.toISOString().replace('Z', ''))
        .plusDays(1)
        .plusHours(9)
        .isBefore(LocalDateTime.now())
    ) {
      review.status = REVIEW_STATUS.DONE;
    }
    if (review.status === REVIEW_STATUS.DONE) {
      throw new ForbiddenException(
        `Reviews cannot be edited for games that have been 24 hours since the game or have been blocked : ${review.uuid}`,
      );
    }
    if (!Object.keys(review[`team${teamType}`]).includes(position)) {
      throw new NotFoundException(`Invalid Position : ${position}`);
    }
    let myPosition;
    for (const [key, value] of Object.entries(review[`team${teamType}`])) {
      // TODO : value === null인 경우는 없음
      if (key === 'CAPTAIN' || value === null) {
        continue;
      }
      if (value['email'] === user.email) {
        if (review[`team${teamType}_status`] === REVIEW_STATUS.NOT_FINISHED) {
          throw new ForbiddenException(
            `Can't review games that haven't finished yet : ${review.uuid}`,
          );
        }
        myPosition = teamType + key;
        break;
      }
    }
    if (!myPosition) {
      for (const [key, value] of Object.entries(
        review[`team${opponentType}`],
      )) {
        // TODO : value === null인 경우는 없음
        if (key === 'CAPTAIN' || value === null) {
          continue;
        }
        if (value['email'] === user.email) {
          if (
            review[`team${opponentType}_status`] === REVIEW_STATUS.NOT_FINISHED
          ) {
            throw new ForbiddenException(
              `Can't review games that haven't finished yet : ${review.uuid}`,
            );
          }
          myPosition = opponentType + key;
          break;
        }
      }
    }
    if (review[`team${teamType}`][position].email === user.email) {
      throw new ForbiddenException("You can't rate yourself");
    }
    if (!review[`team${teamType}`][position].rating[myPosition]) {
      currentUser.position_change_point += 1;
    }
    Object.assign(review[`team${teamType}`][position].rating, {
      [myPosition]: reviewDto.rate,
    });

    await this.userRepository.save(currentUser);
    await this.reviewRepository.save(review);
  }
}
