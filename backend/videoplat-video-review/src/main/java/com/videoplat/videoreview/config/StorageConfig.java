package com.videoplat.videoreview.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 存储配置
 */
@Configuration
@ConfigurationProperties(prefix = "videoplat.storage")
@Data
public class StorageConfig {

    /**
     * 录制文件存储根目录
     */
    private String recordingsPath = "./recordings";

    /**
     * 最大文件大小（字节），默认 5GB
     */
    private Long maxFileSize = 5L * 1024 * 1024 * 1024;

    /**
     * 允许的文件扩展名
     */
    private String[] allowedExtensions = {"mp4", "webm", "mkv"};

    /**
     * 是否启用文件压缩
     */
    private Boolean enableCompression = false;

    /**
     * 获取录制文件存储路径
     */
    public Path getRecordingsPath() {
        return Paths.get(recordingsPath).toAbsolutePath().normalize();
    }

    /**
     * 检查文件扩展名是否允许
     */
    public boolean isAllowedExtension(String extension) {
        if (extension == null || extension.isEmpty()) {
            return false;
        }

        String ext = extension.toLowerCase();
        for (String allowed : allowedExtensions) {
            if (allowed.equalsIgnoreCase(ext)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 检查文件大小是否超过限制
     */
    public boolean isFileSizeExceeded(Long fileSize) {
        return fileSize != null && fileSize > maxFileSize;
    }
}
