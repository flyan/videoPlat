package com.videoplat.meeting.config;

import com.videoplat.meeting.websocket.WebSocketHandler;
import com.videoplat.meeting.websocket.WebSocketHandshakeInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * WebSocket 配置
 *
 * 配置 WebSocket 端点和处理器
 *
 * @author VideoPlat Team
 * @since 1.0
 */
@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final WebSocketHandler webSocketHandler;
    private final WebSocketHandshakeInterceptor handshakeInterceptor;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(webSocketHandler, "/ws/meeting")
                .addInterceptors(handshakeInterceptor)
                .setAllowedOrigins("*"); // 生产环境应该配置具体的域名
    }
}
