package com.videoplat.service;

import com.videoplat.dto.*;
import com.videoplat.model.User;
import com.videoplat.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * 用户认证服务
 *
 * 负责用户登录、游客登录、JWT Token 生成等认证相关功能
 *
 * @author VideoPlat Team
 * @since 1.0
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    /**
     * 用户登录
     *
     * @param request 登录请求，包含用户名和密码
     * @return 认证响应，包含用户信息和 JWT Token
     * @throws RuntimeException 当用户名或密码错误时
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("用户名或密码错误"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("用户名或密码错误");
        }

        String token = jwtService.generateToken(user.getId(), user.getUsername());

        return AuthResponse.builder()
                .user(convertToDto(user))
                .token(token)
                .build();
    }

    /**
     * 游客登录
     *
     * 创建临时游客账号，无需注册即可加入会议
     *
     * @param request 游客登录请求，包含昵称
     * @return 认证响应，包含游客用户信息和 JWT Token
     */
    @Transactional
    public AuthResponse guestLogin(GuestLoginRequest request) {
        // 创建游客用户
        User guest = User.builder()
                .username("guest_" + UUID.randomUUID().toString().substring(0, 8))
                .nickname(request.getNickname())
                .userType(User.UserType.GUEST)
                .build();

        guest = userRepository.save(guest);

        String token = jwtService.generateToken(guest.getId(), guest.getUsername());

        return AuthResponse.builder()
                .user(convertToDto(guest))
                .token(token)
                .build();
    }

    /**
     * 获取当前用户信息
     *
     * @param userId 用户 ID
     * @return 用户信息 DTO
     * @throws RuntimeException 当用户不存在时
     */
    public UserDto getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        return convertToDto(user);
    }

    // 将用户实体转换为 DTO
    private UserDto convertToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .avatarUrl(user.getAvatarUrl())
                .userType(user.getUserType())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
