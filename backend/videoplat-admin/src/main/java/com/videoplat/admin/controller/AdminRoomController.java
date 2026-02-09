package com.videoplat.admin.controller;

import com.videoplat.admin.dto.CloseRoomRequest;
import com.videoplat.admin.dto.RoomStatusDto;
import com.videoplat.admin.service.AdminOperationLogService;
import com.videoplat.admin.service.AdminRoomService;
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
 * 管理员会议室管理控制器
 *
 * 提供会议室查询、强制关闭等功能
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/rooms")
@RequiredArgsConstructor
@Tag(name = "管理员会议室管理", description = "会议室管理相关接口")
@PreAuthorize("hasRole('ADMIN')")
public class AdminRoomController {

    private final AdminRoomService adminRoomService;
    private final AdminOperationLogService operationLogService;

    /**
     * 获取所有会议室（分页）
     */
    @GetMapping
    @Operation(summary = "获取所有会议室", description = "分页查询所有会议室信息")
    public ApiResponse<Page<RoomStatusDto>> getAllRooms(
            @Parameter(description = "页码（从0开始）") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "20") int size) {

        log.info("管理员查询所有会议室，page={}, size={}", page, size);
        Page<RoomStatusDto> rooms = adminRoomService.getAllRooms(page, size);
        return ApiResponse.success(rooms);
    }

    /**
     * 获取进行中的会议室列表
     */
    @GetMapping("/active")
    @Operation(summary = "获取进行中的会议室", description = "查询当前所有进行中的会议室")
    public ApiResponse<List<RoomStatusDto>> getActiveRooms() {
        log.info("管理员查询进行中的会议室");
        List<RoomStatusDto> activeRooms = adminRoomService.getActiveRooms();
        return ApiResponse.success(activeRooms);
    }

    /**
     * 获取会议室详情
     */
    @GetMapping("/{roomId}")
    @Operation(summary = "获取会议室详情", description = "根据会议室ID查询会议室详细信息")
    public ApiResponse<RoomStatusDto> getRoomDetail(
            @Parameter(description = "会议室ID") @PathVariable String roomId) {

        log.info("管理员查询会议室详情，roomId={}", roomId);
        RoomStatusDto room = adminRoomService.getRoomDetail(roomId);
        return ApiResponse.success(room);
    }

    /**
     * 强制关闭会议室
     */
    @PostMapping("/{roomId}/force-close")
    @Operation(summary = "强制关闭会议室", description = "管理员强制关闭指定会议室")
    public ApiResponse<Void> forceCloseRoom(
            @Parameter(description = "会议室ID") @PathVariable String roomId,
            @Valid @RequestBody CloseRoomRequest request,
            HttpServletRequest httpRequest) {

        Long adminId = SecurityUtils.getCurrentUserId();
        String adminUsername = SecurityUtils.getCurrentUsername();

        log.info("管理员 {} 强制关闭会议室 {}，原因: {}", adminUsername, roomId, request.getReason());

        // 获取会议室详情（用于记录日志）
        RoomStatusDto room = adminRoomService.getRoomDetail(roomId);

        // 执行强制关闭
        adminRoomService.forceCloseRoom(roomId, request.getReason());

        // 记录操作日志
        String operationDetail = String.format("强制关闭会议室 %s，原因: %s", room.getRoomName(), request.getReason());
        operationLogService.saveOperationLog(
                adminId,
                adminUsername,
                AdminOperationType.CLOSE_ROOM,
                null,
                room.getId(),
                operationDetail,
                getClientIp(httpRequest)
        );

        return ApiResponse.successWithMessage("会议室已强制关闭");
    }

    /**
     * 强制关闭所有会议室
     */
    @PostMapping("/force-close-all")
    @Operation(summary = "强制关闭所有会议室", description = "管理员强制关闭所有进行中的会议室")
    public ApiResponse<Integer> forceCloseAllRooms(
            @Valid @RequestBody CloseRoomRequest request,
            HttpServletRequest httpRequest) {

        Long adminId = SecurityUtils.getCurrentUserId();
        String adminUsername = SecurityUtils.getCurrentUsername();

        log.info("管理员 {} 强制关闭所有会议室，原因: {}", adminUsername, request.getReason());

        // 执行强制关闭所有会议室
        int closedCount = adminRoomService.forceCloseAllRooms(request.getReason());

        // 记录操作日志
        String operationDetail = String.format("强制关闭所有会议室，共 %d 个，原因: %s", closedCount, request.getReason());
        operationLogService.saveOperationLog(
                adminId,
                adminUsername,
                AdminOperationType.CLOSE_ROOM,
                null,
                null,
                operationDetail,
                getClientIp(httpRequest)
        );

        return ApiResponse.success(String.format("已强制关闭 %d 个会议室", closedCount), closedCount);
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
