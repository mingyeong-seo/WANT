import { useEffect, useMemo, useRef, useState } from "react";
import DaumPostcode, { useKakaoPostcodePopup } from "react-daum-postcode";

const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY || "";

function loadKakaoSdk() {
  if (window.kakao?.maps?.services) return Promise.resolve(window.kakao);

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-kakao="true"]');

    if (existing) {
      existing.addEventListener("load", () =>
        window.kakao.maps.load(() => resolve(window.kakao)),
      );
      existing.addEventListener("error", reject);
      return;
    }

    if (!KAKAO_APP_KEY) {
      reject(new Error("NO_KAKAO_APP_KEY"));
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.dataset.kakao = "true";
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&libraries=services&appkey=${KAKAO_APP_KEY}`;
    script.onload = () => window.kakao.maps.load(() => resolve(window.kakao));
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function AddressPanel({
  title,
  fieldName,
  currentValue,
  currentDetailValue,
  updateField,
  setRouteAddress,
  closePanel,
}) {
  const [panelStep, setPanelStep] = useState("search");
  const [selectedBaseAddress, setSelectedBaseAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [floor, setFloor] = useState("");
  const [hasElevator, setHasElevator] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [isMobilePostcode, setIsMobilePostcode] = useState(false);
  const [resolvedCoords, setResolvedCoords] = useState({
    lat: null,
    lng: null,
  });

  const mountedRef = useRef(false);
  const openPostcodePopup = useKakaoPostcodePopup();

  useEffect(() => {
    mountedRef.current = true;
    setIsClient(true);

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia("(max-width: 1024px)");
    const updateMobilePostcode = () => {
      setIsMobilePostcode(mediaQuery.matches);
    };

    updateMobilePostcode();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateMobilePostcode);
      return () => {
        mediaQuery.removeEventListener("change", updateMobilePostcode);
      };
    }

    mediaQuery.addListener(updateMobilePostcode);
    return () => {
      mediaQuery.removeListener(updateMobilePostcode);
    };
  }, []);

  useEffect(() => {
    if (currentValue) {
      setSelectedBaseAddress(currentValue);
      setPanelStep("detail");
    } else {
      setSelectedBaseAddress("");
      setPanelStep("search");
    }

    if (!currentDetailValue) {
      setDetailAddress("");
      setFloor("");
      setHasElevator("");
      return;
    }

    const detailText = currentDetailValue;
    const floorMatch = detailText.match(/(\d+)\s*층/);
    const elevatorMatch = detailText.match(/엘리베이터\s*(있음|없음)/);

    setFloor(floorMatch ? floorMatch[1] : "");

    const cleanedDetail = detailText
      .replace(/(\d+)\s*층/g, "")
      .replace(/엘리베이터\s*(있음|없음)/g, "")
      .trim();

    setDetailAddress(cleanedDetail);
    setHasElevator(elevatorMatch ? elevatorMatch[1] : "");
  }, [currentValue, currentDetailValue]);

  const getDetailFieldName = () => {
    if (fieldName === "originAddress") return "originDetailAddress";
    if (fieldName === "destinationAddress") return "destinationDetailAddress";
    return "";
  };

  const getLatFieldName = () =>
    fieldName === "originAddress" ? "originLat" : "destinationLat";

  const getLngFieldName = () =>
    fieldName === "originAddress" ? "originLng" : "destinationLng";

  const resolveAddressCoords = async (fullAddress) => {
    const kakao = await loadKakaoSdk();
    const geocoder = new kakao.maps.services.Geocoder();

    return new Promise((resolve, reject) => {
      geocoder.addressSearch(fullAddress, (result, status) => {
        if (status !== kakao.maps.services.Status.OK || !result?.[0]) {
          reject(new Error("ADDRESS_GEOCODE_FAILED"));
          return;
        }

        resolve({
          lat: Number(result[0].y),
          lng: Number(result[0].x),
        });
      });
    });
  };

  const handleComplete = async (data) => {
    if (!mountedRef.current) return;

    let fullAddress = data.address;
    let extraAddress = "";

    if (data.addressType === "R") {
      if (data.bname) {
        extraAddress += data.bname;
      }

      if (data.buildingName) {
        extraAddress += extraAddress
          ? `, ${data.buildingName}`
          : data.buildingName;
      }

      if (extraAddress) {
        fullAddress += ` (${extraAddress})`;
      }
    }

    updateField(fieldName, fullAddress);

    if (!mountedRef.current) return;
    setSelectedBaseAddress(fullAddress);
    setPanelStep("detail");

    try {
      const coords = await resolveAddressCoords(
        data.roadAddress || data.address,
      );

      if (!mountedRef.current) return;

      setResolvedCoords(coords);
      updateField(getLatFieldName(), coords.lat);
      updateField(getLngFieldName(), coords.lng);
    } catch (error) {
      console.error("좌표 변환 실패:", error);
    }
  };

  const isValidFloor = useMemo(() => {
    return /^\d+$/.test(floor) && Number(floor) >= 1;
  }, [floor]);

  const isValidElevator = useMemo(() => {
    return hasElevator === "있음" || hasElevator === "없음";
  }, [hasElevator]);

  const isDetailFormValid = isValidFloor && isValidElevator;

  const handleSubmitDetail = () => {
    const detailFieldName = getDetailFieldName();

    if (!detailFieldName) {
      closePanel();
      return;
    }

    if (!isValidFloor || !isValidElevator) {
      return;
    }

    const detailParts = [];

    if (detailAddress.trim()) {
      detailParts.push(detailAddress.trim());
    }

    if (floor.trim()) {
      detailParts.push(`${floor.trim()}층`);
    }

    if (hasElevator) {
      detailParts.push(`엘리베이터 ${hasElevator}`);
    }

    updateField(detailFieldName, detailParts.join(" "));

    if (resolvedCoords.lat !== null && resolvedCoords.lng !== null) {
      updateField(getLatFieldName(), resolvedCoords.lat);
      updateField(getLngFieldName(), resolvedCoords.lng);
    }

    closePanel();
  };

  const handleBackToSearch = () => {
    if (!mountedRef.current) return;
    setPanelStep("search");
  };

  const handleOpenPostcodePopup = () => {
    openPostcodePopup({
      onComplete: handleComplete,
      autoClose: true,
      popupTitle: "주소 검색",
    });
  };

  const baseAddressText = selectedBaseAddress || currentValue || "";

  return (
    <div className="side-panel-content">
      <div className="side-panel-header">
        <h3>{panelStep === "search" ? title : "상세주소 입력"}</h3>

        <button
          type="button"
          className="panel-close-button"
          onClick={closePanel}
        >
          ×
        </button>
      </div>

      {panelStep === "search" && (
        <div className="address-panel-body">
          {currentValue && (
            <div className="selected-preview">
              <strong>현재 선택된 주소</strong>
              <p>{currentValue}</p>
            </div>
          )}

          <div className="daum-postcode-wrapper">
            {isClient && isMobilePostcode ? (
              <button
                type="button"
                className="mobile-postcode-open-button"
                onClick={handleOpenPostcodePopup}
              >
                주소 검색하기
              </button>
            ) : null}

            {isClient && !isMobilePostcode ? (
              <DaumPostcode
                key={`${fieldName}-postcode`}
                onComplete={handleComplete}
                autoClose={false}
                style={{ width: "100%", height: "100%" }}
              />
            ) : null}
          </div>
        </div>
      )}

      {panelStep === "detail" && (
        <div className="detail-address-panel">
          <div className="selected-preview">
            <div className="selected-preview-header">
              <strong>선택한 주소</strong>

              <button
                type="button"
                className="address-research-button"
                onClick={handleBackToSearch}
              >
                주소 다시 검색
              </button>
            </div>

            <p>{baseAddressText}</p>
          </div>

          <div className="form-group">
            <label>상세 주소</label>
            <input
              type="text"
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
              placeholder="상세 주소를 입력해주세요."
            />
          </div>

          <div className="form-group">
            <label>
              층수 <span className="required-mark">*</span>
            </label>

            <div className="floor-input-wrapper">
              <input
                type="text"
                className="floor-input"
                placeholder="층수 입력"
                value={floor}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  setFloor(value);
                }}
              />
              <span className="floor-unit">층</span>
            </div>

            <p className="helper-text">
              지하, 단독주택, 야외 상차/하차처럼 층수로 표현하기 어려운 경우
              1층으로 입력하고 상세 주소 또는 요청사항에 실제 위치를 적어주세요.
            </p>

            {!floor && <p className="error-text">층수를 입력해주세요.</p>}

            {floor && !isValidFloor && (
              <p className="error-text">층수는 1 이상의 숫자로 입력해주세요.</p>
            )}
          </div>

          <div className="form-group">
            <label>
              건물 내 엘리베이터 <span className="required-mark">*</span>
            </label>

            <div className="elevator-toggle-group">
              <button
                type="button"
                className={`elevator-toggle-button ${
                  hasElevator === "있음" ? "selected" : ""
                }`}
                onClick={() => setHasElevator("있음")}
              >
                있음
              </button>

              <button
                type="button"
                className={`elevator-toggle-button ${
                  hasElevator === "없음" ? "selected" : ""
                }`}
                onClick={() => setHasElevator("없음")}
              >
                없음
              </button>
            </div>

            {!isValidElevator && (
              <p className="error-text">엘리베이터 유무를 선택해주세요.</p>
            )}
          </div>

          <button
            type="button"
            className="primary-button detail-submit-button"
            onClick={handleSubmitDetail}
            disabled={!isDetailFormValid}
          >
            적용하기
          </button>
        </div>
      )}
    </div>
  );
}
