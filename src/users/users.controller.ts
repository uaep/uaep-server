import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './users.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

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
    return { url: `${this.config.get('BASE_URL')}/users/login` };
  }

  @UseGuards(LocalAuthGuard)
  @Post('/auth/login')
  async login(@Req() req) {
    return this.authService.login(req.user);
    // TODO : Redirect to Main Page
    // return {
    //   url: 'Main Page'
    // }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getProfile(@Req() req) {
    return this.userService.getProfile(req.user.email);
  }
}
