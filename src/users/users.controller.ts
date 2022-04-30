import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UserService } from './users.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

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

  @Post('/login')
  async login(@Body() user: LoginDto) {
    await this.userService.login(user);
    // TODO : Redirect to Main Page
    // return {
    //   url: 'Main Page'
    // }
  }
}
