package com.videoplat.meeting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 参与者数据传输对象
 */
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
