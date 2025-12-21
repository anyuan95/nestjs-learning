import { MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { GlobalMiddleware } from './middleware/global.middleware';
import { ApiLimiterGuard } from './guard/api-limiter.guard';
import { LoggingInterceptor } from './interceptor/logging.interceptor';
import { TraceIdInterceptor } from './interceptor/trace-id.interceptor';
import { GlobalExceptionFilter } from './filter/global-exception.filter';
import { LoggerModule } from './logger/logger.module';
import { TraceIdMiddleware } from './logger/mdc.middleware';
import { loadDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    // TypeORM 数据库配置（从 JSON 文件或环境变量动态加载）
    TypeOrmModule.forRoot(loadDatabaseConfig()),
    // TypeOrmModule.forRootAsync({
    //   useFactory: () => loadDatabaseConfig(),
    // }),
    UserModule,
    LoggerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 全局限流守卫
    {
      provide: APP_GUARD,
      useClass: ApiLimiterGuard,
    },
    // TraceId 响应拦截器（需要在最前面，确保响应头包含 traceId）
    {
      provide: APP_INTERCEPTOR,
      useClass: TraceIdInterceptor,
    },
    // 全局日志拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // 全局异常过滤器
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // TraceId 中间件必须在最前面，确保所有后续操作都能访问到 traceId
    consumer.apply(TraceIdMiddleware).forRoutes('*');
    consumer.apply(GlobalMiddleware).forRoutes('*');
  }
}
