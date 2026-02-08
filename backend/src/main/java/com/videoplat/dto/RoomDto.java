package com.videoplat.dto;

import com.videoplat.model.Room;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomDto {

    private Long id;
    private String roomId;
    private String roomName;
    private Long creatorId;
    private Integer maxParticipants;
    private Room.RoomStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime endedAt;
    private Integer currentParticipants;
    private Boolean hasPassword;
}
