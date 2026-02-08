package com.videoplat.controller;

import com.videoplat.dto.ApiResponse;
import com.videoplat.dto.UserDto;
import com.videoplat.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "用户", description = "用户相关接口")
public class UserController {

    private final AuthService authService;

    @GetMapping("/me")
    @Operation(summary = "获取当前用户信息")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        UserDto user = authService.getCurrentUser(userId);
        return ResponseEntity.ok(ApiResponse.success(user));
    }
}
