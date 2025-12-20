# Cloudflare R2 CORS 설정 가이드

## 🎯 목적
Vercel 웹사이트에서 Cloudflare R2로 직접 파일 업로드를 허용하기 위한 CORS 설정

## 📋 단계별 설정 (5분 소요)

### 1단계: Cloudflare Dashboard 접속
1. https://dash.cloudflare.com 접속
2. 로그인
3. 왼쪽 사이드바에서 **R2** 클릭

### 2단계: 버킷 선택
1. 사용 중인 버킷 찾기 (예: `portfolio-files` 또는 환경 변수의 `R2_BUCKET_NAME`)
2. 버킷 이름 클릭

### 3단계: CORS 정책 설정
1. **Settings** 탭 클릭
2. 아래로 스크롤하여 **CORS Policy** 섹션 찾기
3. **Edit CORS Policy** 또는 **Add CORS Policy** 버튼 클릭

### 4단계: CORS 규칙 입력

#### 옵션 A: 테스트용 (빠른 확인)
모든 도메인 허용 (개발/테스트용):

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

#### 옵션 B: 프로덕션용 (권장)
특정 도메인만 허용:

```json
[
  {
    "AllowedOrigins": [
      "https://www.jahyeon.com",
      "https://jahyeon.com",
      "https://jahyeon-portfolio.vercel.app",
      "https://*.vercel.app"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": [
      "*",
      "Content-Type",
      "Content-Length",
      "x-amz-*"
    ],
    "ExposeHeaders": ["ETag", "x-amz-version-id"],
    "MaxAgeSeconds": 3600
  }
]
```

### 5단계: 저장 및 확인
1. **Save** 버튼 클릭
2. ✅ CORS 정책이 적용되었는지 확인
3. 페이지 새로고침 (변경사항 즉시 적용됨)

## 🧪 테스트

### 1. 브라우저 캐시 삭제
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### 2. 파일 업로드 테스트
1. Admin 페이지 접속
2. Resources → Add Resource
3. PPT 파일 선택 (500MB까지)
4. ✅ 업로드 성공 확인

### 3. 에러 확인
브라우저 콘솔 (F12)에서:
- ❌ **이전**: `CORS policy: No 'Access-Control-Allow-Origin' header`
- ✅ **이후**: 에러 없이 업로드 완료

## 📝 CORS 설정 설명

| 필드 | 설명 | 값 |
|------|------|-----|
| `AllowedOrigins` | 허용할 웹사이트 도메인 | `["*"]` 또는 특정 도메인 |
| `AllowedMethods` | 허용할 HTTP 메서드 | `PUT` (업로드), `GET` (다운로드) 필수 |
| `AllowedHeaders` | 허용할 요청 헤더 | `*` (모두 허용) 권장 |
| `ExposeHeaders` | 응답에서 노출할 헤더 | `ETag` (파일 체크섬) |
| `MaxAgeSeconds` | CORS preflight 캐시 시간 | `3600` (1시간) |

## ⚠️ 보안 주의사항

### 개발 단계
- `"*"` (모든 origin 허용) 사용 가능
- 빠른 테스트에 유용

### 프로덕션 배포
- **반드시** 특정 도메인만 허용
- 와일드카드 최소화
- 정기적으로 CORS 정책 검토

## 🔧 문제 해결

### CORS 에러가 계속 발생하는 경우

1. **버킷 이름 확인**
   ```bash
   # .env 파일 또는 Vercel 환경 변수
   R2_BUCKET_NAME=?
   ```

2. **CORS 정책 적용 확인**
   - Cloudflare Dashboard에서 CORS Policy가 저장되었는지 확인
   - JSON 형식이 올바른지 검증

3. **브라우저 캐시 강제 삭제**
   ```
   1. F12 (개발자 도구)
   2. Network 탭
   3. "Disable cache" 체크
   4. 페이지 새로고침
   ```

4. **Preflight 요청 확인**
   - F12 → Network 탭
   - OPTIONS 요청 찾기
   - Response Headers에 `Access-Control-Allow-Origin` 있는지 확인

### 여전히 안 되는 경우

다음 정보를 확인:
```bash
# 1. 사용 중인 R2 버킷 이름
echo $R2_BUCKET_NAME

# 2. Vercel 배포 URL
# 브라우저 주소창에서 복사

# 3. 에러 메시지
# 브라우저 콘솔 (F12) 전체 에러 복사
```

## 📚 참고 자료

- [Cloudflare R2 CORS 문서](https://developers.cloudflare.com/r2/api/s3/api/#cors)
- [AWS S3 CORS 설정](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html)
- [MDN CORS 가이드](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

## ✅ 완료 체크리스트

- [ ] Cloudflare Dashboard에서 R2 버킷 접속
- [ ] CORS Policy 추가/수정
- [ ] JSON 형식으로 규칙 입력
- [ ] 저장 버튼 클릭
- [ ] 브라우저 캐시 삭제
- [ ] PPT 파일 업로드 테스트
- [ ] 에러 없이 업로드 완료 확인

---

**설정 후 즉시 적용됩니다!** 추가 질문이 있으면 언제든지 물어보세요.
