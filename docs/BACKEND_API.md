# VectorAdmin Pro 后端接口文档 (V3.0 - 详细工程版)

**技术栈**: Python (FastAPI/Flask) + MySQL (SQLAlchemy) + JWT + Celery (异步任务)
**通用响应格式**:
```json
{
  "code": 200, // 200:成功, 400:业务错误, 401:未登录, 403:无权限, 500:系统错误
  "data": {},  // 业务数据
  "message": "success" // 提示信息
}
```

---

## 1. 认证模块 (Auth Module)

### 1.1 发送验证码
- **URL**: `GET /api/auth/captcha`
- **涉及表**: `xl_captchas`
- **请求参数**: 无
- **响应字段**:
  - `key` (String): 验证码唯一标识 (UUID)
  - `image` (String): Base64 编码的图片数据
- **后端逻辑**:
  1. 生成 UUID (`key`) 和 4位随机字符 (`code`)。
  2. 生成验证码图片并转 Base64。
  3. **SQL**: `INSERT INTO xl_captchas (uuid, code, expire_at) VALUES (:key, :code, NOW() + INTERVAL 5 MINUTE)`。
  4. **SQL**: `DELETE FROM xl_captchas WHERE expire_at < NOW()` (懒惰清理)。

### 1.2 用户登录
- **URL**: `POST /api/auth/login`
- **涉及表**: `xl_users`, `xl_captchas`, `xl_system_logs`
- **请求字段**:
  - `username` (String): 用户名
  - `password` (String): 密码 (明文，后端校验时加密比对)
  - `captcha` (String): 用户输入的验证码
  - `key` (String): 验证码 UUID
- **响应字段**:
  - `token` (String): JWT Token
  - `user` (Object): 用户信息 (`id`, `username`, `role`, `avatar`...)
- **后端逻辑**:
  1. **验证码校验**: `SELECT code FROM xl_captchas WHERE uuid = :key`。比对失败返回 400。
  2. **查询用户**: `SELECT * FROM xl_users WHERE username = :username AND is_deleted = 0`。
  3. **状态校验**: 若 `status != 'active'`，返回 403。
  4. **密码校验**: `bcrypt.checkpw(password, user.password_hash)`。
  5. **生成 Token**: Payload `{ sub: user.id, role: user.role_key, exp: ... }`。
  6. **更新登录时间**: `UPDATE xl_users SET last_login_time = NOW() WHERE id = :user_id`。
  7. **记录日志**: `INSERT INTO xl_system_logs (type, action, user_id, ...) VALUES ('login', 'USER_LOGIN', ...)`。

### 1.3 获取个人信息与菜单
- **URL**: `GET /api/auth/me`
- **涉及表**: `xl_users`, `xl_menus`, `xl_roles`
- **请求参数**: Header `Authorization: Bearer <token>`
- **响应字段**:
  - `user` (Object): 用户详情
  - `menus` (Array): 树形菜单结构
- **后端逻辑**:
  1. **查询用户**: 根据 Token 中的 ID 查询 `xl_users`。
  2. **查询菜单**: `SELECT * FROM xl_menus WHERE is_visible = 1 AND is_deleted = 0 ORDER BY sort ASC`。
  3. **权限过滤**: 
     - 遍历菜单项，解析 `roles` (JSON字段)。
     - 若 `user.role_key` 在 `menu.roles` 列表中，或用户是 `admin`，则保留。
  4. **构建树**: 将扁平数据转换为树形结构。

---

## 2. 个人中心 (Profile Module)

### 2.1 获取个人信息
- **URL**: `GET /api/profile`
- **涉及表**: `xl_users`
- **逻辑**: 复用 `/auth/me` 逻辑，仅返回 `user` 对象。

### 2.2 保存个人信息
- **URL**: `PUT /api/profile`
- **涉及表**: `xl_users`
- **请求字段**:
  - `email` (String)
  - `phone` (String)
  - `gender` (String): 'male'/'female'/'other'
  - `age` (Int)
  - `avatar` (String)
- **后端逻辑**:
  1. **SQL**: `UPDATE xl_users SET email=:email, phone=:phone, gender=:gender, age=:age, avatar=:avatar WHERE id=:current_user_id`。
  2. 禁止修改 `username` 和 `role_key`。

---

## 3. 仪表盘 (Dashboard Module)

### 3.1 业务统计 (卡片与趋势)
- **URL**: `GET /api/dashboard/stats`
- **涉及表**: `xl_vectors`, `xl_system_logs`
- **响应字段**:
  - `totalVectors` (Int): `SELECT SUM(doc_count) FROM xl_vectors` (假设有统计字段或调向量库API)。
  - `dailyQueries` (Int): `SELECT COUNT(*) FROM xl_system_logs WHERE action = 'VECTOR_SEARCH' AND created_at > CURDATE()`。
  - `trend` (Array): 近7天数据，聚合日志表或业务统计表。

### 3.2 系统控制台接口
1.  **系统资源监控** (`GET /api/dashboard/resources`)
    -   **不涉及表**: 直接调用 Python `psutil` 库。
    -   **响应**: `{ cpu: 45, memory: 60, disk: 30 }`。
2.  **后台任务队列** (`GET /api/dashboard/tasks`)
    -   **涉及表**: `xl_tasks`
    -   **SQL**: `SELECT * FROM xl_tasks ORDER BY created_at DESC LIMIT 10`。
3.  **执行任务进度** (`GET /api/dashboard/tasks/:id`)
    -   **涉及表**: `xl_tasks`
    -   **SQL**: `SELECT status, progress, result_msg FROM xl_tasks WHERE id = :id`。
4.  **集群节点状态** (`GET /api/dashboard/nodes`)
    -   **不涉及表**: 调用 Milvus/ChromaDB 的 `/v1/health` 或 `/system/info` 接口转发结果。

---

## 4. 向量管理 (Vector Module)

### 4.1 向量列表查询
- **URL**: `GET /api/vectors`
- **涉及表**: `xl_vectors`
- **请求参数**: `page`, `pageSize`, `keyword`, `status`
- **后端逻辑**:
  1. Base SQL: `SELECT * FROM xl_vectors WHERE is_deleted = 0`.
  2. 若 `keyword`: `AND title LIKE :keyword`.
  3. 若 `status` != 'all': `AND status = :status`.
  4. 分页: `LIMIT :limit OFFSET :offset`.

### 4.2 启用/禁用切换
- **URL**: `PUT /api/vectors/:id/status`
- **涉及表**: `xl_vectors`
- **请求字段**: `isEnabled` (Boolean)
- **SQL**: `UPDATE xl_vectors SET is_enabled = :isEnabled WHERE id = :id`.

### 4.3 删除向量 (可多选)
- **URL**: `DELETE /api/vectors`
- **涉及表**: `xl_vectors`, `xl_tasks`
- **请求字段**: `ids` (Array<String>)
- **后端逻辑**:
  1. **软删除**: `UPDATE xl_vectors SET is_deleted = 1 WHERE id IN (:ids)`.
  2. **异步清理**: 触发 Celery 任务，连接 Milvus 删除对应的 Collection。

### 4.4 编辑向量 (仅名称)
- **URL**: `PUT /api/vectors/:id`
- **涉及表**: `xl_vectors`
- **请求字段**: `title` (String)
- **前置逻辑**: 调用 4.9 校验接口确保名称不重复。
- **SQL**: `UPDATE xl_vectors SET title = :title WHERE id = :id`.

### 4.5 配置定时任务
- **URL**: `POST /api/vectors/:id/sync-config`
- **涉及表**: `xl_vectors`
- **请求字段**: `enabled` (Boolean), `expression` (String - Cron)
- **后端逻辑**:
  1. **更新库**: `UPDATE xl_vectors SET cron_enabled=:enabled, cron_expression=:expression WHERE id=:id`.
  2. **调度器**: 调用 APScheduler，`scheduler.add_job(...)` 或 `scheduler.remove_job(...)`.

### 4.6 导出向量 (Excel)
- **URL**: `GET /api/vectors/export`
- **涉及表**: `xl_vectors`
- **请求参数**: `ids` (String, comma separated)
- **逻辑**: 查询数据 -> Pandas 生成 DataFrame -> `to_excel` -> 返回 `StreamingResponse`.

### 4.7 添加向量 (向导 - 辅助接口)
1.  **查数据库列表**: `GET /api/vectors/wizard/databases`
    -   **涉及表**: `xl_db_connections`
    -   **SQL**: `SELECT id, name, type FROM xl_db_connections WHERE is_deleted = 0`.
2.  **查表列表**: `GET /api/vectors/wizard/tables`
    -   **请求参数**: `dbId`
    -   **逻辑**: 查询 `xl_db_connections` 获取连接串 -> SQLAlchemy Engine 连接 -> `inspect.get_table_names()` -> 遍历表检查主键 (`inspect.get_pk_constraint`).
3.  **查字段列表**: `GET /api/vectors/wizard/fields`
    -   **请求参数**: `tableId` (格式 `dbId:tableName` 或纯 `tableName`)
    -   **逻辑**: 连接数据库 -> `inspect.get_columns(tableName)`.

### 4.8 添加向量 (向导 - 提交接口)
- **URL**: `POST /api/vectors/create`
- **涉及表**: `xl_vectors`, `xl_tasks`
- **请求字段**:
  - `title`: 集合名称
  - `dbId`: 源数据库ID
  - `tableIds`: 表名数组
  - `fieldKeys`: 选中字段数组
  - `joinConfig`: 多表关联 JSON `{ type, conditions }`
  - `advancedConfig`: 索引配置 JSON `{ indexType, metricType }`
- **后端逻辑**:
  1. **入库**: `INSERT INTO xl_vectors (...) VALUES (...)`, 状态 `pending`.
  2. **创建任务**: `INSERT INTO xl_tasks (name, type, status) VALUES ('Build Index: ' + title, 'vector_build', 'pending')`.
  3. **触发异步**: `build_index_task.delay(vector_id)`.

### 4.9 校验集合名称重复
- **URL**: `POST /api/vectors/check-name`
- **涉及表**: `xl_vectors`
- **SQL**: `SELECT COUNT(1) FROM xl_vectors WHERE title = :title AND is_deleted = 0`.

---

## 5. 向量搜索 (Search Module)

### 5.1 向量库列表 (下拉框)
- **URL**: `GET /api/vectors/simple-list`
- **涉及表**: `xl_vectors`
- **SQL**: `SELECT id, title FROM xl_vectors WHERE status = 'indexed' AND is_enabled = 1`.

### 5.2 向量检索
- **URL**: `POST /api/search/vector`
- **涉及表**: `xl_vectors` (查询配置), `xl_system_logs` (记录操作)
- **请求字段**: `vectorId`, `query`, `type` (dense/hybrid), `topK`
- **后端逻辑**:
  1. 查询 `xl_vectors` 获取 `collection_name` 和 `db_connection_id`.
  2. 调用 Embedding 模型将 `query` 转向量.
  3. 连接 Milvus/Chroma 进行检索 (`collection.search(...)`).
  4. (可选) 根据结果 ID 回查源数据库获取完整文本.
  5. 记录日志: `INSERT INTO xl_system_logs (action='SEARCH', ...)`.

---

## 6. 系统配置 (System Settings)

### 6.1 菜单管理
1.  **查询菜单列表**: `GET /api/settings/menus`
    -   **涉及表**: `xl_menus`
    -   **SQL**: `SELECT * FROM xl_menus WHERE is_deleted = 0 ORDER BY sort ASC`.
2.  **菜单编辑**: `PUT /api/settings/menus/:id`
    -   **涉及表**: `xl_menus`
    -   **请求**: `title`, `path`, `is_visible`, `roles` (JSON).
    -   **SQL**: `UPDATE xl_menus SET ... WHERE id = :id`.

### 6.2 角色管理
1.  **列表**: `GET /api/settings/roles` -> `SELECT * FROM xl_roles`.
2.  **配置权限**: `PUT /api/settings/roles/:id/permissions`
    -   **涉及表**: `xl_roles`
    -   **SQL**: `UPDATE xl_roles SET permissions = :json_perms WHERE id = :id`.
3.  **编辑**: `PUT /api/settings/roles/:id` -> `UPDATE xl_roles ...`.
4.  **删除**: `DELETE /api/settings/roles/:id` -> `DELETE FROM xl_roles ...`.
5.  **新增**: `POST /api/settings/roles` -> `INSERT INTO xl_roles ...`.

### 6.3 用户管理
1.  **列表**: `GET /api/settings/users` -> `SELECT * FROM xl_users` (过滤 password_hash).
2.  **编辑**: `PUT /api/settings/users/:id` -> `UPDATE xl_users ...`.
3.  **停用/启用**: `PUT /api/settings/users/:id/status` -> `UPDATE xl_users SET status = :status ...`.
4.  **删除**: `DELETE /api/settings/users/:id` -> `UPDATE xl_users SET is_deleted = 1 ...`.
5.  **新增**: `POST /api/settings/users` -> 加密密码后 `INSERT INTO xl_users ...`.

### 6.4 系统安全 (IP)
1.  **列表**: `GET /api/settings/ips` -> `SELECT * FROM xl_ip_security`.
2.  **封禁/解封**: `PUT /api/settings/ips/:id/status` -> `UPDATE xl_ip_security SET status = :status`.
3.  **添加封禁**: `POST /api/settings/ips`
    -   **涉及表**: `xl_ip_security`
    -   **SQL**: `INSERT INTO xl_ip_security (ip, location, status) VALUES (:ip, :loc, 'blocked')`.

### 6.5 系统日志
1.  **列表**: `GET /api/settings/logs`
    -   **涉及表**: `xl_system_logs`
    -   **SQL**: `SELECT * FROM xl_system_logs ORDER BY created_at DESC LIMIT :limit OFFSET :offset`.
2.  **详情**: `GET /api/settings/logs/:id` -> `SELECT details ...`.
3.  **删除 (多选)**: `DELETE /api/settings/logs` -> `DELETE FROM xl_system_logs WHERE id IN (:ids)`.
4.  **日志保留**: `POST /api/settings/logs/retention`
    -   **逻辑**: 保存配置到系统配置表，并立即触发一次清理: `DELETE FROM xl_system_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL :days DAY)`.
