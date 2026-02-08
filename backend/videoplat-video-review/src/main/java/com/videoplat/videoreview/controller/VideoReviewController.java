package com.videoplat.videoreview.controller;

import com.videoplat.common.dto.ApiResponse;
import com.videoplat.videoreview.dto.RecordingDto;
import com.videoplat.videoreview.dto.RecordingQueryRequest;
import com.videoplat.videoreview.dto.RecordingStatisticsDto;
import com.videoplat.videoreview.service.RecordingStorageService;
import com.videoplat.videoreview.service.VideoReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * 录制管理控制器
 */
@RestController
@RequestMapping("/api/v1/video-review")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "录制管理", description = "录制文件的查询、播放、下载和删除")
public class VideoReviewController {

    private final VideoReviewService videoReviewService;
    private final RecordingStorageService storageService;

    /**
     * 查询录制列表（分页、过滤）
     */
    @GetMapping("/recordings")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "查询录制列表", description = "支持分页和多条件筛选")
    public ApiResponse<Page<RecordingDto>> getRecordings(
        @Parameter(description = "会议室名称（模糊匹配）")
        @RequestParam(required = false) String roomName,

        @Parameter(description = "开始时间")
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,

        @Parameter(description = "结束时间")
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,

        @Parameter(description = "创建者ID")
        @RequestParam(required = false) Long creatorId,

        @Parameter(description = "页码（从0开始）")
        @RequestParam(defaultValue = "0") Integer page,

        @Parameter(description = "每页大小")
        @RequestParam(defaultValue = "20") Integer size,

        @Parameter(description = "排序字段")
        @RequestParam(defaultValue = "startedAt") String sortBy,

        @Parameter(description = "排序方向（ASC/DESC）")
        @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        RecordingQueryRequest queryRequest = RecordingQueryRequest.builder()
            .roomName(roomName)
            .startDate(startDate)
            .endDate(endDate)
            .creatorId(creatorId)
            .page(page)
            .size(size)
            .sortBy(sortBy)
            .sortDirection(sortDirection)
            .build();

        Page<RecordingDto> recordings = videoReviewService.getRecordings(queryRequest);
        return ApiResponse.success(recordings);
    }

    /**
     * 获取录制详情
     */
    @GetMapping("/recordings/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "获取录制详情", description = "根据ID获取录制的详细信息")
    public ApiResponse<RecordingDto> getRecordingById(
        @Parameter(description = "录制ID")
        @PathVariable Long id
    ) {
        RecordingDto recording = videoReviewService.getRecordingById(id);
        return ApiResponse.success(recording);
    }

    /**
     * 流式播放录制
     */
    @GetMapping("/recordings/{id}/stream")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "流式播放录制", description = "支持 HTTP Range 请求，用于视频播放")
    public ResponseEntity<Resource> streamRecording(
        @Parameter(description = "录制ID")
        @PathVariable Long id,

        @RequestHeader(value = HttpHeaders.RANGE, required = false) String rangeHeader
    ) {
        // 获取录制信息
        RecordingDto recording = videoReviewService.getRecordingById(id);

        // 提取文件名
        String filename = extractFilename(recording.getFilePath());

        // 加载文件资源
        Resource resource = storageService.loadAsResource(filename);

        // 获取内容类型
        String contentType = storageService.getContentType(filename);

        // 构建响应头
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType));
        headers.add(HttpHeaders.ACCEPT_RANGES, "bytes");

        // 支持 Range 请求（用于视频播放）
        if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
            // 简化实现：返回 206 Partial Content
            // 完整实现需要解析 Range 头并返回对应的字节范围
            headers.add(HttpHeaders.CONTENT_RANGE, "bytes 0-" + (recording.getFileSize() - 1) + "/" + recording.getFileSize());
            return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                .headers(headers)
                .body(resource);
        }

        // 返回完整文件
        return ResponseEntity.ok()
            .headers(headers)
            .body(resource);
    }

    /**
     * 下载录制
     */
    @GetMapping("/recordings/{id}/download")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "下载录制", description = "下载录制文件到本地")
    public ResponseEntity<Resource> downloadRecording(
        @Parameter(description = "录制ID")
        @PathVariable Long id
    ) {
        // 获取录制信息
        RecordingDto recording = videoReviewService.getRecordingById(id);

        // 提取文件名
        String filename = extractFilename(recording.getFilePath());

        // 加载文件资源
        Resource resource = storageService.loadAsResource(filename);

        // 获取内容类型
        String contentType = storageService.getContentType(filename);

        // 构建响应头
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType));
        headers.setContentDispositionFormData("attachment", filename);

        return ResponseEntity.ok()
            .headers(headers)
            .body(resource);
    }

    /**
     * 删除录制
     */
    @DeleteMapping("/recordings/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "删除录制", description = "删除录制文件和数据库记录（仅创建者和管理员）")
    public ApiResponse<Void> deleteRecording(
        @Parameter(description = "录制ID")
        @PathVariable Long id
    ) {
        videoReviewService.deleteRecording(id);
        return ApiResponse.success("录制删除成功", null);
    }

    /**
     * 获取存储统计信息
     */
    @GetMapping("/statistics")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "获取存储统计", description = "获取录制文件的统计信息")
    public ApiResponse<RecordingStatisticsDto> getStatistics() {
        RecordingStatisticsDto statistics = videoReviewService.getStatistics();
        return ApiResponse.success(statistics);
    }

    /**
     * 从文件路径中提取文件名
     */
    private String extractFilename(String filePath) {
        if (filePath == null || filePath.isEmpty()) {
            return "";
        }

        // 处理 Windows 和 Unix 路径
        int lastSlash = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'));
        if (lastSlash == -1) {
            return filePath;
        }

        return filePath.substring(lastSlash + 1);
    }
}
