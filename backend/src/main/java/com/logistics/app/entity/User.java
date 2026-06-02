package com.logistics.app.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true)
    private String kakaoId;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status;

    private String phone;
    private String companyName;
    private String vehicleType;

    @Column(length = 1000)
    private String bio;
    private String profileImageUrl;
    private String paymentMethod;
    private String contactEmail;
    private String contactPhone;
    private Boolean profileCompleted;

    @Builder.Default
    private Integer penaltyScore30d = 0;

    private Integer cancelCount;
    private Integer completedTransactionCount;
    private Double cancelRate;
    private LocalDateTime matchingBlockedUntil;
    private LocalDateTime tradingBlockedUntil;
    private Boolean highCancelBadge;
    private Double penaltyRatingDelta;

    @Builder.Default
    private Integer miniGameWeeklyWins = 0;

    @Builder.Default
    private Integer discountCouponCount = 0;

    @Builder.Default
    private Integer driverFeeCouponCount = 0;

    private LocalDateTime lastCouponIssuedAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (status == null) {
            status = UserStatus.ACTIVE;
        }
        if (profileCompleted == null) {
            profileCompleted = false;
        }
        if (penaltyScore30d == null) {
            penaltyScore30d = 0;
        }
        if (cancelCount == null) {
            cancelCount = 0;
        }
        if (completedTransactionCount == null) {
            completedTransactionCount = 0;
        }
        if (cancelRate == null) {
            cancelRate = 0d;
        }
        if (highCancelBadge == null) {
            highCancelBadge = false;
        }
        if (penaltyRatingDelta == null) {
            penaltyRatingDelta = 0d;
        }
        if (miniGameWeeklyWins == null) {
            miniGameWeeklyWins = 0;
        }
        if (discountCouponCount == null) {
            discountCouponCount = 0;
        }
        if (driverFeeCouponCount == null) {
            driverFeeCouponCount = 0;
        }
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        if (status == null) {
            status = UserStatus.ACTIVE;
        }
        if (profileCompleted == null) {
            profileCompleted = false;
        }
        if (penaltyScore30d == null) {
            penaltyScore30d = 0;
        }
        if (cancelCount == null) {
            cancelCount = 0;
        }
        if (completedTransactionCount == null) {
            completedTransactionCount = 0;
        }
        if (cancelRate == null) {
            cancelRate = 0d;
        }
        if (highCancelBadge == null) {
            highCancelBadge = false;
        }
        if (penaltyRatingDelta == null) {
            penaltyRatingDelta = 0d;
        }
        if (miniGameWeeklyWins == null) {
            miniGameWeeklyWins = 0;
        }
        if (discountCouponCount == null) {
            discountCouponCount = 0;
        }
        if (driverFeeCouponCount == null) {
            driverFeeCouponCount = 0;
        }
    }
}
