package com.videoplat.meeting.service;

import com.videoplat.domain.entity.Recording;
import com.videoplat.domain.entity.Room;
import com.videoplat.domain.enums.RoomStatus;
import com.videoplat.domain.repository.RecordingRepository;
import com.videoplat.domain.repository.RoomRepository;
import com.videoplat.domain.specification.RecordingSpecification;
import com.videoplat.meeting.dto.RecordingDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 会议录制服务
 *
 * 负责会议录制的启动、停止、查询和删除等功能
 *
 * @author VideoPlat Team
 * @since 1.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RecordingService {

    private final RecordingRepository recordingRepository;
    private final RoomRepository roomRepository;
    private final AgoraService agoraService;
    private final AgoraCloudRecordingService cloudRecordingService;
    private final LocalRecordingService localRecordingService;

    // 录制文件存储路径
    @Value("${app.recording.storage-path:/app/recordings}")
    private String storagePath;

    // 录制模式：local（本地录制）或 cloud（云端录制）
    @Value("${app.recording.mode:local}")
    private String recordingMode;

    /**
     * 开始录制
     *
     * 只有主持人可以开始录制，录制文件将保存到配置的存储路径
     *
     * @param roomId 会议室 ID
     * @param userId 用户 ID
     * @return 录制信息 DTO
     * @throws RuntimeException 当会议室不存在、用户不是主持人或会议室已结束时
     */
    @Transactional
    public RecordingDto startRecording(String roomId, Long userId) {
        Room room = roomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new RuntimeException("会议室不存在"));

        if (!room.getCreatorId().equals(userId)) {
            throw new RuntimeException("只有主持人可以开始录制");
        }

        if (room.getStatus() != RoomStatus.ACTIVE) {
            throw new RuntimeException("会议室已结束，无法录制");
        }

        // 生成录制文件路径
        String fileName = String.format("%s_%s.mp4",
                roomId,
                LocalDateTime.now().toString().replace(":", "-"));
        String filePath = storagePath + File.separator + fileName;

        Recording recording = Recording.builder()
                .roomId(room.getId())
                .roomName(room.getRoomName())
                .filePath(filePath)
                .resolution("1280x720")
                .creatorId(userId)
                .build();

        recording = recordingRepository.save(recording);

        log.info("开始录制: 会议室={}, 录制ID={}, 模式={}, 文件路径={}",
                room.getRoomName(), recording.getId(), recordingMode, filePath);

        // 根据配置选择录制模式
        try {
            if ("local".equalsIgnoreCase(recordingMode)) {
                // 本地服务端录制
                if (localRecordingService.isConfigured()) {
                    startLocalRecording(recording, room, userId);
                } else {
                    log.warn("本地录制服务未配置，仅创建录制记录");
                    recording.setStatus("RECORDING");
                    recordingRepository.save(recording);
                }
            } else if ("cloud".equalsIgnoreCase(recordingMode)) {
                // 云端录制
                if (cloudRecordingService.isConfigured()) {
                    startCloudRecording(recording, room, userId);
                } else {
                    log.warn("云端录制服务未配置，仅创建录制记录");
                    recording.setStatus("RECORDING");
                    recordingRepository.save(recording);
                }
            } else {
                throw new RuntimeException("不支持的录制模式: " + recordingMode);
            }
        } catch (Exception e) {
            log.error("启动录制失败: {}", e.getMessage(), e);
            recording.setStatus("FAILED");
            recordingRepository.save(recording);
            throw new RuntimeException("启动录制失败: " + e.getMessage());
        }

        return convertToDto(recording);
    }

    /**
     * 停止录制
     *
     * 如果未指定 recordingId，则自动查找该会议室当前正在进行的录制
     *
     * @param roomId 会议室 ID
     * @param recordingId 录制 ID（可选）
     * @throws RuntimeException 当录制不存在或已停止时
     */
    @Transactional
    public void stopRecording(String roomId, Long recordingId) {
        Recording recording;

        if (recordingId != null) {
            // 如果指定了 recordingId，直接查找
            recording = recordingRepository.findById(recordingId)
                    .orElseThrow(() -> new RuntimeException("录制不存在"));
        } else {
            // 如果未指定 recordingId，查找该会议室当前正在进行的录制
            Room room = roomRepository.findByRoomId(roomId)
                    .orElseThrow(() -> new RuntimeException("会议室不存在"));

            List<Recording> activeRecordings = recordingRepository.findByRoomId(room.getId())
                    .stream()
                    .filter(r -> r.getEndedAt() == null)
                    .collect(Collectors.toList());

            if (activeRecordings.isEmpty()) {
                throw new RuntimeException("该会议室没有正在进行的录制");
            }

            // 取最新的一个录制
            recording = activeRecordings.get(activeRecordings.size() - 1);
        }

        if (recording.getEndedAt() != null) {
            throw new RuntimeException("录制已停止");
        }

        recording.setEndedAt(LocalDateTime.now());
        recording.setStatus("STOPPING");

        // 根据录制模式停止录制
        try {
            if ("local".equalsIgnoreCase(recordingMode)) {
                // 停止本地录制
                stopLocalRecording(recording, roomId);
            } else if ("cloud".equalsIgnoreCase(recordingMode)) {
                // 停止云端录制
                stopCloudRecording(recording);
            }
        } catch (Exception e) {
            log.error("停止录制失败: {}", e.getMessage(), e);
            recording.setStatus("FAILED");
        }

        // 获取实际的文件大小和时长
        File file = new File(recording.getFilePath());
        if (file.exists()) {
            recording.setFileSize(file.length());
        }

        recordingRepository.save(recording);

        log.info("停止录制: 录制ID={}, 状态={}, 文件大小={}",
                recording.getId(), recording.getStatus(), recording.getFileSize());
    }

    /**
     * 获取录制列表
     *
     * 支持按会议室名称、开始时间、结束时间筛选
     *
     * @param roomName 会议室名称（可选）
     * @param startDate 开始时间（可选）
     * @param endDate 结束时间（可选）
     * @return 录制列表
     */
    @Transactional(readOnly = true)
    public List<RecordingDto> getRecordings(String roomName, LocalDateTime startDate, LocalDateTime endDate) {
        Specification<Recording> spec = RecordingSpecification.withFilters(roomName, startDate, endDate);
        List<Recording> recordings = recordingRepository.findAll(spec);
        return recordings.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * 获取录制详情
     *
     * @param recordingId 录制 ID
     * @return 录制详情
     * @throws RuntimeException 当录制不存在时
     */
    @Transactional(readOnly = true)
    public RecordingDto getRecordingDetail(Long recordingId) {
        Recording recording = recordingRepository.findById(recordingId)
                .orElseThrow(() -> new RuntimeException("录制不存在"));
        return convertToDto(recording);
    }

    /**
     * 删除录制
     *
     * 只有创建者可以删除录制，删除时会同时删除文件
     *
     * @param recordingId 录制 ID
     * @param userId 用户 ID
     * @throws RuntimeException 当录制不存在或用户无权限时
     */
    @Transactional
    public void deleteRecording(Long recordingId, Long userId) {
        Recording recording = recordingRepository.findById(recordingId)
                .orElseThrow(() -> new RuntimeException("录制不存在"));

        if (!recording.getCreatorId().equals(userId)) {
            throw new RuntimeException("只有创建者可以删除录制");
        }

        // 删除文件
        File file = new File(recording.getFilePath());
        if (file.exists()) {
            boolean deleted = file.delete();
            if (deleted) {
                log.info("删除录制文件: {}", recording.getFilePath());
            } else {
                log.warn("删除录制文件失败: {}", recording.getFilePath());
            }
        }

        // 删除数据库记录
        recordingRepository.delete(recording);

        log.info("删除录制: 录制ID={}, 用户ID={}", recordingId, userId);
    }

    /**
     * 启动本地服务端录制
     */
    private void startLocalRecording(Recording recording, Room room, Long userId) {
        if (!localRecordingService.isConfigured()) {
            throw new RuntimeException("本地录制服务未配置，请检查录制器路径");
        }

        // 获取 RTC Token
        String token = agoraService.generateRtcToken(room.getRoomId(), userId.intValue());

        // 启动本地录制
        String filePath = localRecordingService.startRecording(
                room.getRoomId(),
                token,
                userId.toString()
        );

        recording.setFilePath(filePath);
        recording.setStatus("RECORDING");
        recordingRepository.save(recording);

        log.info("本地录制已启动: roomId={}, filePath={}", room.getRoomId(), filePath);
    }

    /**
     * 停止本地服务端录制
     */
    private void stopLocalRecording(Recording recording, String roomId) {
        String filePath = localRecordingService.stopRecording(roomId);
        if (filePath != null) {
            recording.setFilePath(filePath);
        }
        recording.setStatus("COMPLETED");
        log.info("本地录制已停止: roomId={}, filePath={}", roomId, filePath);
    }

    /**
     * 启动云端录制
     */
    private void startCloudRecording(Recording recording, Room room, Long userId) {
        if (!cloudRecordingService.isConfigured()) {
            throw new RuntimeException("云端录制服务未配置，请检查 Agora 配置");
        }

        // 1. 获取 Resource ID
        String resourceId = cloudRecordingService.acquireResource(
                room.getRoomId(),
                userId.toString()
        );
        recording.setAgoraResourceId(resourceId);

        // 2. 获取 RTC Token
        String token = agoraService.generateRtcToken(room.getRoomId(), userId.intValue());

        // 3. 开始云端录制
        String sid = cloudRecordingService.startRecording(
                resourceId,
                room.getRoomId(),
                userId.toString(),
                token
        );
        recording.setAgoraSid(sid);
        recording.setStatus("RECORDING");

        recordingRepository.save(recording);

        log.info("云端录制已启动: resourceId={}, sid={}", resourceId, sid);
    }

    /**
     * 停止云端录制
     */
    private void stopCloudRecording(Recording recording) {
        if (recording.getAgoraResourceId() != null && recording.getAgoraSid() != null) {
            Room room = roomRepository.findById(recording.getRoomId())
                    .orElseThrow(() -> new RuntimeException("会议室不存在"));

            Map<String, Object> result = cloudRecordingService.stopRecording(
                    recording.getAgoraResourceId(),
                    recording.getAgoraSid(),
                    room.getRoomId(),
                    recording.getCreatorId().toString()
            );

            // 从返回结果中获取文件信息
            if (result != null && result.containsKey("fileList")) {
                List<Map<String, Object>> fileList = (List<Map<String, Object>>) result.get("fileList");
                if (!fileList.isEmpty()) {
                    Map<String, Object> fileInfo = fileList.get(0);
                    if (fileInfo.containsKey("fileName")) {
                        String fileName = (String) fileInfo.get("fileName");
                        recording.setFilePath(storagePath + File.separator + fileName);
                    }
                }
            }

            recording.setStatus("COMPLETED");
            log.info("云端录制已停止: resourceId={}, sid={}",
                    recording.getAgoraResourceId(), recording.getAgoraSid());
        } else {
            recording.setStatus("COMPLETED");
            log.warn("录制未使用云端录制");
        }
    }

    /**
     * 将录制实体转换为 DTO
     */
    private RecordingDto convertToDto(Recording recording) {
        return RecordingDto.builder()
                .id(recording.getId())
                .roomId(recording.getRoomId())
                .roomName(recording.getRoomName())
                .filePath(recording.getFilePath())
                .fileSize(recording.getFileSize())
                .duration(recording.getDuration())
                .resolution(recording.getResolution())
                .startedAt(recording.getStartedAt())
                .endedAt(recording.getEndedAt())
                .creatorId(recording.getCreatorId())
                .build();
    }
}
