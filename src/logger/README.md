# Winston Logger + 分布式追踪集成文档

本项目已集成 Winston 日志框架和分布式追踪功能，提供类似 Log4j2 的功能，包括 **traceId 追踪**、MDC、自定义格式、文件输出和日志滚动。

## 功能特性

✅ **分布式追踪（TraceId）** - 每个请求自动生成唯一 traceId，所有日志自动包含  
✅ **响应头返回 traceId** - 响应头 `X-Trace-Id` 包含 traceId，方便前端和日志系统获取  
✅ **跨服务追踪** - 支持从请求头 `X-Trace-Id` 读取 traceId，实现跨服务追踪  
✅ **MDC（Mapped Diagnostic Context）** - 类似 Log4j2 的 MDC，自动为每个请求添加上下文信息  
✅ **自定义日志格式** - 支持控制台彩色输出和 JSON 格式，traceId 作为顶级字段  
✅ **文件输出** - 日志自动写入文件  
✅ **日志滚动** - 按日期自动滚动，支持大小限制和保留天数  
✅ **多级别日志** - 支持 error、warn、info、debug、verbose  
✅ **异常处理** - 自动捕获未处理的异常和 Promise 拒绝  
✅ **基于 AsyncLocalStorage** - 使用 Node.js 官方推荐的异步上下文传递方式，安全可靠  

## 日志文件结构

```
logs/
├── application-2024-12-18.log    # 所有 info 级别以上的日志
├── error-2024-12-18.log           # 错误日志
├── debug-2024-12-18.log           # 调试日志（仅开发环境）
├── exceptions-2024-12-18.log      # 未捕获的异常
└── rejections-2024-12-18.log      # 未处理的 Promise 拒绝
```

## 环境变量配置

在 `.env` 文件中可以配置以下选项：

```env
# 日志级别：error, warn, info, debug, verbose
LOG_LEVEL=info

# 日志文件最大大小（默认 20m）
LOG_MAX_SIZE=20m

# 日志文件保留天数（默认 14 天，错误日志 30 天）
LOG_MAX_FILES=14d

# 异常日志级别：none, summary, full
EXCEPTION_LOG_LEVEL=summary
```

## TraceId 使用说明

### 核心特性

1. **自动生成 traceId**：每个请求自动生成唯一的 traceId（UUID v4）
2. **自动包含在日志**：所有日志自动包含 traceId，无需手动添加
3. **响应头返回**：响应头 `X-Trace-Id` 包含 traceId，方便前端获取
4. **跨服务追踪**：如果请求头包含 `X-Trace-Id`，会复用该 traceId

### 日志格式示例

**控制台输出：**
```
2024-12-18 12:33:09.123 [info] [MyService] [TraceId: abc-123-def-456] 处理用户请求
```

**JSON 格式（文件输出）：**
```json
{
  "timestamp": "2024-12-18T12:33:09.123Z",
  "level": "info",
  "context": "MyService",
  "message": "处理用户请求",
  "traceId": "abc-123-def-456",
  "mdc": {
    "method": "GET",
    "path": "/api/user",
    "ip": "127.0.0.1"
  }
}
```

### 在日志系统中查询

由于 traceId 是日志的顶级字段，你可以直接在日志系统中查询：

```bash
# 在 ELK、Loki 等日志系统中查询
traceId="abc-123-def-456"

# 或者使用 grep
grep "abc-123-def-456" logs/application-*.log
```

## 使用方式

### 1. 在服务中使用 Logger（traceId 自动包含）

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class MyService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  someMethod() {
    // 普通日志（traceId 会自动包含，无需手动添加）
    this.logger.info('处理用户请求', { userId: 123 });
    // 输出: { traceId: "abc-123", message: "处理用户请求", userId: 123 }
    
    // 错误日志
    this.logger.error('处理失败', { error: '详细错误信息' });
    
    // 警告日志
    this.logger.warn('资源不足', { memory: '80%' });
    
    // 调试日志
    this.logger.debug('调试信息', { step: 'step1' });
  }
}
```

### 2. 获取 traceId（如果需要）

```typescript
import { getTraceId } from '../logger/logger.module';

// 获取当前请求的 traceId
const traceId = getTraceId();
console.log('当前请求的 traceId:', traceId);
```

### 3. 使用 MDC（上下文信息）

MDC 会在每个请求中自动设置以下信息：
- `traceId` - 追踪 ID（最重要的字段）
- `method` - HTTP 方法
- `path` - 请求路径
- `ip` - 客户端 IP
- `userAgent` - 用户代理

你也可以在代码中手动添加 MDC 值：

```typescript
import { setMDC } from '../logger/logger.module';

// 设置自定义 MDC 值
setMDC('userId', '12345');
setMDC('operation', 'createUser');

// 后续的日志会自动包含这些 MDC 值（包括 traceId）
this.logger.info('用户操作完成');
```

### 4. 使用 NestJS 内置 Logger（已自动使用 Winston）

由于已集成 nest-winston，NestJS 的内置 Logger 会自动使用 Winston，traceId 也会自动包含：

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MyService {
  private readonly logger = new Logger(MyService.name);

  someMethod() {
    // 这种方式也可以，traceId 会自动包含
    this.logger.log('信息日志');
    this.logger.error('错误日志');
  }
}
```

### 5. 跨服务追踪

如果你的服务需要调用其他服务，可以传递 traceId：

```typescript
import { getTraceId } from '../logger/logger.module';
import axios from 'axios';

async callOtherService() {
  const traceId = getTraceId();
  
  // 在请求头中传递 traceId
  const response = await axios.get('http://other-service/api', {
    headers: {
      'X-Trace-Id': traceId, // 其他服务会复用这个 traceId
    },
  });
}
```

### 6. 前端获取 traceId

前端可以从响应头中获取 traceId：

```javascript
// 使用 fetch
fetch('/api/user')
  .then(response => {
    const traceId = response.headers.get('X-Trace-Id');
    console.log('TraceId:', traceId);
    // 可以将 traceId 用于错误上报等场景
  });

// 使用 axios
axios.get('/api/user')
  .then(response => {
    const traceId = response.headers['x-trace-id'];
    console.log('TraceId:', traceId);
  });
```

## 与 Log4j2 功能对比

| 功能 | Log4j2 | Winston (本项目) |
|------|--------|------------------|
| **分布式追踪** | ✅ TraceId | ✅ TraceId（基于 AsyncLocalStorage） |
| **MDC** | ✅ MDC | ✅ MDC（基于 AsyncLocalStorage） |
| **日志级别** | 6 级 | 5 级（足够使用） |
| **文件输出** | ✅ | ✅ |
| **日志滚动** | ✅ | ✅ (winston-daily-rotate-file) |
| **格式自定义** | ✅ PatternLayout | ✅ winston.format |
| **异步日志** | ✅ AsyncAppender | ✅ 可配置 |
| **过滤** | ✅ Filter | ✅ 可自定义 |
| **响应头返回 traceId** | ❌ | ✅ 自动返回 |

## 注意事项

1. **traceId 自动管理**：traceId 在请求开始时自动生成，请求结束时自动清理，无需手动处理
2. **AsyncLocalStorage**：使用 Node.js 官方推荐的 AsyncLocalStorage，确保异步上下文正确传递
3. **跨服务追踪**：如果请求头包含 `X-Trace-Id`，会复用该 traceId，实现跨服务追踪
4. **日志文件位置**：日志文件保存在项目根目录的 `logs/` 文件夹
5. **生产环境**：建议设置 `LOG_LEVEL=info` 以减少日志量
6. **日志轮转**：日志文件按日期自动滚动，旧文件会自动删除
7. **日志查询**：由于 traceId 是顶级字段，可以直接在日志系统中按 traceId 查询所有相关日志

## 高级配置

如需更高级的配置（如自定义格式、多个输出目标等），可以修改 `src/logger/logger.module.ts` 文件。

