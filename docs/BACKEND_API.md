# VectorAdmin Pro - 后端 API 接口文档 (详细版)

**技术栈**: Python (FastAPI/Flask) + MySQL + JWT (无 Redis)

---

## 1. 认证模块 (Auth)

### 1.1 获取图形验证码
- **URL**: `GET /api/auth/captcha`
- **描述**: 生成一个随机 UUID 和对应的 Base64 图片。由于无 Redis，数据存储在 MySQL 的 `xl_captchas` 表中。
- **涉及表**: `xl_captchas`
- **请求参数**: 无
- **响应示例**:
  ```json
  {
    "code": 200,
    "data": {
      "key": "a1b2c3d4-e5f6-...", // UUID
      "image": "data:image/svg+xml;base64,..." 
    },
    "message": "success"
  }
  ```
- **后端逻辑**:
  1. 生成 UUID 和 4位随机字符 (例如 "AB12")。
  2. 生成验证码图片。
  3. 执行 SQL: `INSERT INTO xl_captchas (uuid, code, expire_at) VALUES (?, ?, NOW() + INTERVAL 5 MINUTE)`。
  4. 顺便执行清理逻辑: `DELETE FROM xl_captchas WHERE expire_at < NOW()` (懒惰清理)。

### 1.2 用户登录
- **URL**: `POST /api/auth/login`
- **涉及表**: `xl_users`, `xl_captchas`, `xl_system_logs`
- **请求示例**:
  ```json
  {
    "username": "admin",
    "password": "my_secure_password",
    "captcha": "AB12",
    "key": "a1b2c3d4-e5f6-..." // 上一步获取的 UUID
  }
  ```
- **后端逻辑**:
  1. **验证码校验**: `SELECT * FROM xl_captchas WHERE uuid = ?`。如果不存在或 `expire_at < NOW()` 或 `code != captcha`，返回错误，并删除该记录。
  2. **用户校验**: `SELECT * FROM xl_users WHERE username = ? AND is_deleted = 0`。
  3. **密码校验**: 使用 `bcrypt.checkpw` 对比数据库中的 `password_hash`。
  4. **生成 Token**: 使用 `PyJWT` 生成 Token，Payload 包含 `{ sub: user.id, role: user.role_key, exp: ... }`。
  5. **记录日志**: 插入 `xl_system_logs`。
  6. **更新状态**: 更新 `xl_users.last_login_time`。

### 1.3 获取当前用户信息
- **URL**: `GET /api/auth/me`
- **Header**: `Authorization: Bearer <token>`
- **涉及表**: `xl_users`, `xl_roles`, `xl_menus` (可选)
- **响应示例**:
  ```json
  {
    "code": 200,
    "data": {
      "user": {
        "id": "1",
        "username": "admin",
        "role": "admin",
        "avatar": "...",
        "email": "admin@example.com"
      },
      "menus": [] // 如果做后端动态路由，这里返回菜单树
    }
  }
  ```

---

## 2. 仪表盘 (Dashboard)

### 2.1 获取统计数据
- **URL**: `GET /api/dashboard/stats`
- **涉及表**: `xl_vectors`, `xl_system_logs`
- **响应示例**:
  ```json
  {
    "code": 200,
    "data": {
      "totalVectors": 150000, // 聚合所有向量库的数量
      "dailyQueries": 1200,   // 从日志表 COUNT 今天的 query 操作
      "activeNodes": 3,       // 向量数据库后端节点状态
      "errors": 5,            // 今日错误日志数
      "trend": [              // 近7天趋势
        { "name": "Mon", "vectors": 100, "queries": 500 },
        ...
      ]
    }
  }
  ```

### 2.2 获取任务列表
- **URL**: `GET /api/dashboard/tasks`
- **涉及表**: `xl_vector_tasks`
- **逻辑**: `SELECT * FROM xl_vector_tasks ORDER BY created_at DESC LIMIT 10`。

---

## 3. 向量管理 (Vector Management)

### 3.1 获取向量列表
- **URL**: `GET /api/vectors`
- **参数**: `page=1`, `pageSize=10`, `keyword=abc`, `status=indexed`
- **涉及表**: `xl_vectors`
- **响应示例**:
  ```json
  {
    "code": 200,
    "data": {
      "total": 50,
      "list": [
        {
          "id": "1",
          "title": "产品知识库",
          "status": "indexed",
          "source": "MySQL: items",
          "updatedAt": "2024-03-20T10:00:00Z"
          // ... 其他 xl_vectors 字段
        }
      ]
    }
  }
  ```

### 3.2 创建向量集合 (核心流程)
- **URL**: `POST /api/vectors`
- **涉及表**: `xl_vectors`, `xl_vector_tasks`, `xl_db_connections`
- **请求示例**:
  ```json
  {
    "title": "订单索引",
    "dbId": "10",
    "tableIds": ["orders", "users"],
    "joinConfig": {
        "type": "one_to_one",
        "leftTableId": "orders",
        "rightTableId": "users",
        "conditions": [{ "leftFieldId": "user_id", "rightFieldId": "id" }]
    },
    "fieldKeys": ["orders:order_sn", "users:username"],
    "advancedConfig": { "indexType": "HNSW", "metricType": "COSINE" }
  }
  ```
- **后端逻辑 (Python)**:
  1. **入库**: 插入 `xl_vectors`，状态设为 `pending`。
  2. **创建任务**: 插入 `xl_vector_tasks` (type='build_index', status='In Progress')。
  3. **异步执行 (Celery/BackgroundTasks)**:
     - 连接 `xl_db_connections` 指定的数据库。
     - 拼接 SQL: `SELECT orders.order_sn, users.username FROM orders JOIN users ON ...`。
     - 遍历结果集，拼接文本。
     - 调用 Embedding 模型 (OpenAI/M3E) 获取向量。
     - 写入 Milvus/ChromaDB。
     - 更新任务进度。
     - 完成后更新 `xl_vectors.status = 'indexed'`。

### 3.3 检查名称唯一性
- **URL**: `POST /api/vectors/check-name`
- **SQL**: `SELECT count(1) FROM xl_vectors WHERE title = ? AND is_deleted = 0`。

### 3.4 配置定时同步
- **URL**: `POST /api/vectors/:id/sync-config`
- **请求**: `{ "enabled": true, "expression": "0 2 * * *" }`
- **涉及表**: `xl_vectors`
- **逻辑**: 更新表字段，并调用 Python 调度器 (APScheduler) 添加或移除 Job。

### 3.5 向量检索 (Search)
- **URL**: `POST /api/search/vector`
- **请求**:
  ```json
  {
    "query": "如何在 Linux 下重启服务？",
    "type": "hybrid", // dense/hybrid
    "topK": 5
  }
  ```
- **逻辑**:
  1. 文本 Embedding。
  2. 连接向量数据库进行检索。
  3. 返回匹配的文档块 (Chunk)。

### 3.6 向导支持接口
- `GET /vectors/wizard/databases`: 查询 `xl_db_connections`。
- `GET /vectors/wizard/tables`: 连接目标库执行 `SHOW TABLES`。
- `GET /vectors/wizard/fields`: 连接目标库执行 `DESCRIBE <table>`。

---

## 4. 系统设置 (Settings)

### 4.1 用户管理
- **URL**: `GET /api/settings/users` (列表), `POST /api/settings/users` (新增), `PUT /api/settings/users/:id` (编辑)
- **涉及表**: `xl_users`
- **注意**: 创建用户时，密码必须使用 `bcrypt` 散列。

### 4.2 角色管理
- **URL**: `GET /api/settings/roles`, `PUT /api/settings/roles/:id/permissions`
- **涉及表**: `xl_roles`
- **请求**: `{ "permissions": ["vector.read", "vector.write"] }`
- **逻辑**: 直接更新 JSON 字段。

### 4.3 IP 黑名单
- **URL**: `POST /api/settings/ips`
- **涉及表**: `xl_ip_security`
- **逻辑**: 插入数据。Python 中间件 (Middleware) 在每个请求到达时，需查询此表 (或其内存缓存) 判断 `Remote-Addr` 是否在 blocked 状态。

### 4.4 系统日志
- **URL**: `GET /api/settings/logs`
- **涉及表**: `xl_system_logs`
- **逻辑**: 简单的分页查询 `SELECT * FROM xl_system_logs ORDER BY created_at DESC`。
