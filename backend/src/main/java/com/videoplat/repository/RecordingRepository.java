package com.videoplat.repository;

import com.videoplat.model.Recording;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RecordingRepository extends JpaRepository<Recording, Long> {

    List<Recording> findByRoomId(Long roomId);

    List<Recording> findByCreatorId(Long creatorId);

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
}
