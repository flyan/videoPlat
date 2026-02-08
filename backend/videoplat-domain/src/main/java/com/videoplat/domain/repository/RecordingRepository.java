package com.videoplat.domain.repository;

import com.videoplat.domain.entity.Recording;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 录制数据访问层
 */
@Repository
public interface RecordingRepository extends JpaRepository<Recording, Long>, JpaSpecificationExecutor<Recording> {

    List<Recording> findByRoomId(Long roomId);

    List<Recording> findByCreatorId(Long creatorId);

    /**
     * 根据条件筛选录制记录
     *
     * @param roomName 会议室名称（模糊匹配）
     * @param startDate 开始时间
     * @param endDate 结束时间
     * @return 录制记录列表，按开始时间倒序排列
     */
    @Query("SELECT r FROM Recording r WHERE " +
           "(:roomName IS NULL OR r.roomName LIKE %:roomName%) AND " +
           "(:startDate IS NULL OR r.startedAt >= :startDate) AND " +
           "(:endDate IS NULL OR r.startedAt <= :endDate) " +
           "ORDER BY r.startedAt DESC")
    List<Recording> findByFilters(
        @Param("roomName") String roomName,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    // 新增：分页查询录制
    Page<Recording> findAll(Pageable pageable);

    // 新增：统计总文件大小
    @Query("SELECT COALESCE(SUM(r.fileSize), 0) FROM Recording r")
    Long sumFileSize();
}
