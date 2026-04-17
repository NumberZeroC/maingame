#!/bin/bash

# 自动获取公网IP
PUBLIC_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || curl -s ipinfo.io/ip)

if [ -z "$PUBLIC_IP" ]; then
  echo "警告: 无法获取公网IP，使用默认值"
  PUBLIC_IP="localhost"
fi

echo "检测到公网IP: $PUBLIC_IP"

# 导出环境变量
export PUBLIC_IP
export CORS_ORIGIN="http://localhost:3000,http://${PUBLIC_IP}:3000"

# 启动服务
cd "$(dirname "$0")"
npm run start:prod