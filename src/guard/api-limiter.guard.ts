import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ApiLimiterGuard implements CanActivate {
  // 滑动窗口计数：按 IP + 路径维度记录时间戳
  private static buckets: Map<string, number[]> = new Map();

  // 默认阈值：每窗口最多 60 次，窗口 60s，可通过环境变量覆盖
  // private readonly limit = Number(process.env.API_LIMIT || 60);
  private readonly limit = Number(process.env.API_LIMIT || 60);
  private readonly windowMs = Number(process.env.API_LIMIT_WINDOW_MS || 60000);

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const key = `${req.ip || 'unknown'}:${req.path}`;
    const now = Date.now();

    const bucket = this.getBucket(key, now);
    if (bucket.length >= this.limit) {
      // 超出速率限制，抛出 429
      throw new HttpException(
        '请求过于频繁，请稍后再试',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    bucket.push(now);
    ApiLimiterGuard.buckets.set(key, bucket);
    return true;
  }

  private getBucket(key: string, now: number) {
    const existing = ApiLimiterGuard.buckets.get(key) || [];
    const windowStart = now - this.windowMs;
    // 仅保留窗口内的时间戳，避免计数重置过粗
    const fresh = existing.filter((ts) => ts >= windowStart);
    return fresh;
  }
}
