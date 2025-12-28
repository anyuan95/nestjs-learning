import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users') // 指定数据库表名
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' }) // 自增主键
  id: number; // 用户ID

  @Column({ type: 'varchar', length: 100, comment: '用户名' })
  name: string; // 用户名

  @Column({ type: 'varchar', length: 255, unique: true, comment: '邮箱' })
  email: string; // 邮箱

  @Column({ type: 'varchar', length: 255, comment: '密码' })
  password: string; // 密码

  @Column({ type: 'varchar', length: 512, comment: '地址' })
  address: string; // 地址

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createdAt: Date; // 创建时间

  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updatedAt: Date; // 更新时间
}
