package com.videoplat.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 在线用户信息 DTO
 *
 * 用于管理后台展示在线用户的简要信息
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OnlineUserDto {

    /**
     * 用户 ID
     */
    private Long userId;

    /**
     * 用户名
     */
    private String username;

    /**
     * 昵称
     */
    private String nickname;

    /**
     * 最后活跃时间
     */
    private LocalDateTime lastActiveAt;

    /**
     * 是否在会议中
     */
    private Boolean inMeeting;

    /**
     * 当前所在会议室 ID（如果在会议中）
     */
    private String currentRoomId;

    /**
     * 当前所在会议室名称（如果在会议中）
     */
    private String currentRoomName;
}
