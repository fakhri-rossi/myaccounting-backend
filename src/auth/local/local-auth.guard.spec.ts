import { Test } from '@nestjs/testing';
import { LocalAuthGuard } from './local-auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

describe('LocalAuthGuard', () => {
  let localAuthGuard: LocalAuthGuard;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [LocalAuthGuard],
    }).compile();

    localAuthGuard = module.get<LocalAuthGuard>(LocalAuthGuard);
  });

  it('should be defined', () => {
    expect(localAuthGuard).toBeDefined();
  });

  it('should call canActivate and return true if authentication succeeds', async () => {
    // Mock canActivate method to return true
    jest
      .spyOn(AuthGuard('local').prototype, 'canActivate')
      .mockResolvedValue(true);

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 1, email: 'test@example.com' }, // Mock user
        }),
      }),
    } as ExecutionContext;

    const result = await localAuthGuard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException if authentication fails', async () => {
    // Mock canActivate method to throw UnauthorizedException
    jest
      .spyOn(AuthGuard('local').prototype, 'canActivate')
      .mockRejectedValue(new UnauthorizedException());

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({}), // Mock request
      }),
    } as ExecutionContext;

    await expect(localAuthGuard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
