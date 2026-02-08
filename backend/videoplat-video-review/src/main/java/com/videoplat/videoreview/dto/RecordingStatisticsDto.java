package com.videoplat.videoreview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 录制统计信息 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecordingStatisticsDto {

    /**
     * 录制总数
     */
    private Long totalRecordings;

    /**
     * 总文件大小（字节）
     */
    private Long totalFileSize;

    /**
     * 格式化后的总文件大小
     */
    private String totalFileSizeFormatted;

    /**
     * 总时长（秒）
     */
    private Long totalDuration;

    /**
     * 格式化后的总时长
     */
    private String totalDurationFormatted;

    /**
     * 平均文件大小（字节）
     */
    private Long averageFileSize;

    /**
     * 格式化后的平均文件大小
     */
    private String averageFileSizeFormatted;

    /**
     * 平均时长（秒）
     */
    private Long averageDuration;

    /**
     * 格式化后的平均时长
     */
    private String averageDurationFormatted;
}
