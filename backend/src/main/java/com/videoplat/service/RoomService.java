package com.videoplat.service;

import com.videoplat.dto.*;
import com.videoplat.model.Room;
import com.videoplat.model.RoomParticipant;
import com.videoplat.model.User;
import com.videoplat.repository.RoomParticipantRepository;
import com.videoplat.repository.RoomRepository;
import com.videoplat.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 会议室服务
 *
 * 负责会议室的创建、加入、离开、结束等核心业务逻辑，以及参与者管理和 Agora Token 获取
 *
 * @author VideoPlat Team
 * @since 1.0
 */
@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomParticipantRepository participantRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AgoraService agoraService;

    @Value("${app.room.max-participants}")
    private Integer maxParticipants;

    @Value("${app.room.max-concurrent-rooms}")
    private Integer maxConcurrentRooms;

    /**
     * 创建会议室
     *
     * @param request 创建会议室请求，包含会议室名称、密码、最大参与人数等
     * @param creatorId 创建者用户 ID
     * @return 会议室信息 DTO
     * @throws RuntimeException 当活跃会议室数量达到上限时
     */
    @Transactional
    public RoomDto createRoom(CreateRoomRequest request, Long creatorId) {
        // 检查并发会议室数量
        long activeRooms = roomRepository.countByStatus(Room.RoomStatus.ACTIVE);
        if (activeRooms >= maxConcurrentRooms) {
            throw new RuntimeException("当前活跃会议室数量已达上限");
        }

        // 生成唯一的会议室 ID
        String roomId = generateRoomId();

        // 创建会议室
        Room room = Room.builder()
                .roomId(roomId)
                .roomName(request.getRoomName())
                .creatorId(creatorId)
                .maxParticipants(request.getMaxParticipants() != null ?
                        request.getMaxParticipants() : maxParticipants)
                .status(Room.RoomStatus.ACTIVE)
                .build();

        // 如果设置了密码，加密存储
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            room.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        room = roomRepository.save(room);

        // 创建者自动加入会议室
        RoomParticipant participant = RoomParticipant.builder()
                .roomId(room.getId())
                .userId(creatorId)
                .isHost(true)
                .build();
        participantRepository.save(participant);

        return convertToDto(room);
    }

    /**
     * 获取会议室信息
     *
     * @param roomId 会议室 ID
     * @return 会议室信息 DTO
     * @throws RuntimeException 当会议室不存在时
     */
    @Transactional(readOnly = true)
    public RoomDto getRoomInfo(String roomId) {
        Room room = roomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new RuntimeException("会议室不存在"));
        return convertToDto(room);
    }

    /**
     * 加入会议室
     *
     * @param roomId 会议室 ID
     * @param request 加入会议室请求，包含密码（如果需要）
     * @param userId 用户 ID
     * @throws RuntimeException 当会议室不存在、已结束、密码错误或人数已满时
     */
    @Transactional
    public void joinRoom(String roomId, JoinRoomRequest request, Long userId) {
        Room room = roomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new RuntimeException("会议室不存在"));

        if (room.getStatus() != Room.RoomStatus.ACTIVE) {
            throw new RuntimeException("会议室已结束");
        }

        // 检查密码
        if (room.getPasswordHash() != null) {
            if (request.getPassword() == null ||
                !passwordEncoder.matches(request.getPassword(), room.getPasswordHash())) {
                throw new RuntimeException("会议室密码错误");
            }
        }

        // 检查是否已在会议室中
        if (participantRepository.findByRoomIdAndUserIdAndLeftAtIsNull(room.getId(), userId).isPresent()) {
            return; // 已经在会议室中
        }

        // 检查人数限制
        long currentParticipants = participantRepository.countByRoomIdAndLeftAtIsNull(room.getId());
        if (currentParticipants >= room.getMaxParticipants()) {
            throw new RuntimeException("会议室人数已满");
        }

        // 加入会议室
        RoomParticipant participant = RoomParticipant.builder()
                .roomId(room.getId())
                .userId(userId)
                .isHost(false)
                .build();
        participantRepository.save(participant);
    }

    /**
     * 离开会议室
     *
     * @param roomId 会议室 ID
     * @param userId 用户 ID
     * @throws RuntimeException 当会议室不存在或用户不在会议室中时
     */
    @Transactional
    public void leaveRoom(String roomId, Long userId) {
        Room room = roomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new RuntimeException("会议室不存在"));

        RoomParticipant participant = participantRepository
                .findByRoomIdAndUserIdAndLeftAtIsNull(room.getId(), userId)
                .orElseThrow(() -> new RuntimeException("您不在该会议室中"));

        participant.setLeftAt(LocalDateTime.now());
        participantRepository.save(participant);
    }

    /**
     * 结束会议室
     *
     * 只有主持人可以结束会议，结束后所有参与者将被移出会议室
     *
     * @param roomId 会议室 ID
     * @param userId 用户 ID
     * @throws RuntimeException 当会议室不存在或用户不是主持人时
     */
    @Transactional
    public void endRoom(String roomId, Long userId) {
        Room room = roomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new RuntimeException("会议室不存在"));

        if (!room.getCreatorId().equals(userId)) {
            throw new RuntimeException("只有主持人可以结束会议");
        }

        room.setStatus(Room.RoomStatus.ENDED);
        room.setEndedAt(LocalDateTime.now());
        roomRepository.save(room);

        // 所有参与者离开
        List<RoomParticipant> participants = participantRepository
                .findByRoomIdAndLeftAtIsNull(room.getId());
        LocalDateTime now = LocalDateTime.now();
        participants.forEach(p -> p.setLeftAt(now));
        participantRepository.saveAll(participants);
    }

    /**
     * 获取会议室参与者列表
     *
     * @param roomId 会议室 ID
     * @return 参与者列表
     * @throws RuntimeException 当会议室不存在时
     */
    @Transactional(readOnly = true)
    public List<ParticipantDto> getParticipants(String roomId) {
        Room room = roomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new RuntimeException("会议室不存在"));

        List<RoomParticipant> participants = participantRepository
                .findByRoomIdAndLeftAtIsNull(room.getId());

        return participants.stream()
                .map(this::convertToParticipantDto)
                .collect(Collectors.toList());
    }

    /**
     * 获取 Agora RTC Token
     *
     * 用于客户端加入 Agora 频道进行音视频通话
     *
     * @param roomId 会议室 ID
     * @param userId 用户 ID
     * @return Agora Token 响应，包含 Token、App ID、频道名等信息
     * @throws RuntimeException 当会议室不存在或用户不在会议室中时
     */
    public AgoraTokenResponse getAgoraToken(String roomId, Long userId) {
        Room room = roomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new RuntimeException("会议室不存在"));

        // 验证用户是否在会议室中
        participantRepository.findByRoomIdAndUserIdAndLeftAtIsNull(room.getId(), userId)
                .orElseThrow(() -> new RuntimeException("您不在该会议室中"));

        String token = agoraService.generateRtcToken(roomId, userId.intValue());

        return AgoraTokenResponse.builder()
                .token(token)
                .appId(agoraService.getAppId())
                .channelName(roomId)
                .uid(userId.intValue())
                .expirationTime(3600)
                .build();
    }

    // 生成唯一的会议室 ID
    private String generateRoomId() {
        String roomId;
        do {
            roomId = UUID.randomUUID().toString().substring(0, 8);
        } while (roomRepository.existsByRoomId(roomId));
        return roomId;
    }

    // 将会议室实体转换为 DTO
    private RoomDto convertToDto(Room room) {
        long currentParticipants = participantRepository.countByRoomIdAndLeftAtIsNull(room.getId());

        return RoomDto.builder()
                .id(room.getId())
                .roomId(room.getRoomId())
                .roomName(room.getRoomName())
                .creatorId(room.getCreatorId())
                .maxParticipants(room.getMaxParticipants())
                .status(room.getStatus())
                .createdAt(room.getCreatedAt())
                .endedAt(room.getEndedAt())
                .currentParticipants((int) currentParticipants)
                .hasPassword(room.getPasswordHash() != null)
                .build();
    }

    // 将参与者实体转换为 DTO
    private ParticipantDto convertToParticipantDto(RoomParticipant participant) {
        User user = userRepository.findById(participant.getUserId())
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        return ParticipantDto.builder()
                .id(participant.getId())
                .userId(user.getId())
                .nickname(user.getNickname())
                .avatarUrl(user.getAvatarUrl())
                .isHost(participant.getIsHost())
                .joinedAt(participant.getJoinedAt())
                .build();
    }
}
