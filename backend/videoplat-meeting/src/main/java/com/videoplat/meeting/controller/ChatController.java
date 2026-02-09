package com.videoplat.meeting.controller;

import com.videoplat.common.dto.ApiResponse;
import com.videoplat.domain.entity.User;
import com.videoplat.domain.repository.UserRepository;
import com.videoplat.meeting.dto.ChatMessageDTO;
import com.videoplat.meeting.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 聊天控制器
 *
 * 处理会议室聊天相关的 HTTP 请求
 *
 * @author VideoPlat Team
 * @since 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@Tag(name = "聊天管理", description = "会议室聊天消息管理接口")
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    /**
     * 发送聊天消息
     *
     * @param roomId 会议室 ID
     * @param request 消息请求体
     * @param authentication 认证信息
     * @return 发送的消息
     */
    @PostMapping("/rooms/{roomId}/messages")
    @Operation(summary = "发送聊天消息", description = "向指定会议室发送聊天消息")
    public ApiResponse<ChatMessageDTO> sendMessage(
            @Parameter(description = "会议室 ID") @PathVariable String roomId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        try {
            String content = request.get("content");
            if (content == null || content.trim().isEmpty()) {
                return ApiResponse.error("消息内容不能为空");
            }

            // 从认证信息中获取用户 ID
            Long userId = Long.parseLong(authentication.getName());

            // 从数据库获取用户信息
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("用户不存在"));

            String username = user.getNickname() != null ? user.getNickname() : user.getUsername();

            ChatMessageDTO message = chatService.sendMessage(roomId, userId, username, content);
            return ApiResponse.success(message);

        } catch (Exception e) {
            log.error("发送聊天消息失败", e);
            return ApiResponse.error("发送消息失败");
        }
    }

    /**
     * 获取会议室聊天历史
     *
     * @param roomId 会议室 ID
     * @return 聊天消息列表
     */
    @GetMapping("/rooms/{roomId}/messages")
    @Operation(summary = "获取聊天历史", description = "获取指定会议室的聊天历史记录")
    public ApiResponse<List<ChatMessageDTO>> getChatHistory(
            @Parameter(description = "会议室 ID") @PathVariable String roomId) {

        try {
            List<ChatMessageDTO> messages = chatService.getChatHistory(roomId);
            return ApiResponse.success(messages);
        } catch (Exception e) {
            log.error("获取聊天历史失败", e);
            return ApiResponse.error("获取聊天历史失败");
        }
    }

    /**
     * 清除会议室聊天历史
     *
     * @param roomId 会议室 ID
     * @return 操作结果
     */
    @DeleteMapping("/rooms/{roomId}/messages")
    @Operation(summary = "清除聊天历史", description = "清除指定会议室的聊天历史记录")
    public ApiResponse<Void> clearChatHistory(
            @Parameter(description = "会议室 ID") @PathVariable String roomId) {

        try {
            chatService.clearChatHistory(roomId);
            return ApiResponse.success(null);
        } catch (Exception e) {
            log.error("清除聊天历史失败", e);
            return ApiResponse.error("清除聊天历史失败");
        }
    }
}
