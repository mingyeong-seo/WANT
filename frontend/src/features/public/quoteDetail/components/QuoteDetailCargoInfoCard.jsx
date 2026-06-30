function formatWeight(weight, unit) {
  if (!weight) return "-";
  return `${weight}${unit || ""}`;
}

function formatPrice(price) {
  if (!price) return "-";
  return `${Number(price).toLocaleString()}원`;
}

export default function QuoteDetailCargoInfoCard({
  quote,
  canEdit,
  onClickEdit,
}) {
  return (
    <section className="quote-detail-card quote-detail-info-card">
      <div className="quote-detail-card__title-row">
        <h2 className="quote-detail-card__title">화물 정보</h2>

        {canEdit && (
          <button
            type="button"
            className="quote-detail-section-edit-btn"
            onClick={onClickEdit}
          >
            수정
          </button>
        )}
      </div>

      <div className="quote-detail-info-table">
        <div className="quote-detail-info-table__row">
          <div className="quote-detail-info-table__label">희망 차량</div>
          <div className="quote-detail-info-table__content">
            <strong>{quote.vehicleType || "-"}</strong>
          </div>
        </div>

        <div className="quote-detail-info-table__row">
          <div className="quote-detail-info-table__label">화물 종류</div>
          <div className="quote-detail-info-table__content">
            <strong>{quote.cargoType || "-"}</strong>
          </div>
        </div>

        <div className="quote-detail-info-table__row">
          <div className="quote-detail-info-table__label">화물명</div>
          <div className="quote-detail-info-table__content">
            <strong>{quote.cargoName || "-"}</strong>
          </div>
        </div>

        <div className="quote-detail-info-table__row">
          <div className="quote-detail-info-table__label">중량</div>
          <div className="quote-detail-info-table__content">
            <strong>{formatWeight(quote.weight, quote.weightUnit)}</strong>
          </div>
        </div>

        <div className="quote-detail-info-table__row">
          <div className="quote-detail-info-table__label">요청사항</div>
          <div className="quote-detail-info-table__content">
            <strong>{quote.requestNote || "-"}</strong>
          </div>
        </div>

        <div className="quote-detail-info-table__row">
          <div className="quote-detail-info-table__label">희망 운임</div>
          <div className="quote-detail-info-table__content">
            <div className="quote-detail-info-card__price-line">
              <strong>{formatPrice(quote.desiredPrice)}</strong>

              {quote.priceProposalAllowed && (
                <span className="quote-detail-info-card__price-badge">
                  가격 상담 가능
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
