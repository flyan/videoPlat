package com.videoplat.admin.service;

import com.videoplat.admin.dto.RoomStatusDto;
import com.videoplat.domain.entity.Room;
import com.videoplat.domain.entity.RoomParticipant;
import com.videoplat.domain.entity.User;
import com.videoplat.domain.enums.RoomStatus;
import com.videoplat.domain.repository.RoomParticipantRepository;
import com.videoplat.domain.repository.RoomRepository;
import com.videoplat.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 管理员会议室管理服务
 *
 * 提供会议室查询、强制关闭等功能
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminRoomService {

    private final RoomRepository roomRepository;
    private final RoomParticipantRepository participantRepository;
    private final UserRepository userRepository;

    /**
     * 获取所有会议室（分页）
     *
     * @param page 页码（从0开始）
     * @param size 每页大小
     * @return 会议室状态信息分页结果
     */
    @Transactional(readOnly = true)
    public Page<RoomStatusDto> getAllRooms(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Room> roomPage = roomRepository.findAll(pageable);

        return roomPage.map(this::convertToRoomStatusDto);
    }

    /**
     * 获取进行中的会议室列表
     *
     * @return 进行中的会议室信息列表
     */
    @Transactional(readOnly = true)
    public List<RoomStatusDto> getActiveRooms() {
        List<Room> activeRooms = roomRepository.findByStatus(RoomStatus.ACTIVE);

        return activeRooms.stream()
                .map(this::convertToRoomStatusDto)
                .collect(Collectors.toList());
    }

    /**
     * 获取会议室详情
     *
     * @param roomId 会议室 ID
     * @return 会议室状态信息
     */
    @Transactional(readOnly = true)
    public RoomStatusDto getRoomDetail(String roomId) {
        Room room = roomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new RuntimeException("会议室不存在"));

        return convertToRoomStatusDto(room);
    }

    /**
     * 强制关闭会议室
     *
     * @param roomId 会议室 ID
     * @param reason 关闭原因
     */
    @Transactional
    public void forceCloseRoom(String roomId, String reason) {
        Room room = roomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new RuntimeException("会议室不存在"));

        if (room.getStatus() == RoomStatus.ENDED) {
            throw new RuntimeException("会议室已结束");
        }

        // 结束会议室
        room.setStatus(RoomStatus.ENDED);
        room.setEndedAt(LocalDateTime.now());
        roomRepository.save(room);

        // 所有参与者离开
        List<RoomParticipant> participants = participantRepository
                .findByRoomIdAndLeftAtIsNull(room.getId());
        LocalDateTime now = LocalDateTime.now();
        participants.forEach(p -> p.setLeftAt(now));
        participantRepository.saveAll(participants);

        log.info("会议室 {} 被强制关闭，原因: {}", roomId, reason);
    }

    /**
     * 将会议室实体转换为会议室状态 DTO
     */
    private RoomStatusDto convertToRoomStatusDto(Room room) {
        // 获取创建者信息
        Optional<User> creator = userRepository.findById(room.getCreatorId());

        // 获取当前参与者数量
        long currentParticipants = participantRepository.countByRoomIdAndLeftAtIsNull(room.getId());

        // 计算会议持续时长
        Long durationMinutes = null;
        if (room.getEndedAt() != null) {
            Duration duration = Duration.between(room.getCreatedAt(), room.getEndedAt());
            durationMinutes = duration.toMinutes();
        } else if (room.getStatus() == RoomStatus.ACTIVE) {
            Duration duration = Duration.between(room.getCreatedAt(), LocalDateTime.now());
            durationMinutes = duration.toMinutes();
        }

        RoomStatusDto dto = RoomStatusDto.builder()
                .id(room.getId())
                .roomId(room.getRoomId())
                .roomName(room.getRoomName())
                .creatorId(room.getCreatorId())
                .maxParticipants(room.getMaxParticipants())
                .currentParticipants((int) currentParticipants)
                .status(room.getStatus())
                .hasPassword(room.getPasswordHash() != null)
                .createdAt(room.getCreatedAt())
                .endedAt(room.getEndedAt())
                .durationMinutes(durationMinutes)
                .build();

        // 设置创建者信息
        creator.ifPresent(user -> {
            dto.setCreatorUsername(user.getUsername());
            dto.setCreatorNickname(user.getNickname());
        });

        // 获取参与者列表
        List<RoomParticipant> participants = participantRepository
                .findByRoomIdAndLeftAtIsNull(room.getId());

        List<RoomStatusDto.ParticipantInfo> participantInfos = participants.stream()
                .map(participant -> {
                    Optional<User> user = userRepository.findById(participant.getUserId());
                    return user.map(u -> RoomStatusDto.ParticipantInfo.builder()
                            .userId(u.getId())
                            .username(u.getUsername())
                            .nickname(u.getNickname())
                            .isHost(participant.getIsHost())
                            .joinedAt(participant.getJoinedAt())
                            .build())
                            .orElse(null);
                })
                .filter(info -> info != null)
                .collect(Collectors.toList());

        dto.setParticipants(participantInfos);

        return dto;
    }
}
