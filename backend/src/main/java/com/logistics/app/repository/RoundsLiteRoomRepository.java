package com.logistics.app.repository;

import com.logistics.app.entity.RoundsLiteRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

public interface RoundsLiteRoomRepository extends JpaRepository<RoundsLiteRoom, Long> {
    Optional<RoundsLiteRoom> findByRoomCode(String roomCode);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select distinct r from RoundsLiteRoom r left join fetch r.players where r.roomCode = :roomCode")
    Optional<RoundsLiteRoom> findByRoomCodeForUpdate(@Param("roomCode") String roomCode);

    List<RoundsLiteRoom> findByMatchmakingRoomTrueOrderByCreatedAtAsc();
}
