function getStatusLabel(status) {
  switch (status) {
    case "BIDDING":
    case "입찰 진행중":
      return "입찰 진행중";
    case "CONFIRMED":
    case "입찰 완료":
      return "입찰 완료";
    default:
      return status || "입찰 진행중";
  }
}

function getStatusClass(status) {
  switch (status) {
    case "BIDDING":
    case "입찰 진행중":
      return "is-bidding";
    case "CONFIRMED":
    case "입찰 완료":
      return "is-confirmed";
    default:
      return "is-default";
  }
}

function getRegionLabel(address) {
  if (!address) return "-";

  const parts = address.trim().split(" ");

  if (parts.length >= 2) {
    return parts[1];
  }

  const sidoMap = {
    서울특별시: "서울",
    부산광역시: "부산",
    대구광역시: "대구",
    인천광역시: "인천",
    광주광역시: "광주",
    대전광역시: "대전",
    울산광역시: "울산",
    세종특별자치시: "세종",
    경기도: "경기",
    강원특별자치도: "강원",
    충청북도: "충북",
    충청남도: "충남",
    전북특별자치도: "전북",
    전라남도: "전남",
    경상북도: "경북",
    경상남도: "경남",
    제주특별자치도: "제주",
  };

  return sidoMap[parts[0]] || parts[0];
}

function formatDDay(targetDate) {
  if (!targetDate) return "";

  const today = new Date();
  const target = new Date(targetDate);

  if (Number.isNaN(target.getTime())) return "";

  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const targetStart = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  );

  const diffTime = targetStart.getTime() - todayStart.getTime();
  const diffDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDay > 0) return `D-${diffDay}`;
  if (diffDay === 0) return "D-Day";
  return "마감";
}

function formatPrice(desiredPrice) {
  if (!desiredPrice && desiredPrice !== 0) return "희망 운임 미정";

  const numericPrice = Number(desiredPrice);

  if (Number.isNaN(numericPrice)) return `${desiredPrice}`;
  return `${numericPrice.toLocaleString()}원`;
}

export default function QuoteCard({ quote, onClickDetail }) {
  const {
    estimateName,
    originAddress,
    destinationAddress,
    transportDate,
    desiredPrice,
    priceProposalAllowed,
    cargoType,
    vehicleType,
    status,
  } = quote;

  const statusText = getStatusLabel(status);
  const statusClass = getStatusClass(status);

  const originSido = getRegionLabel(originAddress);
  const destinationSido = getRegionLabel(destinationAddress);
  const dDayText = formatDDay(transportDate);
  const priceText = formatPrice(desiredPrice);

  return (
    <article className="quote-card" data-quote-id={quote.id}>
      <div className="quote-card__main">
        <div className="quote-card__header">
          <div className="quote-card__badge-row">
            <span className={`quote-card__status-badge ${statusClass}`}>
              {statusText}
            </span>

            {priceProposalAllowed && (
              <span className="quote-card__price-badge">가격 상담 가능</span>
            )}
          </div>

          <h3 className="quote-card__title">{estimateName || "견적명"}</h3>

          <div className="quote-card__title-divider" />
        </div>

        <div className="quote-card__body">
          <div className="quote-card__route-column">
            <div className="quote-card__route-track">
              <div className="quote-card__route-row quote-card__route-row--top">
                <span className="quote-card__route-dot quote-card__route-dot--origin" />
                <strong className="quote-card__route-text">{originSido}</strong>
              </div>

              <div className="quote-card__route-center">
                <div className="quote-card__route-line" />
              </div>

              <div className="quote-card__route-row quote-card__route-row--bottom">
                <span className="quote-card__route-dot quote-card__route-dot--destination" />
                <strong className="quote-card__route-text">
                  {destinationSido}
                </strong>
              </div>
            </div>
          </div>

          <div className="quote-card__info-column">
            <div className="quote-card__cargo">
              <span className="quote-card__info-label">화물 / 차량</span>

              <div className="quote-card__cargo-row">
                <strong className="quote-card__cargo-value">
                  {vehicleType
                    ? `${cargoType || "-"} · ${vehicleType}`
                    : `${cargoType || "-"}`}
                </strong>
              </div>
            </div>

            <div className="quote-card__price-wrap">
              <span className="quote-card__info-label">희망 운임</span>
              <strong className="quote-card__price">{priceText}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="quote-card__side">
        <div className="quote-card__side-top">
          <div className="quote-card__deadline-block">
            <span className="quote-card__deadline-title">마감일</span>
            <strong className="quote-card__deadline">{dDayText || "-"}</strong>
          </div>

          <div className="quote-card__date-box">
            <span>희망 도착일</span>
            <strong>{transportDate || "-"}</strong>
          </div>
        </div>

        <div className="quote-card__side-bottom">
          <button
            type="button"
            className="quote-card__detail-button"
            onClick={() => onClickDetail?.(quote.id)}
          >
            <span>상세보기&gt;</span>
          </button>
        </div>
      </div>
    </article>
  );
}
