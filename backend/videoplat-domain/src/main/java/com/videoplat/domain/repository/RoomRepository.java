package com.videoplat.domain.repository;

import com.videoplat.domain.entity.Room;
import com.videoplat.domain.enums.RoomStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 会议室数据访问层
 */
@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    Optional<Room> findByRoomId(String roomId);

    boolean existsByRoomId(String roomId);

    // 统计指定状态的会议室数量
    long countByStatus(RoomStatus status);

    // 新增：根据状态查询会议室
    List<Room> findByStatus(RoomStatus status);

    // 新增：分页查询会议室
    Page<Room> findAll(Pageable pageable);

    // 新增：根据状态分页查询会议室
    Page<Room> findByStatus(RoomStatus status, Pageable pageable);
}
