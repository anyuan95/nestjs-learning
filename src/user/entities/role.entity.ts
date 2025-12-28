import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('roles') // 指定数据库表名
export class Role {
  @PrimaryGeneratedColumn({ type: 'bigint' }) // 自增主键
  id: number; // 角色ID

  @Column({ type: 'varchar', length: 50, unique: true, comment: '角色名称' })
  name: string; // 角色名称

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '角色代码' })
  code: string; // 角色代码

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '角色描述' })
  description: string; // 角色描述

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createdAt: Date; // 创建时间

  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updatedAt: Date; // 更新时间
}

