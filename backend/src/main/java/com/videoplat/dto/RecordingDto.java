package com.videoplat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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
