@echo off
REM VideoPlat 会议室清理脚本 (Windows)
REM 使用方法：
REM   cleanup-rooms.bat          # 手动清理无人会议室
REM   cleanup-rooms.bat manual   # 手动清理无人会议室
REM   cleanup-rooms.bat force    # 强制清理所有会议室
REM   cleanup-rooms.bat status   # 查看会议室状态

setlocal enabledelayedexpansion

REM 配置
set API_BASE_URL=http://localhost:8080
set ADMIN_USERNAME=admin
set ADMIN_PASSWORD=admin123

REM 获取操作类型
set ACTION=%1
if "%ACTION%"=="" set ACTION=manual

echo ========================================
echo   VideoPlat 会议室清理工具
echo ========================================
echo.

REM 获取 JWT Token
echo [*] 正在登录...
curl -s -X POST "%API_BASE_URL%/api/auth/login" ^
    -H "Content-Type: application/json" ^
    -d "{\"username\":\"%ADMIN_USERNAME%\",\"password\":\"%ADMIN_PASSWORD%\"}" > temp_login.json

REM 提取 token (简化版，实际可能需要 jq 或其他工具)
for /f "tokens=2 delims=:," %%a in ('findstr "token" temp_login.json') do (
    set TOKEN_RAW=%%a
)
set TOKEN=!TOKEN_RAW:"=!
del temp_login.json

if "!TOKEN!"=="" (
    echo [X] 登录失败！请检查后端服务是否运行。
    exit /b 1
)

echo [√] 登录成功
echo.

REM 执行操作
if "%ACTION%"=="manual" goto MANUAL_CLEANUP
if "%ACTION%"=="force" goto FORCE_CLEANUP
if "%ACTION%"=="status" goto SHOW_STATUS

echo [X] 未知操作: %ACTION%
echo.
echo 使用方法：
echo   %0          # 手动清理无人会议室
echo   %0 manual   # 手动清理无人会议室
echo   %0 force    # 强制清理所有会议室
echo   %0 status   # 查看会议室状态
exit /b 1

:MANUAL_CLEANUP
echo [*] 正在清理无人会议室...
curl -s -X POST "%API_BASE_URL%/api/rooms/cleanup" ^
    -H "Authorization: Bearer !TOKEN!"
echo.
goto END

:FORCE_CLEANUP
echo [!] 警告：强制清理将终止所有活跃会议！
set /p CONFIRM="是否确认继续？(yes/no): "
if not "!CONFIRM!"=="yes" (
    echo [*] 已取消操作
    exit /b 0
)
echo [*] 正在强制清理所有会议室...
curl -s -X POST "%API_BASE_URL%/api/rooms/cleanup/force" ^
    -H "Authorization: Bearer !TOKEN!"
echo.
goto END

:SHOW_STATUS
echo [*] 正在查询会议室状态...
curl -s -X GET "%API_BASE_URL%/api/v1/admin/rooms/active" ^
    -H "Authorization: Bearer !TOKEN!"
echo.
goto END

:END
echo.
echo [√] 操作完成
echo ========================================
