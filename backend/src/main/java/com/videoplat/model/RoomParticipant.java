package com.videoplat.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 会议室参与者实体
 *
 * 记录用户加入和离开会议室的时间，以及是否为主持人
 */
@Entity
@Table(name = "room_participants")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt;

    // 离开时间为空表示仍在会议中
    @Column(name = "left_at")
    private LocalDateTime leftAt;

    // 会议室创建者默认为主持人
    @Column(name = "is_host", nullable = false)
    private Boolean isHost;

    @PrePersist
    protected void onCreate() {
        joinedAt = LocalDateTime.now();
        if (isHost == null) {
            isHost = false;
        }
    }
}
