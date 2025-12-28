import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ALLOW_NO_TOKEN } from 'src/decorators/token.decorator';

/**
 * JWT 认证 Guard
 * 用于保护需要 JWT token 的接口
 * 如果路由标记了 @AllowNoToken()，则跳过 JWT 验证
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private readonly reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        // 检查路由是否允许无 token
        const allowNoToken = this.reflector.getAllAndOverride<boolean>(ALLOW_NO_TOKEN, [
            context.getHandler(),
            context.getClass(),
        ]);
        
        // 如果允许无 token，直接通过
        if (allowNoToken) {
            return true;
        }

        // 否则执行 JWT 验证
        return super.canActivate(context);
    }
}

