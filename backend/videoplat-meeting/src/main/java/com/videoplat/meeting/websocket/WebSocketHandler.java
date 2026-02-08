package com.videoplat.meeting.websocket;

import com.videoplat.meeting.service.OnlineStatusService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * WebSocket 处理器
 *
 * 负责处理 WebSocket 连接、消息和断开事件，管理用户在线状态
 *
 * @author VideoPlat Team
 * @since 1.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketHandler extends TextWebSocketHandler {

    private final OnlineStatusService onlineStatusService;

    // 存储所有活跃的 WebSocket 会话，key 为用户 ID
    private final Map<Long, WebSocketSession> sessions = new ConcurrentHashMap<>();

    /**
     * WebSocket 连接建立后调用
     *
     * @param session WebSocket 会话
     */
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Long userId = getUserIdFromSession(session);
        if (userId != null) {
            sessions.put(userId, session);
            onlineStatusService.setUserOnline(userId);
            log.info("用户 {} 建立 WebSocket 连接", userId);
        } else {
            log.warn("无法从 WebSocket 会话中获取用户 ID");
            session.close();
        }
    }

    /**
     * 接收到 WebSocket 消息时调用
     *
     * @param session WebSocket 会话
     * @param message 文本消息
     */
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Long userId = getUserIdFromSession(session);
        if (userId != null) {
            log.debug("收到用户 {} 的消息: {}", userId, message.getPayload());
            // 这里可以处理客户端发送的消息，例如心跳包
            // 目前只用于维持连接和在线状态
        }
    }

    /**
     * WebSocket 连接关闭后调用
     *
     * @param session WebSocket 会话
     * @param status 关闭状态
     */
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Long userId = getUserIdFromSession(session);
        if (userId != null) {
            sessions.remove(userId);
            onlineStatusService.setUserOffline(userId);
            log.info("用户 {} 断开 WebSocket 连接，状态: {}", userId, status);
        }
    }

    /**
     * WebSocket 传输错误时调用
     *
     * @param session WebSocket 会话
     * @param exception 异常
     */
    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        Long userId = getUserIdFromSession(session);
        log.error("用户 {} 的 WebSocket 连接发生错误", userId, exception);

        if (session.isOpen()) {
            session.close();
        }

        if (userId != null) {
            sessions.remove(userId);
            onlineStatusService.setUserOffline(userId);
        }
    }

    /**
     * 从 WebSocket 会话中获取用户 ID
     *
     * @param session WebSocket 会话
     * @return 用户 ID，如果无法获取则返回 null
     */
    private Long getUserIdFromSession(WebSocketSession session) {
        try {
            // 从会话属性中获取用户 ID（需要在握手拦截器中设置）
            Object userIdObj = session.getAttributes().get("userId");
            if (userIdObj != null) {
                return Long.parseLong(userIdObj.toString());
            }
        } catch (Exception e) {
            log.error("解析用户 ID 失败", e);
        }
        return null;
    }

    /**
     * 向指定用户发送消息
     *
     * @param userId 用户 ID
     * @param message 消息内容
     */
    public void sendMessageToUser(Long userId, String message) {
        WebSocketSession session = sessions.get(userId);
        if (session != null && session.isOpen()) {
            try {
                session.sendMessage(new TextMessage(message));
                log.debug("向用户 {} 发送消息: {}", userId, message);
            } catch (Exception e) {
                log.error("向用户 {} 发送消息失败", userId, e);
            }
        }
    }

    /**
     * 广播消息给所有在线用户
     *
     * @param message 消息内容
     */
    public void broadcastMessage(String message) {
        sessions.forEach((userId, session) -> {
            if (session.isOpen()) {
                try {
                    session.sendMessage(new TextMessage(message));
                } catch (Exception e) {
                    log.error("向用户 {} 广播消息失败", userId, e);
                }
            }
        });
    }
}
