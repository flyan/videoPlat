# 代码注释规范

## 总体原则

1. **简洁明了**：注释应该简短、清晰，避免冗余
2. **解释为什么**：注释应该解释"为什么"这样做，而不是"做了什么"（代码本身已经说明了做什么）
3. **及时更新**：代码修改时，相关注释必须同步更新
4. **使用中文**：本项目使用中文注释，便于团队协作
5. **避免废话**：不要写显而易见的注释，如 `// 设置用户名` 对应 `setUsername(name)`

## Java 后端注释规范

### 1. 类注释

使用 JavaDoc 格式，说明类的职责和用途。

```java
/**
 * 用户认证服务
 *
 * 负责用户登录、注册、JWT Token 生成等认证相关功能
 *
 * @author VideoPlat Team
 * @since 1.0
 */
public class AuthService {
    // ...
}
```

### 2. 方法注释

公共方法必须添加 JavaDoc 注释，说明功能、参数、返回值和可能的异常。

```java
/**
 * 用户登录
 *
 * @param username 用户名
 * @param password 密码（明文）
 * @return 包含 JWT Token 和用户信息的认证响应
 * @throws RuntimeException 当用户名或密码错误时
 */
public AuthResponse login(String username, String password) {
    // ...
}
```

私有方法可以使用简单的单行注释：

```java
// 验证密码是否匹配
private boolean validatePassword(String rawPassword, String encodedPassword) {
    // ...
}
```

### 3. 字段注释

重要字段添加说明：

```java
// JWT Token 有效期（毫秒）
private static final long JWT_EXPIRATION = 86400000; // 24小时

// Agora App ID，用于生成 RTC Token
@Value("${agora.app-id}")
private String appId;
```

### 4. 复杂逻辑注释

对于复杂的业务逻辑，添加分步说明：

```java
public void processRecording(String roomId) {
    // 1. 检查会议室是否存在
    Room room = roomRepository.findById(roomId)
        .orElseThrow(() -> new RuntimeException("会议室不存在"));

    // 2. 验证录制权限
    if (!room.isRecordingEnabled()) {
        throw new RuntimeException("该会议室未开启录制功能");
    }

    // 3. 启动录制任务
    startRecordingTask(room);
}
```

### 5. TODO 和 FIXME

使用标准标记：

```java
// TODO: 添加录制文件压缩功能
// FIXME: 修复并发情况下的 Token 刷新问题
```

## JavaScript/React 前端注释规范

### 1. 组件注释

使用 JSDoc 格式说明组件用途和 props：

```javascript
/**
 * 视频网格组件
 *
 * 以网格布局展示多个视频流
 *
 * @param {Object} props
 * @param {Array} props.participants - 参与者列表
 * @param {string} props.localUserId - 本地用户 ID
 * @param {Function} props.onVideoClick - 视频点击回调
 */
export default function VideoGrid({ participants, localUserId, onVideoClick }) {
    // ...
}
```

### 2. 函数注释

重要函数添加说明：

```javascript
/**
 * 初始化 Agora RTC 客户端
 *
 * @param {string} appId - Agora App ID
 * @param {string} channel - 频道名称
 * @returns {Promise<AgoraRTCClient>} RTC 客户端实例
 */
async function initAgoraClient(appId, channel) {
    // ...
}
```

简单函数可以使用单行注释：

```javascript
// 格式化时间戳为可读格式
const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('zh-CN');
};
```

### 3. Hook 注释

自定义 Hook 说明用途和返回值：

```javascript
/**
 * WebRTC 连接管理 Hook
 *
 * 管理 Agora RTC 客户端的生命周期，包括加入/离开频道、发布/订阅流
 *
 * @param {string} channelName - 频道名称
 * @param {string} token - RTC Token
 * @returns {Object} { client, localTracks, remoteTracks, joinChannel, leaveChannel }
 */
export function useWebRTC(channelName, token) {
    // ...
}
```

### 4. 状态管理注释

Zustand store 添加说明：

```javascript
/**
 * 认证状态管理
 *
 * 管理用户登录状态、Token 和用户信息
 */
export const useAuthStore = create((set) => ({
    // 当前登录用户
    user: null,

    // JWT Token
    token: localStorage.getItem('token'),

    // 登录操作
    login: (userData, token) => {
        localStorage.setItem('token', token);
        set({ user: userData, token });
    },

    // 登出操作
    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
    },
}));
```

### 5. 复杂逻辑注释

```javascript
useEffect(() => {
    // 监听远程用户加入事件
    client.on('user-published', async (user, mediaType) => {
        // 订阅远程用户的音视频流
        await client.subscribe(user, mediaType);

        // 如果是视频流，添加到远程轨道列表
        if (mediaType === 'video') {
            setRemoteTracks(prev => [...prev, { userId: user.uid, track: user.videoTrack }]);
        }
    });

    // 清理监听器
    return () => {
        client.removeAllListeners();
    };
}, [client]);
```

## 配置文件注释规范

### YAML 文件

```yaml
server:
  port: 8080  # 后端服务端口

spring:
  datasource:
    # Neon PostgreSQL 数据库连接
    url: ${DATABASE_URL}
    username: ${DATABASE_USERNAME}
    password: ${DATABASE_PASSWORD}

  jpa:
    # 自动更新数据库表结构（生产环境应改为 validate）
    hibernate:
      ddl-auto: update
```

### Docker Compose

```yaml
services:
  backend:
    # Spring Boot 后端服务
    build: ./backend
    ports:
      - "8080:8080"  # 映射端口
    environment:
      # 数据库连接配置
      DATABASE_URL: ${DATABASE_URL}
```

### JavaScript 配置

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,  // 开发服务器端口
    proxy: {
      // 代理 API 请求到后端
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
```

## 不需要注释的情况

1. **自解释的代码**：变量名、函数名已经清楚表达意图
2. **简单的 getter/setter**
3. **标准的 CRUD 操作**（除非有特殊逻辑）
4. **测试代码**（测试名称应该足够描述性）

## 示例对比

### ❌ 不好的注释

```java
// 获取用户
public User getUser(Long id) {
    // 从数据库查找用户
    return userRepository.findById(id).orElse(null);
}
```

### ✅ 好的注释

```java
/**
 * 根据 ID 获取用户信息
 *
 * @param id 用户 ID
 * @return 用户对象，如果不存在返回 null
 */
public User getUser(Long id) {
    return userRepository.findById(id).orElse(null);
}
```

或者，如果代码足够清晰，可以不加注释：

```java
public User getUserById(Long id) {
    return userRepository.findById(id).orElse(null);
}
```

## 注释检查清单

提交代码前，检查：

- [ ] 所有公共类都有类注释
- [ ] 所有公共方法都有方法注释
- [ ] 复杂逻辑有分步说明
- [ ] 魔法数字有解释
- [ ] 重要配置有说明
- [ ] 没有过时的注释
- [ ] 没有注释掉的代码（应该删除）
