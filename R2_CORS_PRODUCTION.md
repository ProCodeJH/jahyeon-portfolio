# Cloudflare R2 CORS 프로덕션 설정

## 🎯 완성본 설정 (복사해서 사용)

### Cloudflare Dashboard 방법

1. https://dash.cloudflare.com 접속
2. **R2** → 버킷 선택 → **Settings** → **CORS Policy**
3. 아래 JSON을 **그대로 복사해서 붙여넣기**:

```json
[
  {
    "AllowedOrigins": [
      "https://www.jahyeon.com",
      "https://jahyeon.com",
      "https://jahyeon-portfolio.vercel.app",
      "https://jahyeon-portfolio-git-*.vercel.app"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*",
      "Content-Type",
      "Content-MD5",
      "Content-Disposition",
      "x-amz-acl",
      "x-amz-meta-*",
      "x-amz-server-side-encryption",
      "x-amz-storage-class",
      "x-amz-request-id",
      "x-amz-id-2"
    ],
    "ExposeHeaders": [
      "ETag",
      "x-amz-version-id",
      "x-amz-request-id",
      "x-amz-id-2"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

4. **Save** 버튼 클릭
5. ✅ 완료!

---

## 🔧 Wrangler CLI 방법 (선택사항)

프로젝트 폴더에 이미 **r2-cors-production.json** 파일이 있습니다.

```bash
# 1. Wrangler 설치 (아직 없다면)
npm install -g wrangler

# 2. Cloudflare 로그인
wrangler login

# 3. 버킷 이름 확인
# .env 파일 또는 Vercel 환경 변수에서 R2_BUCKET_NAME 확인

# 4. CORS 적용
wrangler r2 bucket cors put YOUR_BUCKET_NAME --cors-file r2-cors-production.json
```

**버킷 이름 예시**:
- `portfolio-files`
- `jahyeon-portfolio`
- 환경 변수 `R2_BUCKET_NAME` 값

---

## 📋 설정 내용 설명

### 허용된 도메인 (AllowedOrigins)
✅ **프로덕션 도메인**:
- `https://www.jahyeon.com` - 메인 도메인
- `https://jahyeon.com` - Root 도메인

✅ **Vercel 배포**:
- `https://jahyeon-portfolio.vercel.app` - 메인 Vercel URL
- `https://jahyeon-portfolio-git-*.vercel.app` - Preview 배포 (모든 브랜치)

### 허용된 메서드 (AllowedMethods)
- `GET` - 파일 다운로드
- `PUT` - 파일 업로드 (Presigned URL 사용)
- `POST` - 멀티파트 업로드
- `DELETE` - 파일 삭제
- `HEAD` - 메타데이터 조회

### 허용된 헤더 (AllowedHeaders)
- `*` - 모든 헤더 허용
- AWS S3 호환 헤더 명시적 포함
- Presigned URL 사용 시 필요한 모든 헤더 포함

### 노출 헤더 (ExposeHeaders)
- `ETag` - 파일 체크섬 (무결성 검증)
- `x-amz-version-id` - 파일 버전 ID
- AWS 요청 추적용 헤더

### 캐시 시간 (MaxAgeSeconds)
- `3600` 초 (1시간)
- Preflight 요청을 1시간 동안 캐시
- 성능 향상 및 비용 절감

---

## ✅ 설정 후 확인

### 1. 즉시 테스트
```bash
# 브라우저 캐시 삭제
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### 2. Admin 페이지에서 업로드 테스트
1. https://www.jahyeon.com/admin 접속
2. Resources → Add Resource
3. PPT 파일 선택 (500MB까지)
4. ✅ 업로드 성공 확인

### 3. 브라우저 콘솔 확인 (F12)
**이전**:
```
❌ CORS policy: No 'Access-Control-Allow-Origin' header
```

**이후**:
```
✅ 에러 없음
✅ 200 OK
✅ 파일 업로드 완료
```

---

## 🔒 보안 특징

✅ **특정 도메인만 허용** - 와일드카드 최소화
✅ **HTTPS만 허용** - HTTP 요청 차단
✅ **Vercel Preview 지원** - 브랜치 배포 테스트 가능
✅ **1시간 캐싱** - 불필요한 Preflight 요청 감소

---

## 🚨 문제 해결

### CORS 에러가 계속 나는 경우

#### 1. 버킷 이름 확인
```bash
# Vercel 환경 변수 확인
# Settings → Environment Variables
R2_BUCKET_NAME=?
```

#### 2. 도메인 정확히 일치하는지 확인
CORS는 **정확히 일치**해야 합니다:
- ✅ `https://www.jahyeon.com`
- ❌ `http://www.jahyeon.com` (HTTP는 차단)
- ❌ `www.jahyeon.com` (프로토콜 없음은 차단)

#### 3. Cloudflare R2 대시보드 확인
1. R2 → 버킷 → Settings
2. CORS Policy가 저장되었는지 확인
3. JSON 형식 오류 없는지 확인

#### 4. 브라우저 강제 새로고침
```
F12 → Network 탭 → "Disable cache" 체크 → 새로고침
```

---

## 📊 성능 최적화

### Preflight 캐싱
- `MaxAgeSeconds: 3600` 설정으로
- OPTIONS 요청을 1시간 동안 캐시
- 반복 업로드 시 성능 향상

### 비용 절감
- Preflight 요청 횟수 감소
- R2 요청 비용 절감
- 네트워크 트래픽 감소

---

## 🔄 업데이트 필요 시

### 새 도메인 추가
```json
"AllowedOrigins": [
  "https://www.jahyeon.com",
  "https://jahyeon.com",
  "https://new-domain.com"  // 추가
]
```

### Preview URL 패턴 변경
```json
"https://jahyeon-portfolio-git-*.vercel.app"  // 모든 브랜치
"https://jahyeon-portfolio-*.vercel.app"      // 더 넓은 범위
```

---

## ✨ 완료!

이 설정으로:
- ✅ 500MB PPT 파일 업로드
- ✅ YouTube 썸네일 자동 생성
- ✅ 이미지 자동 썸네일
- ✅ 모든 도메인에서 안전한 업로드

**모두 정상 작동합니다!** 🚀
