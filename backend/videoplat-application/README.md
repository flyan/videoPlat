# videoplat-application 模块

## 模块说明
应用启动模块，整合所有子模块，提供 Spring Boot 主启动类和全局配置。

## 目录结构
```
videoplat-application/
├── src/main/java/com/videoplat/
│   ├── VideoplatApplication.java          # Spring Boot 主启动类
│   ├── config/                            # 配置类
│   │   ├── CorsConfig.java               # CORS 跨域配置
│   │   ├── DataInitializer.java          # 数据初始化（创建默认账号）
│   │   ├── OpenApiConfig.java            # Swagger API 文档配置
│   │   └── RedisConfig.java              # Redis 序列化配置
│   └── exception/                         # 异常处理
│       └── GlobalExceptionHandler.java    # 全局异常处理器
└── src/main/resources/
    ├── application.yml                    # 主配置文件
    ├── application-dev.yml                # 开发环境配置
    └── application-prod.yml               # 生产环境配置
```

## 核心功能

### 1. 主启动类 (VideoplatApplication)
- 扫描所有子模块的组件
- 启用 JPA Repository
- 配置实体扫描路径

### 2. 配置类

#### CorsConfig
- 配置跨域访问策略
- 允许前端应用访问后端 API

#### DataInitializer
- 应用启动时自动创建默认账号
- 默认管理员账号：`admin / admin123` (角色：ADMIN)
- 测试用户账号：`user1-user9 / user123` (角色：USER)

#### OpenApiConfig
- 配置 Swagger API 文档
- 配置 JWT Bearer Token 认证

#### RedisConfig
- 配置 Redis 序列化方式
- Key 使用 String 序列化
- Value 使用 JSON 序列化

### 3. 全局异常处理 (GlobalExceptionHandler)
- 统一处理业务异常
- 统一处理参数验证异常
- 统一处理未捕获异常
- 返回标准格式的错误响应

## 配置文件说明

### application.yml (主配置)
- 数据库连接配置
- Redis 连接配置
- JPA/Hibernate 配置
- 文件上传配置
- JWT 认证配置
- Agora RTC 配置
- 会议录制配置
- Swagger 文档配置
- 日志配置

### application-dev.yml (开发环境)
- 启用 SQL 日志打印
- 详细的调试日志
- 自动更新数据库表结构

### application-prod.yml (生产环境)
- 关闭 SQL 日志
- 降低日志级别
- 仅验证数据库表结构

## 依赖的模块
- videoplat-common：通用工具和 DTO
- videoplat-domain：领域模型和数据访问
- videoplat-auth：认证授权模块
- videoplat-meeting：会议管理模块
- videoplat-admin：管理后台模块
- videoplat-video-review：视频回放模块

## 启动方式

### 开发环境
```bash
cd backend/videoplat-application
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### 生产环境
```bash
cd backend/videoplat-application
mvn clean package
java -jar target/videoplat-application-0.1.0.jar --spring.profiles.active=prod
```

## 环境变量配置
在启动前需要配置以下环境变量（或在 `.env` 文件中配置）：

```bash
# 数据库配置
DATABASE_URL=jdbc:postgresql://localhost:5432/videoplat
DB_USERNAME=postgres
DB_PASSWORD=postgres

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT 配置
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=86400000

# Agora 配置
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-app-certificate

# 录制配置
RECORDING_STORAGE_PATH=/app/recordings
RECORDING_MAX_SIZE_GB=100

# 服务器配置
APP_PORT=8080
```

## 访问地址
- 应用主页：http://localhost:8080
- Swagger UI：http://localhost:8080/swagger-ui.html
- API 文档：http://localhost:8080/api-docs
- 健康检查：http://localhost:8080/actuator/health

## 默认账号
应用启动后会自动创建以下账号：

| 用户名 | 密码 | 角色 | 说明 |
|--------|------|------|------|
| admin | admin123 | ADMIN | 系统管理员 |
| user1-user9 | user123 | USER | 测试用户 |

## 注意事项
1. 生产环境必须修改 JWT_SECRET
2. 生产环境建议使用 `ddl-auto: validate` 避免自动修改表结构
3. 确保 PostgreSQL 和 Redis 服务已启动
4. 确保已配置 Agora APP_ID 和 APP_CERTIFICATE
5. 录制文件存储路径需要有足够的磁盘空间
