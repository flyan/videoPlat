package com.videoplat.domain.entity;

import com.videoplat.domain.enums.RoomStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 会议室实体
 *
 * 支持最多 10 人同时在线，可设置密码保护
 */
@Entity
@Table(name = "rooms")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 会议室唯一标识符，用于加入会议
    @Column(name = "room_id", unique = true, nullable = false)
    private String roomId;

    @Column(name = "room_name", nullable = false)
    private String roomName;

    @Column(name = "creator_id", nullable = false)
    private Long creatorId;

    // 会议室密码哈希值，为空表示无密码
    @Column(name = "password_hash")
    private String passwordHash;

    // 最大参与人数，默认 10 人
    @Column(name = "max_participants", nullable = false)
    private Integer maxParticipants;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        status = RoomStatus.ACTIVE;
    }
}
