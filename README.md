# WANT 물류 매칭 플랫폼

화주와 차주를 연결하는 풀스택 물류 매칭 플랫폼입니다. 공개 견적 목록, 견적 등록, 배차 보드, 운송 현황, 결제/영수증, 채팅/알림, 관리자 운영 콘솔, 패널티 관리, 미니게임 기능을 포함합니다.

## 프로젝트 개요

이 프로젝트는 물류 운송 거래 과정을 웹 서비스로 구현한 플랫폼입니다. 사용자는 역할에 따라 화주, 차주, 관리자로 구분되며, 각 역할별로 다른 화면과 기능을 사용합니다.

- 화주: 화물 견적 등록, 차주 제안 확인, 차주 확정, 거래 취소, 결제 및 영수증 확인
- 차주: 공개 견적 조회, 운송 제안 등록, 배정된 운송 진행, 정산 내역 확인
- 관리자: 회원 관리, 화물/거래 관리, 패널티 관리, 문의/공지/FAQ 관리, 재무/정산 현황 확인
- 공통: 로그인/회원가입, 카카오 로그인, 채팅, 알림, 프로필 조회, 화주/차주 검색, 미니게임

## 기술 스택

### Frontend

- React 18
- Vite
- Axios
- React Router DOM
- STOMP / SockJS
- Kakao Map SDK
- html2canvas, jsPDF, qrcode

### Backend

- Java 17
- Spring Boot 3.3.4
- Spring Web
- Spring Security
- Spring Data JPA
- Spring WebSocket
- JWT
- PostgreSQL
- Lombok
- Java Mail Sender

## 주요 기능

### 1. 공개 페이지

- 메인 페이지
- 공개 배차/견적 목록
- 견적 상세 페이지
- 화주/차주 검색 페이지
- 공지사항, FAQ, 문의 기능

### 2. 회원 기능

- 일반 로그인/회원가입
- 화주 회원가입
- 차주 회원가입
- 카카오 로그인
- 비밀번호 재설정
- 프로필 조회 및 수정
- 프로필 이미지 업로드

### 3. 견적 및 운송 기능

- 화물 견적 등록
- 견적 목록 조회
- 견적 상세 조회
- 차주 운송 제안 등록
- 화주의 차주 확정
- 운송 시작/완료 처리
- 거래 취소 처리
- 즐겨찾기 기능
- 운송 상태 확인
- Tmap 기반 경로/거리/예상 시간 연동

### 4. 결제 및 정산 기능

- 결제 모달
- 결제 완료 처리
- 영수증 조회
- 영수증 PDF 저장
- QR 코드 기반 영수증 다운로드
- 화주 지출, 차주 수익, 플랫폼 수수료 관리

### 5. 채팅 및 알림

- 사용자 간 1:1 채팅
- 채팅방 목록
- 실시간 알림 패널
- 전체 알림 페이지
- 알림 읽음 처리
- WebSocket 기반 실시간 메시지 처리

### 6. 관리자 콘솔

- 관리자 대시보드
- 회원 목록 및 상태 관리
- 패널티 점수/제재 관리
- 화물/거래 관리
- 공지사항 관리
- FAQ 관리
- 문의 답변 관리
- 신고/분쟁 관리
- 재무/정산 관리
- AI Assistant 로그 및 가이드라인 관리

### 7. 미니게임

- Rounds Lite 미니게임
- 방 만들기
- 방 코드 입장
- 자동 매칭
- 준비 상태 처리
- 라운드 진행
- 카드 선택 시스템
- 다중 맵 구성

## 프로젝트 구조

```text
.
├── backend/
│   ├── src/main/java/com/logistics/app/
│   │   ├── config/          # 보안, CORS, WebSocket, 스키마 초기화 설정
│   │   ├── controller/      # REST API 컨트롤러
│   │   ├── dto/             # 요청/응답 DTO
│   │   ├── entity/          # JPA 엔티티
│   │   ├── repository/      # JPA Repository
│   │   ├── security/        # JWT 인증 필터 및 유틸
│   │   ├── service/         # 비즈니스 로직
│   │   └── ws/              # 실시간 발행 관련 클래스
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   ├── application-mysql.yml
│   │   └── application-postgres.yml
│   └── pom.xml
│
└── frontend/
    ├── src/
    │   ├── components/      # 공통 컴포넌트
    │   ├── features/        # 기능별 페이지/컴포넌트
    │   │   ├── admin/       # 관리자 콘솔
    │   │   ├── chat/        # 채팅/알림 페이지
    │   │   ├── game/        # 미니게임
    │   │   ├── public/      # 공개 페이지
    │   │   ├── quoteRegister/ # 견적 등록
    │   │   └── user/        # 사용자 콘솔
    │   ├── hooks/           # 커스텀 훅
    │   ├── pages/           # 로그인, 회원가입, 결제, 운송현황 등 페이지
    │   ├── styles/          # CSS 파일
    │   ├── api.js           # 백엔드 API 호출 모듈
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

## 실행 전 준비 사항

다음 프로그램이 설치되어 있어야 합니다.

- Node.js 18 이상 권장
- npm
- Java 17
- Maven 또는 Maven Wrapper
- PostgreSQL

## 환경 변수 설정

### Frontend

`frontend/.env` 파일을 생성하고 다음 값을 설정합니다.

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_KAKAO_MAP_APP_KEY=your_kakao_map_key
VITE_KAKAO_JAVASCRIPT_KEY=your_kakao_javascript_key
VITE_TMAP_APP_KEY=your_tmap_key
```

### Backend

`backend/src/main/resources/application.yml` 또는 실행 환경 변수로 다음 값을 설정합니다.

```env
DB_URL=jdbc:postgresql://localhost:5432/logistics
DB_USERNAME=postgres
DB_PASSWORD=your_database_password
JPA_DDL_AUTO=update
APP_FRONTEND_ORIGIN=http://localhost:5173
APP_JWT_SECRET=your_long_jwt_secret_key
APP_JWT_EXP_MIN=720
TMAP_APP_KEY=your_tmap_key
APP_UPLOAD_DIR=uploads
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=your_email@gmail.com
SPRING_MAIL_PASSWORD=your_app_password
APP_MAIL_FROM=your_email@gmail.com
MAIL_FROM_NAME=want
```

주의: 실제 API 키, 메일 비밀번호, DB 비밀번호는 GitHub에 업로드하지 않는 것이 좋습니다. `.env`와 민감한 설정 파일은 배포 환경에서 따로 관리하세요.

## 데이터베이스 준비

PostgreSQL에서 `logistics` 데이터베이스를 생성합니다.

```sql
CREATE DATABASE logistics;
```

기본 설정은 PostgreSQL을 기준으로 되어 있습니다. 실행 시 `JPA_DDL_AUTO=update`를 사용하면 JPA 엔티티 기준으로 테이블이 자동 생성/갱신됩니다.

## 빌드 방법

### Frontend 빌드

```bash
cd frontend
npm run build
```

### Backend 빌드

```bash
cd backend
./mvnw clean package
```

Windows에서는 다음 명령을 사용할 수 있습니다.

```bash
cd backend
mvnw.cmd clean package
```

## 샘플 계정

초기 실행 시 `DataInitializer`에서 샘플 계정과 샘플 데이터가 생성됩니다.

| 역할 | 이메일 | 비밀번호 |
|---|---|---|
| 관리자 | admin@test.com | 1111 |
| 화주 | shipper@test.com | 1111 |
| 차주 | driver@test.com | 1111 |

## 주요 API 경로

| 구분 | 경로 |
|---|---|
| 인증 | `/auth/**` |
| 공개 데이터 | `/public/**` |
| 사용자 | `/api/users/**` |
| 화물/견적 | `/api/shipments/**` |
| 결제/정산 | `/api/finance/**` |
| 평점 | `/api/ratings/**` |
| 채팅 | `/api/chat/**` |
| 알림 | `/api/interactions/**` |
| 관리자 | `/api/admin/**` |
| AI Assistant | `/api/assistant/**` |
| 미니게임 | `/api/game/rounds-lite/**` |
| WebSocket | `/ws` |

## 프론트엔드 주요 화면

| 화면 | 설명 |
|---|---|
| 메인 페이지 | 서비스 소개, 공개 배차 현황, 주요 지표 |
| 견적 목록 | 등록된 화물/견적 목록 조회 |
| 견적 등록 | 화주가 화물 운송 요청 등록 |
| 견적 상세 | 상세 정보 확인 및 운송 제안/확정 |
| 운송 현황 | 운송 진행률, 경로, 상태 확인 |
| 마이페이지 | 사용자 정보, 거래, 정산, 평점, 패널티 확인 |
| 관리자 페이지 | 회원/거래/문의/공지/FAQ/패널티 관리 |
| 미니게임 | Rounds Lite 방식의 실시간 대전 게임 |

## 배포 참고

### Frontend

프론트엔드는 Vercel 배포 설정 파일을 포함하고 있습니다.

- `frontend/vercel.json`

배포 시에는 Vercel 환경 변수에 다음 값을 등록해야 합니다.

```env
VITE_API_BASE_URL=배포된_백엔드_URL
VITE_KAKAO_MAP_APP_KEY=카카오_지도_키
VITE_KAKAO_JAVASCRIPT_KEY=카카오_JS_키
VITE_TMAP_APP_KEY=TMAP_키
```

### Backend

백엔드는 Dockerfile을 포함하고 있습니다.

- `backend/Dockerfile`

배포 환경에서는 DB 접속 정보, JWT Secret, CORS 허용 주소, Tmap 키, 메일 계정 정보를 환경 변수로 설정해야 합니다.

## 자주 발생할 수 있는 문제

### 1. 403 Forbidden 발생

로그인 토큰이 없거나 만료된 경우 발생할 수 있습니다.

확인할 항목:

- 프론트엔드 `localStorage`에 `accessToken` 또는 `member.accessToken`이 저장되어 있는지 확인
- `api.js`에서 Authorization 헤더가 정상적으로 붙는지 확인
- 백엔드 CORS 설정의 `APP_FRONTEND_ORIGIN`이 현재 프론트 주소와 일치하는지 확인

### 2. 카카오 지도 또는 카카오 로그인이 동작하지 않음

확인할 항목:

- `.env`에 `VITE_KAKAO_MAP_APP_KEY`, `VITE_KAKAO_JAVASCRIPT_KEY`가 있는지 확인
- Kakao Developers에 `http://localhost:5173` 도메인이 등록되어 있는지 확인
- 카카오 로그인 Redirect URI와 실제 프론트 주소가 일치하는지 확인

### 3. WebSocket 연결 오류

확인할 항목:

- 백엔드가 `http://localhost:8080`에서 실행 중인지 확인
- WebSocket 엔드포인트 `/ws`가 열려 있는지 확인
- CORS 허용 주소에 프론트 주소가 포함되어 있는지 확인

### 4. Tmap 경로가 직선으로 보이거나 거리/시간이 나오지 않음

확인할 항목:

- 백엔드 `TMAP_APP_KEY` 설정 확인
- 프론트 `VITE_TMAP_APP_KEY` 설정 확인
- 출발지/도착지 좌표가 정상적으로 저장되어 있는지 확인

### 5. npm 패키지 import 오류

다음 패키지가 설치되어 있는지 확인합니다.

```bash
cd frontend
npm install
npm install react-kakao-maps-sdk react-daum-postcode html2canvas jspdf qrcode @stomp/stompjs sockjs-client
```

## 개발 참고 사항

- 프론트엔드 API 호출은 `frontend/src/api.js`에 모여 있습니다.
- 전역 상태와 주요 이벤트 처리는 `frontend/src/hooks/useLogisticsController.js`에서 관리합니다.
- 관리자 화면은 `frontend/src/features/admin`에 구성되어 있습니다.
- 사용자 콘솔은 `frontend/src/features/user`에 구성되어 있습니다.
- 미니게임 화면은 `frontend/src/features/game`에 구성되어 있습니다.
- 백엔드 비즈니스 로직은 `backend/src/main/java/com/logistics/app/service`에 구성되어 있습니다.
- 인증은 JWT 기반이며 `JwtAuthenticationFilter`, `JwtUtil`을 사용합니다.
- 실시간 기능은 STOMP/SockJS와 Spring WebSocket을 사용합니다.

## 팀 작업 분담 예시

| 이름 | 담당 |
|---|---|
| 김대호 | 프론트엔드 수정, 영수증 제작 |
| 김도형 | DB 구조/엔티티 제작, 백/프론트엔드 제작, 운송현황 |
| 김승민 | 실제 사이트 배포, 백엔드 제작 |
| 김재민 | API 연동, 전체 오류 수정, 백/프론트엔드 제작, 미니게임 개발 |
| 서효정 | 로그인/회원가입, 메인/마이페이지 프론트 제작 |
| 서민경 | 견적 목록, 견적 등록 프론트 제작 |

## 라이선스

학습 및 팀 프로젝트 용도로 제작된 프로젝트입니다.