package com.videoplat.videoreview.service;

import com.videoplat.common.exception.BusinessException;
import com.videoplat.common.exception.ResourceNotFoundException;
import com.videoplat.videoreview.config.StorageConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

/**
 * 录制存储服务
 *
 * 负责录制文件的存储、读取、删除等操作
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RecordingStorageService {

    private final StorageConfig storageConfig;

    /**
     * 初始化存储目录
     */
    public void init() {
        try {
            Path recordingsPath = storageConfig.getRecordingsPath();
            if (!Files.exists(recordingsPath)) {
                Files.createDirectories(recordingsPath);
                log.info("创建录制文件存储目录: {}", recordingsPath);
            }
        } catch (IOException e) {
            log.error("无法创建录制文件存储目录", e);
            throw new BusinessException("无法初始化存储目录", e);
        }
    }

    /**
     * 存储文件
     *
     * @param inputStream 文件输入流
     * @param filename 文件名
     * @return 存储后的文件路径（相对路径）
     */
    public String store(InputStream inputStream, String filename) {
        try {
            // 验证文件名
            if (!StringUtils.hasText(filename)) {
                throw new BusinessException("文件名不能为空");
            }

            // 清理文件名，防止路径遍历攻击
            String cleanFilename = StringUtils.cleanPath(filename);
            if (cleanFilename.contains("..")) {
                throw new BusinessException("文件名包含非法字符");
            }

            // 检查文件扩展名
            String extension = getFileExtension(cleanFilename);
            if (!storageConfig.isAllowedExtension(extension)) {
                throw new BusinessException("不支持的文件格式: " + extension);
            }

            // 确保存储目录存在
            init();

            // 保存文件
            Path targetPath = storageConfig.getRecordingsPath().resolve(cleanFilename);
            Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);

            log.info("文件存储成功: {}", targetPath);
            return cleanFilename;

        } catch (IOException e) {
            log.error("文件存储失败: {}", filename, e);
            throw new BusinessException("文件存储失败", e);
        }
    }

    /**
     * 加载文件为 Resource
     *
     * @param filename 文件名
     * @return 文件资源
     */
    public Resource loadAsResource(String filename) {
        try {
            Path filePath = storageConfig.getRecordingsPath().resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("文件不存在或不可读: " + filename);
            }
        } catch (MalformedURLException e) {
            log.error("文件路径格式错误: {}", filename, e);
            throw new BusinessException("文件路径格式错误", e);
        }
    }

    /**
     * 删除文件
     *
     * @param filename 文件名
     */
    public void delete(String filename) {
        try {
            Path filePath = storageConfig.getRecordingsPath().resolve(filename).normalize();

            if (!Files.exists(filePath)) {
                log.warn("尝试删除不存在的文件: {}", filename);
                return;
            }

            Files.delete(filePath);
            log.info("文件删除成功: {}", filePath);

        } catch (IOException e) {
            log.error("文件删除失败: {}", filename, e);
            throw new BusinessException("文件删除失败", e);
        }
    }

    /**
     * 检查文件是否存在
     *
     * @param filename 文件名
     * @return 是否存在
     */
    public boolean exists(String filename) {
        Path filePath = storageConfig.getRecordingsPath().resolve(filename).normalize();
        return Files.exists(filePath);
    }

    /**
     * 获取文件大小
     *
     * @param filename 文件名
     * @return 文件大小（字节）
     */
    public Long getFileSize(String filename) {
        try {
            Path filePath = storageConfig.getRecordingsPath().resolve(filename).normalize();
            if (!Files.exists(filePath)) {
                return 0L;
            }
            return Files.size(filePath);
        } catch (IOException e) {
            log.error("获取文件大小失败: {}", filename, e);
            return 0L;
        }
    }

    /**
     * 获取文件扩展名
     *
     * @param filename 文件名
     * @return 扩展名（小写，不含点）
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }

        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == filename.length() - 1) {
            return "";
        }

        return filename.substring(lastDotIndex + 1).toLowerCase();
    }

    /**
     * 获取文件的 MIME 类型
     *
     * @param filename 文件名
     * @return MIME 类型
     */
    public String getContentType(String filename) {
        String extension = getFileExtension(filename);

        return switch (extension) {
            case "mp4" -> "video/mp4";
            case "webm" -> "video/webm";
            case "mkv" -> "video/x-matroska";
            default -> "application/octet-stream";
        };
    }
}
