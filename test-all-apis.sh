#!/bin/bash

# VideoPlat 功能测试脚本
# 测试所有 API 端点并记录问题

BASE_URL="http://localhost:8080"
ADMIN_TOKEN=""
USER_TOKEN=""

echo "=========================================="
echo "VideoPlat 功能测试"
echo "=========================================="
echo ""

# 测试结果记录
PASSED=0
FAILED=0
ISSUES=()

# 测试函数
test_api() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local token=$5
    local expected_status=$6

    echo "测试: $name"

    if [ -z "$token" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d "$data" 2>&1)
    fi

    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$status_code" = "$expected_status" ]; then
        echo "✅ 通过 (状态码: $status_code)"
        ((PASSED++))
    else
        echo "❌ 失败 (期望: $expected_status, 实际: $status_code)"
        echo "   响应: $body"
        ISSUES+=("$name - 状态码错误: 期望 $expected_status, 实际 $status_code")
        ((FAILED++))
    fi
    echo ""

    # 返回响应体供后续使用
    echo "$body"
}

echo "=========================================="
echo "1. 认证功能测试"
echo "=========================================="
echo ""

# 1.1 管理员登录
echo "1.1 管理员登录"
response=$(test_api "管理员登录" "POST" "/api/auth/login" \
    '{"username":"admin","password":"admin123"}' "" "200")

# 提取 token
ADMIN_TOKEN=$(echo "$response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -z "$ADMIN_TOKEN" ]; then
    echo "⚠️  警告: 无法获取管理员 Token"
    ISSUES+=("管理员登录 - 无法获取 Token")
else
    echo "✅ 管理员 Token 获取成功"
fi
echo ""

# 1.2 普通用户登录
echo "1.2 普通用户登录"
response=$(test_api "普通用户登录" "POST" "/api/auth/login" \
    '{"username":"user1","password":"user123"}' "" "200")

USER_TOKEN=$(echo "$response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -z "$USER_TOKEN" ]; then
    echo "⚠️  警告: 无法获取用户 Token"
    ISSUES+=("普通用户登录 - 无法获取 Token")
else
    echo "✅ 用户 Token 获取成功"
fi
echo ""

# 1.3 游客登录
echo "1.3 游客登录"
test_api "游客登录" "POST" "/api/auth/guest" \
    '{"nickname":"TestGuest"}' "" "200" > /dev/null
echo ""

# 1.4 获取当前用户信息
echo "1.4 获取当前用户信息"
test_api "获取当前用户" "GET" "/api/users/me" "" "$USER_TOKEN" "200" > /dev/null
echo ""

echo "=========================================="
echo "2. 会议室功能测试"
echo "=========================================="
echo ""

# 2.1 创建会议室
echo "2.1 创建会议室"
response=$(test_api "创建会议室" "POST" "/api/rooms" \
    '{"roomName":"Test Room","maxParticipants":10}' "$USER_TOKEN" "200")

ROOM_ID=$(echo "$response" | grep -o '"roomId":"[^"]*"' | cut -d'"' -f4)
if [ -z "$ROOM_ID" ]; then
    echo "⚠️  警告: 无法获取会议室 ID"
    ISSUES+=("创建会议室 - 无法获取 Room ID")
else
    echo "✅ 会议室 ID: $ROOM_ID"
fi
echo ""

# 2.2 获取会议室信息
if [ ! -z "$ROOM_ID" ]; then
    echo "2.2 获取会议室信息"
    test_api "获取会议室信息" "GET" "/api/rooms/$ROOM_ID" "" "$USER_TOKEN" "200" > /dev/null
    echo ""
fi

# 2.3 加入会议室
if [ ! -z "$ROOM_ID" ]; then
    echo "2.3 加入会议室"
    test_api "加入会议室" "POST" "/api/rooms/$ROOM_ID/join" '{}' "$USER_TOKEN" "200" > /dev/null
    echo ""
fi

# 2.4 获取参与者列表
if [ ! -z "$ROOM_ID" ]; then
    echo "2.4 获取参与者列表"
    test_api "获取参与者列表" "GET" "/api/rooms/$ROOM_ID/participants" "" "$USER_TOKEN" "200" > /dev/null
    echo ""
fi

# 2.5 获取 Agora Token
if [ ! -z "$ROOM_ID" ]; then
    echo "2.5 获取 Agora Token"
    test_api "获取 Agora Token" "GET" "/api/rooms/$ROOM_ID/agora-token" "" "$USER_TOKEN" "200" > /dev/null
    echo ""
fi

echo "=========================================="
echo "3. 管理台功能测试"
echo "=========================================="
echo ""

if [ -z "$ADMIN_TOKEN" ]; then
    echo "⚠️  跳过管理台测试（无管理员 Token）"
else
    # 3.1 获取系统统计
    echo "3.1 获取系统统计"
    test_api "获取系统统计" "GET" "/api/v1/admin/statistics" "" "$ADMIN_TOKEN" "200" > /dev/null
    echo ""

    # 3.2 获取用户列表
    echo "3.2 获取用户列表"
    test_api "获取用户列表" "GET" "/api/v1/admin/users?page=0&size=20" "" "$ADMIN_TOKEN" "200" > /dev/null
    echo ""

    # 3.3 获取在线用户
    echo "3.3 获取在线用户"
    test_api "获取在线用户" "GET" "/api/v1/admin/users/online" "" "$ADMIN_TOKEN" "200" > /dev/null
    echo ""

    # 3.4 获取会议室列表
    echo "3.4 获取会议室列表"
    test_api "获取会议室列表" "GET" "/api/v1/admin/rooms?page=0&size=20" "" "$ADMIN_TOKEN" "200" > /dev/null
    echo ""

    # 3.5 获取进行中的会议室
    echo "3.5 获取进行中的会议室"
    test_api "获取进行中的会议室" "GET" "/api/v1/admin/rooms/active" "" "$ADMIN_TOKEN" "200" > /dev/null
    echo ""

    # 3.6 获取操作日志
    echo "3.6 获取操作日志"
    test_api "获取操作日志" "GET" "/api/v1/admin/operation-logs?page=0&size=20" "" "$ADMIN_TOKEN" "200" > /dev/null
    echo ""

    # 3.7 测试权限控制（普通用户访问管理台应该失败）
    echo "3.7 测试权限控制"
    test_api "普通用户访问管理台" "GET" "/api/v1/admin/statistics" "" "$USER_TOKEN" "403" > /dev/null
    echo ""
fi

echo "=========================================="
echo "4. 视频调阅功能测试"
echo "=========================================="
echo ""

# 4.1 获取录制列表
echo "4.1 获取录制列表"
test_api "获取录制列表" "GET" "/api/v1/video-review/recordings?page=0&size=20" "" "$USER_TOKEN" "200" > /dev/null
echo ""

# 4.2 获取存储统计
echo "4.2 获取存储统计"
test_api "获取存储统计" "GET" "/api/v1/video-review/statistics" "" "$USER_TOKEN" "200" > /dev/null
echo ""

echo "=========================================="
echo "测试总结"
echo "=========================================="
echo ""
echo "通过: $PASSED"
echo "失败: $FAILED"
echo "总计: $((PASSED + FAILED))"
echo ""

if [ ${#ISSUES[@]} -gt 0 ]; then
    echo "发现的问题:"
    for issue in "${ISSUES[@]}"; do
        echo "  - $issue"
    done
else
    echo "✅ 所有测试通过！"
fi
