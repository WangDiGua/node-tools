# VectorAdmin Pro 数据库设计文档 (Python + JWT + MySQL)

## 1. 设计规范
- **数据库类型**: MySQL 8.0+
- **ORM 框架**: 推荐使用 SQLAlchemy 或 Tortoise ORM (FastAPI) / Django ORM
- **无 Redis 策略**: 由于不使用 Redis，验证码 (Captcha)、Token 黑名单 (Blacklist) 等临时数据将存储在数据库表中，并配合定时任务清理。
- **表前缀**: `xl_`
- **通用字段**: 所有业务表需包含 `created_at` (创建时间), `updated_at` (更新时间), `is_deleted` (逻辑删除标识)。

---

## 2. 表结构定义

### 2.1 基础认证与用户模块

#### 2.1.1 验证码表 (xl_captchas)
**用途**: 替代 Redis 存储登录验证码。
```sql
CREATE TABLE `xl_captchas` (
  `uuid` char(36) NOT NULL COMMENT '验证码唯一标识',
  `code` varchar(10) NOT NULL COMMENT '验证码字符',
  `expire_at` datetime NOT NULL COMMENT '过期时间',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`uuid`),
  KEY `idx_expire_at` (`expire_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='验证码临时表';
```

#### 2.1.2 系统用户表 (xl_users)
**用途**: 存储系统登录用户信息。
```sql
CREATE TABLE `xl_users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username` varchar(50) NOT NULL COMMENT '登录用户名',
  `password_hash` varchar(255) NOT NULL COMMENT 'Bcrypt加密后的密码',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `role_key` varchar(50) NOT NULL DEFAULT 'viewer' COMMENT '角色标识 (admin/editor/viewer)',
  `avatar` varchar(255) DEFAULT NULL COMMENT '头像URL',
  `gender` varchar(10) DEFAULT 'other' COMMENT 'male/female/other',
  `age` int(3) DEFAULT NULL COMMENT '年龄',
  `status` varchar(20) DEFAULT 'active' COMMENT '状态 active/inactive',
  `last_login_time` datetime DEFAULT NULL COMMENT '最后登录时间',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '逻辑删除 0:否 1:是',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';
```

#### 2.1.3 系统角色表 (xl_roles)
```sql
CREATE TABLE `xl_roles` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `role_key` varchar(50) NOT NULL COMMENT '角色唯一标识',
  `name` varchar(50) NOT NULL COMMENT '角色显示名称',
  `description` varchar(200) DEFAULT NULL,
  `permissions` text COMMENT '权限列表(JSON数组: ["vector.read", "user.edit"])',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_key` (`role_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统角色表';
```

---

## 3. 业务核心模块 (Vectors)

### 3.1 向量集合元数据表 (xl_vectors)
**用途**: 存储向量库的配置信息，而非向量数据本身（向量数据存在 Milvus/ChromaDB 中）。
```sql
CREATE TABLE `xl_vectors` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL COMMENT '集合显示名称',
  `collection_name` varchar(100) NOT NULL COMMENT '底层向量库集合名',
  `source_type` varchar(20) NOT NULL COMMENT 'mysql/pg/mongo/pdf',
  `dimensions` int(11) DEFAULT '1536' COMMENT '向量维度',
  `status` varchar(20) DEFAULT 'pending' COMMENT 'indexed/pending/error',
  
  -- 复杂配置字段 (JSON 存储)
  `is_multi_table` tinyint(1) DEFAULT '0',
  `join_rules` text COMMENT 'JSON: {"type": "one_to_one", "conditions": [...]}',
  `selected_fields` text COMMENT 'JSON: ["table1:field1", "table1:field2"]',
  `advanced_config` text COMMENT 'JSON: {"indexType": "HNSW", "metric": "COSINE"}',
  
  -- 调度配置
  `cron_expression` varchar(50) DEFAULT NULL,
  `is_cron_enabled` tinyint(1) DEFAULT '0',
  
  -- 状态控制
  `is_enabled` tinyint(1) DEFAULT '1',
  
  `created_by` varchar(50) DEFAULT NULL,
  `updated_by` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_collection` (`collection_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='向量集合配置表';
```

### 3.2 异步任务队列表 (xl_vector_tasks)
```sql
CREATE TABLE `xl_vector_tasks` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `vector_id` bigint(20) DEFAULT NULL COMMENT '关联的向量集合ID',
  `name` varchar(100) NOT NULL COMMENT '任务名称',
  `type` varchar(50) NOT NULL COMMENT 'build_index/sync/clean',
  `status` varchar(20) DEFAULT 'In Progress' COMMENT 'In Progress/Completed/Failed',
  `progress` int(3) DEFAULT '0' COMMENT '进度 0-100',
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `error_msg` text COMMENT '错误堆栈',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_vector_id` (`vector_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='后台任务队列表';
```

### 3.3 数据源连接配置表 (xl_db_connections)
**用途**: 存储向导中用到的源数据库连接信息（密码需加密）。
```sql
CREATE TABLE `xl_db_connections` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `type` varchar(20) NOT NULL COMMENT 'mysql/pgsql',
  `host` varchar(100) NOT NULL,
  `port` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL COMMENT '加密存储',
  `db_name` varchar(50) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据源连接表';
```

---

## 4. 系统管理模块

### 4.1 IP 安全策略表 (xl_ip_security)
```sql
CREATE TABLE `xl_ip_security` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `ip` varchar(50) NOT NULL,
  `location` varchar(100) DEFAULT NULL,
  `access_count` int(11) DEFAULT '0',
  `last_access` datetime DEFAULT NULL,
  `status` varchar(20) DEFAULT 'allowed' COMMENT 'allowed/blocked',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ip` (`ip`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='IP 黑白名单';
```

### 4.2 系统日志表 (xl_system_logs)
```sql
CREATE TABLE `xl_system_logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `action` varchar(100) NOT NULL COMMENT 'LOGIN/CREATE_VECTOR',
  `module` varchar(50) DEFAULT NULL,
  `type` varchar(20) NOT NULL COMMENT 'login/operation/error',
  `ip` varchar(50) DEFAULT NULL,
  `details` text COMMENT 'JSON详情',
  `status` varchar(20) DEFAULT 'success',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统操作日志';
```