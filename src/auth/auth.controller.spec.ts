import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { LocalLoginDto } from './dto/local-login.dto';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../common/providers/prisma/prisma.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue({ access_token: 'mock-token' }),
          },
        },
        JwtService,
        UsersService,
        PrismaService,
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('Login', () => {
    it('should return a jwt token on successful login', async () => {
      const loginDto: LocalLoginDto = {
        email: 'test@example.com',
        pass: 'test1234',
      };
      const res = await authController.login({ ...loginDto });

      expect(res).toHaveBeenCalledWith({ ...loginDto });
      expect(res).toEqual({ acess_token: 'mock-token' });
    });
  });
});
