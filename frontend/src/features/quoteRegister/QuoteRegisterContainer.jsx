import "./quoteRegister.css";
import QuoteRegisterStepper from "./QuoteRegisterStepper";
import QuoteRegisterActions from "./QuoteRegisterActions";
import QuoteStepRoute from "./steps/QuoteStepRoute";
import QuoteStepCargo from "./steps/QuoteStepCargo";
import QuoteStepReview from "./steps/QuoteStepReview";
import useQuoteRegisterForm from "./hooks/useQuoteRegisterForm";
import { QUOTE_REGISTER_STEPS } from "./constants/quoteRegisterSteps";
import { useEffect, useRef, useState } from "react";

export default function QuoteRegisterContainer({ controller, onMoveToQuoteList }) {
  const [mobilePanelNotice, setMobilePanelNotice] = useState({
    visible: false,
    target: "",
  });
  const mobilePanelNoticeTimerRef = useRef(null);
  const {
    currentStep,
    formData,
    errors,
    activePanel,
    updateField,
    setRouteAddress,
    openPanel,
    closePanel,
    goPrevStep,
    goNextStep,
    submitForm,
  } = useQuoteRegisterForm(controller);

  const showMobilePanelNotice = (target) => {
    if (
      typeof window === "undefined" ||
      !window.matchMedia("(max-width: 1024px)").matches
    ) {
      return;
    }

    if (mobilePanelNoticeTimerRef.current) {
      window.clearTimeout(mobilePanelNoticeTimerRef.current);
    }

    setMobilePanelNotice({ visible: true, target });
    mobilePanelNoticeTimerRef.current = window.setTimeout(() => {
      setMobilePanelNotice({ visible: false, target: "" });
      mobilePanelNoticeTimerRef.current = null;
    }, 2800);
  };

  useEffect(() => {
    return () => {
      if (mobilePanelNoticeTimerRef.current) {
        window.clearTimeout(mobilePanelNoticeTimerRef.current);
      }
    };
  }, []);

  const handleOpenPanel = (panelName) => {
    openPanel(panelName);
    showMobilePanelNotice(`route-${panelName}`);
  };

  const isRouteStepValid =
    !!(formData.estimateName || "").trim() &&
    !!(formData.originAddress || "").trim() &&
    !!(formData.originDetailAddress || "").trim() &&
    !!(formData.destinationAddress || "").trim() &&
    !!(formData.destinationDetailAddress || "").trim() &&
    !!(formData.transportDate || "").trim() &&
    !!(formData.transportTime || "").trim() &&
    (formData.originAddress || "").trim() !==
      (formData.destinationAddress || "").trim();

  const isCargoStepValid =
    (formData.vehicleNeedConsult || !!(formData.vehicleType || "").trim()) &&
    !!(formData.cargoType || "").trim() &&
    !!(formData.cargoName || "").trim() &&
    (formData.weightNeedConsult || !!(formData.weight || "").trim()) &&
    !!(formData.desiredPrice || "").trim();

  const handleSubmit = async () => {
    const created = await submitForm();

    if (!created) return;

    if (typeof onMoveToQuoteList === "function") {
      onMoveToQuoteList(created);
    }
  };

  let stepContent = null;
  let isCurrentStepValid = true;

  if (currentStep === 1) {
    stepContent = (
      <QuoteStepRoute
        formData={formData}
        errors={errors}
        activePanel={activePanel}
        updateField={updateField}
        setRouteAddress={setRouteAddress}
        openPanel={handleOpenPanel}
        closePanel={closePanel}
        mobilePanelNoticeVisible={mobilePanelNotice.visible}
        mobilePanelNoticeTarget={mobilePanelNotice.target}
      />
    );

    isCurrentStepValid = isRouteStepValid;
  }

  if (currentStep === 2) {
    stepContent = (
      <QuoteStepCargo
        formData={formData}
        errors={errors}
        updateField={updateField}
        onOpenAssistPanel={(panelName) =>
          showMobilePanelNotice(`cargo-${panelName}`)
        }
        mobilePanelNoticeVisible={mobilePanelNotice.visible}
        mobilePanelNoticeTarget={mobilePanelNotice.target}
      />
    );

    isCurrentStepValid = isCargoStepValid;
  }

  if (currentStep === 3) {
    stepContent = <QuoteStepReview formData={formData} />;
    isCurrentStepValid = true;
  }

  return (
    <div className="quote-register-page">
      <div className="quote-register-shell">
        <QuoteRegisterStepper
          steps={QUOTE_REGISTER_STEPS}
          currentStep={currentStep}
        />

        {false && mobilePanelNotice.visible && (
          <div
            className="quote-register-mobile-panel-notice"
            role="status"
            aria-live="polite"
          >
            아래로 스크롤해서 입력 보조 패널을 확인하세요.
          </div>
        )}

        <div className="quote-register-body">{stepContent}</div>

        <QuoteRegisterActions
          currentStep={currentStep}
          totalSteps={QUOTE_REGISTER_STEPS.length}
          onPrev={goPrevStep}
          onNext={goNextStep}
          onSubmit={handleSubmit}
          isCurrentStepValid={isCurrentStepValid}
        />
      </div>
    </div>
  );
}
