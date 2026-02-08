# HTTPS 配置说明

## 问题描述

使用 IP 地址（如 `http://192.168.10.9`）访问时，浏览器会阻止 `getUserMedia` API（摄像头/麦克风访问），导致以下错误：

```
AgoraRTCError NOT_SUPPORTED: can not find getUserMedia
```

**原因**：浏览器的安全策略要求 `getUserMedia` 只能在安全上下文（HTTPS 或 localhost）中使用。

## 解决方案

### 方案 1：使用 HTTPS（已配置）

项目已配置 HTTPS 支持，使用自签名证书。

#### 1. 访问 HTTPS 地址

```
https://192.168.10.9
```

#### 2. 信任自签名证书

首次访问会看到证书警告，需要手动信任：

**Chrome/Edge**：
1. 点击"高级"
2. 点击"继续前往 192.168.10.9（不安全）"

**Firefox**：
1. 点击"高级"
2. 点击"接受风险并继续"

#### 3. 永久信任证书（可选）

**Windows**：
1. 在浏览器中访问 `https://192.168.10.9`
2. 点击地址栏的锁图标 → "连接不安全"
3. 点击"证书" → "详细信息" → "复制到文件"
4. 保存为 `.cer` 文件
5. 双击证书文件 → "安装证书"
6. 选择"本地计算机" → "将所有的证书都放入下列存储" → "受信任的根证书颁发机构"

**macOS**：
1. 导出证书（同上）
2. 打开"钥匙串访问"
3. 将证书拖入"系统"钥匙串
4. 双击证书 → "信任" → "使用此证书时" → "始终信任"

**Linux**：
```bash
# 导出证书
docker exec videoplat-frontend cat /etc/nginx/ssl/nginx.crt > videoplat.crt

# 安装证书
sudo cp videoplat.crt /usr/local/share/ca-certificates/
sudo update-ca-certificates
```

### 方案 2：使用 localhost（临时方案）

如果只是本机测试，可以使用 `http://localhost` 访问，浏览器会将其视为安全上下文。

**限制**：无法从局域网其他设备访问。

### 方案 3：Chrome 不安全源例外（仅开发环境）

**警告**：此方法会降低安全性，仅用于开发测试。

1. 打开 Chrome，访问：
   ```
   chrome://flags/#unsafely-treat-insecure-origin-as-secure
   ```

2. 在"Insecure origins treated as secure"中添加：
   ```
   http://192.168.10.9
   ```

3. 选择"Enabled"

4. 重启浏览器

### 方案 4：使用真实 SSL 证书（生产环境推荐）

#### 使用 Let's Encrypt（需要域名）

1. 准备域名并指向服务器 IP
2. 使用 Certbot 获取证书：

```bash
# 安装 Certbot
sudo apt-get install certbot

# 获取证书
sudo certbot certonly --standalone -d yourdomain.com

# 证书位置
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

3. 更新 `docker-compose.yml`，挂载证书：

```yaml
frontend:
  volumes:
    - /etc/letsencrypt/live/yourdomain.com:/etc/nginx/ssl:ro
```

4. 更新 `nginx.conf`：

```nginx
ssl_certificate /etc/nginx/ssl/fullchain.pem;
ssl_certificate_key /etc/nginx/ssl/privkey.pem;
```

## 验证 HTTPS 配置

### 1. 检查证书是否生成

```bash
docker exec videoplat-frontend ls -la /etc/nginx/ssl/
```

应该看到：
- `nginx.crt` - 证书文件
- `nginx.key` - 私钥文件

### 2. 检查 Nginx 配置

```bash
docker exec videoplat-frontend nginx -t
```

### 3. 查看容器日志

```bash
docker logs videoplat-frontend
```

应该看到：
```
SSL 证书生成完成！
```

### 4. 测试 HTTPS 访问

```bash
curl -k https://192.168.10.9/health
```

应该返回：
```
healthy
```

## 当前配置特性

✅ HTTP 自动重定向到 HTTPS
✅ 支持 HTTP/2
✅ 自动生成自签名证书
✅ 支持所有 IP 地址和域名
✅ API 反向代理
✅ Gzip 压缩
✅ 静态资源缓存

## 常见问题

### Q: 为什么需要 HTTPS？

A: 浏览器安全策略要求访问摄像头/麦克风必须在安全上下文中。HTTPS 或 localhost 被视为安全上下文。

### Q: 自签名证书安全吗？

A: 自签名证书提供加密传输，但浏览器无法验证证书颁发者。适合开发和内网环境，生产环境建议使用受信任的 CA 证书。

### Q: 如何在移动设备上信任证书？

A:
- **iOS**：设置 → 通用 → 描述文件 → 安装证书 → 设置 → 通用 → 关于本机 → 证书信任设置 → 启用完全信任
- **Android**：设置 → 安全 → 加密与凭据 → 从存储设备安装 → 选择证书文件

### Q: HTTP 还能访问吗？

A: 可以，但会自动重定向到 HTTPS。健康检查端点 `/health` 不会重定向。

## 重新生成证书

如果需要更改 IP 地址或域名：

1. 修改 `frontend/generate-cert.sh` 中的 `-subj` 和 `-addext` 参数
2. 重新构建容器：
   ```bash
   docker-compose build frontend
   docker-compose up -d frontend
   ```

## 回退到 HTTP（不推荐）

如果确实需要回退到纯 HTTP：

1. 恢复 `frontend/nginx.conf` 到之前的版本
2. 移除 `frontend/Dockerfile` 中的证书相关配置
3. 重新构建容器

**注意**：回退后将无法使用摄像头/麦克风功能（除非使用 localhost 访问）。
