# TraceId 使用示例

## 快速开始

### 1. 基本使用（traceId 自动包含）

在任何服务中，直接使用 Logger，traceId 会自动包含在日志中：

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class UserService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  async findAll() {
    // traceId 会自动包含在日志中
    this.logger.info('查询用户列表');
    
    // 执行一些操作
    const users = await this.fetchUsers();
    
    // 所有日志都会包含相同的 traceId
    this.logger.info('查询完成', { count: users.length });
    
    return users;
  }
}
```

### 2. 获取 traceId（用于跨服务调用）

```typescript
import { getTraceId } from '../logger/logger.module';
import axios from 'axios';

@Injectable()
export class OrderService {
  async createOrder(userId: number) {
    const traceId = getTraceId();
    
    // 调用其他服务时传递 traceId
    const response = await axios.post('http://payment-service/pay', {
      userId,
      amount: 100,
    }, {
      headers: {
        'X-Trace-Id': traceId, // 其他服务会复用这个 traceId
      },
    });
    
    return response.data;
  }
}
```

### 3. 前端获取 traceId

```typescript
// React 示例
const fetchUsers = async () => {
  const response = await fetch('/api/user');
  const traceId = response.headers.get('X-Trace-Id');
  
  // 可以将 traceId 用于错误上报
  if (!response.ok) {
    errorReporter.report({
      traceId,
      error: 'Failed to fetch users',
    });
  }
  
  return response.json();
};
```

### 4. 在日志系统中查询

#### 使用 grep 查询

```bash
# 查询特定 traceId 的所有日志
grep "abc-123-def-456" logs/application-*.log

# 查询错误日志
grep "abc-123-def-456" logs/error-*.log
```

#### 在 ELK Stack 中查询

```json
{
  "query": {
    "term": {
      "traceId": "abc-123-def-456"
    }
  }
}
```

#### 在 Loki 中查询

```logql
{job="nestjs"} |= "abc-123-def-456"
```

#### 在 Splunk 中查询

```
index=main traceId="abc-123-def-456"
```

## 完整示例

### 服务调用链

```
前端请求
  ↓ (生成 traceId: abc-123)
API Gateway
  ↓ (传递 X-Trace-Id: abc-123)
User Service
  ↓ (传递 X-Trace-Id: abc-123)
Order Service
  ↓ (传递 X-Trace-Id: abc-123)
Payment Service
```

所有服务的日志都会包含相同的 traceId，方便追踪整个请求链路。

## 响应头示例

```http
HTTP/1.1 200 OK
Content-Type: application/json
X-Trace-Id: abc-123-def-456-789

{
  "data": [...]
}
```

## 日志输出示例

### 控制台输出

```
2024-12-18 12:33:09.123 [info] [UserService] [TraceId: abc-123-def-456] 查询用户列表
2024-12-18 12:33:09.125 [info] [UserService] [TraceId: abc-123-def-456] 查询完成 {"count":10}
2024-12-18 12:33:09.130 [info] [OrderService] [TraceId: abc-123-def-456] 创建订单 {"userId":123}
```

### JSON 格式（文件输出）

```json
{"timestamp":"2024-12-18T12:33:09.123Z","level":"info","context":"UserService","message":"查询用户列表","traceId":"abc-123-def-456","mdc":{"method":"GET","path":"/api/user"}}
{"timestamp":"2024-12-18T12:33:09.125Z","level":"info","context":"UserService","message":"查询完成","traceId":"abc-123-def-456","count":10}
{"timestamp":"2024-12-18T12:33:09.130Z","level":"info","context":"OrderService","message":"创建订单","traceId":"abc-123-def-456","userId":123}
```

所有日志都包含相同的 traceId，方便在日志系统中查询整个请求链路。

