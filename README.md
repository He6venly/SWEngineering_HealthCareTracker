# CWNU HealthCare Tracker

> 식단·운동·수분·수면 기록을 한곳에서 관리하고, 저장된 건강 데이터를 기반으로 AI 맞춤 조언을 제공하는 웹 서비스입니다.

## 바로가기

| 구분 | 링크 |
| :--- | :--- |
| 서비스 | [Vercel 프론트엔드](https://sw-engineering-health-care-tracker.vercel.app) |
| 백엔드 | [Render API](https://swengineering-healthcaretracker.onrender.com) |
| 상태 확인 | [Health Check](https://swengineering-healthcaretracker.onrender.com/api/v1/health) |
| API 예시 | [docs/api-examples.http](./docs/api-examples.http) |

> Render 무료 인스턴스가 절전 상태이면 첫 요청에 시간이 걸릴 수 있습니다.

## 주요 기능

- JWT 기반 회원가입·로그인 및 이메일 중복 확인
- 식단·운동 기록과 일간·주간 대시보드
- 수분 목표, 섭취량 및 수면 시간 관리
- 실제 기기 없이 동작하는 웨어러블 데이터 시뮬레이션
- 건강 기록 기반 Gemini AI 코치 및 종합 평가
- 건강 목표·닉네임 관리 및 회원 탈퇴

## 기술 구성

| 영역 | 기술 |
| :--- | :--- |
| Frontend | React 19, Vite 7, Lucide React |
| Backend | Spring Boot 4, Java 21, Spring Security, JWT |
| Database | MongoDB Atlas, Spring Data MongoDB |
| AI | Gemini API, Rule-based Fallback |
| Deploy | Vercel, Render, Docker |

## 프로젝트 구조

```text
.
├─ CWNU14_HealthCare/        # Spring Boot 백엔드
├─ CWNU14_HealthCare_Front/  # React 프론트엔드
├─ docs/                     # API 예시 및 문서
├─ render.yaml               # Render 배포 설정
└─ vercel.json               # Vercel 배포 설정
```

## 로컬 실행

### 1. 백엔드

```powershell
cd CWNU14_HealthCare
.\gradlew.bat bootRun
```

기본 주소: `http://localhost:8080`

### 2. 프론트엔드

```powershell
cd CWNU14_HealthCare_Front
npm install
npm run dev
```

기본 주소: `http://localhost:5173`

## 환경변수

### Backend

| 변수 | 설명 | 필수 여부 |
| :--- | :--- | :---: |
| `MONGODB_URI` | MongoDB Atlas 연결 문자열 | 권장 |
| `JWT_SECRET` | JWT 서명 키 | 권장 |
| `JWT_VALIDITY_IN_SECONDS` | JWT 만료 시간, 기본값 `86400` | 선택 |
| `LLM_PROVIDER` | `auto`, `gemini`, `rule` | 선택 |
| `GEMINI_API_KEY` | Gemini API 키 | Gemini 사용 시 필수 |
| `GEMINI_MODEL` | 기본값 `gemini-2.5-flash` | 선택 |
| `CORS_ALLOWED_ORIGINS` | 허용할 프론트엔드 Origin 목록 | 배포 시 필수 |
| `CORS_ALLOWED_ORIGIN_PATTERNS` | Vercel Preview 도메인 패턴 | 선택 |

### Frontend

| 변수 | 설명 |
| :--- | :--- |
| `VITE_API_BASE_URL` | 백엔드 API 주소, 로컬 기본값 `http://localhost:8080` |

민감한 키와 연결 문자열은 저장소에 커밋하지 않고 배포 플랫폼의 환경변수로 관리합니다.

## 공통 API 응답

```json
{
  "status": 200,
  "message": "요청이 성공적으로 처리되었습니다.",
  "errorCode": null,
  "data": {}
}
```

인증이 필요한 요청은 로그인 응답의 토큰을 전달합니다.

```http
Authorization: Bearer <accessToken>
```
