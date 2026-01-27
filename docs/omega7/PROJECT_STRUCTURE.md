# 📁 jahyeon-portfolio 프로젝트 구조
## 에이전트 작업 영역 분배 가이드

> 이 문서는 각 에이전트가 담당할 파일/폴더 영역을 정의합니다.
> **충돌 방지**를 위해 반드시 지정된 영역 내에서만 작업하세요.

---

## 🏗️ 프로젝트 아키텍처

```
jahyeon-portfolio/
├── 📁 client/src/           # 프론트엔드 소스
│   ├── 📁 _core/            # 🔒 공통 코어 (수정 금지)
│   ├── 📁 components/       # PC-2 담당
│   ├── 📁 contexts/         # PC-1 담당
│   ├── 📁 hooks/            # PC-1 담당
│   ├── 📁 lib/              # PC-1 담당
│   ├── 📁 pages/            # PC-3 담당
│   ├── 📁 styles/           # PC-2 담당
│   └── 📁 types/            # PC-1 담당
├── 📁 server/               # PC-1 담당 (API)
├── 📁 api/                  # PC-1 담당 (Serverless)
├── 📁 shared/               # 🔒 공통 (수정 금지)
└── 📁 drizzle/              # PC-1 담당 (DB)
```

---

## 🎨 PC별 담당 영역

### PC-1: Core/API (web-main-1)

| 영역 | 경로 | 작업 유형 |
|------|------|----------|
| **Hooks** | `client/src/hooks/` | 커스텀 훅 개발 |
| **Contexts** | `client/src/contexts/` | 상태 관리 |
| **Types** | `client/src/types/` | 타입 정의 |
| **Lib** | `client/src/lib/` | 유틸리티 함수 |
| **Server** | `server/` | API 로직 |
| **API Routes** | `api/` | Serverless Functions |
| **Database** | `drizzle/` | 스키마, 마이그레이션 |

---

### PC-2: UI/UX (web-main-2)

| 영역 | 경로 | 작업 유형 |
|------|------|----------|
| **Components** | `client/src/components/` | UI 컴포넌트 |
| **Styles** | `client/src/styles/` | CSS 시스템 |

---

### PC-3: Feature (web-main-3)

| 영역 | 경로 | 작업 유형 |
|------|------|----------|
| **Pages** | `client/src/pages/` | 페이지 컴포넌트 |
| **신규 기능** | (티켓에 따라 할당) | 새 기능 개발 |

---

## 🔒 보호 영역 (수정 금지)

다음 파일/폴더는 **관리자 승인 없이 수정 불가**:

```
❌ package.json
❌ package-lock.json
❌ vite.config.ts
❌ tsconfig.json
❌ vercel.json
❌ client/src/_core/
❌ shared/
❌ .env.example
```

---

## 📝 작업 예시

### PC-1 에이전트가 새 Hook 추가 시:
```bash
# 1. 브랜치 생성
git checkout -b feature/TASK-010-add-useTheme-hook

# 2. 파일 생성
# client/src/hooks/useTheme.ts

# 3. 커밋
git commit -m "[TASK-010] useTheme 커스텀 훅 추가"

# 4. Push
git push origin feature/TASK-010-add-useTheme-hook
```

### PC-2 에이전트가 버튼 컴포넌트 수정 시:
```bash
# 1. 브랜치 생성
git checkout -b feature/TASK-011-update-button-style

# 2. 파일 수정
# client/src/components/Button.tsx
# client/src/styles/button.css

# 3. 커밋
git commit -m "[TASK-011] Button 컴포넌트 호버 애니메이션 추가"

# 4. Push
git push origin feature/TASK-011-update-button-style
```

---

## ⚠️ 충돌 발생 시 대응

1. **즉시 작업 중단**
2. `DEVELOPMENT_LOG.md`에 충돌 상황 기록
3. 관리자에게 보고
4. `git stash`로 변경사항 임시 저장
5. 관리자 지시 대기

---

*Last Updated: 2026-01-27*
