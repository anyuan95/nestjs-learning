import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  validate(email: string, password: string): Promise<any> {
    // 添加调试日志，确认是否进入 validate 方法
    // console.log('=== LocalStrategy.validate 被调用 ===');
    // console.log(`接收到的 name: ${email}`);
    // console.log(`接收到的 password: ${password ? '***已存在***' : '缺失'}`);

    const user = this.authService.validateUser(email, password);
    if (!user) {
      // console.log('用户验证失败，抛出 UnauthorizedException');
      throw new UnauthorizedException();
    }
    // console.log('用户验证成功');
    return user;
  }
}
