# Jira 프로젝트 설정 가이드

## 1단계: Atlassian 계정 로그인

1. 브라우저에서 열기: **https://www.atlassian.com/software/jira/free**
2. "Get it free" 클릭
3. 이메일로 로그인 또는 새 계정 생성

---

## 2단계: Jira 프로젝트 생성

1. "Create Project" 클릭
2. 다음 설정 입력:
   - **프로젝트 이름**: `jahyeon-portfolio`
   - **프로젝트 키**: `WEB`
   - **템플릿**: Kanban (권장)

---

## 3단계: 티켓 생성

기존 TASK_TRACKER.md의 티켓들을 Jira에 생성:

| Jira 키 | 제목 | 우선순위 |
|---------|------|----------|
| WEB-1 | 업로드 에러 핸들링 강화 | High |
| WEB-2 | UI 접근성 개선 | Medium |
| WEB-3 | 프로젝트 상세 페이지 | Medium |
| WEB-4 | 비디오 썸네일 자동 생성 | Medium |
| WEB-5 | 다크모드 토글 | Low |
| WEB-6 | SEO 최적화 | Medium |

---

## 4단계: GitHub 연동 (선택)

1. Jira 설정 → Apps → "GitHub for Jira" 검색
2. 앱 설치
3. GitHub 계정 연결
4. `ProCodeJH/jahyeon-portfolio` 저장소 선택

이제 브랜치명에 `WEB-1`을 포함하면 Jira 티켓과 자동 연결됩니다!

---

## 완료 후

Jira 프로젝트 URL을 알려주시면 DEVELOPMENT_LOG.md에 링크를 추가해드립니다.
