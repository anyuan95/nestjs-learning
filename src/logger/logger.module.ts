import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { format } from 'winston';
import { AsyncLocalStorage } from 'async_hooks';

/**
 * 请求上下文接口
 */
interface RequestContext {
    traceId: string; // 追踪 ID（最重要的字段）
    [key: string]: any; // 其他 MDC 值
}

/**
 * 使用 AsyncLocalStorage 存储请求上下文
 * 这是 Node.js 官方推荐的异步上下文传递方式，比 global 更安全可靠
 */
const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

/**
 * 获取当前请求的上下文（包含 traceId 和所有 MDC 值）
 */
export function getContext(): RequestContext | undefined {
    return asyncLocalStorage.getStore();
}

/**
 * 获取当前请求的 traceId
 */
export function getTraceId(): string | undefined {
    return getContext()?.traceId;
}

/**
 * 获取当前请求的 MDC（所有上下文信息）
 */
export function getMDC(): Record<string, any> {
    const context = getContext();
    return context ? { ...context } : {};
}

/**
 * 设置 MDC 值
 */
export function setMDC(key: string, value: any): void {
    const context = getContext();
    if (context) {
        context[key] = value;
    }
}

/**
 * 在异步上下文中运行函数（由中间件调用）
 */
export function runInContext<T>(context: RequestContext, callback: () => T): T {
    return asyncLocalStorage.run(context, callback);
}

/**
 * 自定义格式，包含 traceId 和 MDC 信息
 * 注意：NestJS Logger 传入的 context 名称（如 new Logger('LoggingInterceptor')）
 * 会通过 nest-winston 自动添加到 info.context 字段中，无需在此处理
 */
const traceFormat = format((info) => {
    const context = getContext();
    if (context) {
        // traceId 作为顶级字段，方便日志系统索引
        info.traceId = context.traceId;
        // 其他 MDC 值作为 mdc 字段
        const { traceId, ...mdc } = context;
        if (Object.keys(mdc).length > 0) {
            info.mdc = mdc;
        }
    }
    // info.context 字段由 nest-winston 自动填充，保留原样
    return info;
});

/**
 * 控制台输出格式（开发环境）
 * traceId 会突出显示，方便调试
 */
const consoleFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    format.colorize(),
    format.printf(({ timestamp, level, context, message, traceId, mdc, ...meta }) =>
        // `${timestamp} [${level}] [${context}] [${traceId??''}] [${mdc ? JSON.stringify(mdc) : ''}] ${message} ${JSON.stringify(meta)}`
        `${timestamp} [${level}] [${traceId ?? ''}] [${context}] ${message} ${meta && Object.keys(meta).length > 0 ? JSON.stringify(meta) : ''}`
    ),
);

/**
 * JSON 格式（生产环境，便于日志收集系统解析）
 * traceId 作为顶级字段，方便日志系统索引和查询
 */
const jsonFormat = format.combine(
    format.timestamp(),
    traceFormat(),
    format.json(),
);

@Module({
    imports: [
        WinstonModule.forRoot({
            // 日志级别
            level: process.env.LOG_LEVEL || 'info',
            // 格式化器
            format: jsonFormat,
            // 传输器（输出目标）
            transports: [
                // 控制台输出（开发环境）
                new winston.transports.Console({
                    format: consoleFormat,
                    level: process.env.LOG_LEVEL || 'debug',
                }),
                // 所有日志文件（按日期滚动）
                new DailyRotateFile({
                    filename: 'logs/application-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    maxSize: process.env.LOG_MAX_SIZE || '20m',
                    maxFiles: process.env.LOG_MAX_FILES || '14d', // 保留 14 天
                    format: jsonFormat,
                    level: 'info',
                }),
                // 错误日志单独文件
                new DailyRotateFile({
                    filename: 'logs/error-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    maxSize: process.env.LOG_MAX_SIZE || '20m',
                    maxFiles: process.env.LOG_MAX_FILES || '30d', // 错误日志保留 30 天
                    format: jsonFormat,
                    level: 'error',
                }),
                // 调试日志单独文件（可选）
                ...(process.env.NODE_ENV === 'development'
                    ? [
                        new DailyRotateFile({
                            filename: 'logs/debug-%DATE%.log',
                            datePattern: 'YYYY-MM-DD',
                            maxSize: '10m',
                            maxFiles: '7d',
                            format: jsonFormat,
                            level: 'debug',
                        }),
                    ]
                    : []),
            ],
            // 异常处理
            exceptionHandlers: [
                new DailyRotateFile({
                    filename: 'logs/exceptions-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    maxSize: '20m',
                    maxFiles: '30d',
                    format: jsonFormat,
                }),
            ],
            // 拒绝的 Promise 处理
            rejectionHandlers: [
                new DailyRotateFile({
                    filename: 'logs/rejections-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    maxSize: '20m',
                    maxFiles: '30d',
                    format: jsonFormat,
                }),
            ],
        }),
    ],
})
export class LoggerModule { }

