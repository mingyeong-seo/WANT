package com.logistics.app.service;

import com.logistics.app.dto.GameDtos;
import com.logistics.app.entity.User;
import com.logistics.app.entity.UserRole;
import com.logistics.app.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class MiniGameRewardService {

    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public MiniGameRewardService(UserRepository userRepository, NotificationService notificationService) {
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public void recordMatchWin(User user) {
        if (user == null || user.getId() == null) {
            return;
        }

        User savedUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        int currentWins = savedUser.getMiniGameWeeklyWins() == null ? 0 : savedUser.getMiniGameWeeklyWins();
        savedUser.setMiniGameWeeklyWins(currentWins + 1);
        userRepository.save(savedUser);
    }


    public List<GameDtos.MiniGameLeaderboardItem> getWeeklyLeaderboard() {
        List<User> users = userRepository.findTop10ByMiniGameWeeklyWinsGreaterThanOrderByMiniGameWeeklyWinsDescCreatedAtAsc(0);
        List<GameDtos.MiniGameLeaderboardItem> leaderboard = new ArrayList<>();

        for (int index = 0; index < users.size(); index++) {
            User user = users.get(index);
            String roleLabel = user.getRole() == UserRole.DRIVER ? "차주" : user.getRole() == UserRole.SHIPPER ? "화주" : "관리자";
            String rewardLabel = user.getRole() == UserRole.DRIVER
                    ? "정산 수수료 50% 할인 쿠폰"
                    : "운송비 5% 할인 쿠폰";

            leaderboard.add(GameDtos.MiniGameLeaderboardItem.builder()
                    .rank(index + 1)
                    .userId(user.getId())
                    .name(user.getName())
                    .role(roleLabel)
                    .weeklyWins(user.getMiniGameWeeklyWins() == null ? 0 : user.getMiniGameWeeklyWins())
                    .rewardLabel(rewardLabel)
                    .build());
        }

        return leaderboard;
    }

    @Scheduled(cron = "0 0 0 * * MON", zone = "Asia/Seoul")
    public void rewardWeeklyTopWinner() {
        userRepository.findTopByMiniGameWeeklyWinsGreaterThanOrderByMiniGameWeeklyWinsDescCreatedAtAsc(0)
                .ifPresent(winner -> {
                    String couponMessage;
                    if (winner.getRole() == UserRole.DRIVER) {
                        int couponCount = winner.getDriverFeeCouponCount() == null ? 0 : winner.getDriverFeeCouponCount();
                        winner.setDriverFeeCouponCount(couponCount + 1);
                        couponMessage = "지난주 미니게임 승리 수 1위로 정산 수수료 50% 할인 쿠폰 1장이 지급되었습니다.";
                    } else {
                        int couponCount = winner.getDiscountCouponCount() == null ? 0 : winner.getDiscountCouponCount();
                        winner.setDiscountCouponCount(couponCount + 1);
                        couponMessage = "지난주 미니게임 승리 수 1위로 운송비 5% 할인 쿠폰 1장이 지급되었습니다.";
                    }
                    winner.setLastCouponIssuedAt(LocalDateTime.now());
                    userRepository.save(winner);

                    notificationService.notifyUser(
                            winner.getId(),
                            "COUPON",
                            "미니게임 주간 1위 쿠폰 지급",
                            couponMessage,
                            "USER",
                            winner.getId()
                    );
                });

        userRepository.resetAllMiniGameWeeklyWins();
    }
}
