# 🖥️ 다른 PC에서 OMEGA-7 환경 설정하기

## 📋 사전 요구사항

- [ ] Git 설치
- [ ] Node.js 18+ 설치
- [ ] GitHub 계정 접근 가능
- [ ] Jira 계정 접근 가능

---

## ⚡ 빠른 설정 (5분)

### 1단계: 작업 디렉토리 생성

```powershell
# 디렉토리 생성
mkdir C:\projects\omega7-env\projects\web-main-X
cd C:\projects\omega7-env\projects\web-main-X

# X는 PC 번호 (1, 2, 3)
```

### 2단계: 저장소 Clone

```powershell
git clone https://github.com/ProCodeJH/jahyeon-portfolio .
```

### 3단계: 의존성 설치

```powershell
npm install
```

### 4단계: GitHub CLI 설치 (PR 자동화용)

```powershell
winget install --id GitHub.cli -e
```

### 5단계: GitHub CLI 로그인

```powershell
gh auth login --web
# 또는 토큰 사용:
# echo "YOUR_GITHUB_TOKEN" | gh auth login --with-token
```

---

## 🎯 에이전트 설정

### PC별 프롬프트

각 PC의 Antigravity 에이전트에게 아래 프롬프트를 전달:

```
# OMEGA-7 에이전트 - PC-X

## 작업 디렉토리
C:\projects\omega7-env\projects\web-main-X

## 담당 영역
- PC-1: server/, api/, drizzle/, hooks/, contexts/, lib/, types/
- PC-2: client/src/components/, client/src/styles/
- PC-3: client/src/pages/, 신규 기능

## Jira 프로젝트
- URL: https://codingssok.atlassian.net/jira/software/projects/WEB
- 티켓 형식: WEB-X

## 워크플로우
git checkout main && git pull origin main
git checkout -b feature/WEB-[번호]-[설명]
# 작업 수행
git commit -m "[WEB-X] 작업 내용"
git push origin feature/WEB-[번호]-[설명]

## 금지사항
❌ main 직접 커밋
❌ 타 에이전트 영역 파일 수정
```

---

## 🔗 공유 리소스

모든 PC에서 접근 가능:
- **GitHub**: https://github.com/ProCodeJH/jahyeon-portfolio
- **Jira**: https://codingssok.atlassian.net/jira/software/projects/WEB
- **Vercel**: https://vercel.com/dashboard

---

## ✅ 체크리스트

새 PC 설정 시:
- [ ] Git clone 완료
- [ ] npm install 완료
- [ ] gh auth login 완료
- [ ] 에이전트에 프롬프트 전달

---

## 📌 중요

1. **각 PC는 독립적인 작업 디렉토리 사용**
2. **같은 브랜치에서 동시 작업 금지**
3. **작업 전 항상 `git pull origin main`**
4. **커밋 메시지에 티켓 번호 포함 `[WEB-X]`**
