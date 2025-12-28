import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            // 从请求头中提取 JWT 令牌
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            // 不忽略令牌过期
            ignoreExpiration: false,
            // 验证令牌的密钥
            secretOrKey: process.env.JWT_SECRET as string,
        });
    }

    validate(payload: any): unknown {
        return { id: payload.sub, email: payload.email }
    }

}