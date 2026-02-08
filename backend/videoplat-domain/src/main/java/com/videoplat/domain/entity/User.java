package com.videoplat.domain.entity;

import com.videoplat.domain.enums.UserOnlineStatus;
import com.videoplat.domain.enums.UserRole;
import com.videoplat.domain.enums.UserType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 用户实体
 *
 * 支持注册用户和游客两种类型
 */
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    // 游客用户此字段为空
    @Column(name = "password_hash")
    private String passwordHash;

    @Column(nullable = false)
    private String nickname;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_type", nullable = false)
    private UserType userType;

    // 新增：用户角色
    @Enumerated(EnumType.STRING)
    @Column(name = "role")  // 暂时允许为 null，让 Hibernate 先添加字段
    @Builder.Default
    private UserRole role = UserRole.USER;

    // 新增：在线状态
    @Enumerated(EnumType.STRING)
    @Column(name = "online_status")
    @Builder.Default
    private UserOnlineStatus onlineStatus = UserOnlineStatus.OFFLINE;

    // 新增：最后活跃时间
    @Column(name = "last_active_at")
    private LocalDateTime lastActiveAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (role == null) {
            role = UserRole.USER;
        }
        if (onlineStatus == null) {
            onlineStatus = UserOnlineStatus.OFFLINE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
