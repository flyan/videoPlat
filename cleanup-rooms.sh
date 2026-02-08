#!/bin/bash

# VideoPlat 会议室清理脚本
# 使用方法：
#   ./cleanup-rooms.sh          # 手动清理无人会议室
#   ./cleanup-rooms.sh manual   # 手动清理无人会议室
#   ./cleanup-rooms.sh force    # 强制清理所有会议室
#   ./cleanup-rooms.sh status   # 查看会议室状态

set -e

# 配置
API_BASE_URL="http://localhost:8080"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取 JWT Token
get_token() {
    echo -e "${BLUE}🔐 正在登录...${NC}"

    TOKEN=$(curl -s -X POST "${API_BASE_URL}/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"${ADMIN_USERNAME}\",\"password\":\"${ADMIN_PASSWORD}\"}" \
        | grep -o '"token":"[^"]*"' \
        | cut -d'"' -f4)

    if [ -z "$TOKEN" ]; then
        echo -e "${RED}❌ 登录失败！请检查后端服务是否运行。${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ 登录成功${NC}"
}

# 手动清理无人会议室
manual_cleanup() {
    echo -e "${BLUE}🧹 正在清理无人会议室...${NC}"

    RESPONSE=$(curl -s -X POST "${API_BASE_URL}/api/rooms/cleanup" \
        -H "Authorization: Bearer ${TOKEN}")

    SUCCESS=$(echo "$RESPONSE" | grep -o '"success":[^,]*' | cut -d':' -f2)
    MESSAGE=$(echo "$RESPONSE" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
    COUNT=$(echo "$RESPONSE" | grep -o '"data":[0-9]*' | cut -d':' -f2)

    if [ "$SUCCESS" = "true" ]; then
        echo -e "${GREEN}✅ ${MESSAGE}${NC}"
        echo -e "${GREEN}📊 清理数量: ${COUNT}${NC}"
    else
        echo -e "${RED}❌ 清理失败: ${MESSAGE}${NC}"
        exit 1
    fi
}

# 强制清理所有会议室
force_cleanup() {
    echo -e "${RED}⚠️  警告：强制清理将终止所有活跃会议！${NC}"
    echo -e "${YELLOW}是否确认继续？(yes/no)${NC}"
    read -r CONFIRM

    if [ "$CONFIRM" != "yes" ]; then
        echo -e "${BLUE}已取消操作${NC}"
        exit 0
    fi

    echo -e "${BLUE}🧹 正在强制清理所有会议室...${NC}"

    RESPONSE=$(curl -s -X POST "${API_BASE_URL}/api/rooms/cleanup/force" \
        -H "Authorization: Bearer ${TOKEN}")

    SUCCESS=$(echo "$RESPONSE" | grep -o '"success":[^,]*' | cut -d':' -f2)
    MESSAGE=$(echo "$RESPONSE" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
    COUNT=$(echo "$RESPONSE" | grep -o '"data":[0-9]*' | cut -d':' -f2)

    if [ "$SUCCESS" = "true" ]; then
        echo -e "${GREEN}✅ ${MESSAGE}${NC}"
        echo -e "${GREEN}📊 清理数量: ${COUNT}${NC}"
    else
        echo -e "${RED}❌ 清理失败: ${MESSAGE}${NC}"
        exit 1
    fi
}

# 查看会议室状态
show_status() {
    echo -e "${BLUE}📊 正在查询会议室状态...${NC}"

    RESPONSE=$(curl -s -X GET "${API_BASE_URL}/api/v1/admin/rooms/active" \
        -H "Authorization: Bearer ${TOKEN}")

    echo -e "${GREEN}当前活跃会议室：${NC}"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
}

# 主函数
main() {
    ACTION=${1:-manual}

    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  VideoPlat 会议室清理工具${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""

    # 获取 Token
    get_token
    echo ""

    # 执行操作
    case "$ACTION" in
        manual)
            manual_cleanup
            ;;
        force)
            force_cleanup
            ;;
        status)
            show_status
            ;;
        *)
            echo -e "${RED}❌ 未知操作: $ACTION${NC}"
            echo -e "${YELLOW}使用方法：${NC}"
            echo -e "  $0          # 手动清理无人会议室"
            echo -e "  $0 manual   # 手动清理无人会议室"
            echo -e "  $0 force    # 强制清理所有会议室"
            echo -e "  $0 status   # 查看会议室状态"
            exit 1
            ;;
    esac

    echo ""
    echo -e "${GREEN}✅ 操作完成${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# 运行主函数
main "$@"
