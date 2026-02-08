# VideoPlat 项目上下文

## 沟通语言
**使用中文沟通**

## 项目概述
VideoPlat 是一个类似 Zoom 的在线视频会议系统，支持多人视频通话、会议录制、回放等核心功能。

## 当前阶段
Beta 测试版本

## 开发环境
- Node.js: 18+
- Java: 17
- Maven: 3.8+
- Docker & Docker Compose
- 推荐 IDE: VS Code (前端) / IntelliJ IDEA (后端)

## 快速启动

### 前端开发
```bash
cd frontend
npm install
npm run dev  # 启动开发服务器 http://localhost:5173
```

### 后端开发
```bash
cd backend
mvn spring-boot:run  # 启动后端服务 http://localhost:8080
```

### Docker 完整环境
```bash
docker-compose up -d  # 启动所有服务
docker-compose logs -f  # 查看日志
docker-compose down  # 停止所有服务
```

## 环境配置

### 必需配置
1. 复制环境变量模板: `cp .env.example .env`
2. 配置 Agora SDK:
   - 注册 Agora 账号: https://console.agora.io
   - 获取 APP_ID 和 APP_CERTIFICATE
   - 填入 `.env` 文件
3. 配置数据库:
   - 使用 Neon PostgreSQL 或本地 PostgreSQL
   - 更新 `.env` 中的 DATABASE_URL
4. Redis 默认配置可直接使用 (localhost:6379)

## 技术栈

### 前端
- React 18+
- Redux Toolkit / Zustand (状态管理)
- Ant Design (UI组件库)
- Agora SDK (WebRTC)
- Video.js (录制回放)
- Vite (构建工具)
- Tailwind CSS + CSS Modules

### 后端
- Spring Boot 3.x
- Spring Security + JWT
- Spring Data JPA
- SpringDoc OpenAPI (Swagger)
- Spring WebSocket (信令)

### 数据库与存储
- Neon (PostgreSQL) - 主数据库
- Redis - 缓存/会话管理
- 本地存储/MinIO - 录制文件存储

### WebRTC 媒体服务器
- Agora 声网 (推荐方案)

## 核心功能
1. 用户管理 (注册用户 + 游客)
2. 视频会议室 (最多10人)
3. 会议录制
4. 录制回放

## 项目结构

### 顶层目录
- `/frontend` - React 前端应用
- `/backend` - Spring Boot 后端应用
- `/docker` - Docker 配置文件
- `/docs` - 项目文档

### 前端 (frontend/)
- `src/pages/` - 页面组件 (Login, Home, Room, Recordings)
- `src/components/` - 通用组件 (VideoGrid, VideoPlayer)
- `src/store/` - Zustand 状态管理 (authStore, roomStore)
- `src/services/` - API 服务层 (auth, room, recording)
- `src/hooks/` - 自定义 Hooks (useWebRTC, useMediaDevices)

### 后端 (backend/)
- `src/main/java/com/videoplat/`
  - `controller/` - REST API 控制器
  - `service/` - 业务逻辑层
  - `repository/` - 数据访问层
  - `model/` - 实体类
  - `dto/` - 数据传输对象
  - `config/` - 配置类

## API 规范
- 基础路径: `/api/v1`
- 认证方式: Bearer Token (JWT)
- 响应格式: `{code: number, message: string, data: any}`
- Swagger UI: http://localhost:8080/swagger-ui.html
- API 文档: http://localhost:8080/api-docs

## 开发规范
- 前端: ESLint + Prettier
- 后端: Checkstyle
- 提交信息: 使用中文描述

## 常用命令

### 前端
```bash
npm run dev      # 开发模式
npm run build    # 生产构建
npm run preview  # 预览构建结果
npm run lint     # 代码检查
npm run format   # 代码格式化
```

### 后端
```bash
mvn clean install     # 构建项目
mvn spring-boot:run   # 运行应用
mvn test              # 运行测试
mvn checkstyle:check  # 代码风格检查
```

### Docker
```bash
docker-compose up -d           # 后台启动
docker-compose ps              # 查看服务状态
docker-compose logs backend    # 查看后端日志
docker-compose restart backend # 重启后端服务
```

## 开发注意事项
- Agora Token 有效期: 1小时，需要定期刷新
- WebSocket 信令端点: `ws://localhost:8080/ws/signaling`
- 录制文件存储路径: `/app/recordings` (容器内) 或 `./recordings` (本地)
- 会议室最大并发数: 10个
- JWT Token 过期时间: 24小时
- Redis 用于会话管理和缓存，重启会清空数据

## 测试
- 前端: Jest + React Testing Library (待配置)
- 后端: JUnit 5 + Mockito
- E2E: 手动测试 (待自动化)

## 部署方式
Docker Compose 容器化部署

## 重要提醒
- 会议室最大人数: 10人
- 录制格式: MP4 (H.264 + AAC)
- 录制分辨率: 1280x720 或 1920x1080
- JWT Token 过期时间: 24小时
