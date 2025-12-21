import { ApiLimiterGuard } from './api-limiter.guard';

describe('ApiLimiterGuard', () => {
  it('should be defined', () => {
    expect(new ApiLimiterGuard()).toBeDefined();
  });
});
