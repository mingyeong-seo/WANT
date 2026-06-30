import AddressPanel from "../components/AddressPanel";
import SchedulePanel from "../components/SchedulePanel";

export default function QuoteStepRoute({
  formData = {},
  errors = {},
  activePanel = null,
  updateField,
  setRouteAddress,
  openPanel,
  closePanel,
  mobilePanelNoticeVisible = false,
  mobilePanelNoticeTarget = "",
}) {
  if (!formData) return null;

  const renderMobilePanelNotice = (target) => {
    if (!mobilePanelNoticeVisible || mobilePanelNoticeTarget !== target) {
      return null;
    }

    return (
      <div
        className="quote-register-mobile-panel-notice"
        role="status"
        aria-live="polite"
      >
        아래로 스크롤해서 입력 보조 패널을 확인하세요.
      </div>
    );
  };

  const transportScheduleText =
    formData.transportDate && formData.transportTime
      ? `${formData.transportDate} ${formData.transportTime}`
      : "운송일자와 시간을 선택해주세요";

  return (
    <section className="quote-step-layout">
      <div className="quote-step-layout__main">
        <div className="form-group">
          <label>
            어떤 제목으로 올려볼까요? <span className="required-mark">*</span>
          </label>
          <input
            type="text"
            value={formData.estimateName || ""}
            onChange={(e) => updateField("estimateName", e.target.value)}
            placeholder="예: 서울 → 부산 냉장 식품 운송"
          />
          {errors?.estimateName && (
            <p className="error-text">{errors.estimateName}</p>
          )}
        </div>

        <div className="form-group">
          <label>
            출발지와 도착지를 입력해 주세요.{" "}
            <span className="required-mark">*</span>
          </label>

          <div className="route-select-box">
            <button
              type="button"
              className={`route-item ${activePanel === "origin" ? "active" : ""}`}
              onClick={() => openPanel("origin")}
            >
              <span className="dot green"></span>

              <div className="route-text-group">
                <span className="route-main-text">
                  {formData.originAddress || "출발지"}
                </span>
                <span className="route-sub-text">
                  {formData.originDetailAddress || "상세 주소를 입력해주세요"}
                </span>
              </div>
            </button>

            <div className="route-divider" />

            <button
              type="button"
              className={`route-item ${
                activePanel === "destination" ? "active" : ""
              }`}
              onClick={() => openPanel("destination")}
            >
              <span className="dot blue"></span>

              <div className="route-text-group">
                <span className="route-main-text">
                  {formData.destinationAddress || "도착지"}
                </span>
                <span className="route-sub-text">
                  {formData.destinationDetailAddress ||
                    "상세 주소를 입력해주세요"}
                </span>
              </div>
            </button>
          </div>
          {renderMobilePanelNotice("route-origin")}
          {renderMobilePanelNotice("route-destination")}

          {errors?.originAddress && (
            <p className="error-text">{errors.originAddress}</p>
          )}
          {errors?.destinationAddress && (
            <p className="error-text">{errors.destinationAddress}</p>
          )}
        </div>

        <div className="form-group transport-date-group">
          <label>
            언제 운송하실 예정인가요? <span className="required-mark">*</span>
          </label>
          <button
            type="button"
            className={`panel-trigger-input ${
              activePanel === "schedule" ? "is-active" : ""
            }`}
            onClick={() => openPanel("schedule")}
          >
            {transportScheduleText}
          </button>
          {renderMobilePanelNotice("route-schedule")}
          {errors?.transportDate && (
            <p className="error-text">{errors.transportDate}</p>
          )}
          {errors?.transportTime && (
            <p className="error-text">{errors.transportTime}</p>
          )}
        </div>
      </div>

      <aside className="quote-step-side-panel">
        {activePanel === "origin" && (
          <AddressPanel
            title="출발지 입력"
            fieldName="originAddress"
            currentValue={formData.originAddress}
            currentDetailValue={formData.originDetailAddress}
            updateField={updateField}
            setRouteAddress={setRouteAddress}
            closePanel={closePanel}
          />
        )}

        {activePanel === "destination" && (
          <AddressPanel
            title="도착지 입력"
            fieldName="destinationAddress"
            currentValue={formData.destinationAddress}
            currentDetailValue={formData.destinationDetailAddress}
            updateField={updateField}
            setRouteAddress={setRouteAddress}
            closePanel={closePanel}
          />
        )}

        {activePanel === "schedule" && (
          <SchedulePanel
            transportDate={formData.transportDate}
            transportTime={formData.transportTime}
            updateField={updateField}
            closePanel={closePanel}
          />
        )}

        {!activePanel && (
          <div className="panel-placeholder">
            <h3>입력 보조 패널</h3>
            <p>
              출발지, 도착지, 운송일자를 클릭하면 여기에서 선택할 수 있습니다.
            </p>
          </div>
        )}
      </aside>
    </section>
  );
}
