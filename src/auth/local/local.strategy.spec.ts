import { Test } from '@nestjs/testing';
import { LocalStrategy } from './local.strategy';
import { AuthService } from '../auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { Role, User } from '@prisma/client';

describe('LocalStrategy', () => {
  let localStrategy: LocalStrategy;
  let authService: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(), // Mock AuthService
          },
        },
      ],
    }).compile();

    localStrategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(localStrategy).toBeDefined();
  });

  it('should return user if credentials are valid', async () => {
    const user: User = {
      id: 'abc',
      name: 'Test',
      email: 'test@example.com',
      password: 'password',
      role: Role.User,
      deletedAt: null,
    };
    jest.spyOn(authService, 'validateUser').mockResolvedValue(user); // Mock valid user

    const result = await localStrategy.validate('test@example.com', 'password');
    expect(result).toEqual(user);
    expect(authService.validateUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      pass: 'password',
    });
  });

  it('should throw UnauthorizedException if credentials are invalid', async () => {
    jest.spyOn(authService, 'validateUser').mockResolvedValue(null); // Mock invalid user

    await expect(
      localStrategy.validate('test@example.com', 'wrong-password'),
    ).rejects.toThrow(UnauthorizedException);
    expect(authService.validateUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      pass: 'wrong-password',
    });
  });
});
