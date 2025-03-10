import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../common/providers/prisma/prisma.service';
import { CreateUserDto } from './dto/users.dto';
import { Role, User } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create user', () => {
    it('should create a user and should return id, name, email, role', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test',
        email: 'test@example.com',
        password: 'test123',
        id: 'abctestabc',
        role: Role.User,
      };

      const userDto: User = {
        ...createUserDto,
        deletedAt: null,
      };

      jest.spyOn(prisma.user, 'create').mockResolvedValue(userDto);

      const res = await service.create(createUserDto);
      expect(res).toBe(userDto);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: createUserDto,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should find a user by email, returns id, email, name, role', async () => {
      const userDto: User = {
        name: 'Test',
        email: 'test@example.com',
        id: 'abctestabc',
        role: Role.User,
        password: 'test123',
        deletedAt: null,
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(userDto);

      const res = await service.findByEmail('test@example.com');
      console.log(res);

      expect(res).toEqual(userDto);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });
    });

    it('should return null if user is not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      const res = await service.findByEmail('test99@example.com');
      expect(res).toBeNull();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test99@example.com' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });
    });
  });
});
