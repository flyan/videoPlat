package com.videoplat.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 关闭会议室请求 DTO
 *
 * 管理员强制关闭会议室时使用
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CloseRoomRequest {

    /**
     * 关闭原因
     */
    @NotBlank(message = "关闭原因不能为空")
    private String reason;
}
