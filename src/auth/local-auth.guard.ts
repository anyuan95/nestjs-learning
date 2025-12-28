import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

/**
 * 自定义 Local Auth Guard，添加调试日志
 * 用于排查 Passport 认证流程中的问题
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
}
