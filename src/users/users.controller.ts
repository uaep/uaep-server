import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { JwtRefreshGuard } from 'src/auth/jwt-refresh.guard';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './users.service';
import { Response } from 'express';
import { EditUserDto } from './dto/edit-user.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('/test')
  async testCreate(@Body() { users }) {
    await this.userService.testCreateUser(users);
    return { url: `${this.config.get('BASE_URL')}/users/auth/login` };
  }

  @Post('/email_validity_checks')
  async emailValidityCheck(@Body() { email }) {
    const signupVerifyToken = await this.userService.emailValidityCheck(email);
    return {
      url: `${this.config.get(
        'BASE_URL',
      )}/users/email_verify?signupVerifyToken=${signupVerifyToken}`,
    };
  }

  @Post('email_verify')
  async emailVerify(
    @Query('signupVerifyToken') signupVerifyToken,
    @Body() { code },
  ) {
    await this.userService.emailVerify(signupVerifyToken, code);
    return {
      url: `${this.config.get(
        'BASE_URL',
      )}/users?signupVerifyToken=${signupVerifyToken}`,
    };
  }

  @Post()
  async createUser(
    @Query('signupVerifyToken') signupVerifyToken,
    @Body() user: CreateUserDto,
  ) {
    await this.userService.createUser(signupVerifyToken, user);
    return { url: `${this.config.get('BASE_URL')}/users/auth/login` };
  }

  @UseGuards(LocalAuthGuard)
  @Post('/auth/login')
  async login(@Req() req, @Res({ passthrough: true }) res: Response) {
    const { access_token, refresh_token } = await this.authService.login(
      req.user.email,
    );

    const cookieOptions = {
      domain: this.config
        .get('BASE_URL')
        .substring(
          this.config.get('BASE_URL').indexOf('://') + 3,
          this.config.get('BASE_URL').lastIndexOf(':'),
        ),
      httpOnly: true,
    };

    res.cookie('access_token', access_token, cookieOptions);
    res.cookie('refresh_token', refresh_token, cookieOptions);

    return {
      url: `${this.config.get('BASE_URL')}/games`,
    };
  }

  @UseGuards(JwtRefreshGuard)
  @Get('/auth/refresh')
  refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
    const user = req.user;
    const access_token = this.authService.getAccessToken(user.email);
    const cookieOptions = {
      domain: this.config
        .get('BASE_URL')
        .substring(
          this.config.get('BASE_URL').indexOf('://') + 3,
          this.config.get('BASE_URL').lastIndexOf(':'),
        ),
      httpOnly: true,
    };
    res.cookie('access_token', access_token, cookieOptions);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('/auth/logout')
  async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user.email);
    const cookieResetOptions = {
      maxAge: 0,
    };
    res.cookie('access_token', '', cookieResetOptions);
    res.cookie('refresh_token', '', cookieResetOptions);
    return { url: `${this.config.get('BASE_URL')}/users/login` };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getProfile(@Req() req) {
    return this.userService.getProfile(req.user.email, req.user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/reviews')
  async getAllReviews(@Req() req) {
    return await this.userService.getAllReviews(req.user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async editProfile(@Req() req, @Body() user: EditUserDto) {
    return await this.userService.editProfile(req.user.email, user);
  }
}
