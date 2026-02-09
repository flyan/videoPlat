# VideoPlat - 视频会议平台

## 项目简介

VideoPlat 是一个类似 Zoom 的在线视频会议系统，支持多人视频通话、会议录制、回放等核心功能。

## 功能特性

### 核心功能 (Beta 版本)
- ✅ 用户管理 (注册用户 + 游客模式)
- ✅ 多人视频会议 (最多10人)
- ✅ 实时音视频通信
- ✅ 屏幕共享
- ✅ 会议录制
- ✅ 录制回放
- ✅ 参与者管理

### 计划功能 (未来版本)
- 🔄 实时翻译
- 🔄 实时字幕
- 🔄 虚拟背景
- 🔄 数字人/虚拟形象
- 🔄 会议转录
- 🔄 AI 摘要
- 🔄 白板功能
- 🔄 文件共享

## 技术架构

### 前端技术栈
- React 18+
- Redux Toolkit / Zustand
- Ant Design
- Agora WebRTC SDK
- Video.js
- Vite
- Tailwind CSS

### 后端技术栈
- Spring Boot 3.x
- Spring Security + JWT
- Spring Data JPA
- SpringDoc OpenAPI
- Spring WebSocket
- PostgreSQL (Neon)
- Redis

### 媒体服务
- Agora 声网 (WebRTC)

## 快速开始

### 前置要求
- Node.js 18+
- Java 17+
- Docker & Docker Compose
- PostgreSQL (或使用 Neon 云数据库)
- Redis

### 环境配置

1. 克隆项目
```bash
git clone <repository-url>
cd videoPlat
```

2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，填入必要的配置信息
```

3. 启动服务 (Docker Compose)
```bash
docker-compose up -d
```

4. 访问应用
- 前端: http://localhost
- 后端 API: http://localhost:8080/api
- API 文档: http://localhost:8080/swagger-ui.html

### 本地开发

#### 前端开发
```bash
cd frontend
npm install
npm run dev
```

#### 后端开发
```bash
cd backend
./mvnw spring-boot:run
```

## 项目结构

```
videoPlat/
├── frontend/              # React 前端应用
│   ├── src/
│   │   ├── components/    # 通用组件
│   │   ├── pages/         # 页面组件
│   │   ├── services/      # API 服务
│   │   ├── hooks/         # 自定义 Hooks
│   │   ├── store/         # 状态管理
│   │   └── utils/         # 工具函数
│   └── package.json
├── backend/               # Spring Boot 后端应用
│   ├── src/main/java/com/videoplat/
│   │   ├── controller/    # REST 控制器
│   │   ├── service/       # 业务逻辑
│   │   ├── repository/    # 数据访问
│   │   ├── model/         # 实体类
│   │   ├── dto/           # 数据传输对象
│   │   └── config/        # 配置类
│   └── pom.xml
├── docker/                # Docker 配置
├── docs/                  # 📚 项目文档
│   ├── deployment/        # 部署文档
│   ├── features/          # 功能文档
│   ├── troubleshooting/   # 故障排查
│   ├── development/       # 开发文档
│   └── archive/           # 归档文档
├── docker-compose.yml     # Docker Compose 配置
├── CLAUDE.md             # 项目上下文
└── README.md             # 项目说明
```

## 📚 文档导航

### 快速开始
- [HTTPS 快速开始](docs/deployment/HTTPS快速开始.md) - HTTPS 配置指南
- [部署完成报告](docs/deployment/部署完成报告.md) - 最新部署状态

### 功能文档
- [录制功能已解决](docs/features/录制功能已解决.md) ⭐ - 录制问题解决方案
- [本地录制快速开始](docs/features/本地录制快速开始.md) - 本地录制指南
- [WebSocket 聊天功能](docs/features/WebSocket聊天功能实现文档.md) - 实时聊天

### 故障排查
- [IP 地址访问问题](docs/troubleshooting/IP地址访问问题解决方案.md)
- [录制功能修复报告](docs/troubleshooting/录制功能修复完成报告.md)

### 开发文档
- [代码注释规范](docs/development/COMMENT_GUIDELINES.md)
- [重构完成报告](docs/development/重构完成报告.md)

**更多文档**: 查看 [docs/README.md](docs/README.md)

## API 文档

启动后端服务后，访问 Swagger UI 查看完整的 API 文档:
http://localhost:8080/swagger-ui.html

### 主要 API 端点

#### 用户认证
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/guest` - 游客登录
- `GET /api/users/me` - 获取当前用户信息

#### 会议室管理
- `POST /api/rooms` - 创建会议室
- `GET /api/rooms/{roomId}` - 获取会议室信息
- `POST /api/rooms/{roomId}/join` - 加入会议室
- `POST /api/rooms/{roomId}/leave` - 离开会议室
- `DELETE /api/rooms/{roomId}` - 结束会议室

#### 录制管理
- `POST /api/rooms/{roomId}/recordings/start` - 开始录制
- `POST /api/rooms/{roomId}/recordings/stop` - 停止录制
- `GET /api/recordings` - 获取录制列表
- `GET /api/recordings/{recordingId}` - 获取录制详情
- `GET /api/recordings/{recordingId}/stream` - 播放录制
- `DELETE /api/recordings/{recordingId}` - 删除录制

## 配置说明

### Agora 配置
需要在 Agora 官网注册账号并获取:
- App ID
- App Certificate (用于生成 Token)

配置位置:
- 后端: `backend/src/main/resources/application.yml`
- 前端: `.env` 文件

### 数据库配置
使用 Neon PostgreSQL 云数据库或本地 PostgreSQL:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://<host>:<port>/<database>
    username: <username>
    password: <password>
```

### Redis 配置
```yaml
spring:
  redis:
    host: localhost
    port: 6379
```

## 部署

### Docker Compose 部署
```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 生产环境注意事项
- 使用 HTTPS
- 配置防火墙规则
- 设置合理的资源限制
- 配置日志轮转
- 定期备份数据库
- 定期清理过期录制文件

## 性能指标

- 视频延迟: < 300ms
- 音频延迟: < 200ms
- 支持并发会议室: 10个
- 单会议室最大人数: 10人
- 系统可用性: 99%

## 开发计划

- [x] Phase 1: 基础架构搭建
- [ ] Phase 2: 核心功能开发
- [ ] Phase 3: 录制功能开发
- [ ] Phase 4: 测试和优化

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

如有问题，请提交 Issue 或联系项目维护者。
