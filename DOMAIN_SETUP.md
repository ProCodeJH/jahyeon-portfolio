# .com 도메인 설정 가이드

## 현재 상태
- Vercel에 배포된 프로젝트
- 기본 Vercel 도메인 사용 중

## .com 도메인 연결 방법

### 1. 도메인 구매
다음 사이트에서 .com 도메인을 구매할 수 있습니다:
- Namecheap (추천)
- GoDaddy
- Google Domains
- Cloudflare

### 2. Vercel에 도메인 연결

#### Vercel 대시보드에서:
1. https://vercel.com/dashboard 접속
2. 프로젝트 선택
3. Settings → Domains 클릭
4. 구매한 도메인 입력 (예: yourdomain.com)
5. Add 버튼 클릭

#### DNS 설정:
Vercel이 제공하는 DNS 레코드를 도메인 등록 사이트에 추가:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

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
만약 애플리케이션에서 도메인을 사용해야 한다면:
```bash
# .env
DOMAIN=yourdomain.com
SITE_URL=https://yourdomain.com
```

## 완료 후 확인사항
- [ ] 도메인이 정상적으로 연결되었는지 확인
- [ ] SSL 인증서 자동 발급 확인 (Vercel이 자동 처리)
- [ ] www 서브도메인 리다이렉트 확인
- [ ] 쿠키가 정상 작동하는지 로그인 테스트
