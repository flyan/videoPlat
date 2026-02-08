# videoplat-meeting 快速参考

## 快速开始

### 1. 添加依赖

在 `videoplat-application` 的 `pom.xml` 中添加：

```xml
<dependency>
    <groupId>com.videoplat</groupId>
    <artifactId>videoplat-meeting</artifactId>
    <version>${project.version}</version>
</dependency>
```

### 2. 配置文件

在 `application.yml` 中添加：

```yaml
app:
  room:
    max-participants: 10
    max-concurrent-rooms: 10
  agora:
    app-id: ${AGORA_APP_ID}
    app-certificate: ${AGORA_APP_CERTIFICATE}
    token-expiration: 3600
```

### 3. 启用组件扫描

在主应用类上添加：

```java
@SpringBootApplication(scanBasePackages = {
    "com.videoplat.application",
    "com.videoplat.meeting",
    "com.videoplat.auth",
    "com.videoplat.common"
})
public class VideoplatApplication {
    // ...
}
```

---

## API 使用示例

### 创建会议室

```bash
POST /api/rooms
Authorization: Bearer {token}
Content-Type: application/json

{
  "roomName": "技术讨论会",
  "password": "123456",
  "maxParticipants": 10
}
```

**响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "roomId": "a1b2c3d4",
    "roomName": "技术讨论会",
    "creatorId": 1,
    "maxParticipants": 10,
    "status": "ACTIVE",
    "currentParticipants": 1,
    "hasPassword": true,
    "createdAt": "2026-02-08T10:00:00"
  }
}
```

### 加入会议室

```bash
POST /api/rooms/a1b2c3d4/join
Authorization: Bearer {token}
Content-Type: application/json

{
  "password": "123456"
}
```

### 获取 Agora Token

```bash
GET /api/rooms/a1b2c3d4/agora-token
Authorization: Bearer {token}
```

**响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "006abc...",
    "appId": "your_app_id",
    "channelName": "a1b2c3d4",
    "uid": 1,
    "expirationTime": 3600
  }
}
```

### 获取参与者列表

```bash
GET /api/rooms/a1b2c3d4/participants
Authorization: Bearer {token}
```

### 离开会议室

```bash
POST /api/rooms/a1b2c3d4/leave
Authorization: Bearer {token}
```

### 结束会议室（仅主持人）

```bash
DELETE /api/rooms/a1b2c3d4
Authorization: Bearer {token}
```

---

## WebSocket 使用示例

### JavaScript 客户端

```javascript
// 建立 WebSocket 连接
const userId = 123;
const ws = new WebSocket(`ws://localhost:8080/ws/meeting?userId=${userId}`);

// 连接成功
ws.onopen = () => {
  console.log('WebSocket 连接已建立');
};

// 接收消息
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('收到消息:', message);

  // 处理不同类型的消息
  switch (message.type) {
    case 'USER_JOINED':
      console.log('用户加入:', message.userId);
      break;
    case 'USER_LEFT':
      console.log('用户离开:', message.userId);
      break;
    case 'ROOM_ENDED':
      console.log('会议室已结束');
      break;
  }
};

// 连接关闭
ws.onclose = () => {
  console.log('WebSocket 连接已关闭');
};

// 连接错误
ws.onerror = (error) => {
  console.error('WebSocket 错误:', error);
};

// 发送心跳（每 30 秒）
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'HEARTBEAT' }));
  }
}, 30000);
```

### React 客户端

```javascript
import { useEffect, useRef } from 'react';

function useWebSocket(userId) {
  const ws = useRef(null);

  useEffect(() => {
    // 建立连接
    ws.current = new WebSocket(`ws://localhost:8080/ws/meeting?userId=${userId}`);

    ws.current.onopen = () => {
      console.log('WebSocket 连接已建立');
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      // 处理消息
    };

    // 心跳
    const heartbeat = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: 'HEARTBEAT' }));
      }
    }, 30000);

    // 清理
    return () => {
      clearInterval(heartbeat);
      ws.current?.close();
    };
  }, [userId]);

  return ws.current;
}
```

---

## 服务使用示例

### 在其他服务中使用 RoomService

```java
@Service
@RequiredArgsConstructor
public class MyService {

    private final RoomService roomService;

    public void doSomething() {
        // 创建会议室
        CreateRoomRequest request = new CreateRoomRequest();
        request.setRoomName("测试会议室");
        request.setMaxParticipants(10);
        RoomDto room = roomService.createRoom(request, userId);

        // 获取会议室信息
        RoomDto roomInfo = roomService.getRoomInfo(roomId);

        // 获取参与者列表
        List<ParticipantDto> participants = roomService.getParticipants(roomId);

        // 获取 Agora Token
        AgoraTokenResponse token = roomService.getAgoraToken(roomId, userId);
    }
}
```

### 在其他服务中使用 OnlineStatusService

```java
@Service
@RequiredArgsConstructor
public class MyService {

    private final OnlineStatusService onlineStatusService;

    public void checkUserStatus() {
        // 检查用户是否在线
        boolean isOnline = onlineStatusService.isUserOnline(userId);

        // 获取所有在线用户
        Set<String> onlineUsers = onlineStatusService.getOnlineUsers();

        // 获取在线用户数量
        long count = onlineStatusService.getOnlineUserCount();

        // 刷新用户在线状态（心跳）
        onlineStatusService.refreshUserOnlineStatus(userId);
    }
}
```

### 在其他服务中使用 WebSocketHandler

```java
@Service
@RequiredArgsConstructor
public class MyService {

    private final WebSocketHandler webSocketHandler;

    public void sendNotification() {
        // 向指定用户发送消息
        String message = "{\"type\":\"NOTIFICATION\",\"content\":\"您有新消息\"}";
        webSocketHandler.sendMessageToUser(userId, message);

        // 广播消息给所有在线用户
        String broadcast = "{\"type\":\"ANNOUNCEMENT\",\"content\":\"系统维护通知\"}";
        webSocketHandler.broadcastMessage(broadcast);
    }
}
```

---

## 常见问题

### Q1: WebSocket 连接失败？

**A:** 检查以下几点：
1. 确保 WebSocket 端点已在 Security 配置中放行
2. 确保 URL 中包含 `userId` 参数
3. 检查防火墙和代理设置

### Q2: 在线状态不准确？

**A:**
1. 确保 Redis 服务正常运行
2. 客户端需要定期发送心跳消息（建议 30 秒）
3. 检查 Redis 连接配置

### Q3: Agora Token 无效？

**A:**
1. 检查 `AGORA_APP_ID` 和 `AGORA_APP_CERTIFICATE` 配置
2. Token 有效期为 1 小时，需要定期刷新
3. 确保 channelName 和 uid 与客户端一致

### Q4: 会议室人数已满？

**A:**
1. 默认最大人数为 10 人，可在配置中修改
2. 检查是否有用户未正常离开（可能需要清理）

### Q5: 如何自定义 WebSocket 消息格式？

**A:** 在 `WebSocketHandler.handleTextMessage()` 方法中处理自定义消息类型

---

## 性能优化建议

### 1. Redis 连接池配置

```yaml
spring:
  redis:
    lettuce:
      pool:
        max-active: 8
        max-idle: 8
        min-idle: 0
        max-wait: -1ms
```

### 2. WebSocket 连接数限制

在 `WebSocketConfig` 中配置：

```java
@Override
public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
    registry.addHandler(webSocketHandler, "/ws/meeting")
            .addInterceptors(handshakeInterceptor)
            .setAllowedOrigins("*")
            .setHandshakeHandler(new DefaultHandshakeHandler() {
                @Override
                protected Principal determineUser(ServerHttpRequest request,
                                                 WebSocketHandler wsHandler,
                                                 Map<String, Object> attributes) {
                    // 自定义用户认证逻辑
                    return super.determineUser(request, wsHandler, attributes);
                }
            });
}
```

### 3. 会议室缓存

考虑使用 Redis 缓存活跃会议室信息，减少数据库查询。

---

## 安全建议

### 1. WebSocket 认证

生产环境建议使用 JWT Token 认证：

```java
@Override
public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Map<String, Object> attributes) {
    String token = extractToken(request);
    if (token != null && jwtService.validateToken(token)) {
        Long userId = jwtService.extractUserId(token);
        attributes.put("userId", userId);
        return true;
    }
    return false;
}
```

### 2. 会议室密码强度

建议在前端添加密码强度验证。

### 3. 限流

建议对 API 端点添加限流保护：

```java
@RateLimiter(name = "createRoom", fallbackMethod = "createRoomFallback")
public RoomDto createRoom(CreateRoomRequest request, Long userId) {
    // ...
}
```

---

## 监控指标

建议监控以下指标：

1. **会议室指标**
   - 活跃会议室数量
   - 总参与人数
   - 平均会议时长

2. **WebSocket 指标**
   - 活跃连接数
   - 消息发送/接收速率
   - 连接错误率

3. **在线状态指标**
   - 在线用户数量
   - Redis 命中率
   - 状态更新延迟

---

## 相关文档

- [README.md](./README.md) - 模块详细说明
- [MIGRATION.md](./MIGRATION.md) - 迁移详细说明
- [MIGRATION_REPORT.md](./MIGRATION_REPORT.md) - 迁移完成报告
