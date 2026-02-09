package com.videoplat.domain.repository;

import com.videoplat.domain.entity.Recording;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 录制数据访问层
 */
@Repository
public interface RecordingRepository extends JpaRepository<Recording, Long>, JpaSpecificationExecutor<Recording> {

    List<Recording> findByRoomId(Long roomId);

    List<Recording> findByCreatorId(Long creatorId);

    // 新增：分页查询录制
    Page<Recording> findAll(Pageable pageable);

    // 新增：统计总文件大小
    @Query("SELECT COALESCE(SUM(r.fileSize), 0) FROM Recording r")
    Long sumFileSize();
}
