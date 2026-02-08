# IP 地址访问问题解决方案总结

## 问题回顾

### 原始问题
用户使用 IP 地址 `192.168.10.9` 访问 VideoPlat 时遇到两个问题：
1. ❌ CORS 跨域错误
2. ❌ 无法使用摄像头/麦克风（`getUserMedia` API 被阻止）

### 错误信息
```
Access to XMLHttpRequest at 'http://localhost:8080/api/auth/login'
from origin 'http://192.168.10.9' has been blocked by CORS policy

AgoraRTCError NOT_SUPPORTED: can not find getUserMedia
```

## 解决方案

### 第一阶段：解决 CORS 问题 ✅

**实施方案：** 使用 Nginx 反向代理

**修改文件：**
1. `frontend/src/services/api.js` - API 基础 URL 改为相对路径 `/api`
2. `frontend/nginx.conf` - `server_name` 改为 `_`（接受所有主机名/IP）
3. `.env` 和 `.env.example` - 更新 `VITE_API_BASE_URL=/api`

**效果：**
- ✅ 前后端同源，无 CORS 问题
- ✅ 支持任意 IP/域名访问
- ✅ 登录功能正常
- ✅ 创建会议功能正常

### 第二阶段：解决 getUserMedia 问题 ✅

**根本原因：**
- 浏览器安全策略要求 `getUserMedia` API 只能在安全上下文中使用
- `localhost` 被视为安全上下文（即使是 HTTP）
- IP 地址在 HTTP 下不是安全上下文

**实施方案：** 配置 HTTPS 支持

**修改文件：**
1. `frontend/generate-cert.sh` - 自动生成自签名 SSL 证书
2. `frontend/nginx.conf` - 添加 HTTPS 配置和 HTTP 重定向
3. `frontend/Dockerfile` - 安装 openssl 并集成证书生成脚本

**配置特性：**
- ✅ 自动生成自签名证书
- ✅ HTTP 自动重定向到 HTTPS
- ✅ 支持 HTTP/2
- ✅ 支持所有 IP 地址和域名
- ✅ API 反向代理
- ✅ Gzip 压缩
- ✅ 静态资源缓存

## 最终效果

### 功能验证

| 功能 | HTTP (localhost) | HTTP (IP) | HTTPS (IP) |
|------|------------------|-----------|------------|
| 页面访问 | ✅ | ✅ → HTTPS | ✅ |
| 用户登录 | ✅ | ✅ → HTTPS | ✅ |
| 创建会议 | ✅ | ✅ → HTTPS | ✅ |
| 摄像头/麦克风 | ✅ | ❌ | ✅ |
| 屏幕共享 | ✅ | ❌ | ✅ |
| 会议录制 | ✅ | ❌ | ✅ |
| 局域网访问 | ❌ | ✅ | ✅ |

### 访问方式

**推荐方式：**
```
https://192.168.10.9
```

**备选方式：**
```
http://192.168.10.9  （自动重定向到 HTTPS）
https://localhost
http://localhost     （自动重定向到 HTTPS）
```

## 技术实现

### Nginx 配置结构

```nginx
# HTTP 服务器 - 重定向到 HTTPS
server {
    listen 80;
    server_name _;
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS 服务器
server {
    listen 443 ssl http2;
    server_name _;

    ssl_certificate /etc/nginx/ssl/nginx.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx.key;

    # API 反向代理
    location /api {
        proxy_pass http://backend:8080;
    }

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 证书生成

容器启动时自动执行 `generate-cert.sh`：
```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/nginx.key \
  -out /etc/nginx/ssl/nginx.crt \
  -subj "/C=CN/ST=Beijing/L=Beijing/O=VideoPlat/OU=Dev/CN=192.168.10.9" \
  -addext "subjectAltName=IP:192.168.10.9,DNS:localhost,DNS:*.local"
```

## 用户使用指南

### 首次访问

1. 访问 `https://192.168.10.9`
2. 看到证书警告（自签名证书）
3. 点击"高级" → "继续访问"
4. 开始使用

### 永久信任证书（可选）

详见 `HTTPS配置说明.md` 中的操作步骤。

## 生产环境建议

### 使用真实 SSL 证书

1. **有域名：** 使用 Let's Encrypt 免费证书
   ```bash
   certbot certonly --standalone -d yourdomain.com
   ```

2. **无域名：** 购买商业 SSL 证书

3. **内网环境：** 搭建内部 CA 服务器

### 安全加固

- 启用 HSTS
- 配置 CSP 策略
- 定期更新证书
- 使用强加密套件

## 相关文档

- `HTTPS快速开始.md` - 用户快速上手指南
- `HTTPS配置说明.md` - 详细配置说明和故障排除
- `CLAUDE.md` - 项目整体文档（已更新）

## 总结

通过两阶段的优化：
1. **Nginx 反向代理** - 解决 CORS 跨域问题
2. **HTTPS 配置** - 解决安全上下文问题

最终实现了：
- ✅ 支持 IP 地址访问
- ✅ 支持局域网访问
- ✅ 完整的视频会议功能
- ✅ 符合浏览器安全策略
- ✅ 符合生产环境最佳实践

**核心原则：** 前后端同源 + 安全上下文（HTTPS）
