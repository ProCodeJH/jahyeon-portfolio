# 📋 TASK TRACKER
## OMEGA-7 작업 관리 시스템 (Jira 대체)

> **프로젝트**: jahyeon-portfolio  
> **최종 업데이트**: 2026-01-27 13:04

---

## 📌 티켓 형식 가이드

```
### TASK-[번호]: [제목]
- **담당자**: [PC-에이전트]
- **우선순위**: 🔴 High / 🟡 Medium / 🟢 Low
- **상태**: ⏳ 진행 중 / ✅ 완료 / 🔄 리뷰 중 / ⏸️ 대기
- **브랜치**: feature/TASK-[번호]-[설명]
- **설명**: [작업 내용]
- **완료 기준**: [어떤 조건이 충족되면 완료인지]
```

---

## 🎯 Backlog (대기 중인 작업)

### TASK-002: 비디오 썸네일 자동 생성 기능
- **담당자**: PC-1 (Core)
- **우선순위**: 🟡 Medium
- **상태**: ⏸️ 대기
- **브랜치**: `feature/TASK-002-video-thumbnail-auto`
- **설명**: 비디오 업로드 시 서버 사이드에서 자동으로 썸네일 생성
- **완료 기준**: 비디오 업로드 후 자동으로 첫 프레임 썸네일이 생성되어 S3에 저장
- **관련 파일**: `server/routers.ts`, `api/` 관련 파일

---

### TASK-003: 업로드 에러 핸들링 강화
- **담당자**: PC-1 (Core)
- **우선순위**: 🔴 High
- **상태**: ⏸️ 대기
- **브랜치**: `feature/TASK-003-upload-error-handling`
- **설명**: 파일 업로드 시 발생하는 undefined 에러 완전 해결 및 상세 로깅 추가
- **완료 기준**: 대용량 파일 업로드 시 에러 없이 완료, 에러 발생 시 명확한 로그 출력
- **관련 파일**: `server/routers.ts`, `client/src/components/FileUploadForm.tsx`

---

### TASK-004: UI 컴포넌트 접근성 개선
- **담당자**: PC-2 (UI/UX)
- **우선순위**: 🟡 Medium
- **상태**: ⏸️ 대기
- **브랜치**: `feature/TASK-004-accessibility-improvement`
- **설명**: WCAG 2.1 기준에 맞는 접근성 개선 (키보드 네비게이션, aria 라벨 등)
- **완료 기준**: Lighthouse 접근성 점수 90점 이상
- **관련 파일**: `client/src/components/` 전체

---

### TASK-005: 다크모드 토글 기능
- **담당자**: PC-2 (UI/UX)
- **우선순위**: 🟢 Low
- **상태**: ⏸️ 대기
- **브랜치**: `feature/TASK-005-dark-mode-toggle`
- **설명**: 사용자가 라이트/다크 모드를 전환할 수 있는 토글 버튼 추가
- **완료 기준**: 토글 버튼 클릭 시 테마 전환, LocalStorage에 설정 저장
- **관련 파일**: `client/src/components/`, `client/src/styles/`, `client/src/hooks/`

---

### TASK-006: 프로젝트 상세 페이지 개선
- **담당자**: PC-3 (Feature)
- **우선순위**: 🟡 Medium
- **상태**: ⏸️ 대기
- **브랜치**: `feature/TASK-006-project-detail-page`
- **설명**: 프로젝트 상세 보기 페이지에 이미지 갤러리, 기술 스택 배지 추가
- **완료 기준**: 프로젝트 클릭 시 상세 페이지로 이동, 갤러리 슬라이더 동작
- **관련 파일**: `client/src/pages/ProjectDetail.tsx` (신규)

---

### TASK-007: SEO 메타태그 최적화
- **담당자**: PC-3 (Feature)
- **우선순위**: 🟡 Medium
- **상태**: ⏸️ 대기
- **브랜치**: `feature/TASK-007-seo-optimization`
- **설명**: 각 페이지별 동적 메타태그, Open Graph, Twitter Card 설정
- **완료 기준**: SNS 공유 시 썸네일과 설명이 올바르게 표시
- **관련 파일**: `client/index.html`, `client/src/pages/`

---

## 📊 Sprint 현황

### 🏃 진행 중 (In Progress)

| 티켓 | 제목 | 담당자 | 우선순위 |
|------|------|--------|----------|
| TASK-001 | 환경 설정 완료 | Admin | ✅ 완료 |

### 📥 대기 (Backlog)

| 티켓 | 제목 | 담당자 | 우선순위 |
|------|------|--------|----------|
| TASK-002 | 비디오 썸네일 자동 생성 | PC-1 | 🟡 Medium |
| TASK-003 | 업로드 에러 핸들링 강화 | PC-1 | 🔴 High |
| TASK-004 | UI 접근성 개선 | PC-2 | 🟡 Medium |
| TASK-005 | 다크모드 토글 | PC-2 | 🟢 Low |
| TASK-006 | 프로젝트 상세 페이지 | PC-3 | 🟡 Medium |
| TASK-007 | SEO 최적화 | PC-3 | 🟡 Medium |

### ✅ 완료 (Done)

| 티켓 | 제목 | 담당자 | 완료일 |
|------|------|--------|--------|
| TASK-001 | OMEGA-7 환경 설정 | Admin | 2026-01-27 |

---

## 🚀 권장 작업 순서

### 1차 스프린트 (우선순위 기준)
1. **TASK-003** (PC-1) - 업로드 에러 핸들링 🔴
2. **TASK-004** (PC-2) - UI 접근성 🟡
3. **TASK-006** (PC-3) - 프로젝트 상세 페이지 🟡

### 2차 스프린트
4. **TASK-002** (PC-1) - 비디오 썸네일
5. **TASK-005** (PC-2) - 다크모드
6. **TASK-007** (PC-3) - SEO 최적화

---

## 📝 티켓 생성 규칙

1. **티켓 번호**: `TASK-XXX` 형식 (예: TASK-001, TASK-002)
2. **브랜치 명명**: `feature/TASK-[번호]-[간단한-설명]`
3. **커밋 메시지**: `[TASK-XXX] 작업 내용 요약`
4. **1티켓 = 1기능**: 하나의 티켓에 하나의 기능만

---

*Last Updated: 2026-01-27 13:04*
