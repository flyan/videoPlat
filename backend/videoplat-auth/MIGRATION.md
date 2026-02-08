# 认证模块迁移总结

## 迁移完成时间
2026-02-08

## 迁移的文件

### DTO 文件 (4个)
从 `backend/src/main/java/com/videoplat/dto/` 迁移到 `backend/videoplat-auth/src/main/java/com/videoplat/auth/dto/`

1. **LoginRequest.java** - 注册用户登录请求
2. **GuestLoginRequest.java** - 游客登录请求
3. **AuthResponse.java** - 认证响应（包含用户信息和 JWT Token）
4. **UserDto.java** - 用户数据传输对象（新增 role 字段）

### Service 文件 (2个)
从 `backend/src/main/java/com/videoplat/service/` 迁移到 `backend/videoplat-auth/src/main/java/com/videoplat/auth/service/`

1. **AuthService.java** - 用户认证服务（处理登录、游客登录、获取当前用户）
2. **JwtService.java** - JWT Token 服务（生成、解析、验证 Token）

### Controller 文件 (2个)
从 `backend/src/main/java/com/videoplat/controller/` 迁移到 `backend/videoplat-auth/src/main/java/com/videoplat/auth/controller/`

1. **AuthController.java** - 认证控制器（/api/auth 路径）
2. **UserController.java** - 用户控制器（/api/users 路径）

### Security 文件 (1个)
从 `backend/src/main/java/com/videoplat/security/` 迁移到 `backend/videoplat-auth/src/main/java/com/videoplat/auth/security/`

1. **JwtAuthenticationFilter.java** - JWT 认证过滤器

### Config 文件 (1个)
从 `backend/src/main/java/com/videoplat/config/` 迁移到 `backend/videoplat-auth/src/main/java/com/videoplat/auth/config/`

1. **SecurityConfig.java** - Spring Security 安全配置

## 主要变更

### 1. 包名更新
- 从 `com.videoplat.*` 更新为 `com.videoplat.auth.*`
- 所有文件的 package 声明已更新

### 2. 导入语句更新
所有文件的导入语句已更新为使用新的模块包名：

- `com.videoplat.common.dto.ApiResponse` - 来自 videoplat-common 模块
- `com.videoplat.domain.entity.User` - 来自 videoplat-domain 模块
- `com.videoplat.domain.repository.UserRepository` - 来自 videoplat-domain 模块
- `com.videoplat.domain.enums.UserType` - 来自 videoplat-domain 模块
- `com.videoplat.domain.enums.UserRole` - 来自 videoplat-domain 模块

### 3. UserDto 增强
在 `UserDto.java` 中新增了 `role` 字段：
```java
private UserRole role;
```

### 4. AuthService 更新
在 `guestLogin()` 方法中，创建游客用户时设置默认角色：
```java
.role(UserRole.USER)
```

在 `convertToDto()` 方法中，添加了 role 字段的映射：
```java
.role(user.getRole())
```

## 依赖关系

videoplat-auth 模块依赖：
- **videoplat-common** - 提供 ApiResponse 等通用类
- **videoplat-domain** - 提供 User 实体、UserRepository、枚举类型
- **Spring Boot Web** - Web 功能
- **Spring Security** - 安全认证
- **JWT (jjwt)** - Token 生成和验证
- **Lombok** - 简化代码

## 配置要求

需要在 application.yml 中配置以下属性：
```yaml
app:
  jwt:
    secret: your-secret-key-here
    expiration: 86400000  # 24小时（毫秒）
```

## API 端点

### 认证相关 (/api/auth)
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/guest` - 游客登录

### 用户相关 (/api/users)
- `GET /api/users/me` - 获取当前用户信息（需要认证）

## 注意事项

1. **原文件保留**：原始文件仍在 `backend/src/main/java/com/videoplat/` 目录中，迁移后需要决定是否删除
2. **编译验证**：需要运行 `mvn clean compile` 验证所有文件能正确编译
3. **测试**：需要编写单元测试和集成测试
4. **文档更新**：需要更新 API 文档和 Swagger 配置

## 下一步

1. 在 videoplat-application 模块中配置组件扫描，包含 `com.videoplat.auth` 包
2. 删除或标记原始文件为已废弃
3. 运行测试验证功能正常
4. 更新前端代码中的 API 调用（如果有变化）
