# WANT - Logistics Frontend

WANT는 화주와 차주를 연결하고,

견적 등록부터 운행 현황 추적까지 지원하는

화물 운송 중개 플랫폼입니다.

## 👥 팀원

| 이름 | 담당 |
| --- | --- |
| 서민경 | 견적 등록/목록/상세 UI 구현, 화물 정보 입력 화면 구성 |
| 서효정 | 로그인·회원가입 UI, 메인/마이페이지 화면 구성 |
| 김대호 | UI 보완, 결제 영수증/PDF/QR 기능 구현 |

---

## 🛠 기술 스택

| 분류 | 기술 | 설명 |
| --- | --- | --- |
| 개발 언어 | JavaScript, HTML, CSS | 프론트엔드 개발에 사용 |
| 프론트엔드 | React, Vite, React Router DOM, Axios | 화면 구성, 페이지 이동, 백엔드 API 통신 처리 |
| 인증 / 보안 | JWT | 로그인 토큰 인증 |
| 외부 API | Kakao Login API, Kakao Maps SDK, Daum Postcode, TMap API | 소셜 로그인, 지도 표시, 주소 검색, 경로/거리 계산 |
| 개발 / 협업 도구 | VS Code, GitHub | 코드 작성, 버전 관리 및 협업 |

---

## ✨ 주요 기능

- 화물 운송 견적 등록
- 견적 목록 및 상세 조회
- 실시간 채팅 및 알림
- 운행 경로 지도 시각화
- PDF 영수증 다운로드
- QR 코드 출력

---

## 📁 프로젝트 구조

```
frontend/
├── public/
│   ├── favicon.png
│   └── images/
├── src/
│   ├── api.js                  # Axios 인스턴스 및 API 호출 모음
│   ├── App.jsx                 # 라우팅 설정
│   ├── main.jsx                # 진입점
│   ├── assets/                 # 이미지, 로고 등 정적 리소스
│   ├── components/
│   │   ├── common/             # 공통 컴포넌트 (모달, 채팅, 결제 등)
│   │   ├── layout/             # 레이아웃 컴포넌트
│   │   ├── KakaoMapView.jsx    # 카카오 지도 통합 컴포넌트
│   │   └── ShipmentLocationPicker.jsx
│   ├── constants/              # 공통 상수 (테마, 폼, 차량 정보 등)
│   ├── features/
│   │   ├── admin/              # 관리자 콘솔
│   │   ├── chat/               # 채팅 및 알림
│   │   ├── game/               # QuickDraw 미니게임
│   │   ├── public/             # 공개 페이지
│   │   ├── quoteRegister/      # 견적 등록
│   │   └── user/               # 사용자 콘솔
│   ├── hooks/                  # 커스텀 훅
│   ├── pages/                  # 독립 페이지
│   ├── styles/                 # 전역 CSS
│   └── utils/                  # 공통 유틸 함수
├── .env.example
├── index.html
├── vite.config.js
└── package.json
```

---

## ⚙️ 환경 변수 설정

`.env.example`을 참고하여 `.env` 파일을 생성합니다.

```
VITE_API_BASE_URL=http://localhost:8080
VITE_KAKAO_MAP_APP_KEY=your_kakao_map_key
VITE_TMAP_APP_KEY=your_tmap_key
```

> **참고**
> 
> - 카카오 지도 API 키는 Kakao Developers에서 발급받습니다.
> - TMap API 키는 SKT TMap에서 발급받습니다.
> - TMap 키가 설정되지 않으면 직선 경로로 표시됩니다.

---

## 🚀 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리 보기
npm run preview
```

---

## 🔗 백엔드 연동

백엔드 서버가 `http://localhost:8080`에서 실행 중이어야 합니다.
