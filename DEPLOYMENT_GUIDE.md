# 🚀 Vercel 배포 및 커스텀 도메인 연결 가이드

## 📦 1단계: 코드 푸시 완료
✅ 이미 완료되었습니다!
- 최신 변경사항이 GitHub에 푸시되었습니다
- 브랜치: `main`
- 레포지토리: ProCodeJH/jahyeon-portfolio

## 🌐 2단계: Vercel에 배포하기

### 방법 A: Vercel CLI 사용 (빠름)

```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. Vercel 로그인
vercel login

# 3. 프로젝트 초기 배포
vercel

# 4. 프로덕션 배포
vercel --prod
```

### 방법 B: Vercel 웹사이트 사용 (권장)

1. **Vercel 계정 생성/로그인**
   - https://vercel.com 접속
   - GitHub 계정으로 로그인

2. **새 프로젝트 추가**
   - "Add New Project" 클릭
   - "Import Git Repository" 선택
   - `ProCodeJH/jahyeon-portfolio` 선택

3. **프로젝트 설정**
   ```
   Framework Preset: Other
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist/public
   Install Command: npm install
   ```

4. **환경 변수 추가** (중요!)
   Settings → Environment Variables로 이동하여 다음 변수들을 추가:

   ```
   DATABASE_URL=your_neon_database_url
   R2_ACCOUNT_ID=your_cloudflare_r2_account_id
   R2_ACCESS_KEY_ID=your_r2_access_key
   R2_SECRET_ACCESS_KEY=your_r2_secret_key
   R2_BUCKET_NAME=your_bucket_name
   R2_PUBLIC_URL=https://your-public-url
   ADMIN_PASSWORD=your_admin_password
   ```

5. **Deploy 클릭**

## 🌍 3단계: 커스텀 도메인 연결하기

### A. Vercel에서 도메인 추가

1. Vercel 프로젝트 대시보드 → **Settings** → **Domains**
2. "Add Domain" 클릭
3. 도메인 입력 (예: `yourdomain.com`)
4. Vercel이 제공하는 DNS 레코드 정보 확인

### B. DNS 설정 (도메인 등록 업체에서)

Vercel이 제공하는 DNS 레코드를 도메인 등록업체(GoDaddy, Namecheap, Gabia 등)에 추가하세요:

#### 옵션 1: A 레코드 사용 (권장)
```
Type: A
Name: @ (또는 비워두기)
Value: 76.76.21.21
TTL: Auto 또는 3600
```

```
Type: A
Name: www
Value: 76.76.21.21
TTL: Auto 또는 3600
```

#### 옵션 2: CNAME 레코드 사용
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: Auto 또는 3600
```

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto 또는 3600
```

### C. DNS 전파 대기

- DNS 변경사항이 전파되는 데 **최대 48시간** 소요될 수 있습니다
- 보통 **5-30분** 내에 적용됩니다
- 확인 방법:
  ```bash
  # DNS 확인
  nslookup yourdomain.com

  # 또는
  dig yourdomain.com
  ```

### D. SSL 자동 설정

Vercel이 자동으로 **Let's Encrypt SSL 인증서**를 발급합니다:
- HTTPS 자동 활성화
- 자동 갱신
- 추가 설정 불필요

## 🎯 4단계: 배포 확인

배포가 완료되면:
1. Vercel에서 제공하는 URL 확인 (예: `jahyeon-portfolio.vercel.app`)
2. 커스텀 도메인 접속 테스트
3. 다음 기능 확인:
   - ✅ 페이지 전환 애니메이션
   - ✅ 네비게이션 인터랙션
   - ✅ 마이크로 인터랙션 (hover 효과)
   - ✅ 반응형 디자인
   - ✅ 다크 모드

## 🔧 일반적인 문제 해결

### 문제 1: 빌드 실패
```bash
# 로컬에서 먼저 빌드 테스트
npm run build

# 에러 확인 후 수정
```

### 문제 2: 환경 변수 누락
- Vercel 대시보드에서 모든 환경 변수가 추가되었는지 확인
- Redeploy 클릭하여 재배포

### 문제 3: 도메인이 연결되지 않음
- DNS 레코드가 올바른지 확인
- 24-48시간 대기
- DNS 캐시 클리어: `ipconfig /flushdns` (Windows)

### 문제 4: API 라우트 404 에러
- `vercel.json` 파일의 rewrites 설정 확인
- 빌드 로그에서 에러 확인

## 📊 배포 후 모니터링

Vercel 대시보드에서 확인 가능:
- **Analytics**: 방문자 통계
- **Logs**: 실시간 로그
- **Deployments**: 배포 히스토리
- **Speed Insights**: 성능 분석

## 🎉 완료!

배포가 성공하면 다음 URL에서 포트폴리오를 확인할 수 있습니다:
- Vercel 기본 도메인: `https://jahyeon-portfolio.vercel.app`
- 커스텀 도메인: `https://yourdomain.com`

---

## 💡 추가 팁

### 자동 배포 설정
- `main` 브랜치에 푸시하면 자동 배포
- Pull Request마다 프리뷰 배포 생성

### 성능 최적화
- Vercel Edge Network를 통한 CDN 자동 적용
- 이미지 최적화 자동 적용
- Gzip/Brotli 압축 자동 적용

### 커스텀 도메인 이메일
- Vercel에서는 이메일 호스팅 미제공
- Google Workspace, ProtonMail 등 별도 이메일 서비스 사용 권장
