package com.videoplat.service;

import io.agora.media.RtcTokenBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AgoraService {

    @Value("${app.agora.app-id}")
    private String appId;

    @Value("${app.agora.app-certificate}")
    private String appCertificate;

    @Value("${app.agora.token-expiration}")
    private Integer tokenExpiration;

    public String generateRtcToken(String channelName, Integer uid) {
        if (appCertificate == null || appCertificate.isEmpty()) {
            // 如果没有配置 App Certificate，返回 null（开发环境可以不使用 token）
            return null;
        }

        int timestamp = (int) (System.currentTimeMillis() / 1000);
        int privilegeExpiredTs = timestamp + tokenExpiration;

        RtcTokenBuilder tokenBuilder = new RtcTokenBuilder();
        return tokenBuilder.buildTokenWithUid(
                appId,
                appCertificate,
                channelName,
                uid,
                RtcTokenBuilder.Role.Role_Publisher,
                privilegeExpiredTs
        );
    }

    public String getAppId() {
        return appId;
    }
}
