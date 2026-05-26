import { useState } from 'react';

export default function UserRegisterDriverTab() {
  const [activeGuideIndex, setActiveGuideIndex] = useState(0);

  const moveCarousel = (direction) => {
    setActiveGuideIndex((currentIndex) => (currentIndex + direction + 3) % 3);
  };

  return (
    <section className="bid-guide-section">
      <div className="guide-carousel">
        <button
          type="button"
          className="guide-carousel-button guide-carousel-button--prev"
          aria-label="이전 가이드 보기"
          onPointerDown={(event) => {
            event.preventDefault();
            moveCarousel(-1);
          }}
        >
          ‹
        </button>

        <div className="guide-carousel-viewport">
          <div
            className="guide-card-list"
            style={{ '--guide-slide-index': activeGuideIndex }}
          >
            <article className="guide-card guide-card--orange">
              <div className="guide-badge">01</div>

              <h3>입찰중 배차 선택</h3>
              <p>
                구간, 화물 종류, 예상 시간을 확인한 뒤 조건에 맞는 제안을
                등록합니다.
              </p>

              <div className="simple-visual" aria-hidden="true">
                <div className="simple-bid-stack">
                  <div className="simple-bid-ghost simple-bid-ghost--left" />
                  <div className="simple-bid-ghost simple-bid-ghost--right" />
                  <div className="simple-bid">
                    <div className="simple-bid-top">
                      <div>
                        <strong>이기사</strong>
                        <span>5톤 | 냉장탑차</span>
                      </div>
                      <div className="simple-check">✓</div>
                    </div>
                    <div className="simple-price">₩480,000</div>
                    <div className="simple-bid-person">🙆</div>
                  </div>
                </div>
                <div className="simple-select-shape">선택하기</div>
              </div>
            </article>

            <article className="guide-card guide-card--blue">
              <div className="guide-badge">02</div>

              <h3>화주 확정 이후 운송 시작</h3>
              <p>
                화주가 제안을 확정하면 운송 시작 버튼이 열리고 배차 진행이
                시작됩니다.
              </p>

              <div className="simple-visual" aria-hidden="true">
                <div className="simple-route">
                  <div className="simple-route-line">
                    <div className="simple-dot">출발</div>
                    <div className="simple-line" />
                    <div className="simple-dot">도착</div>
                  </div>

                  <div className="simple-truck" aria-label="운송 트럭">
                    <span>🚚</span>
                    <span>💨</span>
                  </div>

                  <div className="simple-start">운송 시작</div>
                </div>
              </div>
            </article>

            <article className="guide-card guide-card--green">
              <div className="guide-badge">03</div>

              <h3>자동 주행 트래킹</h3>
              <p>
                운송 시작과 동시에 트럭 아이콘이 예상 시간에 맞춰 출발지에서
                도착지까지 이동합니다.
              </p>

              <div className="simple-visual" aria-hidden="true">
                <div className="simple-track">
                  <div className="simple-map">
                    <div className="simple-curve" />
                    <div className="simple-car">🗺️</div>
                  </div>

                  <div className="simple-progress-box">
                    <div className="simple-progress-title">
                      운송 중<span>GPS 추적 중</span>
                    </div>
                    <div className="simple-progress-bar">
                      <i />
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>

        <button
          type="button"
          className="guide-carousel-button guide-carousel-button--next"
          aria-label="다음 가이드 보기"
          onPointerDown={(event) => {
            event.preventDefault();
            moveCarousel(1);
          }}
        >
          ›
        </button>
      </div>
    </section>
  );
}
