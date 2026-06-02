package com.logistics.app.repository;

import com.logistics.app.entity.User;
import com.logistics.app.entity.UserRole;
import com.logistics.app.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;


public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByKakaoId(String kakaoId);
    long countByRole(UserRole role);
    long countByStatus(UserStatus status);
    List<User> findAllByOrderByCreatedAtDesc();
    List<User> findByRoleAndStatusOrderByCreatedAtDesc(UserRole role, UserStatus status);
    List<User> findTop10ByMiniGameWeeklyWinsGreaterThanOrderByMiniGameWeeklyWinsDescCreatedAtAsc(Integer miniGameWeeklyWins);
    Optional<User> findTopByMiniGameWeeklyWinsGreaterThanOrderByMiniGameWeeklyWinsDescCreatedAtAsc(Integer miniGameWeeklyWins);

    @Modifying
    @Query("update User u set u.miniGameWeeklyWins = 0")
    int resetAllMiniGameWeeklyWins();
}

