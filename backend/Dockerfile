# 构建阶段
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# 配置 Maven 使用阿里云镜像
RUN mkdir -p /root/.m2 && \
    echo '<?xml version="1.0" encoding="UTF-8"?>' > /root/.m2/settings.xml && \
    echo '<settings>' >> /root/.m2/settings.xml && \
    echo '  <mirrors>' >> /root/.m2/settings.xml && \
    echo '    <mirror>' >> /root/.m2/settings.xml && \
    echo '      <id>aliyun</id>' >> /root/.m2/settings.xml && \
    echo '      <mirrorOf>central</mirrorOf>' >> /root/.m2/settings.xml && \
    echo '      <name>Aliyun Maven</name>' >> /root/.m2/settings.xml && \
    echo '      <url>https://maven.aliyun.com/repository/public</url>' >> /root/.m2/settings.xml && \
    echo '    </mirror>' >> /root/.m2/settings.xml && \
    echo '  </mirrors>' >> /root/.m2/settings.xml && \
    echo '</settings>' >> /root/.m2/settings.xml

# 复制父 POM
COPY pom.xml .

# 复制所有子模块的 POM 文件（用于依赖下载）
COPY videoplat-common/pom.xml ./videoplat-common/
COPY videoplat-domain/pom.xml ./videoplat-domain/
COPY videoplat-auth/pom.xml ./videoplat-auth/
COPY videoplat-meeting/pom.xml ./videoplat-meeting/
COPY videoplat-admin/pom.xml ./videoplat-admin/
COPY videoplat-video-review/pom.xml ./videoplat-video-review/
COPY videoplat-application/pom.xml ./videoplat-application/

# 下载依赖（利用 Docker 缓存层）
RUN mvn dependency:go-offline -B || true

# 复制所有子模块的源代码
COPY videoplat-common/src ./videoplat-common/src
COPY videoplat-domain/src ./videoplat-domain/src
COPY videoplat-auth/src ./videoplat-auth/src
COPY videoplat-meeting/src ./videoplat-meeting/src
COPY videoplat-admin/src ./videoplat-admin/src
COPY videoplat-video-review/src ./videoplat-video-review/src
COPY videoplat-application/src ./videoplat-application/src

# 构建整个项目（从父 POM 开始）
RUN mvn clean package -DskipTests

# Agora SDK 编译阶段（使用阿里云镜像）
FROM ubuntu:22.04 AS agora-builder

WORKDIR /agora

# 使用阿里云镜像源
RUN sed -i 's@//.*archive.ubuntu.com@//mirrors.aliyun.com@g' /etc/apt/sources.list && \
    sed -i 's@//.*security.ubuntu.com@//mirrors.aliyun.com@g' /etc/apt/sources.list && \
    apt-get update && apt-get install -y \
    build-essential \
    cmake \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 复制 Agora SDK
COPY agora_rtc_sdk /agora/agora_rtc_sdk

# 编译录制程序
WORKDIR /agora/agora_rtc_sdk/example
RUN chmod +x build.sh && \
    ./build.sh -b build -l n -o linux -t release

# 运行阶段
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# 安装运行时依赖
RUN apk add --no-cache libstdc++ libgcc

# 创建必要的目录
RUN mkdir -p /app/recordings /app/logs /app/agora_recorder

# 复制构建产物（从 application 模块）
COPY --from=builder /app/videoplat-application/target/*.jar app.jar

# 复制 Agora SDK 库文件和录制程序
COPY --from=agora-builder /agora/agora_rtc_sdk/agora_sdk/*.so /usr/local/lib/
COPY --from=agora-builder /agora/agora_rtc_sdk/example/out/recorder_local /app/agora_recorder/

# 配置动态链接库路径
ENV LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH

# 设置录制程序可执行权限
RUN chmod +x /app/agora_recorder/recorder_local

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# 启动应用
ENTRYPOINT ["java", "-jar", "app.jar"]
