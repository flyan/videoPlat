package com.videoplat.auth.controller;

import com.videoplat.auth.dto.*;
import com.videoplat.auth.service.AuthService;
import com.videoplat.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 用户认证控制器
 *
 * 处理用户登录、游客登录等认证相关的 HTTP 请求
 *
 * @author VideoPlat Team
 * @since 1.0
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "认证", description = "用户认证相关接口")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "用户登录")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/guest")
    @Operation(summary = "游客登录")
    public ResponseEntity<ApiResponse<AuthResponse>> guestLogin(@Valid @RequestBody GuestLoginRequest request) {
        AuthResponse response = authService.guestLogin(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
