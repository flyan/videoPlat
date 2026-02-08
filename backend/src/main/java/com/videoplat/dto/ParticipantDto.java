package com.videoplat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantDto {

    private Long id;
    private Long userId;
    private String nickname;
    private String avatarUrl;
    private Boolean isHost;
    private LocalDateTime joinedAt;
}
