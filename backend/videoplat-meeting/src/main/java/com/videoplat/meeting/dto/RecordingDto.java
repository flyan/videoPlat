package com.videoplat.meeting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 录制数据传输对象
 *
 * @author VideoPlat Team
 * @since 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecordingDto {

    private Long id;
    private Long roomId;
    private String roomName;
    private String filePath;
    private Long fileSize;
    private Integer duration;
    private String resolution;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private Long creatorId;
}
