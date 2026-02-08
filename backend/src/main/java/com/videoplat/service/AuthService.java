package com.videoplat.service;

import com.videoplat.dto.*;
import com.videoplat.model.User;
import com.videoplat.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

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

    public UserDto getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        return convertToDto(user);
    }

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
