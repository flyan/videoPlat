# VideoPlat 后台部署指南

## 📋 前置条件

- ✅ Docker 已安装
- ✅ Docker Compose 已安装
- ⚠️ Neon PostgreSQL 数据库（需要创建）
- ⚠️ Agora 账号和配置（需要申请）

## 🚀 快速部署步骤

### 第一步：配置环境变量

编辑项目根目录的 `.env` 文件，填写以下必需配置：

```bash
# 1. Agora 配置（从 Agora 控制台获取）
VITE_AGORA_APP_ID=你的_Agora_App_ID
AGORA_APP_ID=你的_Agora_App_ID
AGORA_APP_CERTIFICATE=你的_Agora_App_Certificate

# 2. 数据库配置（从 Neon 获取）
DATABASE_URL=jdbc:postgresql://你的neon主机.neon.tech/videoplat?sslmode=require

# 3. JWT 密钥（生产环境请修改）
JWT_SECRET=请修改为你自己的密钥_至少32位字符
```

### 第二步：仅部署后台服务

运行以下命令仅启动后台和 Redis：

```bash
# Windows PowerShell
docker-compose up -d redis backend

# 或者 Windows CMD
docker-compose up -d redis backend
```

### 第三步：查看部署状态

```bash
# 查看容器状态
docker-compose ps

# 查看后台日志
docker-compose logs -f backend

# 查看 Redis 日志
docker-compose logs -f redis
```

### 第四步：验证部署

1. **健康检查**
   ```bash
   curl http://localhost:8080/actuator/health
   ```
   应该返回：`{"status":"UP"}`

2. **访问 API 文档**
   打开浏览器访问：http://localhost:8080/swagger-ui.html

3. **测试 API**
   ```bash
   curl http://localhost:8080/api/health
   ```

## 🔧 常用命令

### 启动服务
```bash
docker-compose up -d redis backend
```

### 停止服务
```bash
docker-compose stop backend redis
```

### 重启服务
```bash
docker-compose restart backend
```

### 查看日志
```bash
# 实时查看后台日志
docker-compose logs -f backend

# 查看最近 100 行日志
docker-compose logs --tail=100 backend
```

### 重新构建并启动
```bash
docker-compose up -d --build backend
```

### 清理并重新部署
```bash
# 停止并删除容器
docker-compose down

# 重新构建并启动
docker-compose up -d --build redis backend
```

## 🐛 故障排查

### 1. 容器启动失败

**查看详细错误信息：**
```bash
docker-compose logs backend
```

**常见问题：**
- 数据库连接失败：检查 `.env` 中的 `DATABASE_URL` 是否正确
- Redis 连接失败：确保 Redis 容器正在运行
- 端口被占用：检查 8080 端口是否被其他程序占用

### 2. 数据库连接错误

**检查数据库配置：**
```bash
# 进入容器查看环境变量
docker exec -it videoplat-backend env | grep DATABASE
```

**测试数据库连接：**
- 确保 Neon 数据库已创建
- 确保连接字符串包含 `?sslmode=require`
- 检查用户名和密码是否正确

### 3. Agora 配置问题

**检查 Agora 配置：**
```bash
docker exec -it videoplat-backend env | grep AGORA
```

**注意事项：**
- App ID 和 App Certificate 必须匹配
- 确保在 Agora 控制台启用了 App Certificate

### 4. 查看容器内部日志

```bash
# 进入容器
docker exec -it videoplat-backend sh

# 查看应用日志
cat /app/logs/videoplat.log
```

## 📊 监控和维护

### 查看资源使用情况
```bash
docker stats videoplat-backend videoplat-redis
```

### 备份数据
```bash
# 备份 Redis 数据
docker exec videoplat-redis redis-cli SAVE
docker cp videoplat-redis:/data/dump.rdb ./backup/

# 备份录制文件
docker cp videoplat-backend:/app/recordings ./backup/
```

### 更新应用
```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建并启动
docker-compose up -d --build backend

# 3. 查看日志确认启动成功
docker-compose logs -f backend
```

## 🔐 安全建议

1. **修改默认密钥**
   - 修改 `.env` 中的 `JWT_SECRET`
   - 使用强密码（至少 32 位随机字符）

2. **数据库安全**
   - 使用 Neon 的 SSL 连接（已在配置中）
   - 定期备份数据库

3. **防火墙配置**
   - 仅开放必要端口（8080）
   - 使用反向代理（Nginx）

4. **日志管理**
   - 定期清理日志文件
   - 配置日志轮转

## 📝 下一步

部署成功后，你可以：

1. 部署前端服务：`docker-compose up -d frontend`
2. 配置域名和 SSL 证书
3. 设置自动备份
4. 配置监控告警

## 🆘 获取帮助

如果遇到问题：
1. 查看日志：`docker-compose logs backend`
2. 检查配置：确保 `.env` 文件配置正确
3. 查看文档：`README.md`
