# OMEGA-7 에이전트 프롬프트 (Jira 연동 버전)
## 각 PC에 복사하여 에이전트에게 전달하세요

> **Jira 프로젝트 키**: WEB  
> **최종 업데이트**: 2026-01-27

---

## 🖥️ PC-1 에이전트 (Core/API)

```
# OMEGA-7 에이전트 - PC-1 Core

## 작업 디렉토리
C:\Users\MIN\.gemini\antigravity\scratch\omega7-env\projects\web-main-1

## 담당 영역
- server/, api/, drizzle/ (백엔드)
- client/src/hooks/, contexts/, lib/, types/

## 현재 티켓: WEB-1
업로드 에러 핸들링 강화

## 워크플로우
git checkout main && git pull origin main
git checkout -b feature/WEB-1-upload-error-handling
# 작업 수행
git commit -m "[WEB-1] 파일 업로드 에러 핸들링 강화"
git push origin feature/WEB-1-upload-error-handling

## 금지사항
❌ main 직접 커밋
❌ client/src/components, pages 수정 (타 에이전트 영역)
```

---

## 🖥️ PC-2 에이전트 (UI/UX)

```
# OMEGA-7 에이전트 - PC-2 UI/UX

## 작업 디렉토리
C:\Users\MIN\.gemini\antigravity\scratch\omega7-env\projects\web-main-2

## 담당 영역
- client/src/components/ (UI 컴포넌트)
- client/src/styles/ (CSS)

## 현재 티켓: WEB-2
UI 컴포넌트 접근성 개선

## 워크플로우
git checkout main && git pull origin main
git checkout -b feature/WEB-2-accessibility
# 작업 수행
git commit -m "[WEB-2] UI 컴포넌트 접근성 개선"
git push origin feature/WEB-2-accessibility

## 금지사항
❌ main 직접 커밋
❌ server/, api/ 수정 (타 에이전트 영역)
```

---

## 🖥️ PC-3 에이전트 (Feature)

```
# OMEGA-7 에이전트 - PC-3 Feature

## 작업 디렉토리
C:\Users\MIN\.gemini\antigravity\scratch\omega7-env\projects\web-main-3

## 담당 영역
- client/src/pages/ (페이지)
- 신규 기능 개발

## 현재 티켓: WEB-3
프로젝트 상세 페이지 구현

## 워크플로우
git checkout main && git pull origin main
git checkout -b feature/WEB-3-project-detail
# 작업 수행
git commit -m "[WEB-3] 프로젝트 상세 페이지 구현"
git push origin feature/WEB-3-project-detail

## 금지사항
❌ main 직접 커밋
❌ server/, components/ 자체 수정 (타 에이전트 영역)
```

---

## 📋 에이전트 활성화 방법

1. Jira에서 WEB-1 ~ WEB-6 티켓 생성
2. 각 에이전트에게 위 프롬프트 전달
3. 작업 시작 지시:
```
[WEB-1] 작업 시작해주세요.
```

---

## 🔗 GitHub ↔ Jira 연동

1. Jira → 앱 → "GitHub for Jira" 검색 및 설치
2. GitHub 계정 연결
3. 저장소 선택: ProCodeJH/jahyeon-portfolio

연동 후 브랜치명에 `WEB-1`을 포함하면 Jira 티켓과 자동 연결됩니다!
