import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { match } from "path-to-regexp";
import { ALLOW_NO_PERMISSION, AllowNoPermission } from "src/decorators/permission.decorator";
import { ALLOW_NO_TOKEN } from "src/decorators/token.decorator";
import { PermissionService } from "src/permission/permission.service";

@Injectable()
export class RoleAuthGuard implements CanActivate {
    constructor(private readonly reflector: Reflector,
        @Inject(PermissionService) private readonly permissionServise: PermissionService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const allowNoToken = this.reflector.getAllAndOverride<boolean>(ALLOW_NO_TOKEN, [context.getHandler(), context.getClass()]);
        if (allowNoToken) {
            return true;
        }

        const allowNoPermission = this.reflector.getAllAndOverride<boolean>(ALLOW_NO_PERMISSION, [context.getHandler(), context.getClass()]);
        if (allowNoPermission) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            return false;
        }

        const userApis = await this.permissionServise.findUserApis(user.id);
        console.log(`当前用户 ${user.id} 有权限的路径包括：${userApis}`);

        // 使用实际请求路径进行匹配（包含具体参数值，如 /api/user/123）
        const actualPath = request.path;
        const reqMethod = request.method;
        console.log(`当前请求路径：${actualPath}，当前请求方法：${reqMethod}`);

        // 判断用户是否有该 API 权限
        // 支持路径变量匹配：数据库中存储的路径模式（如 /api/user/:id）可以匹配实际路径（如 /api/user/123）
        const hasPermission = userApis.some(api => {
            if (api.method.toUpperCase() !== reqMethod.toUpperCase()) {
                return false;
            }
            // 使用 match 函数进行路径匹配（新版本推荐方式）
            // match 函数返回一个匹配函数，调用后返回 false 或匹配结果对象
            const matcher = match(api.apiPath);
            return matcher(actualPath) !== false;
        });

        return hasPermission;
    }

}