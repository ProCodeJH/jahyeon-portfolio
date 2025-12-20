# .com 도메인 설정 가이드

## 현재 상태
- ✅ 도메인: **www.jahyeon.com** (보유 중)
- Vercel 프로젝트: jahyeon-portfolio
- 목표: www.jahyeon.com을 Vercel 프로젝트에 연결

## 도메인 연결 방법 (www.jahyeon.com)

### 1. Vercel에 도메인 연결

#### Vercel 대시보드에서:
1. https://vercel.com/dashboard 접속
2. **jahyeon-portfolio** 프로젝트 선택
3. **Settings** → **Domains** 클릭
4. 도메인 입력: `www.jahyeon.com` 또는 `jahyeon.com`
5. **Add** 버튼 클릭

#### 권장 설정:
- `jahyeon.com` (apex/root domain) → Vercel
- `www.jahyeon.com` → Vercel (자동 리다이렉트)

### 2. DNS 설정

도메인 등록 업체 (Namecheap, GoDaddy 등)의 DNS 관리 페이지에서:

#### Option A: Vercel Nameservers (권장)
Vercel의 네임서버를 사용하면 자동으로 모든 설정 완료:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

#### Option B: 직접 DNS 레코드 설정
```
Type: A
Name: @ (또는 jahyeon.com)
Value: 76.76.21.21
TTL: 3600

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

⚠️ **중요**: DNS 변경 후 적용까지 최대 48시간 소요 (보통 10분~2시간)

### 3. 쿠키 도메인 설정 (선택사항)

현재 `server/_core/cookies.ts`에서 domain 설정이 주석 처리되어 있습니다.
커스텀 도메인을 사용하려면 주석을 해제하세요:

```typescript
// server/_core/cookies.ts

export function getSessionCookieOptions(req: Request) {
  const hostname = req.hostname;
  const shouldSetDomain =
    hostname &&
    !LOCAL_HOSTS.has(hostname) &&
    !isIpAddress(hostname) &&
    hostname !== "127.0.0.1" &&
    hostname !== "::1";

  const domain =
    shouldSetDomain && !hostname.startsWith(".")
      ? `.${hostname}`
      : shouldSetDomain
        ? hostname
        : undefined;

  return {
    domain,  // 주석 해제
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req),
  };
}
```

### 4. 환경 변수 (필요시)
만약 애플리케이션에서 도메인을 사용해야 한다면, Vercel 대시보드에서:
```bash
# Settings → Environment Variables
DOMAIN=jahyeon.com
SITE_URL=https://www.jahyeon.com
```

### 5. 빠른 설정 체크리스트
- [ ] Vercel 대시보드에서 `jahyeon.com` 추가
- [ ] 도메인 등록 업체에서 DNS 레코드 설정
- [ ] SSL 인증서 자동 발급 확인 (Vercel이 자동 처리, 보통 5분 이내)
- [ ] `https://www.jahyeon.com` 접속 테스트
- [ ] `https://jahyeon.com` 접속 테스트 (www 리다이렉트 확인)

## 완료 후 확인사항
- [ ] 도메인이 정상적으로 연결되었는지 확인: `https://www.jahyeon.com`
- [ ] SSL 인증서 자동 발급 확인 (Vercel이 자동 처리, 🔒 자물쇠 표시)
- [ ] www 서브도메인 리다이렉트 확인 (`jahyeon.com` → `www.jahyeon.com`)
- [ ] 쿠키가 정상 작동하는지 로그인 테스트 (Admin 페이지)
- [ ] 모바일에서도 접속 확인

## 문제 해결

### DNS 변경이 적용되지 않는 경우
```bash
# DNS 전파 확인
https://dnschecker.org

# 도메인: jahyeon.com
# Type: A 또는 CNAME
```

### SSL 인증서 오류
1. Vercel 대시보드 → Domains에서 도메인 상태 확인
2. "Refresh" 버튼 클릭
3. 여전히 오류 시 도메인 삭제 후 재추가

### 연락처
- Vercel 지원: https://vercel.com/support
- 도메인 등록 업체 지원 센터
