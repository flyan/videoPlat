package com.videoplat.domain.repository;

import com.videoplat.domain.entity.RoomParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 会议室参与者数据访问层
 */
@Repository
public interface RoomParticipantRepository extends JpaRepository<RoomParticipant, Long> {

    // 查询会议室中当前在线的参与者
    List<RoomParticipant> findByRoomIdAndLeftAtIsNull(Long roomId);

    // 查询指定用户在会议室中的参与记录（仍在线）
    Optional<RoomParticipant> findByRoomIdAndUserIdAndLeftAtIsNull(Long roomId, Long userId);

    // 统计会议室当前在线人数
    long countByRoomIdAndLeftAtIsNull(Long roomId);

    // 新增：查询用户当前所在的会议室（可能有多个，返回列表）
    List<RoomParticipant> findByUserIdAndLeftAtIsNull(Long userId);

    // 新增：查询用户的所有参与记录
    List<RoomParticipant> findByUserId(Long userId);
}
