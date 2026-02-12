# VectorAdmin Pro 后端接口文档 (Strict V1.0)

**协议**: HTTP/JSON
**鉴权**: Header `Authorization: Bearer <token>`

---

## 1. 登录页面 API
| 接口描述 | URL | Method | 参数 | 返回值示例 | 备注 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **发送验证码** | `/auth/captcha` | `GET` | 无 | `{ key: "uuid", image: "base64" }` | 存入 xl_captchas |
| **用户登录** | `/auth/login` | `POST` | `{ username, password, captcha, key }` | `{ token: "jwt", user: {...} }` | 校验密码与验证码 |
| **获取用户信息/菜单** | `/auth/me` | `GET` | 无 | `{ user: {...}, menus: [...] }` | 登录成功后调用，返回权限过滤后的菜单树 |

## 2. 个人中心 API
| 接口描述 | URL | Method | 参数 | 返回值示例 | 备注 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **获取个人信息** | `/profile` | `GET` | 无 | `{ username, email, phone, role... }` | 复用逻辑 |
| **保存个人信息** | `/profile` | `PUT` | `{ email, phone, gender, age... }` | `{ success: true }` | 更新 xl_users |

## 3. 仪表盘 API
### 3.1 业务统计
| 接口描述 | URL | Method | 参数 | 返回值示例 | 备注 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **获取统计卡片与趋势** | `/dashboard/stats` | `GET` | 无 | `{ totalVectors: 1000, dailyQueries: 50, trend: [...] }` | 聚合 xl_vectors 和 xl_logs |

### 3.2 系统控制台
| 接口描述 | URL | Method | 参数 | 返回值示例 | 备注 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **系统资源监控** | `/dashboard/resources` | `GET` | 无 | `{ cpu: 45, memory: 60, disk: 30 }` | 实时服务器状态 |
| **后台任务队列** | `/dashboard/tasks` | `GET` | 无 | `[{ id, name, status, progress }]` | 查询 xl_tasks |
| **执行任务进度** | `/dashboard/tasks/:id` | `GET` | 无 | `{ progress: 85, status: "running" }` | 轮询用 |
| **集群节点状态** | `/dashboard/nodes` | `GET` | 无 | `[{ ip, status, load }]` | 向量库集群状态 |

## 4. 向量管理 API
| 接口描述 | URL | Method | 参数 | 返回值示例 | 备注 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **向量列表查询** | `/vectors` | `GET` | `page, pageSize, keyword, status` | `{ list: [], total: 100 }` | 分页查询 |
| **启用/禁用状态切换** | `/vectors/:id/status` | `PUT` | `{ isEnabled: true/false }` | `{ success: true }` | 更新状态 |
| **删除向量 (可多选)** | `/vectors` | `DELETE` | `{ ids: ["1", "2"] }` | `{ success: true }` | 批量软删除 |
| **校验集合名称** | `/vectors/check-name` | `POST` | `{ title: "name" }` | `{ exists: true/false }` | 创建/编辑前调用 |
| **编辑向量** | `/vectors/:id` | `PUT` | `{ title: "new_name" }` | `{ success: true }` | 仅允许修改名称，需先调校验接口 |
| **配置定时任务** | `/vectors/:id/sync` | `POST` | `{ enabled: true, cron: "0 2 * * *" }` | `{ success: true }` | 设置 Cron |
| **导出向量** | `/vectors/export` | `GET` | `ids=1,2,3` | Blob (Excel file) | 下载文件流 |

### 4.1 添加向量 (向导流程)
| 接口描述 | URL | Method | 参数 | 返回值示例 | 备注 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **获取数据库列表** | `/vectors/db/list` | `GET` | 无 | `[{ id, name, type }]` | 步骤1: 选择库 |
| **获取表列表** | `/vectors/db/tables` | `GET` | `dbId` | `[{ name, hasPrimaryKey }]` | 步骤2: 选择表 (需校验主键) |
| **获取字段列表** | `/vectors/db/fields` | `GET` | `tableId` | `[{ name, type }]` | 步骤3: 选择字段 |
| **创建并转化向量** | `/vectors/create` | `POST` | `{ title, dbId, tableIds, fields, joinConfig, advancedConfig }` | `{ taskId: "123" }` | 步骤4: 提交，后端创建异步任务 |

## 5. 向量搜索 API
| 接口描述 | URL | Method | 参数 | 返回值示例 | 备注 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **向量库列表** | `/vectors/simple-list` | `GET` | 无 | `[{ id, title }]` | 下拉框选择用 |
| **向量检索** | `/search/vector` | `POST` | `{ vectorId, query, type: "dense/hybrid", topK }` | `[{ content, score, source }]` | 执行搜索 |

## 6. 系统配置 API

### 6.1 菜单管理
| 接口描述 | URL | Method | 参数 | 返回值示例 | 备注 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **查询菜单列表** | `/settings/menus` | `GET` | 无 | `[{ id, title, path, visible, roles }]` | 全量列表 |
| **菜单编辑** | `/settings/menus/:id` | `PUT` | `{ title, path, visible, roles }` | `{ success: true }` | 更新可见性/权限 |

### 6.2 角色管理
| 接口描述 | URL | Method | 参数 | 返回值示例 | 备注 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **角色列表查询** | `/settings/roles` | `GET` | 无 | `[{ id, name, permissions }]` | |
| **新增角色** | `/settings/roles` | `POST` | `{ name, description }` | `{ id: 1 }` | |
| **编辑角色** | `/settings/roles/:id` | `PUT` | `{ name, description }` | `{ success: true }` | |
| **配置权限** | `/settings/roles/:id/permissions` | `PUT` | `{ permissions: ["p1", "p2"] }` | `{ success: true }` | |
| **删除角色** | `/settings/roles/:id` | `DELETE` | 无 | `{ success: true }` | |

### 6.3 用户管理
| 接口描述 | URL | Method | 参数 | 返回值示例 | 备注 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **用户列表查询** | `/settings/users` | `GET` | `page, keyword, status` | `{ list: [], total }` | |
| **新增用户** | `/settings/users` | `POST` | `{ username, password, role... }` | `{ id: 1 }` | |
| **用户编辑** | `/settings/users/:id` | `PUT` | `{ email, phone, role }` | `{ success: true }` | |
| **用户停用/启用** | `/settings/users/:id/status` | `PUT` | `{ status: "active/inactive" }` | `{ success: true }` | |
| **用户删除** | `/settings/users/:id` | `DELETE` | 无 | `{ success: true }` | |

### 6.4 系统安全
| 接口描述 | URL | Method | 参数 | 返回值示例 | 备注 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **IP 列表查询** | `/settings/ips` | `GET` | `keyword` | `[{ ip, status, accessCount }]` | 查询访问过系统的IP |
| **添加封禁 IP** | `/settings/ips` | `POST` | `{ ip, location }` | `{ success: true }` | 主动添加 |
| **封禁/解封 IP** | `/settings/ips/:id/status` | `PUT` | `{ status: "blocked/allowed" }` | `{ success: true }` | 切换状态 |

### 6.5 系统日志
| 接口描述 | URL | Method | 参数 | 返回值示例 | 备注 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **日志列表查询** | `/settings/logs` | `GET` | `page, type, keyword` | `{ list: [], total }` | |
| **日志详情查询** | `/settings/logs/:id` | `GET` | 无 | `{ details: "JSON..." }` | |
| **删除日志 (可多选)** | `/settings/logs` | `DELETE` | `{ ids: ["1", "2"] }` | `{ success: true }` | 批量删除 |
| **日志保留操作** | `/settings/logs/retention` | `POST` | `{ days: 30 }` | `{ success: true }` | 设置自动清理规则 |
