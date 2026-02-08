package com.videoplat.admin.controller;

import com.videoplat.admin.dto.OperationLogDto;
import com.videoplat.admin.service.AdminOperationLogService;
import com.videoplat.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 管理员操作日志控制器
 *
 * 提供操作日志查询功能
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/operation-logs")
@RequiredArgsConstructor
@Tag(name = "管理员操作日志", description = "操作日志查询相关接口")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOperationLogController {

    private final AdminOperationLogService operationLogService;

    /**
     * 获取操作日志（分页）
     */
    @GetMapping
    @Operation(summary = "获取操作日志", description = "分页查询管理员操作日志")
    public ApiResponse<Page<OperationLogDto>> getOperationLogs(
            @Parameter(description = "页码（从0开始）") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "20") int size) {

        log.info("管理员查询操作日志，page={}, size={}", page, size);
        Page<OperationLogDto> logs = operationLogService.getOperationLogs(page, size);
        return ApiResponse.success(logs);
    }
}
