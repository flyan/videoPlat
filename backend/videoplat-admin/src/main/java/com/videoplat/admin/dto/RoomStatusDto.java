package com.videoplat.admin.dto;

import com.videoplat.domain.enums.RoomStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 会议室状态信息 DTO
 *
 * 用于管理后台展示会议室详细信息，包括参与者列表
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomStatusDto {

    /**
     * 会议室数据库 ID
     */
    private Long id;

    /**
     * 会议室唯一标识符
     */
    private String roomId;

    /**
     * 会议室名称
     */
    private String roomName;

    /**
     * 创建者 ID
     */
    private Long creatorId;

    /**
     * 创建者用户名
     */
    private String creatorUsername;

    /**
     * 创建者昵称
     */
    private String creatorNickname;

    /**
     * 最大参与人数
     */
    private Integer maxParticipants;

    /**
     * 当前参与人数
     */
    private Integer currentParticipants;

    /**
     * 会议室状态
     */
    private RoomStatus status;

    /**
     * 是否有密码
     */
    private Boolean hasPassword;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 结束时间
     */
    private LocalDateTime endedAt;

    /**
     * 会议持续时长（分钟）
     */
    private Long durationMinutes;

    /**
     * 参与者列表
     */
    private List<ParticipantInfo> participants;

    /**
     * 参与者信息
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParticipantInfo {
        private Long userId;
        private String username;
        private String nickname;
        private Boolean isHost;
        private LocalDateTime joinedAt;
    }
}
