package com.videoplat.meeting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Agora RTC Token 响应
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgoraTokenResponse {

    private String token;
    private String appId;
    private String channelName;
    private Integer uid;
    private Integer expirationTime;
}
