package com.videoplat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
