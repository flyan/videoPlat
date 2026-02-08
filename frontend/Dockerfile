# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建参数
ARG VITE_AGORA_APP_ID
ARG VITE_API_BASE_URL

ENV VITE_AGORA_APP_ID=$VITE_AGORA_APP_ID
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# 构建应用
RUN npm run build

# 生产阶段
FROM nginx:alpine

# 安装 openssl 用于生成证书
RUN apk add --no-cache openssl

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制证书生成脚本
COPY generate-cert.sh /docker-entrypoint.d/10-generate-cert.sh
RUN chmod +x /docker-entrypoint.d/10-generate-cert.sh

# 暴露端口
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
