package com.logistics.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class GameDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JoinRoomRequest {
        private String roomCode;
    }

    @Data
    @Builder
    public static class QuickDrawPlayerView {
        private Long userId;
        private String seat;
        private String name;
        private boolean ready;
        private int score;
        private LocalDateTime shotAt;
    }

    @Data
    @Builder
    public static class QuickDrawRoomResponse {
        private String roomCode;
        private String phase;
        private String mySeat;
        private String winnerSeat;
        private String lastRoundMessage;
        private int targetScore;
        private LocalDateTime drawAt;
        private List<QuickDrawPlayerView> players;
    }

    @Data
    @Builder
    public static class MiniGameLeaderboardItem {
        private int rank;
        private Long userId;
        private String name;
        private String role;
        private int weeklyWins;
        private String rewardLabel;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoundsLiteInputRequest {
        private boolean left;
        private boolean right;
        private boolean jump;
        private boolean drop;
        private boolean shoot;
        private Double aimX;
        private Double aimY;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoundsLiteSelectCardRequest {
        private String cardKey;
    }

    @Data
    @Builder
    public static class RoundsLitePlayerView {
        private Long userId;
        private String seat;
        private String name;
        private boolean ready;
        private boolean cardPickPending;
        private int wins;
        private int hp;
        private int maxHp;
        private double x;
        private double y;
        private double width;
        private double height;
        private boolean facingRight;
        private double aimAngleDeg;
        private List<String> selectedCards;
    }

    @Data
    @Builder
    public static class RoundsLiteProjectileView {
        private String id;
        private String ownerSeat;
        private double x;
        private double y;
        private double radius;
    }

    @Data
    @Builder
    public static class RoundsLiteCardOptionView {
        private String key;
        private String title;
        private String description;
    }

    @Data
    @Builder
    public static class RoundsLitePlatformView {
        private double x;
        private double y;
        private double w;
        private double h;
        private String kind;
    }

    @Data
    @Builder
    public static class RoundsLiteRoomResponse {
        private String roomCode;
        private String phase;
        private String mySeat;
        private String pickerSeat;
        private boolean myCardPickPending;
        private String roundWinnerSeat;
        private String matchWinnerSeat;
        private String message;
        private int roundNo;
        private int targetWins;
        private LocalDateTime countdownEndsAt;
        private boolean matchmakingRoom;
        private boolean matchmakingQueued;
        private String mapKey;
        private Double arenaWidth;
        private Double arenaHeight;
        private List<RoundsLitePlatformView> platforms;
        private List<RoundsLitePlayerView> players;
        private List<RoundsLiteProjectileView> projectiles;
        private List<RoundsLiteCardOptionView> cardOptions;
    }
}
