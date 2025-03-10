import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LocalLoginDto } from './dto/local-login.dto';
import { User } from '@prisma/client';
import { BcryptService } from '../common/providers/bcrypt/bcrypt.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private bcryptService: BcryptService,
  ) {}

  async validateUser(dto: LocalLoginDto): Promise<Partial<User> | null> {
    const { email, pass } = dto;
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new NotFoundException('Email is not registered');

    if (await this.bcryptService.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    } else {
      throw new UnauthorizedException('Wrong password');
    }
  }

  async login(user: any) {
    const payload = { name: user.name, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
