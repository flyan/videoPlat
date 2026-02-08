package com.videoplat.controller;

import com.videoplat.dto.*;
import com.videoplat.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@Tag(name = "会议室", description = "会议室管理相关接口")
public class RoomController {

    private final RoomService roomService;

    @PostMapping
    @Operation(summary = "创建会议室")
    public ResponseEntity<ApiResponse<RoomDto>> createRoom(
            @Valid @RequestBody CreateRoomRequest request,
            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        RoomDto room = roomService.createRoom(request, userId);
        return ResponseEntity.ok(ApiResponse.success(room));
    }

    @GetMapping("/{roomId}")
    @Operation(summary = "获取会议室信息")
    public ResponseEntity<ApiResponse<RoomDto>> getRoomInfo(@PathVariable String roomId) {
        RoomDto room = roomService.getRoomInfo(roomId);
        return ResponseEntity.ok(ApiResponse.success(room));
    }

    @PostMapping("/{roomId}/join")
    @Operation(summary = "加入会议室")
    public ResponseEntity<ApiResponse<Void>> joinRoom(
            @PathVariable String roomId,
            @RequestBody JoinRoomRequest request,
            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        roomService.joinRoom(roomId, request, userId);
        return ResponseEntity.ok(ApiResponse.success("成功加入会议室", null));
    }

    @PostMapping("/{roomId}/leave")
    @Operation(summary = "离开会议室")
    public ResponseEntity<ApiResponse<Void>> leaveRoom(
            @PathVariable String roomId,
            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        roomService.leaveRoom(roomId, userId);
        return ResponseEntity.ok(ApiResponse.success("已离开会议室", null));
    }

    @DeleteMapping("/{roomId}")
    @Operation(summary = "结束会议室")
    public ResponseEntity<ApiResponse<Void>> endRoom(
            @PathVariable String roomId,
            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        roomService.endRoom(roomId, userId);
        return ResponseEntity.ok(ApiResponse.success("会议室已结束", null));
    }

    @GetMapping("/{roomId}/participants")
    @Operation(summary = "获取参与者列表")
    public ResponseEntity<ApiResponse<List<ParticipantDto>>> getParticipants(@PathVariable String roomId) {
        List<ParticipantDto> participants = roomService.getParticipants(roomId);
        return ResponseEntity.ok(ApiResponse.success(participants));
    }

    @GetMapping("/{roomId}/agora-token")
    @Operation(summary = "获取 Agora Token")
    public ResponseEntity<ApiResponse<AgoraTokenResponse>> getAgoraToken(
            @PathVariable String roomId,
            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        AgoraTokenResponse token = roomService.getAgoraToken(roomId, userId);
        return ResponseEntity.ok(ApiResponse.success(token));
    }
}
