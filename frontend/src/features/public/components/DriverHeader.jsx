import AppLogo from "../../../components/common/AppLogo";

function moveToMain(controller, targetId = null) {
  if (targetId) {
    controller.goToMainSection(targetId);
    return;
  }

  controller.setRoutePage("main");
  controller.setDashboardTab("home");

  if (!controller.isLoggedIn) {
    controller.setAuthMode("signup");
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function DriverHeader({ controller }) {
  const currentRoute = controller.routePage;

  const navButtonClass = (isActive) => (isActive ? "is-active" : "");

  return (
    <header className="landing-header">
      <div className="landing-header__inner">
        {/* <button
          type="button"
          className="landing-brand"
          onClick={() => moveToMain(controller)}
          aria-label="메인으로 돌아가기"
        >
          <AppLogo subtitle="운송 운영 플랫폼" hideTitle />
        </button> */}
        <button
          type="button"
          className="landing-brand"
          onClick={() => moveToMain(controller)}
          aria-label="메인으로 돌아가기"
        >
          <AppLogo hideText />
        </button>

        <nav className="landing-nav">
          <button
            type="button"
            className={navButtonClass(currentRoute === "quotes" || currentRoute === "detail")}
            onClick={() => controller.setRoutePage("quotes")}
          >
            견적 목록 보기
          </button>

          <button
            type="button"
            className={navButtonClass(currentRoute === "status")}
            onClick={() => controller.setRoutePage("status")}
          >
            운송 현황
          </button>

          <button
            type="button"
            className={navButtonClass(currentRoute === "shippers")}
            onClick={() => controller.openPublicUserPage("SHIPPER")}
          >
            화주 찾기
          </button>

          <button
            type="button"
            className={navButtonClass(currentRoute === "game")}
            onClick={() => controller.setRoutePage("game")}
          >
            미니게임
          </button>
        </nav>

        <div className="landing-header__actions">
          <button
            type="button"
            className="landing-btn landing-btn--light"
            onClick={() => {
              controller.setRoutePage("dashboard");
              controller.setDashboardTab("overview");
            }}
          >
            마이페이지
          </button>

          <button
            type="button"
            className="landing-btn landing-btn--primary"
            onClick={controller.logout}
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}
