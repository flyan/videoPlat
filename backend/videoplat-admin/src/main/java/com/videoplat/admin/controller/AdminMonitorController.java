package com.videoplat.admin.controller;

import com.videoplat.admin.dto.SystemStatisticsDto;
import com.videoplat.admin.service.AdminMonitorService;
import com.videoplat.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 管理员系统监控控制器
 *
 * 提供系统统计信息、运行状态等功能
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/statistics")
@RequiredArgsConstructor
@Tag(name = "管理员系统监控", description = "系统监控相关接口")
@PreAuthorize("hasRole('ADMIN')")
public class AdminMonitorController {

    private final AdminMonitorService adminMonitorService;

    /**
     * 获取系统统计信息
     */
    @GetMapping
    @Operation(summary = "获取系统统计信息", description = "查询系统整体运行状态和统计数据")
    public ApiResponse<SystemStatisticsDto> getSystemStatistics() {
        log.info("管理员查询系统统计信息");
        SystemStatisticsDto statistics = adminMonitorService.getSystemStatistics();
        return ApiResponse.success(statistics);
    }
}
