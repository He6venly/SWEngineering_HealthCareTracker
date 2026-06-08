# 소프트웨어공학 Team 14 - HealthCare Tracker
소프트웨어공학 팀프로젝트 14조

## 백엔드 로컬 실행

필수 환경:
- JDK 21
- MongoDB Atlas 팀 공용 클러스터

환경변수:
- `JWT_SECRET`: JWT 서명 키
- `JWT_VALIDITY_IN_SECONDS`: JWT 만료 시간, 기본값 `86400`
- `LLM_PROVIDER`: `rule` 또는 `gemini`, 기본값 `rule`
- `GEMINI_API_KEY`: Gemini API 키
- `GEMINI_MODEL`: Gemini 모델명, 기본값 `gemini-2.5-flash`
- `GEMINI_FALLBACK_MODELS`: Gemini 장애 시 재시도할 모델 목록, 기본값 `gemini-2.5-flash,gemini-2.0-flash,gemini-flash-latest`

참고:
- MongoDB 연결 URI는 `CWNU14_HealthCare/src/main/resources/application.properties`에 팀 공용 DB로 고정되어 있음
- Spring Boot는 `.env`를 자동으로 읽지 않으므로 JWT/LLM 설정은 Windows 환경변수 또는 Eclipse Run Configuration의 Environment에 직접 등록해야 함

실행:

```powershell
cd CWNU14_HealthCare
.\gradlew.bat bootRun
```

## 프론트 연동 기준

- 백엔드 기본 주소: `http://localhost:8080`
- 프론트 개발 서버: `http://localhost:5173`
- CORS 허용 origin: `http://localhost:5173`, `http://127.0.0.1:5173`
- API 예시: `docs/api-examples.http`

인증이 필요한 API는 로그인 응답의 `accessToken`을 아래 형식으로 전달한다.

```http
Authorization: Bearer <accessToken>
```

공통 응답 형식:

```json
{
  "status": 200,
  "message": "요청이 성공적으로 처리되었습니다.",
  "errorCode": null,
  "data": {}
}
```
