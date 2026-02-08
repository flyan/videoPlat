package com.videoplat.repository;

import com.videoplat.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 会议室数据访问层
 */
@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    Optional<Room> findByRoomId(String roomId);

    boolean existsByRoomId(String roomId);

    // 统计指定状态的会议室数量
    long countByStatus(Room.RoomStatus status);
}
