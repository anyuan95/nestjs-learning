import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runInContext } from './logger.module';

/**
 * TraceId 中间件：为每个请求生成唯一的 traceId 并存储到 AsyncLocalStorage
 * 这是分布式追踪的核心，确保整个请求链路中的所有日志都包含相同的 traceId
 */
@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 优先使用请求头中的 traceId（如果存在），便于跨服务追踪
    // 如果没有，则生成新的 traceId
    const traceId = (req.headers['x-trace-id'] as string) || uuidv4();

    // 创建请求上下文
    const context = {
      traceId,
      method: req.method,
      path: req.path,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent') || '',
    };

    // 在 AsyncLocalStorage 中运行后续处理
    // 这样所有异步操作都能访问到这个 context
    runInContext(context, () => {
      // 将 traceId 存储到 request 对象，方便响应拦截器使用
      (req as any).traceId = traceId;
      next();
    });
  }
}

