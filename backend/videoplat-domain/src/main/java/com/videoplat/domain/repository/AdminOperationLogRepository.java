package com.videoplat.domain.repository;

import com.videoplat.domain.entity.AdminOperationLog;
import com.videoplat.domain.enums.AdminOperationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 管理操作日志数据访问层
 */
@Repository
public interface AdminOperationLogRepository extends JpaRepository<AdminOperationLog, Long> {

    // 根据管理员ID查询操作日志
    List<AdminOperationLog> findByAdminId(Long adminId);

    // 根据操作类型查询日志
    List<AdminOperationLog> findByOperationType(AdminOperationType operationType);

    // 根据目标用户ID查询日志
    List<AdminOperationLog> findByTargetUserId(Long targetUserId);

    // 根据目标会议室ID查询日志
    List<AdminOperationLog> findByTargetRoomId(Long targetRoomId);

    // 分页查询操作日志（按时间倒序）
    Page<AdminOperationLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // 根据时间范围查询日志
    List<AdminOperationLog> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
}
