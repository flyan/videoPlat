package com.videoplat.meeting.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Set;

/**
 * 在线状态管理服务
 *
 * 使用 Redis 管理用户在线状态，支持设置用户在线/离线、查询在线用户等功能
 *
 * @author VideoPlat Team
 * @since 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OnlineStatusService {

    private final RedisTemplate<String, String> redisTemplate;

    // Redis key 前缀
    private static final String ONLINE_USER_PREFIX = "online:user:";
    private static final String ONLINE_USERS_SET = "online:users";

    // 在线状态过期时间（秒），防止异常断开导致状态未清理
    private static final Duration ONLINE_EXPIRATION = Duration.ofMinutes(5);

    /**
     * 设置用户为在线状态
     *
     * @param userId 用户 ID
     */
    public void setUserOnline(Long userId) {
        try {
            String key = ONLINE_USER_PREFIX + userId;
            // 设置用户在线标记，带过期时间
            redisTemplate.opsForValue().set(key, "1", ONLINE_EXPIRATION);
            // 将用户 ID 添加到在线用户集合
            redisTemplate.opsForSet().add(ONLINE_USERS_SET, userId.toString());
            log.info("用户 {} 已设置为在线状态", userId);
        } catch (Exception e) {
            log.error("设置用户 {} 在线状态失败", userId, e);
        }
    }

    /**
     * 设置用户为离线状态
     *
     * @param userId 用户 ID
     */
    public void setUserOffline(Long userId) {
        try {
            String key = ONLINE_USER_PREFIX + userId;
            // 删除用户在线标记
            redisTemplate.delete(key);
            // 从在线用户集合中移除
            redisTemplate.opsForSet().remove(ONLINE_USERS_SET, userId.toString());
            log.info("用户 {} 已设置为离线状态", userId);
        } catch (Exception e) {
            log.error("设置用户 {} 离线状态失败", userId, e);
        }
    }

    /**
     * 检查用户是否在线
     *
     * @param userId 用户 ID
     * @return true 表示在线，false 表示离线
     */
    public boolean isUserOnline(Long userId) {
        try {
            String key = ONLINE_USER_PREFIX + userId;
            Boolean exists = redisTemplate.hasKey(key);
            return exists != null && exists;
        } catch (Exception e) {
            log.error("检查用户 {} 在线状态失败", userId, e);
            return false;
        }
    }

    /**
     * 获取所有在线用户 ID 集合
     *
     * @return 在线用户 ID 集合
     */
    public Set<String> getOnlineUsers() {
        try {
            return redisTemplate.opsForSet().members(ONLINE_USERS_SET);
        } catch (Exception e) {
            log.error("获取在线用户列表失败", e);
            return Set.of();
        }
    }

    /**
     * 获取在线用户数量
     *
     * @return 在线用户数量
     */
    public long getOnlineUserCount() {
        try {
            Long size = redisTemplate.opsForSet().size(ONLINE_USERS_SET);
            return size != null ? size : 0;
        } catch (Exception e) {
            log.error("获取在线用户数量失败", e);
            return 0;
        }
    }

    /**
     * 刷新用户在线状态的过期时间（用于心跳保活）
     *
     * @param userId 用户 ID
     */
    public void refreshUserOnlineStatus(Long userId) {
        try {
            String key = ONLINE_USER_PREFIX + userId;
            if (Boolean.TRUE.equals(redisTemplate.hasKey(key))) {
                redisTemplate.expire(key, ONLINE_EXPIRATION);
                log.debug("刷新用户 {} 的在线状态过期时间", userId);
            }
        } catch (Exception e) {
            log.error("刷新用户 {} 在线状态失败", userId, e);
        }
    }

    /**
     * 清理所有在线状态（用于系统维护）
     */
    public void clearAllOnlineStatus() {
        try {
            Set<String> onlineUsers = getOnlineUsers();
            if (onlineUsers != null && !onlineUsers.isEmpty()) {
                for (String userId : onlineUsers) {
                    String key = ONLINE_USER_PREFIX + userId;
                    redisTemplate.delete(key);
                }
            }
            redisTemplate.delete(ONLINE_USERS_SET);
            log.info("已清理所有在线状态");
        } catch (Exception e) {
            log.error("清理在线状态失败", e);
        }
    }
}
