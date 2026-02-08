# VideoPlat 快速启动指南

## 🎉 后端代码已完成！

后端所有核心代码已经实现完毕，现在可以进行测试了。

## 📋 前置准备

### 1. 安装必要软件
- ✅ Java 17+
- ✅ Maven 3.6+
- ✅ Node.js 18+
- ✅ PostgreSQL 或 Neon 云数据库账号
- ⚠️ Redis（可选，用于会话管理）
- ⚠️ Agora 账号（用于视频通话）

### 2. 注册 Agora 账号
1. 访问 https://www.agora.io/cn/
2. 注册账号并登录
3. 创建项目，获取 **App ID**
4. （可选）启用 App Certificate 以生成 Token

### 3. 配置数据库

#### 选项 A: 使用 Neon 云数据库（推荐）
1. 访问 https://neon.tech/
2. 注册并创建数据库
3. 获取连接字符串（格式：`postgresql://user:password@host:port/database`）

#### 选项 B: 使用本地 PostgreSQL
```bash
# 创建数据库
createdb videoplat

# 或使用 psql
psql -U postgres
CREATE DATABASE videoplat;
```

## 🚀 启动步骤

### 方式一：本地开发模式（推荐用于测试）

#### 1. 配置环境变量

创建 `.env` 文件（复制 `.env.example`）：
```bash
cp .env.example .env
```

编辑 `.env` 文件，填入以下信息：
```env
# Agora 配置
VITE_AGORA_APP_ID=你的_Agora_App_ID
AGORA_APP_ID=你的_Agora_App_ID
AGORA_APP_CERTIFICATE=你的_Agora_App_Certificate（可选）

# 数据库配置
DATABASE_URL=postgresql://username:password@host:port/videoplat

# JWT 配置（可以使用默认值）
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRATION=86400000
```

#### 2. 启动后端

```bash
cd backend

# 方式 A: 使用 Maven
./mvnw spring-boot:run

# 方式 B: 使用 IDE
# 在 IntelliJ IDEA 或 Eclipse 中打开项目，运行 VideoplatApplication.java
```

后端启动成功后，访问：
- API 地址: http://localhost:8080/api
- Swagger 文档: http://localhost:8080/swagger-ui.html

#### 3. 启动前端

```bash
cd frontend

# 安装依赖（如果还没安装）
npm install

# 启动开发服务器
npm run dev
```

前端启动成功后，访问：
- 前端地址: http://localhost:3000

### 方式二：Docker Compose 部署

```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 2. 启动所有服务
docker-compose up -d

# 3. 查看日志
docker-compose logs -f

# 4. 停止服务
docker-compose down
```

## 🧪 测试功能

### 1. 测试用户登录

系统已自动创建以下测试用户：

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |
| user1 | user123 | 普通用户 |
| user2 | user123 | 普通用户 |

### 2. 测试流程

#### A. 用户登录测试
1. 打开浏览器访问 http://localhost:3000
2. 选择"用户登录"标签
3. 输入用户名 `admin` 和密码 `admin123`
4. 点击"登录"

#### B. 游客登录测试
1. 选择"游客访问"标签
2. 输入昵称（例如：测试游客）
3. 点击"进入"

#### C. 创建会议室测试
1. 登录后，点击"创建会议"卡片
2. 输入会议室名称（例如：测试会议）
3. （可选）设置会议密码
4. 点击"创建并加入"

#### D. 加入会议室测试
1. 在另一个浏览器窗口登录另一个用户
2. 点击"加入会议"卡片
3. 输入会议室 ID（从创建会议的页面复制）
4. 如果设置了密码，输入密码
5. 点击"加入会议"

#### E. 视频通话测试
1. 允许浏览器访问摄像头和麦克风
2. 测试以下功能：
   - 静音/取消静音
   - 开启/关闭摄像头
   - 屏幕共享
   - 查看参与者列表

#### F. 录制功能测试（仅主持人）
1. 在会议室中，点击录制按钮
2. 开始录制后，会显示红色录制指示器
3. 进行一段时间的会议
4. 点击停止录制按钮
5. 返回首页，点击"录制记录"
6. 查看录制列表，播放录制视频

## 📊 API 测试

### 使用 Swagger UI
访问 http://localhost:8080/swagger-ui.html 查看和测试所有 API。

### 使用 curl 测试

#### 1. 用户登录
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

#### 2. 游客登录
```bash
curl -X POST http://localhost:8080/api/auth/guest \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "测试游客"
  }'
```

#### 3. 创建会议室
```bash
curl -X POST http://localhost:8080/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "roomName": "测试会议",
    "maxParticipants": 10
  }'
```

## 🐛 常见问题

### 1. 后端启动失败

**问题**: 数据库连接失败
```
Error: Connection refused
```

**解决方案**:
- 检查数据库是否运行
- 检查 `application.yml` 中的数据库配置
- 确认数据库用户名和密码正确

**问题**: 端口被占用
```
Error: Port 8080 is already in use
```

**解决方案**:
- 修改 `application.yml` 中的 `server.port`
- 或停止占用 8080 端口的程序

### 2. 前端启动失败

**问题**: 依赖安装失败
```
npm ERR! code ERESOLVE
```

**解决方案**:
```bash
npm install --legacy-peer-deps
```

**问题**: Agora SDK 错误
```
Error: Invalid App ID
```

**解决方案**:
- 检查 `.env` 文件中的 `VITE_AGORA_APP_ID`
- 确认 Agora App ID 正确

### 3. 视频通话问题

**问题**: 无法看到视频
- 检查浏览器是否允许摄像头权限
- 检查 Agora App ID 是否正确
- 打开浏览器控制台查看错误信息

**问题**: 无法连接到其他用户
- 检查网络连接
- 确认 Agora 服务正常
- 检查防火墙设置

### 4. 录制功能问题

**问题**: 录制文件不存在
- 当前版本录制功能需要集成 Agora 云端录制 API
- 录制文件路径：`/app/recordings/` 或配置的路径

## 📝 开发建议

### 1. 开发环境配置
- 使用 IntelliJ IDEA 或 VS Code
- 安装 Lombok 插件（后端）
- 安装 ESLint 和 Prettier 插件（前端）

### 2. 代码规范
- 后端：遵循 Java 代码规范
- 前端：使用 ESLint 和 Prettier 格式化代码

### 3. Git 提交规范
```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

## 🔧 下一步优化

### 功能完善
- [ ] 集成 Agora 云端录制 API
- [ ] 实现 WebSocket 实时通知
- [ ] 添加会议聊天功能
- [ ] 实现虚拟背景
- [ ] 添加会议白板

### 性能优化
- [ ] 添加 Redis 缓存
- [ ] 优化数据库查询
- [ ] 实现 CDN 加速
- [ ] 添加日志监控

### 安全加固
- [ ] 实现 HTTPS
- [ ] 添加请求限流
- [ ] 实现敏感信息加密
- [ ] 添加安全审计日志

## 📞 获取帮助

如果遇到问题：
1. 查看日志文件：`backend/logs/videoplat.log`
2. 查看浏览器控制台错误
3. 查看 Swagger API 文档
4. 提交 Issue

## 🎊 恭喜！

您已经成功搭建了 VideoPlat 视频会议平台！现在可以开始测试和开发了。
