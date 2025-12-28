import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('permission_apis') // 指定数据库表名
export class PermissionApi {
  @PrimaryGeneratedColumn({ type: 'bigint' }) // 自增主键
  id: number; // 关联ID

  @Column({ type: 'bigint', comment: '权限ID' })
  permissionId: number; // 权限ID

  @Column({ type: 'varchar', length: 255, comment: '接口路径' })
  apiPath: string; // 接口路径（如：/api/users）

  @Column({ type: 'varchar', length: 20, comment: 'HTTP方法' })
  method: string; // HTTP方法（如：GET, POST, PUT, DELETE）

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '接口描述' })
  description: string; // 接口描述

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createdAt: Date; // 创建时间

  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updatedAt: Date; // 更新时间
}

