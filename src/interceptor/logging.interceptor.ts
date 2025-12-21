import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Inject,
  NestInterceptor,
  type LoggerService,
  Logger,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { setMDC } from '../logger/logger.module';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  // constructor(
  //   @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
  // ) {}
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest();
    const path = req?.originalUrl || req?.url;
    const method = req?.method;
    const controller = context.getClass().name;
    const handler = context.getHandler().name;
    const fullName = `${controller}.${handler}`;

    // 将控制器和方法信息添加到 MDC
    setMDC('controller', controller);
    setMDC('handler', handler);

    const params = {
      // 记录常见请求数据，避免遗漏
      params: req?.params,
      query: req?.query,
      body: req?.body,
    };

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - now;
        // 组装日志消息，将参数信息格式化到 message 中
        const message = `请求处理完成 - ${method} ${path} | Handler: ${fullName} | 耗时: ${duration}ms | 参数: ${JSON.stringify(params)} | 响应: ${JSON.stringify(data)}`;
        this.logger.log(message);
      }),
    );
  }
}
