package com.videoplat.dto;

import com.videoplat.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

    private Long id;
    private String username;
    private String nickname;
    private String avatarUrl;
    private User.UserType userType;
    private LocalDateTime createdAt;
}
