# 会议室模块迁移总结

## 迁移完成时间
2026-02-08

## 迁移内容

### 1. DTO 层（5个文件）

从 `backend/src/main/java/com/videoplat/dto/` 迁移到 `videoplat-meeting/src/main/java/com/videoplat/meeting/dto/`

- ✅ **AgoraTokenResponse.java** - Agora Token 响应对象
- ✅ **ParticipantDto.java** - 参与者数据传输对象
- ✅ **JoinRoomRequest.java** - 加入会议室请求
- ✅ **CreateRoomRequest.java** - 创建会议室请求
- ✅ **RoomDto.java** - 会议室数据传输对象（已更新使用 `com.videoplat.domain.enums.RoomStatus`）

### 2. Service 层（3个文件）

从 `backend/src/main/java/com/videoplat/service/` 迁移到 `videoplat-meeting/src/main/java/com/videoplat/meeting/service/`

- ✅ **AgoraService.java** - Agora Token 生成服务
- ✅ **RoomService.java** - 会议室业务逻辑服务（已更新所有导入）
- ✅ **OnlineStatusService.java** - 在线状态管理服务（新增）

### 3. Controller 层（1个文件）

从 `backend/src/main/java/com/videoplat/controller/` 迁移到 `videoplat-meeting/src/main/java/com/videoplat/meeting/controller/`

- ✅ **RoomController.java** - 会议室 REST API 控制器（已更新使用 `com.videoplat.common.dto.ApiResponse`）

### 4. WebSocket 层（3个文件 - 新增）

新增到 `videoplat-meeting/src/main/java/com/videoplat/meeting/websocket/`

- ✅ **WebSocketHandler.java** - WebSocket 连接和消息处理
- ✅ **WebSocketHandshakeInterceptor.java** - WebSocket 握手拦截器
- ✅ **WebSocketConfig.java** - WebSocket 配置（位于 config 包）

## 包名变更

所有文件的包名从 `com.videoplat` 更新为 `com.videoplat.meeting`

## 导入语句更新

### RoomService.java 主要变更：

**原导入：**
```java
import com.videoplat.dto.*;
import com.videoplat.model.Room;
import com.videoplat.model.RoomParticipant;
import com.videoplat.model.User;
import com.videoplat.repository.RoomParticipantRepository;
import com.videoplat.repository.RoomRepository;
import com.videoplat.repository.UserRepository;
```

**新导入：**
```java
import com.videoplat.meeting.dto.*;
import com.videoplat.domain.entity.Room;
import com.videoplat.domain.entity.RoomParticipant;
import com.videoplat.domain.entity.User;
import com.videoplat.domain.enums.RoomStatus;
import com.videoplat.domain.repository.RoomParticipantRepository;
import com.videoplat.domain.repository.RoomRepository;
import com.videoplat.domain.repository.UserRepository;
```

### RoomController.java 主要变更：

**原导入：**
```java
import com.videoplat.dto.*;
import com.videoplat.service.RoomService;
```

**新导入：**
```java
import com.videoplat.common.dto.ApiResponse;
import com.videoplat.meeting.dto.*;
import com.videoplat.meeting.service.RoomService;
```

### RoomDto.java 主要变更：

**原导入：**
```java
import com.videoplat.model.Room;
// 使用 Room.RoomStatus
```

**新导入：**
```java
import com.videoplat.domain.enums.RoomStatus;
// 直接使用 RoomStatus
```

## 依赖配置更新

在 `videoplat-meeting/pom.xml` 中添加了以下依赖：

```xml
<!-- 内部模块依赖 -->
<dependency>
    <groupId>com.videoplat</groupId>
    <artifactId>videoplat-common</artifactId>
</dependency>
<dependency>
    <groupId>com.videoplat</groupId>
    <artifactId>videoplat-domain</artifactId>
</dependency>

<!-- Spring 依赖 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>

<!-- Agora SDK -->
<dependency>
    <groupId>io.agora</groupId>
    <artifactId>authentication</artifactId>
</dependency>
```

## 新增功能

### 1. WebSocket 支持

- **WebSocketHandler**: 处理 WebSocket 连接、消息和断开事件
- **WebSocketHandshakeInterceptor**: 在握手阶段提取用户信息
- **WebSocketConfig**: 配置 WebSocket 端点 `/ws/meeting`

### 2. 在线状态管理

- **OnlineStatusService**: 基于 Redis 的用户在线状态管理
  - `setUserOnline(userId)` - 设置用户在线
  - `setUserOffline(userId)` - 设置用户离线
  - `isUserOnline(userId)` - 检查用户是否在线
  - `getOnlineUsers()` - 获取所有在线用户
  - `getOnlineUserCount()` - 获取在线用户数量
  - `refreshUserOnlineStatus(userId)` - 刷新在线状态（心跳）

## 文件结构

```
videoplat-meeting/
├── pom.xml
├── README.md
└── src/main/java/com/videoplat/meeting/
    ├── controller/
    │   └── RoomController.java
    ├── service/
    │   ├── RoomService.java
    │   ├── AgoraService.java
    │   └── OnlineStatusService.java
    ├── dto/
    │   ├── RoomDto.java
    │   ├── CreateRoomRequest.java
    │   ├── JoinRoomRequest.java
    │   ├── ParticipantDto.java
    │   └── AgoraTokenResponse.java
    ├── config/
    │   └── WebSocketConfig.java
    └── websocket/
        ├── WebSocketHandler.java
        └── WebSocketHandshakeInterceptor.java
```

## 编译验证

所有文件已创建完成，建议执行以下命令验证编译：

```bash
cd backend/videoplat-meeting
mvn clean compile
```

## 后续工作

1. ✅ 迁移完成所有会议室相关代码
2. ✅ 创建 WebSocket 支持
3. ✅ 创建在线状态管理服务
4. ⏳ 在 videoplat-application 模块中集成 videoplat-meeting
5. ⏳ 更新原有代码的导入路径
6. ⏳ 测试所有 API 端点
7. ⏳ 测试 WebSocket 连接

## 注意事项

1. **原文件保留**: 原 `backend/src/main/java/com/videoplat/` 目录下的文件暂时保留，待集成测试通过后再删除
2. **配置文件**: 需要在 application.yml 中配置 Agora 相关参数
3. **Redis 依赖**: OnlineStatusService 依赖 Redis，需要确保 Redis 服务可用
4. **WebSocket 端点**: WebSocket 端点为 `/ws/meeting?userId={userId}`
5. **安全配置**: 需要在 Security 配置中放行 WebSocket 端点

## 配置示例

```yaml
app:
  room:
    max-participants: 10
    max-concurrent-rooms: 10
  agora:
    app-id: ${AGORA_APP_ID}
    app-certificate: ${AGORA_APP_CERTIFICATE}
    token-expiration: 3600

spring:
  redis:
    host: localhost
    port: 6379
```
