package com.videoplat.admin.service;

import com.videoplat.admin.dto.OperationLogDto;
import com.videoplat.domain.entity.AdminOperationLog;
import com.videoplat.domain.entity.Room;
import com.videoplat.domain.entity.User;
import com.videoplat.domain.enums.AdminOperationType;
import com.videoplat.domain.repository.AdminOperationLogRepository;
import com.videoplat.domain.repository.RoomRepository;
import com.videoplat.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * 管理员操作日志服务
 *
 * 提供操作日志查询功能
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminOperationLogService {

    private final AdminOperationLogRepository operationLogRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;

    /**
     * 获取操作日志（分页）
     *
     * @param page 页码（从0开始）
     * @param size 每页大小
     * @return 操作日志分页结果
     */
    @Transactional(readOnly = true)
    public Page<OperationLogDto> getOperationLogs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AdminOperationLog> logPage = operationLogRepository.findAllByOrderByCreatedAtDesc(pageable);

        return logPage.map(this::convertToOperationLogDto);
    }

    /**
     * 保存操作日志
     *
     * @param adminId 管理员 ID
     * @param adminUsername 管理员用户名
     * @param operationType 操作类型
     * @param targetUserId 目标用户 ID（可选）
     * @param targetRoomId 目标会议室 ID（可选）
     * @param operationDetail 操作详情
     * @param ipAddress IP 地址
     */
    @Transactional
    public void saveOperationLog(Long adminId, String adminUsername, AdminOperationType operationType,
                                 Long targetUserId, Long targetRoomId, String operationDetail, String ipAddress) {
        AdminOperationLog operationLog = AdminOperationLog.builder()
                .adminId(adminId)
                .adminUsername(adminUsername)
                .operationType(operationType)
                .targetUserId(targetUserId)
                .targetRoomId(targetRoomId)
                .operationDetail(operationDetail)
                .ipAddress(ipAddress)
                .build();

        operationLogRepository.save(operationLog);
        log.info("保存管理操作日志: 管理员={}, 操作类型={}, 详情={}", adminUsername, operationType, operationDetail);
    }

    /**
     * 将操作日志实体转换为 DTO
     */
    private OperationLogDto convertToOperationLogDto(AdminOperationLog log) {
        OperationLogDto dto = OperationLogDto.builder()
                .id(log.getId())
                .adminId(log.getAdminId())
                .adminUsername(log.getAdminUsername())
                .operationType(log.getOperationType())
                .operationTypeDesc(getOperationTypeDescription(log.getOperationType()))
                .targetUserId(log.getTargetUserId())
                .targetRoomId(log.getTargetRoomId())
                .operationDetail(log.getOperationDetail())
                .ipAddress(log.getIpAddress())
                .createdAt(log.getCreatedAt())
                .build();

        // 获取目标用户名
        if (log.getTargetUserId() != null) {
            Optional<User> targetUser = userRepository.findById(log.getTargetUserId());
            targetUser.ifPresent(user -> dto.setTargetUsername(user.getUsername()));
        }

        // 获取目标会议室名称
        if (log.getTargetRoomId() != null) {
            Optional<Room> targetRoom = roomRepository.findById(log.getTargetRoomId());
            targetRoom.ifPresent(room -> dto.setTargetRoomName(room.getRoomName()));
        }

        return dto;
    }

    /**
     * 获取操作类型描述
     */
    private String getOperationTypeDescription(AdminOperationType operationType) {
        switch (operationType) {
            case FORCE_OFFLINE:
                return "强制用户下线";
            case CLOSE_ROOM:
                return "强制关闭会议室";
            case DELETE_RECORDING:
                return "删除录制";
            default:
                return operationType.name();
        }
    }
}
