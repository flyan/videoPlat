# videoplat-meeting 模块迁移完成报告

## 执行时间
2026-02-08

## 迁移状态
✅ 已完成

---

## 一、迁移文件清单

### 1. DTO 层（5个文件）

| 原路径 | 新路径 | 状态 |
|--------|--------|------|
| `backend/src/main/java/com/videoplat/dto/AgoraTokenResponse.java` | `videoplat-meeting/src/main/java/com/videoplat/meeting/dto/AgoraTokenResponse.java` | ✅ |
| `backend/src/main/java/com/videoplat/dto/ParticipantDto.java` | `videoplat-meeting/src/main/java/com/videoplat/meeting/dto/ParticipantDto.java` | ✅ |
| `backend/src/main/java/com/videoplat/dto/JoinRoomRequest.java` | `videoplat-meeting/src/main/java/com/videoplat/meeting/dto/JoinRoomRequest.java` | ✅ |
| `backend/src/main/java/com/videoplat/dto/CreateRoomRequest.java` | `videoplat-meeting/src/main/java/com/videoplat/meeting/dto/CreateRoomRequest.java` | ✅ |
| `backend/src/main/java/com/videoplat/dto/RoomDto.java` | `videoplat-meeting/src/main/java/com/videoplat/meeting/dto/RoomDto.java` | ✅ |

### 2. Service 层（2个文件）

| 原路径 | 新路径 | 状态 |
|--------|--------|------|
| `backend/src/main/java/com/videoplat/service/AgoraService.java` | `videoplat-meeting/src/main/java/com/videoplat/meeting/service/AgoraService.java` | ✅ |
| `backend/src/main/java/com/videoplat/service/RoomService.java` | `videoplat-meeting/src/main/java/com/videoplat/meeting/service/RoomService.java` | ✅ |

### 3. Controller 层（1个文件）

| 原路径 | 新路径 | 状态 |
|--------|--------|------|
| `backend/src/main/java/com/videoplat/controller/RoomController.java` | `videoplat-meeting/src/main/java/com/videoplat/meeting/controller/RoomController.java` | ✅ |

---

## 二、新增文件清单

### 1. WebSocket 层（2个文件）

| 文件路径 | 说明 | 状态 |
|---------|------|------|
| `videoplat-meeting/src/main/java/com/videoplat/meeting/websocket/WebSocketHandler.java` | WebSocket 连接和消息处理器 | ✅ |
| `videoplat-meeting/src/main/java/com/videoplat/meeting/websocket/WebSocketHandshakeInterceptor.java` | WebSocket 握手拦截器 | ✅ |

### 2. Service 层（1个文件）

| 文件路径 | 说明 | 状态 |
|---------|------|------|
| `videoplat-meeting/src/main/java/com/videoplat/meeting/service/OnlineStatusService.java` | 用户在线状态管理服务 | ✅ |

### 3. Config 层（1个文件）

| 文件路径 | 说明 | 状态 |
|---------|------|------|
| `videoplat-meeting/src/main/java/com/videoplat/meeting/config/WebSocketConfig.java` | WebSocket 配置类 | ✅ |

### 4. 文档文件（2个文件）

| 文件路径 | 说明 | 状态 |
|---------|------|------|
| `videoplat-meeting/README.md` | 模块说明文档 | ✅ |
| `videoplat-meeting/MIGRATION.md` | 迁移详细说明文档 | ✅ |

---

## 三、代码变更说明

### 3.1 包名变更

所有文件的包名从 `com.videoplat` 更新为 `com.videoplat.meeting`

### 3.2 导入语句更新

#### RoomService.java

**变更前：**
```java
import com.videoplat.dto.*;
import com.videoplat.model.Room;
import com.videoplat.model.RoomParticipant;
import com.videoplat.model.User;
import com.videoplat.repository.*;
```

**变更后：**
```java
import com.videoplat.meeting.dto.*;
import com.videoplat.domain.entity.Room;
import com.videoplat.domain.entity.RoomParticipant;
import com.videoplat.domain.entity.User;
import com.videoplat.domain.enums.RoomStatus;
import com.videoplat.domain.repository.*;
```

#### RoomController.java

**变更前：**
```java
import com.videoplat.dto.*;
import com.videoplat.service.RoomService;
```

**变更后：**
```java
import com.videoplat.common.dto.ApiResponse;
import com.videoplat.meeting.dto.*;
import com.videoplat.meeting.service.RoomService;
```

#### RoomDto.java

**变更前：**
```java
import com.videoplat.model.Room;
private Room.RoomStatus status;
```

**变更后：**
```java
import com.videoplat.domain.enums.RoomStatus;
private RoomStatus status;
```

### 3.3 依赖配置更新

在 `videoplat-meeting/pom.xml` 中添加了以下依赖：

- `videoplat-common` - 通用模块
- `videoplat-domain` - 领域模块
- `spring-boot-starter-web` - Web 支持
- `spring-boot-starter-security` - 安全支持
- `spring-boot-starter-data-redis` - Redis 支持
- `spring-boot-starter-validation` - 验证支持
- `spring-boot-starter-websocket` - WebSocket 支持
- `io.agora:authentication` - Agora SDK

---

## 四、新增功能说明

### 4.1 WebSocket 支持

**功能：**
- WebSocket 连接管理
- 用户在线状态实时更新
- 消息推送和广播

**端点：**
- `ws://localhost:8080/ws/meeting?userId={userId}`

**主要类：**
- `WebSocketHandler` - 处理连接、消息、断开事件
- `WebSocketHandshakeInterceptor` - 握手时提取用户信息
- `WebSocketConfig` - 配置 WebSocket 端点

### 4.2 在线状态管理

**功能：**
- 基于 Redis 的在线状态存储
- 自动过期机制（5分钟）
- 心跳保活
- 在线用户查询

**主要方法：**
- `setUserOnline(userId)` - 设置用户在线
- `setUserOffline(userId)` - 设置用户离线
- `isUserOnline(userId)` - 检查用户是否在线
- `getOnlineUsers()` - 获取所有在线用户
- `getOnlineUserCount()` - 获取在线用户数量
- `refreshUserOnlineStatus(userId)` - 刷新在线状态

---

## 五、目录结构

```
videoplat-meeting/
├── pom.xml                                    # Maven 配置文件
├── README.md                                  # 模块说明文档
├── MIGRATION.md                               # 迁移详细说明
└── src/main/java/com/videoplat/meeting/
    ├── controller/                            # 控制器层
    │   └── RoomController.java               # 会议室 REST API
    ├── service/                               # 服务层
    │   ├── RoomService.java                  # 会议室业务逻辑
    │   ├── AgoraService.java                 # Agora Token 生成
    │   └── OnlineStatusService.java          # 在线状态管理
    ├── dto/                                   # 数据传输对象
    │   ├── RoomDto.java                      # 会议室 DTO
    │   ├── CreateRoomRequest.java            # 创建会议室请求
    │   ├── JoinRoomRequest.java              # 加入会议室请求
    │   ├── ParticipantDto.java               # 参与者 DTO
    │   └── AgoraTokenResponse.java           # Agora Token 响应
    ├── config/                                # 配置类
    │   └── WebSocketConfig.java              # WebSocket 配置
    └── websocket/                             # WebSocket 相关
        ├── WebSocketHandler.java             # WebSocket 处理器
        └── WebSocketHandshakeInterceptor.java # 握手拦截器
```

---

## 六、API 端点清单

### 6.1 REST API

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/rooms` | 创建会议室 |
| GET | `/api/rooms/{roomId}` | 获取会议室信息 |
| POST | `/api/rooms/{roomId}/join` | 加入会议室 |
| POST | `/api/rooms/{roomId}/leave` | 离开会议室 |
| DELETE | `/api/rooms/{roomId}` | 结束会议室 |
| GET | `/api/rooms/{roomId}/participants` | 获取参与者列表 |
| GET | `/api/rooms/{roomId}/agora-token` | 获取 Agora Token |

### 6.2 WebSocket

| 端点 | 说明 |
|------|------|
| `ws://localhost:8080/ws/meeting?userId={userId}` | WebSocket 连接端点 |

---

## 七、配置要求

### 7.1 application.yml 配置

```yaml
app:
  room:
    max-participants: 10              # 单个会议室最大参与人数
    max-concurrent-rooms: 10          # 最大并发会议室数量
  agora:
    app-id: ${AGORA_APP_ID}           # Agora App ID
    app-certificate: ${AGORA_APP_CERTIFICATE}  # Agora App Certificate
    token-expiration: 3600            # Token 有效期（秒）

spring:
  redis:
    host: localhost                   # Redis 主机
    port: 6379                        # Redis 端口
```

### 7.2 环境变量

需要在 `.env` 文件中配置：

```env
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_app_certificate
```

---

## 八、后续工作

### 8.1 必须完成

- [ ] 在 `videoplat-application` 模块中集成 `videoplat-meeting`
- [ ] 更新 Security 配置，放行 WebSocket 端点
- [ ] 配置 Redis 连接
- [ ] 配置 Agora 参数

### 8.2 测试验证

- [ ] 测试创建会议室 API
- [ ] 测试加入会议室 API
- [ ] 测试获取 Agora Token API
- [ ] 测试 WebSocket 连接
- [ ] 测试在线状态管理
- [ ] 测试会议室结束流程

### 8.3 代码清理

- [ ] 删除原 `backend/src/main/java/com/videoplat/` 目录下的已迁移文件
- [ ] 更新其他模块中对旧包名的引用

---

## 九、注意事项

1. **原文件保留**：原 `backend/src/main/java/com/videoplat/` 目录下的文件暂时保留，待集成测试通过后再删除

2. **Redis 依赖**：`OnlineStatusService` 依赖 Redis，需要确保 Redis 服务可用

3. **WebSocket 认证**：当前 WebSocket 通过查询参数传递 userId，生产环境建议使用 JWT Token 认证

4. **Agora Token**：Token 有效期默认 1 小时，需要在客户端实现自动刷新机制

5. **在线状态过期**：在线状态默认 5 分钟过期，建议客户端定期发送心跳消息

6. **并发限制**：
   - 单个会议室最多 10 人
   - 最多 10 个并发会议室

---

## 十、文件统计

| 类型 | 数量 |
|------|------|
| 迁移的 Java 文件 | 8 个 |
| 新增的 Java 文件 | 4 个 |
| 配置文件 | 1 个 (pom.xml) |
| 文档文件 | 2 个 (README.md, MIGRATION.md) |
| **总计** | **15 个文件** |

---

## 十一、完成确认

✅ 所有会议室相关代码已成功迁移到 `videoplat-meeting` 模块
✅ 包名已更新为 `com.videoplat.meeting`
✅ 导入语句已更新为使用新的模块包名
✅ WebSocket 支持已添加
✅ 在线状态管理服务已创建
✅ 依赖配置已更新
✅ 文档已创建

**迁移工作已全部完成！**
