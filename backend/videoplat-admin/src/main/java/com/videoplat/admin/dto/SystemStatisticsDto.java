package com.videoplat.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 系统统计信息 DTO
 *
 * 用于管理后台展示系统整体运行状态和统计数据
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemStatisticsDto {

    /**
     * 总用户数
     */
    private Long totalUsers;

    /**
     * 注册用户数
     */
    private Long registeredUsers;

    /**
     * 游客用户数
     */
    private Long guestUsers;

    /**
     * 在线用户数
     */
    private Long onlineUsers;

    /**
     * 总会议室数
     */
    private Long totalRooms;

    /**
     * 进行中的会议室数
     */
    private Long activeRooms;

    /**
     * 已结束的会议室数
     */
    private Long endedRooms;

    /**
     * 总录制数
     */
    private Long totalRecordings;

    /**
     * 今日新增用户数
     */
    private Long todayNewUsers;

    /**
     * 今日新增会议室数
     */
    private Long todayNewRooms;

    /**
     * 今日新增录制数
     */
    private Long todayNewRecordings;

    /**
     * 系统运行时长（秒）
     */
    private Long systemUptimeSeconds;

    /**
     * 最大并发会议室数限制
     */
    private Integer maxConcurrentRooms;

    /**
     * 单个会议室最大人数限制
     */
    private Integer maxParticipantsPerRoom;
}
