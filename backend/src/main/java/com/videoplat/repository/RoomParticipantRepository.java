package com.videoplat.repository;

import com.videoplat.model.RoomParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomParticipantRepository extends JpaRepository<RoomParticipant, Long> {

    List<RoomParticipant> findByRoomIdAndLeftAtIsNull(Long roomId);

    Optional<RoomParticipant> findByRoomIdAndUserIdAndLeftAtIsNull(Long roomId, Long userId);

    long countByRoomIdAndLeftAtIsNull(Long roomId);
}
