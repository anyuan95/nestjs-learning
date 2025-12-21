import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 创建新用户
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // 使用 TypeORM 创建并保存用户实体
    const user = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(user);
    this.logger.log(`创建用户成功: ${savedUser.id}`);
    return savedUser;
  }

  /**
   * 获取所有用户
   */
  async findAll(): Promise<User[]> {
    this.logger.log('查询所有用户');
    return await this.userRepository.find();
  }

  /**
   * 根据ID查找用户
   */
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`用户 ID ${id} 不存在`);
    }
    return user;
  }

  /**
   * 更新用户信息
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // 先查找用户，如果不存在会抛出异常
    const user = await this.findOne(id);
    // 使用 Repository 的 merge 方法合并更新数据
    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);
    this.logger.log(`更新用户成功: ${id}`);
    return updatedUser;
  }

  /**
   * 删除用户
   */
  async remove(id: number): Promise<void> {
    // 先查找用户，如果不存在会抛出异常
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    this.logger.log(`删除用户成功: ${id}`);
  }
}
