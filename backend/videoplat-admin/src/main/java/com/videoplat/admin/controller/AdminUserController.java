package com.videoplat.admin.controller;

import com.videoplat.admin.dto.OnlineUserDto;
import com.videoplat.admin.dto.UserStatusDto;
import com.videoplat.admin.dto.ForceOfflineRequest;
import com.videoplat.admin.service.AdminOperationLogService;
import com.videoplat.admin.service.AdminUserService;
import com.videoplat.common.dto.ApiResponse;
import com.videoplat.common.util.SecurityUtils;
import com.videoplat.domain.enums.AdminOperationType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 管理员用户管理控制器
 *
 * 提供用户查询、在线用户管理、强制下线等功能
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@Tag(name = "管理员用户管理", description = "用户管理相关接口")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;
    private final AdminOperationLogService operationLogService;

    /**
     * 获取所有用户（分页）
     */
    @GetMapping
    @Operation(summary = "获取所有用户", description = "分页查询所有用户信息")
    public ApiResponse<Page<UserStatusDto>> getAllUsers(
            @Parameter(description = "页码（从0开始）") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "20") int size) {

        log.info("管理员查询所有用户，page={}, size={}", page, size);
        Page<UserStatusDto> users = adminUserService.getAllUsers(page, size);
        return ApiResponse.success(users);
    }

    /**
     * 获取在线用户列表
     */
    @GetMapping("/online")
    @Operation(summary = "获取在线用户", description = "查询当前所有在线用户")
    public ApiResponse<List<OnlineUserDto>> getOnlineUsers() {
        log.info("管理员查询在线用户");
        List<OnlineUserDto> onlineUsers = adminUserService.getOnlineUsers();
        return ApiResponse.success(onlineUsers);
    }

    /**
     * 获取用户详情
     */
    @GetMapping("/{userId}")
    @Operation(summary = "获取用户详情", description = "根据用户ID查询用户详细信息")
    public ApiResponse<UserStatusDto> getUserDetail(
            @Parameter(description = "用户ID") @PathVariable Long userId) {

        log.info("管理员查询用户详情，userId={}", userId);
        UserStatusDto user = adminUserService.getUserDetail(userId);
        return ApiResponse.success(user);
    }

    /**
     * 强制用户下线
     */
    @PostMapping("/{userId}/force-offline")
    @Operation(summary = "强制用户下线", description = "管理员强制指定用户下线")
    public ApiResponse<Void> forceUserOffline(
            @Parameter(description = "用户ID") @PathVariable Long userId,
            @Valid @RequestBody ForceOfflineRequest request,
            HttpServletRequest httpRequest) {

        Long adminId = SecurityUtils.getCurrentUserId();
        String adminUsername = SecurityUtils.getCurrentUsername();

        log.info("管理员 {} 强制用户 {} 下线，原因: {}", adminUsername, userId, request.getReason());

        // 执行强制下线
        adminUserService.forceUserOffline(userId, request.getReason());

        // 记录操作日志
        String operationDetail = String.format("强制用户下线，原因: %s", request.getReason());
        operationLogService.saveOperationLog(
                adminId,
                adminUsername,
                AdminOperationType.FORCE_OFFLINE,
                userId,
                null,
                operationDetail,
                getClientIp(httpRequest)
        );

        return ApiResponse.successWithMessage("用户已强制下线");
    }

    /**
     * 获取客户端 IP 地址
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
