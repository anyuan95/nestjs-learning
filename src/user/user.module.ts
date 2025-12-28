import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRole])], // 注册实体，以便 TypeORM 自动创建表
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // 导出 UserService，供其他模块使用
})
export class UserModule {}
