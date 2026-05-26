import AppLogo from '../../../components/common/AppLogo'
import { roleText } from "../../../utils/formatters";
import { useEffect, useState } from "react";

export default function UserSidebar({
  auth,
  dashboardTab,
  setDashboardTab,
  summary,
  logout,
  goToMain,
  setRoutePage, // 추가
  routePage,  // 추가
}) {
  const navItems = [
    ["overview", "마이페이지"],
    ["board", "배차 보드"],
    // ["register", auth.role === "SHIPPER" ? "화물 등록" : "입찰 가이드"],
    ["finance", "정산 내역"],
    ["penalty", "패널티 관리"],
    ["ratings", "평점 관리"],
    // ["bookmarks", "즐겨찾기"],
  ];

  // 추가
  if (auth.role === "DRIVER") {
    navItems.splice(2, 0, ["register", "입찰 가이드"]);
    navItems.push(["bookmarks", "즐겨찾기"])
  }

  // const isRouteActive = (page) => controllerRoutePage === page;

  const [menuOpen, setMenuOpen] = useState(
    window.innerWidth > 768
  );

  const [isResponsiveSidebar, setIsResponsiveSidebar] =
    useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      const responsive = window.innerWidth <= 1024;

      setIsResponsiveSidebar(responsive);

      // 모바일이면 기본 닫힘
      if (window.innerWidth <= 768) {
        setMenuOpen(false);
      } else {
        setMenuOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);

    return () =>
      window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <aside className="console-sidebar">
      <div className="console-logo"><AppLogo title="want" subtitle="운송 운영 플랫폼" compact hideText /></div>
      <div
        className="sidebar-profile"
        onClick={() => {
          if (isResponsiveSidebar) {
            setMenuOpen(!menuOpen);
          }
        }}
      >
        <strong>{auth.name}</strong>
        <span>{roleText(auth.role)}</span>
        <small>{auth.email}</small>
      </div>
      {(!isResponsiveSidebar || menuOpen) && (
        <>
          <nav className="sidebar-nav">
            <button
              className="btn btn-ghost block"
              onClick={() => goToMain?.() ?? setDashboardTab("home")}
            >
              메인으로 돌아가기
            </button>
            {navItems.map(([key, label]) => (
              <button
                key={key}
                className={dashboardTab === key ? "nav-link active" : "nav-link"}
                onClick={() => setDashboardTab(key)}
              >
                {label}
              </button>
            ))}

            <div className="sidebar-divider" />

            {/* <button
          className={dashboardTab === "quotes" ? "nav-link active" : "nav-link"}
          onClick={() => setDashboardTab("quotes")}
        >
          견적목록 보기
        </button> */}
            <button
              className={routePage === "quotes" ? "nav-link active" : "nav-link"}
              onClick={() => setRoutePage("quotes")}
            >
              견적 목록
            </button>

            {auth.role === "SHIPPER" && (
              <button
                className={routePage === "createQuote" ? "nav-link active" : "nav-link"}
                onClick={() => setRoutePage("createQuote")}
              >
                견적 등록
              </button>
            )}

            {/* <button
          className={dashboardTab === "transport" ? "nav-link active" : "nav-link"}
          onClick={() => setDashboardTab("transport")}
        >
          운송현황
        </button> */}
            <button
              className={routePage === "status" ? "nav-link active" : "nav-link"}
              onClick={() => setRoutePage("status")}
            >
              운송 현황
            </button>


          </nav>
          <div className="side-mini-kpis">
            {/* <div>
          <span>전체</span>
          <strong>{summary.total}</strong>
        </div>
        <div>
          <span>입찰중</span>
          <strong>{summary.bidding}</strong>
        </div>
        <div>
          <span>운행중</span>
          <strong>{summary.live}</strong>
        </div>
        <div>
          <span>완료</span>
          <strong>{summary.completed}</strong>
        </div> */}
          </div>
          <button className="btn btn-secondary block" onClick={logout}>
            로그아웃
          </button>
        </>
      )}
    </aside>
  );
}
