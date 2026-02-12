# VectorAdmin Pro 数据库设计文档 (Python + JWT + MySQL)

## 1. 设计规范
- **数据库**: MySQL 8.0+
- **鉴权**: JWT (无 Redis，黑名单/验证码存数据库)
- **通用字段**: `id` (BigInt/Snowflake), `created_at`, `updated_at`, `is_deleted` (0/1)

---

## 2. 表结构定义

### 2.1 权限与菜单模块 (System Core)

#### 2.1.1 系统菜单表 (xl_menus)
**用途**: 存储动态菜单结构，支持RBAC权限控制。
```sql
CREATE TABLE `xl_menus` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `parent_id` bigint(20) DEFAULT '0' COMMENT '父菜单ID，一级菜单为0',
  `title` varchar(50) NOT NULL COMMENT '菜单显示名称',
  `path` varchar(100) DEFAULT NULL COMMENT '前端路由路径',
  `component` varchar(100) DEFAULT NULL COMMENT '前端组件路径(可选)',
  `icon` varchar(50) DEFAULT NULL COMMENT '图标标识 (Lucide Icon Name)',
  `sort` int(11) DEFAULT '0' COMMENT '排序权重',
  `is_visible` tinyint(1) DEFAULT '1' COMMENT '显示状态 1:显示 0:隐藏',
  `perms` varchar(100) DEFAULT NULL COMMENT '权限标识 (如 vector:list)',
  `roles` text COMMENT '允许访问的角色列表 JSON ["admin","editor"]',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统菜单表';
```

#### 2.1.2 系统角色表 (xl_roles)
```sql
CREATE TABLE `xl_roles` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL COMMENT '角色名称 (管理员)',
  `role_key` varchar(50) NOT NULL COMMENT '角色标识 (admin)',
  `description` varchar(200) DEFAULT NULL,
  `permissions` text COMMENT '权限点列表 JSON ["user:add", "vector:edit"]',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_key` (`role_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统角色表';
```

#### 2.1.3 系统用户表 (xl_users)
```sql
CREATE TABLE `xl_users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `gender` varchar(10) DEFAULT 'other' COMMENT 'male/female/other',
  `age` int(3) DEFAULT NULL,
  `role_key` varchar(50) NOT NULL COMMENT '关联 xl_roles.role_key',
  `status` varchar(20) DEFAULT 'active' COMMENT 'active/inactive',
  `last_login_time` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';
```

#### 2.1.4 验证码临时表 (xl_captchas)
```sql
CREATE TABLE `xl_captchas` (
  `uuid` char(36) NOT NULL,
  `code` varchar(10) NOT NULL,
  `expire_at` datetime NOT NULL,
  PRIMARY KEY (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='验证码存储';
```

---

## 3. 向量业务模块 (Vector Business)

### 3.1 向量集合表 (xl_vectors)
```sql
CREATE TABLE `xl_vectors` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL COMMENT '集合名称',
  `collection_name` varchar(100) NOT NULL COMMENT 'Milvus集合名 (自动生成)',
  `db_connection_id` bigint(20) NOT NULL COMMENT '源数据库ID',
  `source_table` varchar(100) NOT NULL COMMENT '主表名',
  `status` varchar(20) DEFAULT 'pending' COMMENT 'pending/indexed/error',
  `is_enabled` tinyint(1) DEFAULT '1',
  
  -- 字段映射与关联
  `field_mapping` text COMMENT 'JSON: 选中的字段列表 [{"name":"title","type":"varchar"}]',
  `join_config` text COMMENT 'JSON: 多表关联配置 {"left":"t1","right":"t2","on":...}',
  
  -- 高级配置
  `index_type` varchar(20) DEFAULT 'HNSW',
  `metric_type` varchar(20) DEFAULT 'COSINE',
  `compression` varchar(20) DEFAULT 'NONE',
  
  -- 定时任务
  `cron_enabled` tinyint(1) DEFAULT '0',
  `cron_expression` varchar(50) DEFAULT NULL,
  
  `created_by` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='向量集合主表';
```

### 3.2 数据库连接配置 (xl_db_connections)
```sql
CREATE TABLE `xl_db_connections` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL COMMENT '连接别名',
  `type` varchar(20) NOT NULL COMMENT 'mysql/pgsql',
  `host` varchar(100) NOT NULL,
  `port` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `database` varchar(50) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='源数据库连接信息';
```

### 3.3 异步任务队列表 (xl_tasks)
```sql
CREATE TABLE `xl_tasks` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `type` varchar(50) NOT NULL COMMENT 'vector_build/sync/clean',
  `status` varchar(20) DEFAULT 'pending' COMMENT 'pending/running/completed/failed',
  `progress` int(3) DEFAULT '0',
  `result_msg` text COMMENT '成功或失败信息',
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 4. 系统安全与日志 (Security & Logs)

### 4.1 IP控制表 (xl_ip_security)
```sql
CREATE TABLE `xl_ip_security` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `ip` varchar(50) NOT NULL,
  `location` varchar(100) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'allowed' COMMENT 'allowed/blocked',
  `access_count` int(11) DEFAULT '0',
  `last_access_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ip` (`ip`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 4.2 系统日志表 (xl_logs)
```sql
CREATE TABLE `xl_logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `type` varchar(20) NOT NULL COMMENT 'login/operation/error',
  `module` varchar(50) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `ip` varchar(50) DEFAULT NULL,
  `details` text COMMENT '详情/堆栈',
  `status` varchar(20) DEFAULT 'success',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 5. 初始化数据 (Data Seeding)

### 5.1 菜单表初始化 (xl_menus)
```sql
INSERT INTO `xl_menus` (`id`, `parent_id`, `title`, `path`, `component`, `icon`, `sort`, `is_visible`, `perms`, `roles`) VALUES
(1, 0, '仪表盘', '/dashboard', 'Dashboard', 'LayoutDashboard', 1, 1, 'dashboard:view', '["admin", "editor", "viewer"]'),
(2, 0, '向量配置', '/vector-config', 'Layout', 'Database', 2, 1, 'vector:view', '["admin", "editor", "viewer"]'),
(3, 2, '向量管理', '/vector', 'VectorList', 'Database', 1, 1, 'vector:manage', '["admin", "editor"]'),
(4, 2, '向量搜索', '/vector-search', 'VectorSearch', 'Search', 2, 1, 'vector:search', '["admin", "editor", "viewer"]'),
(5, 0, '知识库', '/kb', 'Layout', 'Book', 3, 1, 'kb:view', '["admin", "editor", "viewer"]'),
(6, 5, '知识库配置', '/kb/config', 'KBConfig', 'Settings', 1, 1, 'kb:config', '["admin", "editor"]'),
(7, 5, '知识库检索', '/kb/retrieval', 'KBRetrieval', 'Search', 2, 1, 'kb:retrieval', '["admin", "editor", "viewer"]'),
(8, 0, '节点工具', '/tools', 'Layout', 'Wrench', 4, 1, 'tools:view', '["admin", "editor"]'),
(9, 8, '大模型输出清洁', '/tools/llm-clean', 'LLMClean', 'Eraser', 1, 1, 'tools:clean', '["admin", "editor"]'),
(10, 0, '系统设置', '/settings', 'Layout', 'Settings', 5, 1, 'system:view', '["admin"]'),
(11, 10, '菜单管理', '/settings/menus', 'MenuManagement', 'List', 1, 1, 'system:menus', '["admin"]'),
(12, 10, '角色管理', '/settings/roles', 'RoleManagement', 'Shield', 2, 1, 'system:roles', '["admin"]'),
(13, 10, '用户管理', '/settings/users', 'UserManagement', 'Users', 3, 1, 'system:users', '["admin"]'),
(14, 10, '系统安全', '/settings/security', 'SystemSecurity', 'Lock', 4, 1, 'system:security', '["admin"]'),
(15, 10, '系统日志', '/settings/logs', 'SystemLogs', 'FileText', 5, 1, 'system:logs', '["admin"]'),
(16, 0, 'API 文档', '/api-docs', 'APIDocs', 'BookOpen', 6, 1, 'api:view', '["admin", "editor", "viewer"]');
```

### 5.2 角色表初始化 (xl_roles)
```sql
INSERT INTO `xl_roles` (`id`, `name`, `role_key`, `description`, `permissions`) VALUES
(1, '超级管理员', 'admin', '拥有系统所有权限', '["*"]'),
(2, '编辑人员', 'editor', '负责数据维护与知识库配置', '["dashboard:view", "vector:view", "vector:manage", "vector:search", "kb:view", "kb:config", "kb:retrieval", "tools:view", "tools:clean", "api:view"]'),
(3, '只读访客', 'viewer', '仅供查看数据，无法进行修改操作', '["dashboard:view", "vector:view", "vector:search", "kb:view", "kb:retrieval", "api:view"]');
```
