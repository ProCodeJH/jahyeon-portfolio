# 🚀 OMEGA-7 환경 설정 가이드
## 각 PC별 초기 설정 방법

---

## 📋 사전 요구사항

- [x] Git 설치 완료
- [x] Node.js (v18+) 설치 완료
- [x] VS Code 또는 선호 IDE 설치
- [x] GitHub 계정 접근 가능

---

## 🖥️ PC별 설정 순서

### STEP 1: 작업 디렉토리로 이동

```powershell
# PC-1 에이전트
cd C:\Users\MIN\.gemini\antigravity\scratch\omega7-env\projects\web-main-1

# PC-2 에이전트
cd C:\Users\MIN\.gemini\antigravity\scratch\omega7-env\projects\web-main-2

# PC-3 에이전트
cd C:\Users\MIN\.gemini\antigravity\scratch\omega7-env\projects\web-main-3
```

### STEP 2: 저장소 Clone

```powershell
git clone https://github.com/ProCodeJH/jahyeon-portfolio .
```

### STEP 3: 의존성 설치

```powershell
npm install
```

### STEP 4: 환경 변수 설정

```powershell
# .env.local 파일 생성 (관리자에게 값 요청)
Copy-Item .env.example .env.local
```

### STEP 5: 개발 서버 실행 확인

```powershell
npm run dev
```

---

## 🔄 작업 시작 프로토콜

매 작업 시작 전 반드시 실행:

```powershell
# 1. main 브랜치 최신화
git checkout main
git pull origin main

# 2. 작업 브랜치 생성
git checkout -b feature/TASK-XXX-description
```

---

## 📤 작업 완료 프로토콜

```powershell
# 1. 변경사항 스테이징
git add .

# 2. 커밋 (티켓 번호 포함)
git commit -m "[TASK-XXX] 작업 내용 요약"

# 3. Push
git push origin feature/TASK-XXX-description

# 4. GitHub에서 PR 생성
# 5. DEVELOPMENT_LOG.md 업데이트
```

---

## ⚠️ 주의사항

### 절대 하지 말 것
- ❌ `main` 브랜치에 직접 커밋
- ❌ 다른 에이전트의 작업 디렉토리 접근
- ❌ 공통 파일 무단 수정

### 반드시 할 것
- ✅ 작업 전 `git pull origin main`
- ✅ 작업 후 `DEVELOPMENT_LOG.md` 업데이트
- ✅ 커밋 메시지에 티켓 번호 포함

---

## 🔗 프로젝트 링크

| 구분 | URL |
|------|-----|
| **GitHub** | https://github.com/ProCodeJH/jahyeon-portfolio |
| **Vercel** | https://vercel.com/dashboard |
| **Production** | (배포 후 추가) |

---

*OMEGA-7 Framework v1.0.0*
