package com.videoplat.meeting.websocket;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

/**
 * WebSocket 握手拦截器
 *
 * 在 WebSocket 握手阶段提取用户信息并存储到会话属性中
 *
 * @author VideoPlat Team
 * @since 1.0
 */
@Slf4j
@Component
public class WebSocketHandshakeInterceptor implements HandshakeInterceptor {

    /**
     * 握手前调用
     *
     * @param request HTTP 请求
     * @param response HTTP 响应
     * @param wsHandler WebSocket 处理器
     * @param attributes 会话属性
     * @return true 允许握手，false 拒绝握手
     */
    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        try {
            if (request instanceof ServletServerHttpRequest) {
                ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;

                // 从查询参数中获取用户 ID
                String query = servletRequest.getServletRequest().getQueryString();
                if (query != null && query.contains("userId=")) {
                    String userId = extractUserId(query);
                    if (userId != null) {
                        attributes.put("userId", userId);
                        log.info("WebSocket 握手成功，用户 ID: {}", userId);
                        return true;
                    }
                }

                // 也可以从 JWT Token 中提取用户 ID（如果使用 Token 认证）
                String token = servletRequest.getServletRequest().getHeader("Authorization");
                if (token != null && token.startsWith("Bearer ")) {
                    // TODO: 解析 JWT Token 获取用户 ID
                    // String userId = jwtService.extractUserId(token.substring(7));
                    // attributes.put("userId", userId);
                    // return true;
                }

                log.warn("WebSocket 握手失败：缺少用户 ID");
            }
        } catch (Exception e) {
            log.error("WebSocket 握手处理失败", e);
        }
        return false;
    }

    /**
     * 握手后调用
     *
     * @param request HTTP 请求
     * @param response HTTP 响应
     * @param wsHandler WebSocket 处理器
     * @param exception 握手过程中的异常
     */
    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                              WebSocketHandler wsHandler, Exception exception) {
        if (exception != null) {
            log.error("WebSocket 握手后处理失败", exception);
        }
    }

    /**
     * 从查询字符串中提取用户 ID
     *
     * @param query 查询字符串
     * @return 用户 ID，如果未找到则返回 null
     */
    private String extractUserId(String query) {
        String[] params = query.split("&");
        for (String param : params) {
            if (param.startsWith("userId=")) {
                return param.substring("userId=".length());
            }
        }
        return null;
    }
}
