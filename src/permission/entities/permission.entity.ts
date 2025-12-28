import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('permissions') // 指定数据库表名
export class Permission {
  @PrimaryGeneratedColumn({ type: 'bigint' }) // 自增主键
  id: number; // 权限ID

  @Column({ type: 'varchar', length: 50, unique: true, comment: '权限名称' })
  name: string; // 权限名称

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '权限代码' })
  code: string; // 权限代码

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '权限描述' })
  description: string; // 权限描述

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '资源路径' })
  resource: string; // 资源路径

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '操作类型' })
  action: string; // 操作类型（如：GET, POST, PUT, DELETE）

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createdAt: Date; // 创建时间

  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updatedAt: Date; // 更新时间
}

