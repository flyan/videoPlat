package com.videoplat.meeting.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.videoplat.meeting.dto.ChatMessageDTO;
import com.videoplat.meeting.websocket.WebSocketHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * 聊天服务
 *
 * 处理会议室聊天消息的发送、存储和获取
 *
 * @author VideoPlat Team
 * @since 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final WebSocketHandler webSocketHandler;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String CHAT_HISTORY_KEY_PREFIX = "chat:room:";
    private static final int CHAT_HISTORY_EXPIRE_HOURS = 24;
    private static final int MAX_CHAT_HISTORY_SIZE = 100;

    /**
     * 发送聊天消息到会议室
     *
     * @param roomId 会议室 ID
     * @param userId 发送者用户 ID
     * @param username 发送者用户名
     * @param content 消息内容
     * @return 聊天消息 DTO
     */
    public ChatMessageDTO sendMessage(String roomId, Long userId, String username, String content) {
        try {
            // 创建消息对象
            ChatMessageDTO message = ChatMessageDTO.builder()
                    .id(System.currentTimeMillis())
                    .roomId(roomId)
                    .userId(userId)
                    .username(username)
                    .content(content)
                    .type("text")
                    .timestamp(LocalDateTime.now())
                    .build();

            // 存储到 Redis（保留最近的消息历史）
            saveChatHistory(roomId, message);

            // 广播消息给会议室所有成员
            broadcastToRoom(roomId, message);

            log.info("用户 {} 在会议室 {} 发送消息", username, roomId);
            return message;

        } catch (Exception e) {
            log.error("发送聊天消息失败", e);
            throw new RuntimeException("发送消息失败");
        }
    }

    /**
     * 发送系统消息到会议室
     *
     * @param roomId 会议室 ID
     * @param content 消息内容
     */
    public void sendSystemMessage(String roomId, String content) {
        try {
            ChatMessageDTO message = ChatMessageDTO.builder()
                    .id(System.currentTimeMillis())
                    .roomId(roomId)
                    .userId(0L)
                    .username("系统")
                    .content(content)
                    .type("system")
                    .timestamp(LocalDateTime.now())
                    .build();

            saveChatHistory(roomId, message);
            broadcastToRoom(roomId, message);

        } catch (Exception e) {
            log.error("发送系统消息失败", e);
        }
    }

    /**
     * 获取会议室聊天历史
     *
     * @param roomId 会议室 ID
     * @return 聊天消息列表
     */
    public List<ChatMessageDTO> getChatHistory(String roomId) {
        try {
            String key = CHAT_HISTORY_KEY_PREFIX + roomId;
            List<Object> messages = redisTemplate.opsForList().range(key, 0, -1);

            if (messages == null || messages.isEmpty()) {
                return new ArrayList<>();
            }

            List<ChatMessageDTO> chatMessages = new ArrayList<>();
            for (Object msg : messages) {
                if (msg instanceof ChatMessageDTO) {
                    chatMessages.add((ChatMessageDTO) msg);
                }
            }

            return chatMessages;

        } catch (Exception e) {
            log.error("获取聊天历史失败", e);
            return new ArrayList<>();
        }
    }

    /**
     * 保存聊天消息到 Redis
     *
     * @param roomId 会议室 ID
     * @param message 聊天消息
     */
    private void saveChatHistory(String roomId, ChatMessageDTO message) {
        try {
            String key = CHAT_HISTORY_KEY_PREFIX + roomId;

            // 添加消息到列表
            redisTemplate.opsForList().rightPush(key, message);

            // 限制列表大小
            Long size = redisTemplate.opsForList().size(key);
            if (size != null && size > MAX_CHAT_HISTORY_SIZE) {
                redisTemplate.opsForList().trim(key, size - MAX_CHAT_HISTORY_SIZE, -1);
            }

            // 设置过期时间
            redisTemplate.expire(key, CHAT_HISTORY_EXPIRE_HOURS, TimeUnit.HOURS);

        } catch (Exception e) {
            log.error("保存聊天历史失败", e);
        }
    }

    /**
     * 广播消息到会议室所有成员
     *
     * @param roomId 会议室 ID
     * @param message 聊天消息
     */
    private void broadcastToRoom(String roomId, ChatMessageDTO message) {
        try {
            // 将消息转换为 JSON
            String jsonMessage = objectMapper.writeValueAsString(message);

            // 广播给所有在线用户（实际应该只发给该会议室的成员）
            // TODO: 维护会议室成员列表，只发送给会议室内的用户
            webSocketHandler.broadcastMessage(jsonMessage);

        } catch (Exception e) {
            log.error("广播消息失败", e);
        }
    }

    /**
     * 清除会议室聊天历史
     *
     * @param roomId 会议室 ID
     */
    public void clearChatHistory(String roomId) {
        try {
            String key = CHAT_HISTORY_KEY_PREFIX + roomId;
            redisTemplate.delete(key);
            log.info("清除会议室 {} 的聊天历史", roomId);
        } catch (Exception e) {
            log.error("清除聊天历史失败", e);
        }
    }
}
