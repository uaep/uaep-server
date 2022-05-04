import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
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
  ) {}

  @Post('/email_validity_checks')
  async emailValidityCheck(@Body() { email }) {
    await this.userService.emailValidityCheck(email);
    return {
      url: 'http://localhost:3000/users/email_verify',
    };
  }

  @Post('email_verify')
  emailVerify(@Body() { code }) {
    this.userService.emailVerify(code);
    return { url: 'http://localhost:3000/users' };
  }

  @Post()
  async createUser(@Body() user: CreateUserDto) {
    await this.userService.createUser(user);
    return { url: 'http://localhost:3000/users/login' };
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
