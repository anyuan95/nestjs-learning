import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_roles') // 指定数据库表名
export class UserRole {
  @PrimaryGeneratedColumn({ type: 'bigint' }) // 自增主键
  id: number; // 关联ID

  @Column({ type: 'bigint', comment: '用户ID' })
  userId: number; // 用户ID

  @Column({ type: 'bigint', comment: '角色ID' })
  roleId: number; // 角色ID

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createdAt: Date; // 创建时间

  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updatedAt: Date; // 更新时间
}

