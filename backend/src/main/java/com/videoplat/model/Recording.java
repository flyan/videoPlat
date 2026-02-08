package com.videoplat.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 会议录制实体
 *
 * 存储会议录制文件的元数据信息，支持 MP4 格式
 */
@Entity
@Table(name = "recordings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Recording {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "room_name", nullable = false)
    private String roomName;

    // 录制文件存储路径
    @Column(name = "file_path", nullable = false)
    private String filePath;

    // 文件大小（字节）
    @Column(name = "file_size")
    private Long fileSize;

    // 录制时长（秒）
    @Column(name = "duration")
    private Integer duration;

    // 视频分辨率，如 1280x720 或 1920x1080
    @Column(name = "resolution")
    private String resolution;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "creator_id", nullable = false)
    private Long creatorId;

    @PrePersist
    protected void onCreate() {
        startedAt = LocalDateTime.now();
    }
}
