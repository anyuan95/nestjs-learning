import { readFileSync } from 'fs';
import { join } from 'path';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from './snake-naming.strategy';

/**
 * 数据库配置接口
 */
interface DatabaseConfig {
  type?: string; // 数据库类型
  host?: string; // 数据库主机
  port?: number; // 数据库端口
  username?: string; // 数据库用户名
  password?: string; // 数据库密码
  database?: string; // 数据库名称
  synchronize?: boolean; // 自动同步数据库结构
  logging?: boolean; // 是否启用日志
  charset?: string; // 字符集
}

/**
 * 默认数据库配置
 */
const defaultConfig = {
  type: 'mysql' as const,
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'test',
  // 使用 autoLoadEntities: true 后，不需要手动在根配置中列出所有实体
  // 实体类会自动从各个模块的 TypeOrmModule.forFeature() 中加载
  // https://nest.nodejs.cn/techniques/database#%E8%87%AA%E5%8A%A8%E5%8A%A0%E8%BD%BD%E5%AE%9E%E4%BD%93
  autoLoadEntities: true,
  synchronize: false, // 生产环境应设为 false
  logging: false,
  charset: 'utf8mb4',
};

/**
 * 从 JSON 文件加载数据库配置
 * @returns TypeORM 配置选项
 */
export function loadDatabaseConfig(): TypeOrmModuleOptions {
  // 从环境变量获取配置文件路径
  const configFilePath = process.env.DB_CONFIG_FILE_PATH;

  if (!configFilePath) {
    throw new Error('DB_CONFIG_FILE_PATH is not set');
  }

  try {
    // 读取 JSON 配置文件
    const configPath = join(process.cwd(), configFilePath);
    const configContent = readFileSync(configPath, 'utf-8');
    const dbConfig: DatabaseConfig = JSON.parse(configContent);

    // 合并配置：JSON 文件中的配置优先，环境变量次之，最后使用默认值
    // 使用 ?? 运算符避免将 0、false、空字符串等有效值误判为 falsy
    const mergedConfig = {
      type: (dbConfig.type as 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mongodb') ?? defaultConfig.type,
      host: dbConfig.host ?? process.env.DB_HOST ?? defaultConfig.host,
      port: dbConfig.port ?? (process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined) ?? defaultConfig.port,
      username: dbConfig.username ?? process.env.DB_USERNAME ?? defaultConfig.username,
      password: dbConfig.password ?? process.env.DB_PASSWORD ?? defaultConfig.password,
      database: dbConfig.database ?? process.env.DB_DATABASE ?? defaultConfig.database,
      autoLoadEntities: defaultConfig.autoLoadEntities, // 自动从 forFeature 中加载实体类
      synchronize: dbConfig.synchronize ?? defaultConfig.synchronize,
      logging: dbConfig.logging ?? defaultConfig.logging,
      charset: dbConfig.charset ?? defaultConfig.charset,
      namingStrategy: new SnakeNamingStrategy(), // 使用下划线命名策略，将驼峰命名转换为下划线
    } as TypeOrmModuleOptions;

    return mergedConfig;
  } catch (error) {
    // 如果读取配置文件失败，输出警告并使用默认配置
    console.warn(
      `⚠️  无法加载数据库配置文件: ${configFilePath}`,
      error instanceof Error ? error.message : error,
    );
    console.warn('使用默认配置或环境变量配置');
    
    // 如果配置文件读取失败，尝试使用环境变量构建配置
    const fallbackConfig = {
      ...defaultConfig,
      host: process.env.DB_HOST ?? defaultConfig.host,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : defaultConfig.port,
      username: process.env.DB_USERNAME ?? defaultConfig.username,
      password: process.env.DB_PASSWORD ?? defaultConfig.password,
      database: process.env.DB_DATABASE ?? defaultConfig.database,
      autoLoadEntities: defaultConfig.autoLoadEntities, // 确保自动加载实体类
      namingStrategy: new SnakeNamingStrategy(), // 使用下划线命名策略，将驼峰命名转换为下划线
    } as TypeOrmModuleOptions;
    
    return fallbackConfig;
  }
}
