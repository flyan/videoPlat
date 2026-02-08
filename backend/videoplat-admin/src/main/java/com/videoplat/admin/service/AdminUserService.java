package com.videoplat.admin.service;

import com.videoplat.admin.dto.OnlineUserDto;
import com.videoplat.admin.dto.UserStatusDto;
import com.videoplat.domain.entity.Room;
import com.videoplat.domain.entity.RoomParticipant;
import com.videoplat.domain.entity.User;
import com.videoplat.domain.enums.RoomStatus;
import com.videoplat.domain.repository.RoomParticipantRepository;
import com.videoplat.domain.repository.RoomRepository;
import com.videoplat.domain.repository.UserRepository;
import com.videoplat.meeting.service.OnlineStatusService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 管理员用户管理服务
 *
 * 提供用户查询、在线用户管理、强制下线等功能
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final RoomParticipantRepository participantRepository;
    private final OnlineStatusService onlineStatusService;

    /**
     * 获取所有用户（分页）
     *
     * @param page 页码（从0开始）
     * @param size 每页大小
     * @return 用户状态信息分页结果
     */
    @Transactional(readOnly = true)
    public Page<UserStatusDto> getAllUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> userPage = userRepository.findAll(pageable);

        return userPage.map(this::convertToUserStatusDto);
    }

    /**
     * 获取在线用户列表
     *
     * @return 在线用户信息列表
     */
    @Transactional(readOnly = true)
    public List<OnlineUserDto> getOnlineUsers() {
        Set<String> onlineUserIds = onlineStatusService.getOnlineUsers();

        if (onlineUserIds == null || onlineUserIds.isEmpty()) {
            return new ArrayList<>();
        }

        List<Long> userIds = onlineUserIds.stream()
                .map(Long::parseLong)
                .collect(Collectors.toList());

        List<User> users = userRepository.findAllById(userIds);

        return users.stream()
                .map(this::convertToOnlineUserDto)
                .collect(Collectors.toList());
    }

    /**
     * 获取用户详情
     *
     * @param userId 用户 ID
     * @return 用户状态信息
     */
    @Transactional(readOnly = true)
    public UserStatusDto getUserDetail(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        return convertToUserStatusDto(user);
    }

    /**
     * 强制用户下线
     *
     * @param userId 用户 ID
     * @param reason 下线原因
     */
    @Transactional
    public void forceUserOffline(Long userId, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 检查用户是否在会议中
        List<RoomParticipant> activeParticipants = participantRepository
                .findByUserIdAndLeftAtIsNull(userId);

        if (!activeParticipants.isEmpty()) {
            // 强制离开会议室
            RoomParticipant participant = activeParticipants.get(0);
            participant.setLeftAt(java.time.LocalDateTime.now());
            participantRepository.save(participant);

            log.info("用户 {} 被强制离开会议室，原因: {}", userId, reason);
        }

        // 设置用户为离线状态
        onlineStatusService.setUserOffline(userId);

        log.info("用户 {} 被强制下线，原因: {}", userId, reason);
    }

    /**
     * 将用户实体转换为用户状态 DTO
     */
    private UserStatusDto convertToUserStatusDto(User user) {
        UserStatusDto dto = UserStatusDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .avatarUrl(user.getAvatarUrl())
                .userType(user.getUserType())
                .role(user.getRole())
                .onlineStatus(user.getOnlineStatus())
                .lastActiveAt(user.getLastActiveAt())
                .createdAt(user.getCreatedAt())
                .build();

        // 查询用户是否在会议中
        List<RoomParticipant> activeParticipants = participantRepository
                .findByUserIdAndLeftAtIsNull(user.getId());

        if (!activeParticipants.isEmpty()) {
            RoomParticipant participant = activeParticipants.get(0);  // 取第一个
            Optional<Room> room = roomRepository.findById(participant.getRoomId());

            if (room.isPresent() && room.get().getStatus() == RoomStatus.ACTIVE) {
                dto.setCurrentRoomId(room.get().getRoomId());
                dto.setCurrentRoomName(room.get().getRoomName());
            }
        }

        return dto;
    }

    /**
     * 将用户实体转换为在线用户 DTO
     */
    private OnlineUserDto convertToOnlineUserDto(User user) {
        OnlineUserDto dto = OnlineUserDto.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .lastActiveAt(user.getLastActiveAt())
                .inMeeting(false)
                .build();

        // 查询用户是否在会议中
        List<RoomParticipant> activeParticipants = participantRepository
                .findByUserIdAndLeftAtIsNull(user.getId());

        if (!activeParticipants.isEmpty()) {
            RoomParticipant participant = activeParticipants.get(0);
            Optional<Room> room = roomRepository.findById(participant.getRoomId());

            if (room.isPresent() && room.get().getStatus() == RoomStatus.ACTIVE) {
                dto.setInMeeting(true);
                dto.setCurrentRoomId(room.get().getRoomId());
                dto.setCurrentRoomName(room.get().getRoomName());
            }
        }

        return dto;
    }
}
