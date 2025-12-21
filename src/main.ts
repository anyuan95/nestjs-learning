// 必须在所有 import 之前加载环境变量，确保模块导入时能读取到正确的环境变量
import { configDotenv } from 'dotenv';
configDotenv();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

console.log(process.env.DB_CONFIG_FILE_PATH);
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // 使用 Winston 作为日志系统
    bufferLogs: true,
  });

  // 使用 Winston Logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const port = process.env.PORT ?? 8080;
  await app.listen(port);

  // 启动日志
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  logger.log(`🚀 应用启动成功，监听端口: ${port}`, 'Bootstrap');
}
bootstrap();
