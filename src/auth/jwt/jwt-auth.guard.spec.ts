import { Test } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

describe('JwtAuthGuard', () => {
  let jwtAuthGuard: JwtAuthGuard;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile();

    jwtAuthGuard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  it('should be defined', () => {
    expect(jwtAuthGuard).toBeDefined();
  });

  it('should call canActivate and return true if authentication succeeds', async () => {
    // Mock canActivate method to return true
    jest
      .spyOn(AuthGuard('jwt').prototype, 'canActivate')
      .mockResolvedValue(true);

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 1, email: 'test@example.com' }, // Mock user
        }),
      }),
    } as ExecutionContext;

    const result = await jwtAuthGuard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException if authentication fails', async () => {
    // Mock canActivate method to throw UnauthorizedException
    jest
      .spyOn(AuthGuard('jwt').prototype, 'canActivate')
      .mockRejectedValue(new UnauthorizedException());

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({}), // Mock request
      }),
    } as ExecutionContext;

    await expect(jwtAuthGuard.canActivate(context)).rejects.toThrowError(
      UnauthorizedException,
    );
  });
});
