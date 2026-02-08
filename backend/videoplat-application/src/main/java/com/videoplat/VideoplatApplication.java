package com.videoplat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * VideoPlat 应用主启动类
 *
 * 整合所有子模块，启动 Spring Boot 应用
 */
@SpringBootApplication(scanBasePackages = {
        "com.videoplat.auth",           // 认证模块
        "com.videoplat.meeting",        // 会议模块
        "com.videoplat.admin",          // 管理模块
        "com.videoplat.videoreview",    // 视频回放模块
        "com.videoplat.config",         // 配置类
        "com.videoplat.exception"       // 异常处理
})
@EnableJpaRepositories(basePackages = "com.videoplat.domain.repository")
@EnableScheduling
public class VideoplatApplication {

    public static void main(String[] args) {
        SpringApplication.run(VideoplatApplication.class, args);
    }
}
