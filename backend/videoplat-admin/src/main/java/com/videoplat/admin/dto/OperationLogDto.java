package com.videoplat.admin.dto;

import com.videoplat.domain.enums.AdminOperationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 操作日志 DTO
 *
 * 用于管理后台展示管理员操作日志
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperationLogDto {

    /**
     * 日志 ID
     */
    private Long id;

    /**
     * 管理员 ID
     */
    private Long adminId;

    /**
     * 管理员用户名
     */
    private String adminUsername;

    /**
     * 操作类型
     */
    private AdminOperationType operationType;

    /**
     * 操作类型描述
     */
    private String operationTypeDesc;

    /**
     * 目标用户 ID
     */
    private Long targetUserId;

    /**
     * 目标用户名
     */
    private String targetUsername;

    /**
     * 目标会议室 ID
     */
    private Long targetRoomId;

    /**
     * 目标会议室名称
     */
    private String targetRoomName;

    /**
     * 操作详情
     */
    private String operationDetail;

    /**
     * IP 地址
     */
    private String ipAddress;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
}
