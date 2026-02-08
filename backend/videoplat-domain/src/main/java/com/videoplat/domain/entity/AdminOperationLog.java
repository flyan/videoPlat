package com.videoplat.domain.entity;

import com.videoplat.domain.enums.AdminOperationType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 管理操作日志实体
 *
 * 记录管理员的所有操作，用于审计和追踪
 */
@Entity
@Table(name = "admin_operation_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminOperationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "admin_id", nullable = false)
    private Long adminId;

    @Column(name = "admin_username", nullable = false, length = 100)
    private String adminUsername;

    @Enumerated(EnumType.STRING)
    @Column(name = "operation_type", nullable = false, length = 50)
    private AdminOperationType operationType;

    @Column(name = "target_user_id")
    private Long targetUserId;

    @Column(name = "target_room_id")
    private Long targetRoomId;

    // JSON格式的操作详情
    @Column(name = "operation_detail", columnDefinition = "TEXT")
    private String operationDetail;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
