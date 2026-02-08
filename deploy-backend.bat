@echo off
chcp 65001 >nul
echo ========================================
echo VideoPlat 后台部署脚本
echo ========================================
echo.

REM 检查 Docker 是否运行
docker info >nul 2>&1
if errorlevel 1 (
    echo [错误] Docker 未运行，请先启动 Docker Desktop
    pause
    exit /b 1
)

echo [1/5] 检查环境变量配置...
if not exist .env (
    echo [错误] .env 文件不存在，请先配置环境变量
    echo 请复制 .env.example 为 .env 并填写配置
    pause
    exit /b 1
)

REM 检查必需的环境变量
findstr /C:"AGORA_APP_ID=" .env | findstr /V /C:"AGORA_APP_ID=$" >nul
if errorlevel 1 (
    echo [警告] AGORA_APP_ID 未配置
)

findstr /C:"DATABASE_URL=jdbc:postgresql" .env >nul
if errorlevel 1 (
    echo [警告] DATABASE_URL 未正确配置
)

echo [2/5] 停止旧容器...
docker-compose stop backend redis 2>nul

echo [3/5] 构建后台镜像...
docker-compose build backend
if errorlevel 1 (
    echo [错误] 后台镜像构建失败
    pause
    exit /b 1
)

echo [4/5] 启动服务...
docker-compose up -d redis backend
if errorlevel 1 (
    echo [错误] 服务启动失败
    pause
    exit /b 1
)

echo [5/5] 等待服务启动...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo 部署完成！
echo ========================================
echo.
echo 服务状态：
docker-compose ps
echo.
echo 后台 API: http://localhost:8080
echo API 文档: http://localhost:8080/swagger-ui.html
echo.
echo 查看日志: docker-compose logs -f backend
echo 停止服务: docker-compose stop backend redis
echo.
pause
