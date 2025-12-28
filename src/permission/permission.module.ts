import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { PermissionApi } from './entities/permission-api.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, PermissionApi])], // 注册实体，以便 TypeORM 自动创建表
  controllers: [PermissionController],
  providers: [PermissionService],
  exports: [PermissionService],
})
export class PermissionModule {}
