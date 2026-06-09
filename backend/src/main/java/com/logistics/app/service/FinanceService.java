package com.logistics.app.service;

import com.logistics.app.dto.FinanceDtos;
import com.logistics.app.dto.ReceiptDTO;
import com.logistics.app.entity.*;
import com.logistics.app.repository.MoneyTransactionRepository;
import com.logistics.app.repository.OfferRepository;
import com.logistics.app.repository.ShipmentRepository;
import com.logistics.app.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class FinanceService {

    public static final int SERVICE_FEE_RATE = 3;
    private static final Object FINANCE_RECONCILE_LOCK = new Object();
    private final OfferRepository offerRepository;
    private final MoneyTransactionRepository moneyTransactionRepository;
    private final ShipmentRepository shipmentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public FinanceService(MoneyTransactionRepository moneyTransactionRepository,
                          ShipmentRepository shipmentRepository,
                          UserRepository userRepository,
                          OfferRepository offerRepository,
                          NotificationService notificationService) {
        this.moneyTransactionRepository = moneyTransactionRepository;
        this.shipmentRepository = shipmentRepository;
        this.userRepository = userRepository;
        this.offerRepository = offerRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public FinanceDtos.FinanceSummaryResponse getSummary(User user) {
        reconcileFinanceTransactionsSafely();

        List<MoneyTransaction> transactions;
        if (user.getRole() == UserRole.ADMIN) {
            transactions = moneyTransactionRepository.findAll();
        } else {
            transactions = moneyTransactionRepository.findByUserOrderByCreatedAtDesc(user);
        }
        transactions = deduplicateForDisplay(transactions);

        int totalSpent = 0;
        int totalGrossEarned = 0;
        int totalNetEarned = 0;
        int totalFeePaid = 0;
        int totalPlatformRevenue = 0;

        for (MoneyTransaction tx : transactions) {
            switch (tx.getType()) {
                case SPEND -> {
                    totalSpent += nvl(tx.getGrossAmount());
                    totalFeePaid += nvl(tx.getFeeAmount());
                }
                case EARN -> {
                    totalGrossEarned += nvl(tx.getGrossAmount());
                    totalNetEarned += nvl(tx.getNetAmount());
                    totalFeePaid += nvl(tx.getFeeAmount());
                }
                case FEE -> totalPlatformRevenue += nvl(tx.getNetAmount());
            }
        }

        int completedShipmentCount = user.getRole() == UserRole.ADMIN
                ? (int) shipmentRepository.findAll().stream().filter(s -> s.getStatus() == ShipmentStatus.COMPLETED).count()
                : (int) shipmentRepository.findAll().stream().filter(s ->
                s.getStatus() == ShipmentStatus.COMPLETED && (
                        (user.getRole() == UserRole.SHIPPER && s.getShipper() != null && s.getShipper().getId().equals(user.getId())) ||
                                (user.getRole() == UserRole.DRIVER && s.getAssignedDriver() != null && s.getAssignedDriver().getId().equals(user.getId()))
                )
        ).count();

        List<FinanceDtos.MoneyTransactionResponse> recent = transactions.stream()
                .sorted((a, b) -> safeCreatedAt(b).compareTo(safeCreatedAt(a)))
                .limit(8)
                .map(this::toResponse)
                .toList();

        return FinanceDtos.FinanceSummaryResponse.builder()
                .role(user.getRole().name())
                .serviceFeeRate(SERVICE_FEE_RATE)
                .totalSpent(totalSpent)
                .totalGrossEarned(totalGrossEarned)
                .totalNetEarned(totalNetEarned)
                .totalFeePaid(totalFeePaid)
                .totalPlatformRevenue(totalPlatformRevenue)
                .transactionCount(transactions.size())
                .completedShipmentCount(completedShipmentCount)
                .recentTransactions(recent)
                .build();
    }

    @Transactional
    public List<FinanceDtos.MoneyTransactionResponse> getTransactions(User user) {
        reconcileFinanceTransactionsSafely();

        List<MoneyTransaction> transactions = user.getRole() == UserRole.ADMIN
                ? moneyTransactionRepository.findAll()
                : moneyTransactionRepository.findByUserOrderByCreatedAtDesc(user);
        return deduplicateForDisplay(transactions).stream()
                .sorted((a, b) -> safeCreatedAt(b).compareTo(safeCreatedAt(a)))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void settleCompletedShipment(Shipment shipment) {
        if (shipment == null) {
            return;
        }

        Offer acceptedOffer = resolveAcceptedOffer(shipment);
        User adminUser = findAdminUser();
        reconcileShipmentTransactions(shipment, acceptedOffer, adminUser, false);
    }

    @Transactional
    public void settleCompletedShipment(Shipment shipment, Offer acceptedOffer, User adminUser) {
        if (shipment == null) {
            return;
        }

        reconcileShipmentTransactions(shipment, acceptedOffer, adminUser, false);
    }

    @Transactional
    public void settleCompletedShipment(Shipment shipment, Offer acceptedOffer, User adminUser, boolean useDriverFeeCoupon) {
        if (shipment == null) {
            return;
        }

        reconcileShipmentTransactions(shipment, acceptedOffer, adminUser, useDriverFeeCoupon);
    }

    private void reconcileFinanceTransactionsSafely() {
        synchronized (FINANCE_RECONCILE_LOCK) {
            reconcileCompletedShipmentTransactions();
            moneyTransactionRepository.flush();
        }
    }

    private List<MoneyTransaction> deduplicateForDisplay(List<MoneyTransaction> transactions) {
        Map<String, MoneyTransaction> uniqueMap = new LinkedHashMap<>();

        transactions.stream()
                .sorted(Comparator.comparing(MoneyTransaction::getId, Comparator.nullsLast(Long::compareTo)))
                .forEach(tx -> uniqueMap.putIfAbsent(transactionDisplayKey(tx), tx));

        return new ArrayList<>(uniqueMap.values());
    }

    private String transactionDisplayKey(MoneyTransaction tx) {
        Long shipmentId = tx.getShipment() != null ? tx.getShipment().getId() : null;
        String type = tx.getType() != null ? tx.getType().name() : "UNKNOWN";
        if (shipmentId == null) {
            return "TX-" + tx.getId() + "-" + type;
        }
        return "SHIPMENT-" + shipmentId + "-" + type;
    }

    private java.time.LocalDateTime safeCreatedAt(MoneyTransaction tx) {
        return tx.getCreatedAt() != null ? tx.getCreatedAt() : java.time.LocalDateTime.MIN;
    }

    private void reconcileCompletedShipmentTransactions() {
        User adminUser = findAdminUser();
        List<Shipment> completedShipments = shipmentRepository.findAll().stream()
                .filter(shipment -> shipment.getStatus() == ShipmentStatus.COMPLETED)
                .toList();

        for (Shipment shipment : completedShipments) {
            reconcileShipmentTransactions(shipment, resolveAcceptedOffer(shipment), adminUser, false);
        }
    }

    private User findAdminUser() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() == UserRole.ADMIN)
                .findFirst()
                .orElse(null);
    }

    private Offer resolveAcceptedOffer(Shipment shipment) {
        if (shipment == null || shipment.getAcceptedOfferId() == null) {
            return null;
        }

        return offerRepository.findById(shipment.getAcceptedOfferId()).orElse(null);
    }

    private void reconcileShipmentTransactions(Shipment shipment, Offer acceptedOffer, User adminUser, boolean useDriverFeeCoupon) {
        if (shipment == null || shipment.getStatus() != ShipmentStatus.COMPLETED) {
            return;
        }

        int grossAmount = acceptedOffer != null && acceptedOffer.getPrice() != null
                ? acceptedOffer.getPrice()
                : nvl(shipment.getAgreedPrice());
        int feeAmount = (int) Math.floor(grossAmount * (SERVICE_FEE_RATE / 100.0));
        int driverFeeAmount = feeAmount;
        int netAmount = Math.max(grossAmount - driverFeeAmount, 0);
        String driverDescription = "운행 완료 정산";
        String paymentMethod = shipment.getPaymentMethod();

        if (shipment.getAssignedDriver() != null) {
            List<MoneyTransaction> existingEarnTransactions = moneyTransactionRepository.findByShipmentAndTypeOrderByCreatedAtAsc(shipment, TransactionType.EARN);
            boolean alreadySettled = !existingEarnTransactions.isEmpty();
            boolean couponAlreadyApplied = alreadySettled
                    && existingEarnTransactions.get(0).getDescription() != null
                    && existingEarnTransactions.get(0).getDescription().contains("정산 수수료 50% 할인 쿠폰 적용");

            if (couponAlreadyApplied) {
                driverFeeAmount = nvl(existingEarnTransactions.get(0).getFeeAmount());
                netAmount = Math.max(grossAmount - driverFeeAmount, 0);
                driverDescription = "운행 완료 정산 - 정산 수수료 50% 할인 쿠폰 적용";
            } else if (!alreadySettled && useDriverFeeCoupon) {
                User driver = shipment.getAssignedDriver();
                int driverCoupons = driver.getDriverFeeCouponCount() == null ? 0 : driver.getDriverFeeCouponCount();
                if (driverCoupons <= 0) {
                    throw new RuntimeException("사용 가능한 정산 수수료 할인 쿠폰이 없습니다.");
                }
                if (feeAmount > 0) {
                    driverFeeAmount = (int) Math.floor(feeAmount * 0.5);
                    netAmount = Math.max(grossAmount - driverFeeAmount, 0);
                    driverDescription = "운행 완료 정산 - 정산 수수료 50% 할인 쿠폰 적용";
                    driver.setDriverFeeCouponCount(Math.max(0, driverCoupons - 1));
                    userRepository.save(driver);
                }
            }
        }

        if (shipment.getShipper() != null) {
            int shipperGrossAmount = grossAmount;
            int shipperDiscountAmount = 0;
            int shipperNetAmount = grossAmount;
            String shipperDescription = shipment.isPaid() ? "운송 결제 완료" : "배차 완료 결제";
            List<MoneyTransaction> existingSpendTransactions = moneyTransactionRepository.findByShipmentAndTypeOrderByCreatedAtAsc(shipment, TransactionType.SPEND);
            if (!existingSpendTransactions.isEmpty() && nvl(existingSpendTransactions.get(0).getFeeAmount()) > 0) {
                MoneyTransaction existingSpend = existingSpendTransactions.get(0);
                shipperGrossAmount = nvl(existingSpend.getGrossAmount());
                shipperDiscountAmount = nvl(existingSpend.getFeeAmount());
                shipperNetAmount = nvl(existingSpend.getNetAmount());
                shipperDescription = existingSpend.getDescription() != null ? existingSpend.getDescription() : "운송 결제 완료 - 운송비 5% 할인 쿠폰 적용";
            }

            ensureSingleTransaction(
                    shipment,
                    shipment.getShipper(),
                    TransactionType.SPEND,
                    shipperGrossAmount,
                    shipperDiscountAmount,
                    shipperNetAmount,
                    shipperDescription,
                    paymentMethod
            );
        }

        if (shipment.getAssignedDriver() != null) {
            ensureSingleTransaction(
                    shipment,
                    shipment.getAssignedDriver(),
                    TransactionType.EARN,
                    grossAmount,
                    driverFeeAmount,
                    netAmount,
                    driverDescription,
                    paymentMethod
            );
        }

        if (adminUser != null) {
            ensureSingleTransaction(
                    shipment,
                    adminUser,
                    TransactionType.FEE,
                    grossAmount,
                    driverFeeAmount,
                    driverFeeAmount,
                    driverFeeAmount < feeAmount ? "플랫폼 수수료 수익 - 차주 수수료 할인 쿠폰 적용" : "플랫폼 수수료 수익",
                    paymentMethod
            );
        }
    }

    private void ensureSingleTransaction(Shipment shipment, User user, TransactionType type, int grossAmount, int feeAmount, int netAmount, String description, String paymentMethod) {
        List<MoneyTransaction> transactions = new ArrayList<>(moneyTransactionRepository.findByShipmentAndTypeOrderByCreatedAtAsc(shipment, type));

        MoneyTransaction primary;
        if (transactions.isEmpty()) {
            primary = MoneyTransaction.builder()
                    .user(user)
                    .shipment(shipment)
                    .type(type)
                    .grossAmount(grossAmount)
                    .feeAmount(feeAmount)
                    .netAmount(netAmount)
                    .description(description)
                    .paymentMethod(paymentMethod)
                    .build();
        } else {
            primary = transactions.get(0);
        }

        boolean changed = transactions.isEmpty();

        if (primary.getUser() == null || !Objects.equals(primary.getUser().getId(), user.getId())) {
            primary.setUser(user);
            changed = true;
        }
        if (!Objects.equals(primary.getGrossAmount(), grossAmount)) {
            primary.setGrossAmount(grossAmount);
            changed = true;
        }
        if (!Objects.equals(primary.getFeeAmount(), feeAmount)) {
            primary.setFeeAmount(feeAmount);
            changed = true;
        }
        if (!Objects.equals(primary.getNetAmount(), netAmount)) {
            primary.setNetAmount(netAmount);
            changed = true;
        }
        if (!Objects.equals(primary.getDescription(), description)) {
            primary.setDescription(description);
            changed = true;
        }
        if (!Objects.equals(primary.getPaymentMethod(), paymentMethod)) {
            primary.setPaymentMethod(paymentMethod);
            changed = true;
        }

        if (changed) {
            moneyTransactionRepository.save(primary);
        }

        if (transactions.size() > 1) {
            moneyTransactionRepository.deleteAllInBatch(transactions.subList(1, transactions.size()));
            moneyTransactionRepository.flush();
        }
    }

    public FinanceDtos.ReceiptResponse getReceipt(User user, Long shipmentId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("화물을 찾을 수 없습니다."));

        boolean canView = user.getRole() == UserRole.ADMIN
                || (shipment.getShipper() != null && shipment.getShipper().getId().equals(user.getId()))
                || (shipment.getAssignedDriver() != null && shipment.getAssignedDriver().getId().equals(user.getId()));

        if (!canView) {
            throw new RuntimeException("해당 영수증을 조회할 권한이 없습니다.");
        }

        MoneyTransaction tx = user.getRole() == UserRole.ADMIN
                ? moneyTransactionRepository.findFirstByShipmentIdOrderByCreatedAtDesc(shipmentId).orElse(null)
                : moneyTransactionRepository.findFirstByUserAndShipmentIdOrderByCreatedAtDesc(user, shipmentId).orElse(null);

        Integer fallbackGross = shipment.getAgreedPrice();
        if (fallbackGross == null && shipment.getAcceptedOfferId() != null) {
            fallbackGross = offerRepository.findById(shipment.getAcceptedOfferId())
                    .map(Offer::getPrice)
                    .orElse(null);
        }
        int grossAmount = tx != null ? nvl(tx.getGrossAmount()) : nvl(fallbackGross);
        int feeAmount;
        int netAmount;
        TransactionType transactionType;
        String description;
        String paymentMethod;
        java.time.LocalDateTime createdAt;
        String receiptNumber;

        if (tx != null) {
            feeAmount = nvl(tx.getFeeAmount());
            netAmount = nvl(tx.getNetAmount());
            transactionType = tx.getType();
            description = tx.getDescription();
            paymentMethod = tx.getPaymentMethod() != null ? tx.getPaymentMethod() : (tx.getShipment() != null ? tx.getShipment().getPaymentMethod() : null);
            createdAt = tx.getCreatedAt();
            receiptNumber = "RCPT-" + shipmentId + "-" + tx.getId();
        } else {
            feeAmount = user.getRole() == UserRole.DRIVER ? (int) Math.floor(grossAmount * (SERVICE_FEE_RATE / 100.0)) : 0;
            netAmount = Math.max(grossAmount - feeAmount, 0);
            transactionType = user.getRole() == UserRole.DRIVER ? TransactionType.EARN : TransactionType.SPEND;
            description = shipment.isPaid() ? "운송 결제 내역" : "거래 예상 영수증";
            paymentMethod = shipment.getPaymentMethod();
            createdAt = shipment.getPaymentCompletedAt() != null ? shipment.getPaymentCompletedAt() : shipment.getUpdatedAt();
            if (createdAt == null) {
                createdAt = shipment.getCreatedAt();
            }
            receiptNumber = "RCPT-" + shipmentId + "-PREVIEW";
        }

        return FinanceDtos.ReceiptResponse.builder()
                .receiptNumber(receiptNumber)
                .shipmentId(shipment.getId())
                .shipmentTitle(shipment.getTitle())
                .transactionType(transactionType)
                .grossAmount(grossAmount)
                .feeAmount(feeAmount)
                .netAmount(netAmount)
                .description(description)
                .paymentMethod(paymentMethod)
                .createdAt(createdAt)
                .originAddress(shipment.getOriginAddress())
                .destinationAddress(shipment.getDestinationAddress())
                .shipperName(shipment.getShipper() != null ? shipment.getShipper().getName() : null)
                .driverName(shipment.getAssignedDriver() != null ? shipment.getAssignedDriver().getName() : null)
                .viewerRole(user.getRole().name())
                .build();
    }

    @Transactional
    public FinanceDtos.ShipmentPaymentResponse payForShipment(Long shipmentId, User user, FinanceDtos.ShipmentPaymentRequest request) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("결제할 거래를 찾을 수 없습니다."));

        if (user == null || shipment.getShipper() == null || !shipment.getShipper().getId().equals(user.getId())) {
            throw new RuntimeException("본인 화물만 결제할 수 있습니다.");
        }
        if (shipment.getStatus() != ShipmentStatus.CONFIRMED) {
            throw new RuntimeException("차주 확정 후에만 결제할 수 있습니다.");
        }
        if (shipment.isPaid()) {
            throw new RuntimeException("이미 결제가 완료된 거래입니다.");
        }
        if (shipment.getAcceptedOfferId() == null) {
            throw new RuntimeException("확정된 운임 정보가 없습니다.");
        }

        Offer acceptedOffer = offerRepository.findById(shipment.getAcceptedOfferId())
                .orElseThrow(() -> new RuntimeException("확정된 제안 정보를 찾을 수 없습니다."));
        int originalAmount = acceptedOffer.getPrice() == null ? 0 : acceptedOffer.getPrice();
        boolean useDiscountCoupon = request != null && Boolean.TRUE.equals(request.getUseDiscountCoupon());
        int availableCoupons = user.getDiscountCouponCount() == null ? 0 : user.getDiscountCouponCount();
        int discountAmount = 0;
        boolean couponUsed = false;

        if (useDiscountCoupon) {
            if (availableCoupons <= 0) {
                throw new RuntimeException("사용 가능한 할인 쿠폰이 없습니다.");
            }
            discountAmount = Math.max(0, (int) Math.floor(originalAmount * 0.05));
            couponUsed = discountAmount > 0;
            user.setDiscountCouponCount(Math.max(0, availableCoupons - 1));
        }

        int amount = Math.max(0, originalAmount - discountAmount);
        String paymentMethod = request != null && request.getPaymentMethod() != null && !request.getPaymentMethod().isBlank()
                ? request.getPaymentMethod().trim()
                : "등록된 결제수단";

        if (couponUsed) {
            userRepository.save(user);
        }

        shipment.setAgreedPrice(originalAmount);
        shipment.setPaid(true);
        shipment.setPaymentMethod(paymentMethod);
        shipment.setPaymentCompletedAt(java.time.LocalDateTime.now());
        shipmentRepository.save(shipment);

        if (!moneyTransactionRepository.existsByShipmentAndType(shipment, TransactionType.SPEND)) {
            moneyTransactionRepository.save(MoneyTransaction.builder()
                    .user(shipment.getShipper())
                    .shipment(shipment)
                    .type(TransactionType.SPEND)
                    .grossAmount(originalAmount)
                    .feeAmount(discountAmount)
                    .netAmount(amount)
                    .description(couponUsed ? "운송 결제 완료 - 운송비 5% 할인 쿠폰 적용" : "운송 결제 완료")
                    .paymentMethod(paymentMethod)
                    .build());
        }

        String amountText = String.format("%,d원", amount);
        notificationService.notifyUser(shipment.getShipper().getId(), "PAYMENT", "결제가 완료되었습니다.",
                shipment.getTitle() + " 건 결제가 완료되었습니다. 결제 금액은 " + amountText + "입니다.", "SHIPMENT", shipment.getId());
        if (shipment.getAssignedDriver() != null) {
            notificationService.notifyUser(shipment.getAssignedDriver().getId(), "PAYMENT", "결제 완료 알림",
                    shipment.getTitle() + " 건이 결제되었습니다. 결제 금액은 " + amountText + "입니다.", "SHIPMENT", shipment.getId());
        }

        return FinanceDtos.ShipmentPaymentResponse.builder()
                .shipmentId(shipment.getId())
                .shipmentTitle(shipment.getTitle())
                .amount(amount)
                .originalAmount(originalAmount)
                .discountAmount(discountAmount)
                .couponUsed(couponUsed)
                .remainingCouponCount(user.getDiscountCouponCount())
                .paid(true)
                .paidAt(shipment.getPaymentCompletedAt())
                .paymentMethod(paymentMethod)
                .message(couponUsed ? "운송비 5% 할인 쿠폰이 적용되어 결제가 완료되었습니다." : "결제가 완료되었습니다.")
                .build();
    }

    private FinanceDtos.MoneyTransactionResponse toResponse(MoneyTransaction tx) {
        return FinanceDtos.MoneyTransactionResponse.builder()
                .id(tx.getId())
                .shipmentId(tx.getShipment() != null ? tx.getShipment().getId() : null)
                .shipmentTitle(tx.getShipment() != null ? tx.getShipment().getTitle() : null)
                .type(tx.getType())
                .grossAmount(tx.getGrossAmount())
                .feeAmount(tx.getFeeAmount())
                .netAmount(tx.getNetAmount())
                .description(tx.getDescription())
                .paymentMethod(
                        tx.getPaymentMethod() != null
                                ? tx.getPaymentMethod()
                                : (tx.getShipment() != null ? tx.getShipment().getPaymentMethod() : null)
                )
                .createdAt(tx.getCreatedAt())
                .build();
    }

    private int nvl(Integer value) {
        return value == null ? 0 : value;
    }

    public ReceiptDTO getReceipt(Long shipmentId) {

        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found"));

        Integer price = 0;

        if (shipment.getAcceptedOfferId() != null) {
            Offer offer = offerRepository.findById(shipment.getAcceptedOfferId())
                    .orElseThrow(() -> new RuntimeException("Offer not found"));

            price = offer.getPrice();
        }

        return ReceiptDTO.builder()
                .receiptNumber(UUID.randomUUID().toString().substring(0, 10))
                .shipmentId(shipment.getId())
                .title(shipment.getTitle())
                .amount(price)
                .fee(0)
                .finalAmount(price)
                .createdAt(shipment.getCreatedAt())
                .build();
    }
}
