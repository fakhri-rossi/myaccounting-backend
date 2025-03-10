import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LocalLoginDto } from './dto/local-login.dto';
import { Role, User } from '@prisma/client';
import { BcryptService } from '../common/providers/bcrypt/bcrypt.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let bcryptService: BcryptService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(), // Mock UsersService
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(), // Mock JwtService
          },
        },
        {
          provide: BcryptService,
          useValue: {
            compare: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    bcryptService = module.get<BcryptService>(BcryptService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      const mockUser: User = {
        id: 'abcd',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: Role.User,
        deletedAt: null,
      };

      const { deletedAt, ...expected } = mockUser;

      const loginDto: LocalLoginDto = {
        email: 'test@example.com',
        pass: 'password',
      };

      // Mock UsersService.findByEmail
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);

      // Mock bcrypt.compare
      jest.spyOn(bcryptService, 'compare').mockResolvedValue(true);

      const result = await authService.validateUser(loginDto);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        deletedAt: null,
      });
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcryptService.compare).toHaveBeenCalledWith(
        loginDto.pass,
        mockUser.password,
      );
    });

    it('should throw NotFoundException if email is not registered', async () => {
      const loginDto: LocalLoginDto = {
        email: 'test@example.com',
        pass: 'password',
      };

      // Mock UsersService.findByEmail to return null
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      await expect(authService.validateUser(loginDto)).rejects.toThrowError(
        NotFoundException,
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      const mockUser: User = {
        id: 'abcd',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: Role.User,
        deletedAt: null,
      };

      const loginDto: LocalLoginDto = {
        email: 'test@example.com',
        pass: 'wrongPassword',
      };

      // Mock UsersService.findByEmail
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);

      // Mock bcrypt.compare to return false
      jest.spyOn(bcryptService, 'compare').mockResolvedValue(false);

      await expect(authService.validateUser(loginDto)).rejects.toThrowError(
        UnauthorizedException,
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcryptService.compare).toHaveBeenCalledWith(
        loginDto.pass,
        mockUser.password,
      );
    });
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        role: 'user',
      };

      const mockToken = 'mockAccessToken';

      // Mock JwtService.sign
      jest.spyOn(jwtService, 'sign').mockReturnValue(mockToken);

      const result = await authService.login(mockUser);

      expect(result).toEqual({ access_token: mockToken });
      expect(jwtService.sign).toHaveBeenCalledWith({
        name: mockUser.name,
        sub: mockUser.id,
        role: mockUser.role,
      });
    });
  });
});
