# videoplat-meeting 模块

## 模块说明

会议管理模块，负责会议室的创建、加入、离开、结束等核心业务逻辑，以及 WebSocket 信令和用户在线状态管理。

## 主要功能

1. **会议室管理**
   - 创建会议室
   - 加入会议室
   - 离开会议室
   - 结束会议室
   - 获取会议室信息
   - 获取参与者列表

2. **Agora 集成**
   - 生成 Agora RTC Token
   - 提供 App ID 和频道信息

3. **WebSocket 信令**
   - WebSocket 连接管理
   - 用户在线状态管理
   - 实时消息推送

4. **在线状态管理**
   - 基于 Redis 的在线状态存储
   - 自动过期机制
   - 心跳保活

## 目录结构

```
src/main/java/com/videoplat/meeting/
├── controller/          # 控制器层
│   └── RoomController.java
├── service/            # 服务层
│   ├── RoomService.java
│   ├── AgoraService.java
│   └── OnlineStatusService.java
├── dto/                # 数据传输对象
│   ├── RoomDto.java
│   ├── CreateRoomRequest.java
│   ├── JoinRoomRequest.java
│   ├── ParticipantDto.java
│   └── AgoraTokenResponse.java
├── config/             # 配置类
│   └── WebSocketConfig.java
└── websocket/          # WebSocket 相关
    ├── WebSocketHandler.java
    └── WebSocketHandshakeInterceptor.java
```

## 依赖关系

- **videoplat-common**: 通用工具类和 DTO
- **videoplat-domain**: 领域实体和仓储接口
- **Spring Boot Web**: REST API 支持
- **Spring Security**: 安全认证
- **Spring Data Redis**: 在线状态存储
- **Spring WebSocket**: WebSocket 支持
- **Agora SDK**: RTC Token 生成

## API 端点

### 会议室管理

- `POST /api/rooms` - 创建会议室
- `GET /api/rooms/{roomId}` - 获取会议室信息
- `POST /api/rooms/{roomId}/join` - 加入会议室
- `POST /api/rooms/{roomId}/leave` - 离开会议室
- `DELETE /api/rooms/{roomId}` - 结束会议室
- `GET /api/rooms/{roomId}/participants` - 获取参与者列表
- `GET /api/rooms/{roomId}/agora-token` - 获取 Agora Token

### WebSocket 端点

- `ws://localhost:8080/ws/meeting?userId={userId}` - WebSocket 连接

## 配置项

```yaml
app:
  room:
    max-participants: 10          # 单个会议室最大参与人数
    max-concurrent-rooms: 10      # 最大并发会议室数量
  agora:
    app-id: ${AGORA_APP_ID}       # Agora App ID
    app-certificate: ${AGORA_APP_CERTIFICATE}  # Agora App Certificate
    token-expiration: 3600        # Token 有效期（秒）
```

## 使用说明

### 1. 创建会议室

```bash
POST /api/rooms
Content-Type: application/json
Authorization: Bearer {token}

{
  "roomName": "测试会议室",
  "password": "123456",
  "maxParticipants": 10
}
```

### 2. 加入会议室

```bash
POST /api/rooms/{roomId}/join
Content-Type: application/json
Authorization: Bearer {token}

{
  "password": "123456"
}
```

### 3. 获取 Agora Token

```bash
GET /api/rooms/{roomId}/agora-token
Authorization: Bearer {token}
```

### 4. 建立 WebSocket 连接

```javascript
const ws = new WebSocket('ws://localhost:8080/ws/meeting?userId=123');

ws.onopen = () => {
  console.log('WebSocket 连接已建立');
};

ws.onmessage = (event) => {
  console.log('收到消息:', event.data);
};

ws.onclose = () => {
  console.log('WebSocket 连接已关闭');
};
```

## 注意事项

1. **Agora Token 有效期**: 默认 1 小时，需要定期刷新
2. **WebSocket 连接**: 需要在查询参数中传递 userId
3. **在线状态**: 基于 Redis 存储，重启会清空
4. **会议室限制**: 最多 10 人，最多 10 个并发会议室
5. **密码加密**: 使用 BCrypt 加密存储

## 迁移说明

本模块代码从原 `backend/src/main/java/com/videoplat/` 迁移而来，主要变更：

1. 包名从 `com.videoplat` 更新为 `com.videoplat.meeting`
2. 实体类和仓储接口使用 `videoplat-domain` 模块
3. 通用 DTO 使用 `videoplat-common` 模块
4. 新增 WebSocket 支持和在线状态管理
5. 新增 Agora 配置和 Token 生成服务

## 后续优化

1. 添加会议室录制功能
2. 添加会议室邀请功能
3. 添加会议室权限管理
4. 优化 WebSocket 消息格式
5. 添加会议室统计功能
