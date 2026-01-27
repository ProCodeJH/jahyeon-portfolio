# Bitbucket 마이그레이션 가이드

## 1단계: Bitbucket 저장소 생성

1. **https://bitbucket.org** 접속
2. Atlassian 계정으로 로그인 (Jira와 같은 계정)
3. **Create repository** 클릭
4. 다음 설정:
   - **Workspace**: codingssok (또는 본인 워크스페이스)
   - **Project**: jahyeon-portfolio
   - **Repository name**: `jahyeon-portfolio`
   - **Access level**: Private
   - **Include a README?**: No
5. **Create repository** 클릭

---

## 2단계: GitHub에서 Bitbucket으로 Push

저장소 생성 후, 아래 명령어를 실행합니다:

```powershell
cd C:\Users\MIN\.gemini\antigravity\scratch\omega7-env\projects\web-main-1

# Bitbucket 리모트 추가
git remote add bitbucket https://bitbucket.org/codingssok/jahyeon-portfolio.git

# 모든 브랜치 Push
git push bitbucket --all

# 모든 태그 Push
git push bitbucket --tags
```

---

## 3단계: Jira ↔ Bitbucket 연동

1. **Jira** → 프로젝트 설정 → Apps
2. **Bitbucket** 검색 및 설치
3. 저장소 연결

---

## 완료 후

저장소 URL을 알려주시면 자동 연동을 진행해드립니다.
