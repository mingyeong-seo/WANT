import KakaoMapView from "../../../components/KakaoMapView";
import Pagination from "../../../components/common/Pagination";
import ProfilePreviewCard from "../../../components/common/ProfilePreviewCard";
import SectionTitle from "../../../components/common/SectionTitle";
import ShipmentCancelModal from "../../../components/common/ShipmentCancelModal";
import {
  formatCurrency,
  formatDate,
  formatRatingSummary,
  roleText,
  statusText,
} from "../../../utils/formatters";
import { useMemo, useState } from "react";
import PenaltyBlockedModal from "../../../components/common/PenaltyBlockedModal";

export default function UserBoardTab({ controller }) {
  const {
    auth,
    filteredShipments,
    selectedId,
    setSelectedId,
    handleToggleBookmark,
    selected,
    roleTheme,
    offerForm,
    setOfferForm,
    handleCreateOffer,
    handleAcceptOffer,
    openPaymentModal,
    handleStart,
    handleCompletionProofChange,
    completionProof,
    handleComplete,
    page,
    setPage,
    totalPages,
    cancelModalOpen,
    openCancelModal,
    closeCancelModal,
    cancelForm,
    setCancelForm,
    handleCancelShipment,
    cancelSubmitting,
    penaltyBlockedModal,
    closePenaltyBlockedModal,
  } = controller;

  // 추가
  const offerStatusText = {
    PENDING: "대기중",
    ACCEPTED: "수락됨",
    REJECTED: "거절됨",
  };

  // 추가
  const [statusFilter, setStatusFilter] = useState("ALL");

  const currentUserId = Number(
    auth?.id || controller.profile?.id || localStorage.getItem("userId") || 0,
  );

  const isSelectedShipperOwner =
    !!selected &&
    auth.role === "SHIPPER" &&
    !!currentUserId &&
    Number(selected.shipperId) === currentUserId;

  const isSelectedAssignedDriver =
    !!selected &&
    auth.role === "DRIVER" &&
    (selected.assignedToMe === true ||
      (!!currentUserId && Number(selected.assignedDriverId) === currentUserId) ||
      (!!auth?.email && selected.assignedDriverEmail === auth.email));

  const showCancelButton =
    !!selected &&
    (selected.status === "BIDDING" ||
      selected.status === "CONFIRMED" ||
      selected.status === "IN_TRANSIT") &&
    (isSelectedShipperOwner || isSelectedAssignedDriver);

  // 추가
  const sortedShipments = useMemo(() => {
    return [...filteredShipments]
      .filter((item) => {
        if (statusFilter === "ALL") return true;
        return item.status === statusFilter;
      })
      .sort((a, b) => {
        return (b.bookmarked === true) - (a.bookmarked === true);
      });
  }, [filteredShipments, statusFilter]);

  function formatMinutesToHour(mins) {
    if (mins == null) return "-";

    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;

    if (hours === 0) return `${minutes}분`;
    if (minutes === 0) return `${hours}시간`;

    return `${hours}시간 ${minutes}분`;
  }

  // 추가
  const [previewImages, setPreviewImages] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  return (
    <div className="page-stack">
      <div className="surface table-surface shipment-table">
        <div className="table-head">
          <div className="table-head-row">
            <SectionTitle title="배차 목록" />

            {/* 추가 */}
            <div
              className={`board-filter ${auth.role === "SHIPPER" ? "shipper" : "driver"}`}
            >
              <button
                className={statusFilter === "ALL" ? "active" : ""}
                onClick={() => setStatusFilter("ALL")}
              >
                전체
              </button>

              <button
                className={statusFilter === "BIDDING" ? "active" : ""}
                onClick={() => setStatusFilter("BIDDING")}
              >
                입찰중
              </button>

              <button
                className={statusFilter === "IN_TRANSIT" ? "active" : ""}
                onClick={() => setStatusFilter("IN_TRANSIT")}
              >
                운송중
              </button>

              <button
                className={statusFilter === "CONFIRMED" ? "active" : ""}
                onClick={() => setStatusFilter("CONFIRMED")}
              >
                확정
              </button>

              <button
                className={statusFilter === "CANCELLED" ? "active" : ""}
                onClick={() => setStatusFilter("CANCELLED")}
              >
                취소
              </button>
            </div>
          </div>
        </div>
        <div className="table-scroll">
          <table className="board-table">
            <thead>
              <tr>
                <th></th>
                <th>상태</th>
                <th>배차명</th>
                <th>태그</th>
                <th>구간</th>
                <th>입찰</th>
                <th>차주</th>
                <th>예상</th>
              </tr>
            </thead>

            <tbody>
              {/* {filteredShipments.map((item) => ( */}
              {sortedShipments.map((item) => (
                <tr
                  key={item.id}
                  className={selectedId === item.id ? "is-selected" : ""}
                  onClick={() => {
                    setSelectedId(item.id);
                  }}
                >
                  <td>
                    <button
                      className={
                        item.bookmarked
                          ? "bookmark-toggle active"
                          : "bookmark-toggle"
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleBookmark(item.id);
                      }}
                      aria-label={
                        item.bookmarked ? "즐겨찾기 해제" : "즐겨찾기 추가"
                      }
                      title={
                        item.bookmarked ? "즐겨찾기 해제" : "즐겨찾기 추가"
                      }
                    >
                      ★
                    </button>
                  </td>

                  <td>
                    <span
                      className={`badge badge-${item.status.toLowerCase()}`}
                    >
                      {statusText(item.status)}
                    </span>
                  </td>

                  <td>
                    <strong>{item.title}</strong>
                    <small>{item.cargoType}</small>
                  </td>

                  <td>
                    {auth.role === "DRIVER" ? (
                      <div className="chip-group">
                        {item.assignedToMe && (
                          <span className="tag tag-dark">내 배차</span>
                        )}
                        {!item.assignedToMe && item.hasMyOffer && (
                          <span className="tag">내 입찰</span>
                        )}
                        {!item.assignedToMe &&
                          !item.hasMyOffer &&
                          item.status === "BIDDING" && (
                            <span className="tag">입찰 가능</span>
                          )}
                        {item.counterpartyHighCancelBadge && (
                          <span className="tag tag-dark">취소율 높음</span>
                        )}
                      </div>
                    ) : (
                      <div className="chip-group">
                        <span className="tag">{roleText(auth.role)}</span>
                        {item.counterpartyHighCancelBadge && (
                          <span className="tag tag-dark">취소율 높음</span>
                        )}
                      </div>
                    )}
                  </td>

                  <td>
                    {item.originAddress} → {item.destinationAddress}
                  </td>

                  <td>
                    {item.offerCount}건 / {formatCurrency(item.bestOfferPrice)}
                  </td>

                  <td>{item.assignedDriverName || "-"}</td>

                  {/* <td>{item.tracking?.remainingMinutes ?? item.estimatedMinutes}분</td> */}
                  <td>
                    {formatMinutesToHour(
                      item.tracking?.remainingMinutes ?? item.estimatedMinutes,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* <Pagination page={page} totalPages={totalPages} onPageChange={setPage} /> */}

      <div className="detail-layout">
        <div className="surface">
          {selected ? (
            <>
              <div className="detail-head">
                <div>
                  <div className="eyebrow">SHIPMENT DETAIL</div>
                  <h3>{selected.title}</h3>
                </div>

                <div className="table-actions">
                  <button
                    className={
                      selected.bookmarked
                        ? "bookmark-toggle active"
                        : "bookmark-toggle"
                    }
                    onClick={() => handleToggleBookmark(selected.id)}
                    aria-label={
                      selected.bookmarked ? "즐겨찾기 해제" : "즐겨찾기 추가"
                    }
                    title={
                      selected.bookmarked ? "즐겨찾기 해제" : "즐겨찾기 추가"
                    }
                  >
                    ★
                  </button>

                  <span
                    className={`badge badge-${selected.status.toLowerCase()}`}
                  >
                    {statusText(selected.status)}
                  </span>
                </div>
              </div>

              <div className="detail-stat-grid">
                <div>
                  <span>출발지</span>
                  <strong>{selected.originAddress}</strong>
                </div>
                <div>
                  <span>도착지</span>
                  <strong>{selected.destinationAddress}</strong>
                </div>
                <div>
                  <span>입찰 현황</span>
                  <strong>
                    {selected.offerCount}건 /{" "}
                    {formatCurrency(selected.bestOfferPrice)}
                  </strong>
                </div>
                <div>
                  <span>배정 차주</span>
                  <strong>{selected.assignedDriverName || "미확정"}</strong>
                </div>
                <div>
                  <span>운송 시작 예정</span>
                  <strong>{formatDate(selected.scheduledStartAt)}</strong>
                </div>
                <div>
                  <span>현재 위치</span>
                  <strong>
                    {selected.tracking?.roughLocation || "미등록"}
                  </strong>
                </div>
                <div>
                  <span>남은 시간</span>
                  {/* <strong>{selected.tracking?.remainingMinutes ?? selected.estimatedMinutes}분</strong> */}
                  <strong>
                    {formatMinutesToHour(
                      selected.tracking?.remainingMinutes ??
                        selected.estimatedMinutes,
                    )}
                  </strong>
                </div>
                <div>
                  <span>내 누적 취소 점수</span>
                  <strong>{selected.cancelPenaltyScore ?? 0}점</strong>
                </div>
              </div>

              {!!selected.cargoImageUrls?.length && (
                <div className="surface-sub cargo-images">
                  <strong>등록 화물 사진</strong>
                  <div className="image-preview-row">
                    {selected.cargoImageUrls.map((src, idx) => (
                      <img
                        key={idx}
                        src={src}
                        alt={`cargo-detail-${idx}`}
                        className="image-preview-thumb"
                        onClick={() => {
                          setPreviewImages(selected.cargoImageUrls);
                          setPreviewIndex(idx);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {!!selected.completionImageUrl && (
                <div className="surface-sub">
                  <strong>배송 완료 사진</strong>
                  <div className="image-preview-row">
                    <img
                      src={selected.completionImageUrl}
                      alt="completion"
                      className="image-preview-thumb"
                      onClick={() => {
                        setPreviewImages([selected.completionImageUrl]);
                        setPreviewIndex(0);
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="profile-section">
                <ProfilePreviewCard
                  title={
                    auth.role === "DRIVER"
                      ? "거래 전 확인할 화주 정보"
                      : "거래 전 확인할 차주 정보"
                  }
                  profile={
                    auth.role === "DRIVER"
                      ? {
                          id: selected.shipperId,
                          name: selected.shipperName,
                          role: "SHIPPER",
                          companyName: selected.companyName,
                          bio: selected.shipperBio,
                          profileImageUrl: selected.shipperProfileImageUrl,
                          contactEmail: selected.shipperContactEmail,
                          contactPhone: selected.shipperContactPhone,
                          averageRating: selected.shipperAverageRating,
                          ratingCount: selected.shipperRatingCount,
                          completedCount: undefined,
                          highCancelBadge: selected.counterpartyHighCancelBadge,
                        }
                      : selected.assignedDriverName
                        ? {
                            id: selected.assignedDriverId,
                            name: selected.assignedDriverName,
                            role: "DRIVER",
                            bio: selected.assignedDriverBio,
                            profileImageUrl:
                              selected.assignedDriverProfileImageUrl,
                            contactEmail: selected.assignedDriverContactEmail,
                            contactPhone: selected.assignedDriverContactPhone,
                            averageRating: selected.assignedDriverAverageRating,
                            ratingCount: selected.assignedDriverRatingCount,
                            completedCount: undefined,
                            highCancelBadge:
                              selected.counterpartyHighCancelBadge,
                          }
                        : null
                  }
                  onImageClick={(imageUrl) => {
                    setPreviewImages([imageUrl]);
                    setPreviewIndex(0);
                  }}
                />
              </div>
              <div className="map-section">
                <KakaoMapView shipment={selected} />
              </div>
              {/* <div className="surface-sub timeline-section">
                <SectionTitle title="상태 타임라인" />
                <div className="list-stack">
                  {(selected.histories || []).map((history) => (
                    <div className="list-row block" key={history.id}>
                      <strong>{statusText(history.toStatus)}</strong>
                      <span>
                        {history.note} · {history.actorEmail}
                      </span>
                      <small>{formatDate(history.createdAt)}</small>
                    </div>
                  ))}
                </div>
              </div> */}
            </>
          ) : (
            <div className="empty-box">배차를 선택해 주세요.</div>
          )}
        </div>

        <div className="surface side-form">
          {selected ? (
            <>
              {/* <SectionTitle title="제안 업체 목록" desc={`${roleText(auth.role)} 기준으로 표시됩니다.`} /> */}
              <SectionTitle
                title={auth.role === "SHIPPER" ? "제안 업체 목록" : "입찰 현황"}
                desc={
                  auth.role === "SHIPPER"
                    ? "입찰에 참여한 업체 목록을 확인할 수 있습니다."
                    : "내 입찰 및 배차 참여 상태를 확인할 수 있습니다."
                }
              />

              {/* <div className="surface-sub role-side-guide">
                <strong>{roleTheme?.label}</strong>
                <p className="section-desc">
                  {auth.role === 'SHIPPER'
                    ? '화주는 입찰 비교와 차주 확정, 운행 확인이 핵심입니다.'
                    : '차주는 입찰 등록, 운송 시작, ETA 기준 완료 전환이 핵심입니다.'}
                </p>
                {selected.viewerMatchingBlockedUntil && (
                  <small>매칭 제한 해제 시각: {formatDate(selected.viewerMatchingBlockedUntil)}</small>
                )}
                {selected.viewerTradingBlockedUntil && (
                  <small>거래 금지 해제 시각: {formatDate(selected.viewerTradingBlockedUntil)}</small>
                )}
              </div> */}

              {auth.role === "DRIVER" &&
                selected.status === "BIDDING" &&
                !selected.hasMyOffer && (
                  <div className="form-stack">
                    <div className="surface-sub">
                      <strong>정산 안내</strong>
                      <p className="section-desc">
                        차주는 확정 금액에서 3% 수수료를 제외한 나머지 금액을
                        받습니다.
                      </p>
                    </div>

                    <input
                      placeholder="제안 금액"
                      value={offerForm.price}
                      onChange={(e) =>
                        setOfferForm({ ...offerForm, price: e.target.value })
                      }
                    />

                    <textarea
                      rows="4"
                      placeholder="제안 메시지"
                      value={offerForm.message}
                      onChange={(e) =>
                        setOfferForm({ ...offerForm, message: e.target.value })
                      }
                    />

                    <button
                      className="btn btn-primary"
                      onClick={handleCreateOffer}
                    >
                      입찰 제안
                    </button>
                  </div>
                )}

              {auth.role === "DRIVER" &&
                selected.status === "BIDDING" &&
                selected.hasMyOffer && (
                  <div className="surface-sub">
                    <strong>이미 이 배차에 입찰했습니다.</strong>
                    <p className="section-desc">
                      내 입찰 태그가 붙은 배차는 화주 선택 결과를 기다리면
                      됩니다.
                    </p>
                  </div>
                )}

              {isSelectedShipperOwner && selected.status === "CONFIRMED" && (
                <div className="surface-sub">
                  <strong>{selected.paid ? "결제 완료" : "결제 필요"}</strong>
                  <p className="section-desc">
                    {selected.paid
                      ? "결제가 완료되었습니다. 이제 차주가 운송을 시작할 수 있습니다."
                      : `선택한 차주에게 ${formatCurrency(selected.agreedPrice || 0)}을 결제해야 운행이 시작됩니다.`}
                  </p>
                  {!selected.paid && (
                    <button
                      className="btn btn-primary"
                      onClick={() => openPaymentModal(selected.id)}
                    >
                      결제하기
                    </button>
                  )}
                </div>
              )}
              {showCancelButton && (
                <div className="surface-sub">
                  <strong>거래 취소</strong>
                  <p className="section-desc">
                    취소 시점에 따라 패널티 점수가 누적되며, 반복 취소 시 매칭
                    제한 또는 거래 금지가 적용됩니다.
                  </p>
                  <button className="btn" onClick={openCancelModal}>
                    거래 취소 요청
                  </button>
                </div>
              )}
              {auth.role === "SHIPPER" && (
                <div className="list-stack">
                  {(selected.offers || []).length ? (
                    selected.offers.map((offer) => (
                      <div key={offer.id} className="offer-card">
                        <div className="detail-head">
                          <strong>{offer.driverName}</strong>
                          {/* <span className="badge badge-neutral">{offer.status}</span> */}
                          <span className="badge badge-neutral">
                            {offerStatusText[offer.status] || offer.status}
                          </span>
                        </div>

                        <div className="section-desc">
                          평점{" "}
                          {formatRatingSummary(
                            offer.driverAverageRating,
                            offer.driverRatingCount,
                          )}
                        </div>

                        {offer.driverBio && <small>{offer.driverBio}</small>}

                        <p>{formatCurrency(offer.price)}</p>
                        <small>{offer.message || "메시지 없음"}</small>

                        {isSelectedShipperOwner &&
                          selected.status === "BIDDING" &&
                          offer.status === "PENDING" && (
                            <button
                              className="btn btn-primary small"
                              onClick={() => handleAcceptOffer(offer.id)}
                            >
                              이 차주 확정
                            </button>
                          )}
                      </div>
                    ))
                  ) : (
                    <div className="empty-box small">
                      등록된 제안이 없습니다.
                    </div>
                  )}
                </div>
              )}

              {auth.role === "DRIVER" &&
                selected.assignedDriverName === auth.name && (
                  <div className="form-stack">
                    {selected.status === "CONFIRMED" && (
                      <>
                        {!selected.paid && (
                          <div className="surface-sub">
                            <strong>결제 대기</strong>
                            <p className="section-desc">
                              화주가 결제를 완료하면 운송 시작 버튼을 사용할 수
                              있습니다.
                            </p>
                          </div>
                        )}
                        <button
                          className="btn btn-primary"
                          onClick={handleStart}
                          disabled={!selected.paid}
                        >
                          운송 시작
                        </button>
                      </>
                    )}

                    {selected.status === "IN_TRANSIT" && (
                      <>
                        <div className="surface-sub">
                          <strong>자동 이동 시뮬레이션</strong>
                          <p className="section-desc">
                            운송 시작과 함께 트럭이 출발지에서 도착지까지
                            자동으로 이동하며, 지도에서 진행률과 남은 시간을
                            실시간으로 확인할 수 있습니다.
                          </p>
                        </div>

                        <div className="surface-sub">
                          <strong>배송 완료 사진 등록</strong>
                          <p className="section-desc">
                            완료 처리 전에 현장 사진 1장을 반드시 등록해야
                            합니다.
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCompletionProofChange}
                          />

                          {completionProof.dataUrl && (
                            <div className="image-preview-row">
                              <img
                                src={completionProof.dataUrl}
                                alt="completion-proof"
                                className="image-preview-thumb"
                              />
                            </div>
                          )}
                        </div>

                        <button
                          className="btn btn-primary"
                          onClick={handleComplete}
                          disabled={
                            !selected.tracking?.completable ||
                            !completionProof.dataUrl
                          }
                        >
                          운송 완료
                        </button>

                        {!selected.tracking?.completable && (
                          <small>
                            예상 도착 시간이 지나야 완료 가능합니다.
                          </small>
                        )}

                        {selected.tracking?.completable &&
                          !completionProof.dataUrl && (
                            <small>
                              완료 사진을 등록하면 완료 버튼이 활성화됩니다.
                            </small>
                          )}
                      </>
                    )}
                  </div>
                )}
            </>
          ) : (
            <div className="empty-box">상세를 선택하면 액션이 표시됩니다.</div>
          )}
        </div>
      </div>

      <ShipmentCancelModal
        open={cancelModalOpen}
        form={cancelForm}
        setForm={setCancelForm}
        onClose={closeCancelModal}
        onSubmit={handleCancelShipment}
        selected={selected}
        isSubmitting={cancelSubmitting}
        auth={auth}
      />

      {/* 추가 */}
      {previewImages.length > 0 && (
        <div className="image-modal" onClick={() => setPreviewImages([])}>
          <div
            className="image-modal-inner"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 왼쪽 버튼 */}
            {previewImages.length > 1 && (
              <button
                className="image-nav left"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewIndex((prev) =>
                    prev === 0 ? previewImages.length - 1 : prev - 1,
                  );
                }}
              >
                ‹
              </button>
            )}

            {/* 이미지 */}
            <img
              src={previewImages[previewIndex]}
              alt="preview"
              className="image-modal-content"
              onClick={(e) => e.stopPropagation()}
            />

            {/* 오른쪽 버튼 */}
            {previewImages.length > 1 && (
              <button
                className="image-nav right"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewIndex((prev) =>
                    prev === previewImages.length - 1 ? 0 : prev + 1,
                  );
                }}
              >
                ›
              </button>
            )}
          </div>
        </div>
      )}

      <PenaltyBlockedModal
        open={penaltyBlockedModal.open}
        message={penaltyBlockedModal.message}
        onClose={closePenaltyBlockedModal}
      />
    </div>
  );
}
