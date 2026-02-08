package com.videoplat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * VideoPlat 应用程序入口
 *
 * 在线视频会议系统，提供多人视频通话、会议录制、回放等功能
 *
 * @author VideoPlat Team
 * @since 1.0
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableAsync
@EnableScheduling
public class VideoplatApplication {

    public static void main(String[] args) {
        SpringApplication.run(VideoplatApplication.class, args);
    }
}
