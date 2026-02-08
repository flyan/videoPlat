package com.videoplat.meeting.controller;

import com.videoplat.common.dto.ApiResponse;
import com.videoplat.meeting.dto.RecordingDto;
import com.videoplat.meeting.service.RecordingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 录制控制器
 *
 * 处理会议录制相关的 HTTP 请求
 *
 * @author VideoPlat Team
 * @since 1.0
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "录制", description = "会议录制相关接口")
public class RecordingController {

    private final RecordingService recordingService;

    @PostMapping("/rooms/{roomId}/recordings/start")
    @Operation(summary = "开始录制")
    public ResponseEntity<ApiResponse<RecordingDto>> startRecording(
            @PathVariable String roomId,
            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        RecordingDto recording = recordingService.startRecording(roomId, userId);
        return ResponseEntity.ok(ApiResponse.success(recording));
    }

    @PostMapping("/rooms/{roomId}/recordings/stop")
    @Operation(summary = "停止录制")
    public ResponseEntity<ApiResponse<Void>> stopRecording(
            @PathVariable String roomId,
            @RequestParam(required = false) Long recordingId,
            Authentication authentication) {
        recordingService.stopRecording(roomId, recordingId);
        return ResponseEntity.ok(ApiResponse.success("录制已停止", null));
    }

    @GetMapping("/recordings")
    @Operation(summary = "获取录制列表")
    public ResponseEntity<ApiResponse<List<RecordingDto>>> getRecordings(
            @RequestParam(required = false) String roomName,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<RecordingDto> recordings = recordingService.getRecordings(roomName, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(recordings));
    }

    @GetMapping("/recordings/{recordingId}")
    @Operation(summary = "获取录制详情")
    public ResponseEntity<ApiResponse<RecordingDto>> getRecordingDetail(@PathVariable Long recordingId) {
        RecordingDto recording = recordingService.getRecordingDetail(recordingId);
        return ResponseEntity.ok(ApiResponse.success(recording));
    }

    @GetMapping("/recordings/{recordingId}/stream")
    @Operation(summary = "流式播放录制")
    public ResponseEntity<Resource> streamRecording(@PathVariable Long recordingId) {
        RecordingDto recording = recordingService.getRecordingDetail(recordingId);
        File file = new File(recording.getFilePath());

        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(file);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("video/mp4"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getName() + "\"")
                .body(resource);
    }

    @DeleteMapping("/recordings/{recordingId}")
    @Operation(summary = "删除录制")
    public ResponseEntity<ApiResponse<Void>> deleteRecording(
            @PathVariable Long recordingId,
            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        recordingService.deleteRecording(recordingId, userId);
        return ResponseEntity.ok(ApiResponse.success("录制已删除", null));
    }
}
