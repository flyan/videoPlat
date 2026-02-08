package com.videoplat.auth.dto;

import com.videoplat.domain.enums.UserType;
import com.videoplat.domain.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 用户数据传输对象
 *
 * 不包含敏感信息（如密码哈希）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

    private Long id;
    private String username;
    private String nickname;
    private String avatarUrl;
    private UserType userType;
    private UserRole role;
    private LocalDateTime createdAt;
}
