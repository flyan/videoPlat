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

# 运行阶段
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# 创建必要的目录
RUN mkdir -p /app/recordings /app/logs

# 复制构建产物（从 application 模块）
COPY --from=builder /app/videoplat-application/target/*.jar app.jar

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# 启动应用
ENTRYPOINT ["java", "-jar", "app.jar"]
