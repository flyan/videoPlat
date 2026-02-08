package com.videoplat.admin.service;

import com.videoplat.admin.dto.SystemStatisticsDto;
import com.videoplat.domain.entity.User;
import com.videoplat.domain.enums.RoomStatus;
import com.videoplat.domain.enums.UserType;
import com.videoplat.domain.repository.RecordingRepository;
import com.videoplat.domain.repository.RoomRepository;
import com.videoplat.domain.repository.UserRepository;
import com.videoplat.meeting.service.OnlineStatusService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * 管理员系统监控服务
 *
 * 提供系统统计信息、运行状态等功能
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminMonitorService {

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final RecordingRepository recordingRepository;
    private final OnlineStatusService onlineStatusService;

    @Value("${app.room.max-participants:10}")
    private Integer maxParticipantsPerRoom;

    @Value("${app.room.max-concurrent-rooms:10}")
    private Integer maxConcurrentRooms;

    // 系统启动时间（可以通过 ApplicationContext 获取，这里简化处理）
    private static final LocalDateTime SYSTEM_START_TIME = LocalDateTime.now();

    /**
     * 获取系统统计信息
     *
     * @return 系统统计信息
     */
    @Transactional(readOnly = true)
    public SystemStatisticsDto getSystemStatistics() {
        // 总用户数
        long totalUsers = userRepository.count();

        // 注册用户数和游客用户数
        List<User> allUsers = userRepository.findAll();
        long registeredUsers = allUsers.stream()
                .filter(user -> user.getUserType() == UserType.REGISTERED)
                .count();
        long guestUsers = allUsers.stream()
                .filter(user -> user.getUserType() == UserType.GUEST)
                .count();

        // 在线用户数
        long onlineUsers = onlineStatusService.getOnlineUserCount();

        // 总会议室数
        long totalRooms = roomRepository.count();

        // 进行中的会议室数
        long activeRooms = roomRepository.countByStatus(RoomStatus.ACTIVE);

        // 已结束的会议室数
        long endedRooms = roomRepository.countByStatus(RoomStatus.ENDED);

        // 总录制数
        long totalRecordings = recordingRepository.count();

        // 今日新增数据
        LocalDateTime todayStart = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime todayEnd = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);

        long todayNewUsers = allUsers.stream()
                .filter(user -> user.getCreatedAt().isAfter(todayStart) &&
                               user.getCreatedAt().isBefore(todayEnd))
                .count();

        long todayNewRooms = roomRepository.findAll().stream()
                .filter(room -> room.getCreatedAt().isAfter(todayStart) &&
                               room.getCreatedAt().isBefore(todayEnd))
                .count();

        long todayNewRecordings = recordingRepository.findAll().stream()
                .filter(recording -> recording.getStartedAt().isAfter(todayStart) &&
                                    recording.getStartedAt().isBefore(todayEnd))
                .count();

        // 系统运行时长（秒）
        long systemUptimeSeconds = java.time.Duration.between(SYSTEM_START_TIME, LocalDateTime.now()).getSeconds();

        return SystemStatisticsDto.builder()
                .totalUsers(totalUsers)
                .registeredUsers(registeredUsers)
                .guestUsers(guestUsers)
                .onlineUsers(onlineUsers)
                .totalRooms(totalRooms)
                .activeRooms(activeRooms)
                .endedRooms(endedRooms)
                .totalRecordings(totalRecordings)
                .todayNewUsers(todayNewUsers)
                .todayNewRooms(todayNewRooms)
                .todayNewRecordings(todayNewRecordings)
                .systemUptimeSeconds(systemUptimeSeconds)
                .maxConcurrentRooms(maxConcurrentRooms)
                .maxParticipantsPerRoom(maxParticipantsPerRoom)
                .build();
    }
}
