package com.videoplat.meeting.service;

import io.agora.media.RtcTokenBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Agora 声网服务
 *
 * 负责生成 Agora RTC Token，用于客户端加入音视频频道
 *
 * @author VideoPlat Team
 * @since 1.0
 */
@Service
public class AgoraService {

    @Value("${app.agora.app-id}")
    private String appId;

    @Value("${app.agora.app-certificate}")
    private String appCertificate;

    // Token 有效期（秒）
    @Value("${app.agora.token-expiration}")
    private Integer tokenExpiration;

    /**
     * 生成 Agora RTC Token
     *
     * Token 用于客户端加入 Agora 频道，具有时效性（默认 1 小时）
     *
     * @param channelName 频道名称（会议室 ID）
     * @param uid 用户 ID
     * @return RTC Token，如果未配置 App Certificate 则返回 null（开发环境可不使用 Token）
     */
    public String generateRtcToken(String channelName, Integer uid) {
        if (appCertificate == null || appCertificate.isEmpty()) {
            // 如果没有配置 App Certificate，返回 null（开发环境可以不使用 token）
            return null;
        }

        // 1. 获取当前时间戳（秒）
        int timestamp = (int) (System.currentTimeMillis() / 1000);

        // 2. 计算 Token 过期时间戳
        int privilegeExpiredTs = timestamp + tokenExpiration;

        // 3. 使用 Agora SDK 生成 Token
        RtcTokenBuilder tokenBuilder = new RtcTokenBuilder();
        return tokenBuilder.buildTokenWithUid(
                appId,
                appCertificate,
                channelName,
                uid,
                RtcTokenBuilder.Role.Role_Publisher,  // 发布者角色，可发送和接收音视频
                privilegeExpiredTs
        );
    }

    /**
     * 获取 Agora App ID
     *
     * @return App ID
     */
    public String getAppId() {
        return appId;
    }
}
