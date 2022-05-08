import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { EmailService } from 'src/email/email.service';
import { UserEntity } from './entities/user.entity';
import { VerificationEntity } from './entities/verification.entity';
import { UserController } from './users.controller';
import { UserService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    TypeOrmModule.forFeature([VerificationEntity]),
    AuthModule,
    ConfigModule,
  ],
  controllers: [UserController],
  providers: [UserService, EmailService],
  exports: [UserService],
})
export class UsersModule {}
