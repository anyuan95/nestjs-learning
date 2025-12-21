import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
  type LoggerService,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Response } from 'express';
import { setMDC } from '../logger/logger.module';

@Catch()
export class GlobalExceptionFilter<T> implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  ) {}

  // 通过环境变量控制异常日志级别：none/summary/full
  private readonly logLevel =
    (process.env.EXCEPTION_LOG_LEVEL || 'summary').toLowerCase();

  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 解析常见异常：Nest 内置 HttpException 或普通 Error
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // HttpException 可携带结构化响应
    const errorResponse = isHttpException
      ? exception.getResponse()
      : {
          statusCode: status,
          message: (exception as any)?.message || 'Internal server error',
        };

    const stack = (exception as any)?.stack;

    // 将异常信息添加到 MDC
    setMDC('errorStatus', status);
    setMDC('errorType', isHttpException ? 'HttpException' : 'Error');

    // 根据日志级别输出
    if (this.logLevel === 'full') {
      // 打印完整堆栈，MDC 会自动包含
      this.logger.error(`[${request?.method}] ${request?.url} -> status=${status}`, {
        stack,
        error: errorResponse,
      });
    } else if (this.logLevel === 'summary') {
      // 只打印摘要行，MDC 会自动包含
      this.logger.error(`[${request?.method}] ${request?.url} -> status=${status}`, {
        error: errorResponse,
      });
    } // none 则不打印

    response.status(status).json({
      path: request?.url,
      timestamp: new Date().toISOString(),
      statusCode: status,
      error: errorResponse,
    });
  }
}
