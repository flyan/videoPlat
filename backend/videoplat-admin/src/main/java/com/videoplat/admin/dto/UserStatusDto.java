package com.videoplat.admin.dto;

import com.videoplat.domain.enums.UserOnlineStatus;
import com.videoplat.domain.enums.UserRole;
import com.videoplat.domain.enums.UserType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 用户状态信息 DTO
 *
 * 用于管理后台展示用户详细信息，包括在线状态、角色、类型等
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatusDto {

    /**
     * 用户 ID
     */
    private Long id;

    /**
     * 用户名
     */
    private String username;

    /**
     * 昵称
     */
    private String nickname;

    /**
     * 头像 URL
     */
    private String avatarUrl;

    /**
     * 用户类型（注册用户/游客）
     */
    private UserType userType;

    /**
     * 用户角色（管理员/普通用户）
     */
    private UserRole role;

    /**
     * 在线状态
     */
    private UserOnlineStatus onlineStatus;

    /**
     * 最后活跃时间
     */
    private LocalDateTime lastActiveAt;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 当前所在会议室 ID（如果在会议中）
     */
    private String currentRoomId;

    /**
     * 当前所在会议室名称（如果在会议中）
     */
    private String currentRoomName;
}
