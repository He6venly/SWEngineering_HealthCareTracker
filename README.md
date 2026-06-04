# 소프트웨어공학 Team 14 - HealthCare Tracker
소프트웨어공학 팀프로젝트 14조

## 백엔드 로컬 실행

필수 환경:
- JDK 21
- MongoDB Atlas 개인 클러스터 또는 팀 공용 클러스터

환경변수:
- `MONGODB_URI`: MongoDB 연결 URI
- `JWT_SECRET`: JWT 서명 키
- `JWT_VALIDITY_IN_SECONDS`: JWT 만료 시간, 기본값 `86400`

참고:
- 예시는 `CWNU14_HealthCare/.env.example`에 있음
- Spring Boot는 `.env`를 자동으로 읽지 않으므로 Windows 환경변수 또는 Eclipse Run Configuration의 Environment에 직접 등록해야 함

실행:

```powershell
cd CWNU14_HealthCare
.\gradlew.bat bootRun
```
