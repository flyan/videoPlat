# VideoPlat Admin 模块

## 模块概述

`videoplat-admin` 是 VideoPlat 视频会议系统的管理后台模块，提供用户管理、会议室管理、系统监控和操作日志等功能。

## 功能特性

### 1. 用户管理
- 查询所有用户（分页）
- 查询在线用户列表
- 查询用户详情
- 强制用户下线

### 2. 会议室管理
- 查询所有会议室（分页）
- 查询进行中的会议室
- 查询会议室详情（包括参与者列表）
- 强制关闭会议室

### 3. 系统监控
- 系统统计信息（用户数、会议室数、录制数等）
- 在线用户统计
- 今日新增数据统计
- 系统运行时长

### 4. 操作日志
- 查询管理员操作日志（分页）
- 自动记录关键操作（强制下线、关闭会议室等）

## 技术架构

### 依赖模块
- `videoplat-common` - 通用工具类和 DTO
- `videoplat-domain` - 实体类和 Repository
- `videoplat-meeting` - 会议室服务和在线状态管理

### 技术栈
- Spring Boot 3.x
- Spring AOP - 操作日志切面
- Spring Security - 权限控制
- Spring Data JPA - 数据访问
- Lombok - 简化代码
- SpringDoc OpenAPI - API 文档

## 项目结构

```
videoplat-admin/
├── src/main/java/com/videoplat/admin/
│   ├── controller/          # 控制器层
│   │   ├── AdminUserController.java           # 用户管理
│   │   ├── AdminRoomController.java           # 会议室管理
│   │   ├── AdminMonitorController.java        # 系统监控
│   │   └── AdminOperationLogController.java   # 操作日志
│   ├── service/             # 服务层
│   │   ├── AdminUserService.java              # 用户管理服务
│   │   ├── AdminRoomService.java              # 会议室管理服务
│   │   ├── AdminMonitorService.java           # 系统监控服务
│   │   └── AdminOperationLogService.java      # 操作日志服务
│   ├── dto/                 # 数据传输对象
│   │   ├── UserStatusDto.java                 # 用户状态信息
│   │   ├── RoomStatusDto.java                 # 会议室状态信息
│   │   ├── OnlineUserDto.java                 # 在线用户信息
│   │   ├── SystemStatisticsDto.java           # 系统统计信息
│   │   ├── OperationLogDto.java               # 操作日志
│   │   ├── ForceOfflineRequest.java           # 强制下线请求
│   │   └── CloseRoomRequest.java              # 关闭会议室请求
│   └── aspect/              # AOP 切面
│       └── AdminOperationAspect.java          # 操作日志切面
└── pom.xml
```

## API 端点

### 用户管理 API

#### 1. 获取所有用户（分页）
```
GET /api/v1/admin/users?page=0&size=20
```

#### 2. 获取在线用户
```
GET /api/v1/admin/users/online
```

#### 3. 获取用户详情
```
GET /api/v1/admin/users/{userId}
```

#### 4. 强制用户下线
```
POST /api/v1/admin/users/{userId}/force-offline
Content-Type: application/json

{
  "reason": "违反使用规定"
}
```

### 会议室管理 API

#### 1. 获取所有会议室（分页）
```
GET /api/v1/admin/rooms?page=0&size=20
```

#### 2. 获取进行中的会议室
```
GET /api/v1/admin/rooms/active
```

#### 3. 获取会议室详情
```
GET /api/v1/admin/rooms/{roomId}
```

#### 4. 强制关闭会议室
```
POST /api/v1/admin/rooms/{roomId}/force-close
Content-Type: application/json

{
  "reason": "会议内容违规"
}
```

### 系统监控 API

#### 1. 获取系统统计信息
```
GET /api/v1/admin/statistics
```

响应示例：
```json
{
  "success": true,
  "data": {
    "totalUsers": 1000,
    "registeredUsers": 800,
    "guestUsers": 200,
    "onlineUsers": 50,
    "totalRooms": 500,
    "activeRooms": 10,
    "endedRooms": 490,
    "totalRecordings": 300,
    "todayNewUsers": 20,
    "todayNewRooms": 15,
    "todayNewRecordings": 10,
    "systemUptimeSeconds": 86400,
    "maxConcurrentRooms": 10,
    "maxParticipantsPerRoom": 10
  }
}
```

### 操作日志 API

#### 1. 获取操作日志（分页）
```
GET /api/v1/admin/operation-logs?page=0&size=20
```

## 权限控制

所有管理后台接口都需要 `ADMIN` 角色权限：

```java
@PreAuthorize("hasRole('ADMIN')")
```

确保用户的 `role` 字段为 `UserRole.ADMIN` 才能访问这些接口。

## 操作日志记录

### 自动记录的操作
- 强制用户下线
- 强制关闭会议室
- 删除录制（待实现）

### 日志内容
- 管理员 ID 和用户名
- 操作类型
- 目标用户/会议室
- 操作详情
- IP 地址
- 操作时间

### AOP 切面
使用 `AdminOperationAspect` 自动记录所有管理员操作的访问日志，用于审计和追踪。

## 使用示例

### 1. 查询在线用户
```bash
curl -X GET "http://localhost:8080/api/v1/admin/users/online" \
  -H "Authorization: Bearer {admin_token}"
```

### 2. 强制用户下线
```bash
curl -X POST "http://localhost:8080/api/v1/admin/users/123/force-offline" \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{"reason": "违反使用规定"}'
```

### 3. 查询系统统计
```bash
curl -X GET "http://localhost:8080/api/v1/admin/statistics" \
  -H "Authorization: Bearer {admin_token}"
```

### 4. 强制关闭会议室
```bash
curl -X POST "http://localhost:8080/api/v1/admin/rooms/abc123/force-close" \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{"reason": "会议内容违规"}'
```

## 配置说明

在 `application.yml` 中配置：

```yaml
app:
  room:
    max-participants: 10          # 单个会议室最大人数
    max-concurrent-rooms: 10      # 最大并发会议室数
```

## 开发注意事项

1. **权限验证**：所有接口都需要 ADMIN 角色，确保在测试时使用管理员账号
2. **操作日志**：关键操作会自动记录到 `admin_operation_logs` 表
3. **事务管理**：强制下线和关闭会议室操作使用事务保证数据一致性
4. **IP 地址获取**：支持代理服务器场景，优先从 `X-Forwarded-For` 和 `X-Real-IP` 获取真实 IP
5. **分页查询**：默认页码从 0 开始，默认每页 20 条记录

## 测试

### 单元测试
```bash
mvn test -pl videoplat-admin
```

### 集成测试
确保以下服务正常运行：
- PostgreSQL 数据库
- Redis 服务
- 后端应用

## API 文档

启动应用后访问 Swagger UI：
```
http://localhost:8080/swagger-ui.html
```

查找 "管理员" 相关的 API 分组。

## 未来扩展

- [ ] 批量操作（批量下线、批量关闭会议室）
- [ ] 更详细的统计报表（按时间段统计）
- [ ] 实时监控面板（WebSocket 推送）
- [ ] 操作日志导出功能
- [ ] 用户行为分析
- [ ] 会议室使用情况分析

## 相关模块

- [videoplat-common](../videoplat-common/README.md) - 通用模块
- [videoplat-domain](../videoplat-domain/README.md) - 领域模型
- [videoplat-meeting](../videoplat-meeting/README.md) - 会议管理
- [videoplat-auth](../videoplat-auth/README.md) - 认证授权
