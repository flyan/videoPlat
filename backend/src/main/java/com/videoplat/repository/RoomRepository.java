package com.videoplat.repository;

import com.videoplat.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    Optional<Room> findByRoomId(String roomId);

    boolean existsByRoomId(String roomId);

    long countByStatus(Room.RoomStatus status);
}
