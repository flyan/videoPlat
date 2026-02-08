package com.videoplat.videoreview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 录制查询请求
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecordingQueryRequest {

    /**
     * 会议室名称（模糊匹配）
     */
    private String roomName;

    /**
     * 开始时间（筛选录制开始时间 >= startDate）
     */
    private LocalDateTime startDate;

    /**
     * 结束时间（筛选录制开始时间 <= endDate）
     */
    private LocalDateTime endDate;

    /**
     * 创建者ID（筛选指定用户创建的录制）
     */
    private Long creatorId;

    /**
     * 页码（从0开始）
     */
    @Builder.Default
    private Integer page = 0;

    /**
     * 每页大小
     */
    @Builder.Default
    private Integer size = 20;

    /**
     * 排序字段（默认按开始时间）
     */
    @Builder.Default
    private String sortBy = "startedAt";

    /**
     * 排序方向（ASC/DESC）
     */
    @Builder.Default
    private String sortDirection = "DESC";
}
