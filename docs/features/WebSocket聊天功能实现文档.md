# WebSocket 聊天功能实现文档

## 概述

本文档说明如何使用 WebSocket 实现会议室实时聊天功能。

## 架构设计

### 后端架构

1. **WebSocket 配置** (`WebSocketConfig.java`)
   - 端点: `/ws/meeting`
   - 支持跨域连接
   - 需要用户 ID 参数

2. **WebSocket 处理器** (`WebSocketHandler.java`)
   - 管理 WebSocket 连接
   - 维护用户会话映射
   - 提供消息广播功能

3. **聊天服务** (`ChatService.java`)
   - 处理聊天消息的发送和存储
   - 使用 Redis 存储聊天历史（24小时过期）
   - 通过 WebSocket 广播消息

4. **聊天控制器** (`ChatController.java`)
   - REST API 端点
   - 发送消息: `POST /api/v1/chat/rooms/{roomId}/messages`
   - 获取历史: `GET /api/v1/chat/rooms/{roomId}/messages`
   - 清除历史: `DELETE /api/v1/chat/rooms/{roomId}/messages`

### 前端架构

1. **WebSocket 服务** (`websocket.js`)
   - 单例模式
   - 自动重连机制（最多5次）
   - 消息处理器注册系统

2. **聊天 API 服务** (`chat.js`)
   - HTTP API 调用封装
   - 发送消息、获取历史、清除历史

3. **Room 组件集成**
   - 连接 WebSocket
   - 监听实时消息
   - 显示聊天界面

## 使用流程

### 1. 用户加入会议室

```javascript
// 连接 WebSocket
await websocketService.connect(user.id)

// 加载聊天历史
const history = await getChatHistory(roomId)
setChatMessages(history)
```

### 2. 发送消息

```javascript
// 用户输入消息并点击发送
await sendChatMessage(roomId, content)

// 后端处理流程：
// 1. 验证用户身份
// 2. 创建消息对象
// 3. 存储到 Redis
// 4. 通过 WebSocket 广播给所有在线用户
```

### 3. 接收消息

```javascript
// 注册消息处理器
websocketService.onMessage('chat', (data) => {
  if (data.roomId === roomId) {
    setChatMessages(prev => [...prev, data])
  }
})
```

### 4. 离开会议室

```javascript
// 断开 WebSocket 连接
websocketService.disconnect()
```

## 消息格式

### 聊天消息 DTO

```json
{
  "id": 1234567890,
  "roomId": "room-123",
  "userId": 1,
  "username": "张三",
  "content": "大家好！",
  "type": "text",
  "timestamp": "2024-01-01T12:00:00"
}
```

### 系统消息

```json
{
  "id": 1234567891,
  "roomId": "room-123",
  "userId": 0,
  "username": "系统",
  "content": "张三加入了会议",
  "type": "system",
  "timestamp": "2024-01-01T12:00:00"
}
```

## 配置说明

### 后端配置

1. **WebSocket 端点**: `/ws/meeting?userId={userId}`
2. **Redis 配置**: 确保 Redis 服务正常运行
3. **CORS 配置**: 生产环境需要配置具体的允许域名

### 前端配置

1. **WebSocket URL**:
   - 开发环境: `ws://localhost:8080/ws/meeting`
   - 生产环境: `wss://your-domain.com/ws/meeting`

2. **环境变量** (`.env`):
   ```
   VITE_WS_URL=localhost:8080
   ```

## 功能特性

### 已实现

✅ 实时消息发送和接收
✅ 聊天历史存储（Redis，24小时）
✅ 消息持久化
✅ 自动重连机制
✅ 消息时间戳
✅ 区分自己和他人的消息
✅ 系统消息支持

### 待优化

⚠️ 会议室成员管理（目前广播给所有在线用户）
⚠️ 消息已读状态
⚠️ 消息撤回功能
⚠️ 文件/图片分享
⚠️ @提及功能
⚠️ 表情符号支持

## 测试步骤

### 1. 启动后端服务

```bash
cd backend
mvn spring-boot:run
```

### 2. 启动前端服务

```bash
cd frontend
npm run dev
```

### 3. 测试聊天功能

1. 打开两个浏览器窗口
2. 使用不同账号登录
3. 加入同一个会议室
4. 在一个窗口发送消息
5. 验证另一个窗口能实时收到消息

## 故障排查

### WebSocket 连接失败

1. 检查后端服务是否启动
2. 检查 WebSocket 端点是否正确
3. 检查用户 ID 是否正确传递
4. 查看浏览器控制台错误信息

### 消息发送失败

1. 检查用户是否已认证
2. 检查 Redis 服务是否正常
3. 查看后端日志

### 消息未实时更新

1. 检查 WebSocket 连接状态
2. 检查消息处理器是否正确注册
3. 检查 roomId 是否匹配

## 性能优化建议

1. **消息分页**: 聊天历史较多时实现分页加载
2. **虚拟滚动**: 消息列表使用虚拟滚动优化性能
3. **消息压缩**: WebSocket 消息使用压缩传输
4. **连接池**: 后端使用连接池管理 WebSocket 连接
5. **会议室隔离**: 只向会议室成员广播消息，而非所有在线用户

## 安全考虑

1. **认证**: WebSocket 握手时验证用户身份
2. **授权**: 验证用户是否有权限访问会议室
3. **消息过滤**: 过滤恶意内容和 XSS 攻击
4. **频率限制**: 限制消息发送频率，防止刷屏
5. **HTTPS/WSS**: 生产环境使用加密连接

## 相关文件

### 后端

- `WebSocketConfig.java` - WebSocket 配置
- `WebSocketHandler.java` - WebSocket 处理器
- `WebSocketHandshakeInterceptor.java` - 握手拦截器
- `ChatService.java` - 聊天服务
- `ChatController.java` - 聊天控制器
- `ChatMessageDTO.java` - 消息 DTO

### 前端

- `services/websocket.js` - WebSocket 服务
- `services/chat.js` - 聊天 API 服务
- `pages/Room.jsx` - 会议室页面（集成聊天）
- `pages/Room.css` - 聊天样式

## 更新日志

### 2024-01-01

- ✅ 实现 WebSocket 基础架构
- ✅ 实现聊天消息发送和接收
- ✅ 实现聊天历史存储
- ✅ 实现前端 WebSocket 服务
- ✅ 集成到会议室页面
