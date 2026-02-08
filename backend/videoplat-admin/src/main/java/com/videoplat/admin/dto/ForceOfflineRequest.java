package com.videoplat.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 强制下线请求 DTO
 *
 * 管理员强制用户下线时使用
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForceOfflineRequest {

    /**
     * 强制下线原因
     */
    @NotBlank(message = "下线原因不能为空")
    private String reason;
}
