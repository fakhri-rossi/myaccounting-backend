import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let configService: ConfigService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('jwt-secret-key'), // Mock ConfigService
          },
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  it('should validate and return the user payload', async () => {
    const payload: JwtPayload = { sub: '123', name: 'Test', role: 'user' };
    const result = await jwtStrategy.validate(payload);

    expect(result).toEqual({
      id: payload.sub,
      name: payload.name,
      role: payload.role,
    });
  });

  it('should use JWT secret from ConfigService', () => {
    expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
  });
});
