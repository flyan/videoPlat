package com.videoplat.meeting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 聊天消息 DTO
 *
 * @author VideoPlat Team
 * @since 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {

    /**
     * 消息 ID
     */
    private Long id;

    /**
     * 会议室 ID
     */
    private String roomId;

    /**
     * 发送者用户 ID
     */
    private Long userId;

    /**
     * 发送者用户名
     */
    private String username;

    /**
     * 消息内容
     */
    private String content;

    /**
     * 消息类型（text, system）
     */
    private String type;

    /**
     * 发送时间
     */
    private LocalDateTime timestamp;
}
