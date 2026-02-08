package com.videoplat.videoreview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 录制信息 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecordingDto {

    private Long id;
    private Long roomId;
    private String roomName;
    private String filePath;
    private Long fileSize;
    private String fileSizeFormatted; // 格式化后的文件大小，如 "125.5 MB"
    private Integer duration;
    private String durationFormatted; // 格式化后的时长，如 "01:23:45"
    private String resolution;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private Long creatorId;
    private Boolean canDelete; // 当前用户是否可以删除

    /**
     * 格式化文件大小
     */
    public static String formatFileSize(Long bytes) {
        if (bytes == null || bytes == 0) {
            return "0 B";
        }

        String[] units = {"B", "KB", "MB", "GB", "TB"};
        int unitIndex = 0;
        double size = bytes.doubleValue();

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return String.format("%.2f %s", size, units[unitIndex]);
    }

    /**
     * 格式化时长（秒转为 HH:MM:SS）
     */
    public static String formatDuration(Integer seconds) {
        if (seconds == null || seconds == 0) {
            return "00:00:00";
        }

        int hours = seconds / 3600;
        int minutes = (seconds % 3600) / 60;
        int secs = seconds % 60;

        return String.format("%02d:%02d:%02d", hours, minutes, secs);
    }
}
