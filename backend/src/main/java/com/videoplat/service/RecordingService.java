package com.videoplat.service;

import com.videoplat.dto.RecordingDto;
import com.videoplat.model.Recording;
import com.videoplat.model.Room;
import com.videoplat.repository.RecordingRepository;
import com.videoplat.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecordingService {

    private final RecordingRepository recordingRepository;
    private final RoomRepository roomRepository;

    @Value("${app.recording.storage-path}")
    private String storagePath;

    @Transactional
    public RecordingDto startRecording(String roomId, Long userId) {
        Room room = roomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new RuntimeException("会议室不存在"));

        if (!room.getCreatorId().equals(userId)) {
            throw new RuntimeException("只有主持人可以开始录制");
        }

        if (room.getStatus() != Room.RoomStatus.ACTIVE) {
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

        // TODO: 调用 Agora 云端录制 API 开始录制
        // 这里需要集成 Agora 云端录制服务

        return convertToDto(recording);
    }

    @Transactional
    public void stopRecording(String roomId, Long recordingId) {
        Recording recording = recordingRepository.findById(recordingId)
                .orElseThrow(() -> new RuntimeException("录制不存在"));

        if (recording.getEndedAt() != null) {
            throw new RuntimeException("录制已停止");
        }

        recording.setEndedAt(LocalDateTime.now());

        // TODO: 调用 Agora 云端录制 API 停止录制
        // 获取录制文件信息并更新

        // 模拟文件信息（实际应从 Agora 获取）
        recording.setFileSize(0L); // 实际文件大小
        recording.setDuration(0);  // 实际时长（秒）

        recordingRepository.save(recording);
    }

    @Transactional(readOnly = true)
    public List<RecordingDto> getRecordings(String roomName, LocalDateTime startDate, LocalDateTime endDate) {
        List<Recording> recordings = recordingRepository.findByFilters(roomName, startDate, endDate);
        return recordings.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RecordingDto getRecordingDetail(Long recordingId) {
        Recording recording = recordingRepository.findById(recordingId)
                .orElseThrow(() -> new RuntimeException("录制不存在"));
        return convertToDto(recording);
    }

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
            file.delete();
        }

        recordingRepository.delete(recording);
    }

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
