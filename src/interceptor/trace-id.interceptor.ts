import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Response } from 'express';
import { getTraceId } from '../logger/logger.module';

/**
 * TraceId 响应拦截器：在响应头中添加 traceId
 * 方便前端和日志采集系统获取 traceId
 */
@Injectable()
export class TraceIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse<Response>();
    const traceId = getTraceId();

    // 在响应头中添加 traceId
    if (traceId) {
      response.setHeader('X-Trace-Id', traceId);
    }

    return next.handle();
  }
}

