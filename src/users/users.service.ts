import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/users.dto';
import { PrismaService } from '../common/providers/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateUserDto): Promise<Partial<User>> {
    return this.prismaService.user.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
  }
}
