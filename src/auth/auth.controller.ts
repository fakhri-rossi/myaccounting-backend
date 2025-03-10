import {
  Body,
  ConflictException,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { v4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { LocalAuthGuard } from './local/local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(LocalAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    return req.logout();
  }

  @Post('/signup')
  async signUp(
    @Body() body: { email: string; password: string; name: string },
  ) {
    const { email, name, password } = body;

    if (await this.usersService.findByEmail(email)) {
      throw new ConflictException('Email is already registered');
    }

    return this.usersService.create({
      id: v4(),
      email,
      name,
      password: bcrypt.hashSync(password, 10),
      role: Role.User,
    });
  }
}
