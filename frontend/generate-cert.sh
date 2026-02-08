#!/bin/sh
# 生成自签名 SSL 证书用于开发环境

# 创建证书目录
mkdir -p /etc/nginx/ssl

# 生成自签名证书（有效期 365 天）
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/nginx.key \
  -out /etc/nginx/ssl/nginx.crt \
  -subj "/C=CN/ST=Beijing/L=Beijing/O=VideoPlat/OU=Dev/CN=192.168.10.9" \
  -addext "subjectAltName=IP:192.168.10.9,DNS:localhost,DNS:*.local"

echo "SSL 证书生成完成！"
