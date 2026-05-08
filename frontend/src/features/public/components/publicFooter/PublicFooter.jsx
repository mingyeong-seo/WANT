import "./publicFooter.css";

export default function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="public-footer__inner">
        <div className="public-footer__main">
          <div className="public-footer__brand">
            <strong className="public-footer__logo">WANT</strong>

            <p className="public-footer__desc">
              원하는 조건의 운송을 비교하고, 배차부터 운행 현황까지 한 번에
              관리하는 운송 운영 플랫폼입니다.
            </p>
          </div>

          <div className="public-footer__info">
            <p>서비스명: WANT</p>
            <p>문의: support@want-logistics.com</p>
            <p>운영시간: 평일 09:00 - 18:00</p>
          </div>
        </div>

        <div className="public-footer__bottom">
          <p className="public-footer__team">
            Team WANT · 김도형 김대호 김승민 김재민 서민경 서효정
          </p>

          <p className="public-footer__copy">
            © 2026 WANT. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
