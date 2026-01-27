# 📱 Jahyeon Admin App

> **React Native + Firebase 기반 실시간 고객 상담 모바일 앱**  
> 웹사이트 방문자와 언제 어디서나 소통할 수 있는 서버리스 채팅 관리 시스템

[![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2053-000020?logo=expo)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime%20DB-FFCA28?logo=firebase)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)

---

## 🎯 프로젝트 소개

**Jahyeon Admin**은 [jahyeon.com](https://www.jahyeon.com) 포트폴리오 웹사이트의 방문자 채팅을 **모바일에서 실시간으로 관리**할 수 있는 관리자 앱입니다.

### ✨ 주요 기능

- 📬 **실시간 메시지 알림** - 새 메시지 즉시 확인
- 💬 **실시간 채팅** - 방문자와 즉각적인 소통
- 🔐 **관리자 인증** - Firebase Authentication 보안
- 🌙 **다크/라이트 모드** - 사용자 환경에 맞는 테마
- ✨ **Glassmorphism UI** - 프리미엄 디자인

---

## 🛠 기술 스택

### 📱 Mobile App
| 기술 | 설명 | 사용 기업 |
|------|------|----------|
| **React Native** | 크로스 플랫폼 앱 개발 | Facebook, Instagram, Uber Eats |
| **Expo** | React Native 개발 프레임워크 | Coinbase, Discord |
| **TypeScript** | 타입 안정성 | Microsoft, Slack |
| **Zustand** | 경량 상태 관리 | - |

### 🔥 Backend (Serverless)
| 서비스 | 역할 |
|--------|------|
| **Firebase Realtime Database** | 실시간 채팅 동기화 |
| **Firebase Authentication** | 관리자 로그인/보안 |
| **Firebase Cloud Messaging** | 푸시 알림 |

### 🎨 UI/UX
- Glassmorphism Design
- React Native Reanimated (Animations)
- Linear Gradient Effects

---

## 💰 상용 서비스 비교

| 서비스 | 월 비용 | 특징 |
|--------|---------|------|
| Zendesk Chat | $55+/월 | 실시간 채팅 |
| Intercom | $74+/월 | 고객 상담 |
| 채널톡 | ₩36,000+/월 | 웹채팅 + 모바일 |
| **Jahyeon Admin** | **₩0** | 직접 개발 ✅ |

> 💎 **개발 외주 시 예상 비용:** 500만원 ~ 1,500만원  
> 💎 **연간 SaaS 비용 절감:** 50만원+

---

## 🚀 시작하기

### 필수 조건
- Node.js 18+
- npm 또는 yarn
- Expo Go 앱 (테스트용)

### 설치

```bash
# 1. 저장소 클론
git clone https://github.com/ProCodeJH/jahyeon-admin-app.git
cd jahyeon-admin-app

# 2. 의존성 설치
npm install

# 3. 개발 서버 시작
npx expo start
```

### 테스트 방법

1. **Expo Go 앱** 설치 (iOS/Android)
2. QR 코드 스캔
3. 관리자 계정으로 로그인

---

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── chat/          # 채팅 관련 컴포넌트
│   │   ├── ChatBubble.tsx
│   │   ├── ChatListItem.tsx
│   │   └── MessageInput.tsx
│   └── ui/            # 공통 UI 컴포넌트
│       ├── GlassCard.tsx
│       └── PremiumButton.tsx
├── screens/           # 화면
│   ├── LoginScreen.tsx
│   ├── ChatListScreen.tsx
│   ├── ChatRoomScreen.tsx
│   └── SettingsScreen.tsx
├── lib/               # 유틸리티
│   ├── firebase.ts    # Firebase 설정
│   └── store.ts       # Zustand 스토어
└── styles/            # 스타일 시스템
    ├── colors.ts
    └── typography.ts
```

---

## 🏢 활용 분야

| 분야 | 활용 예시 |
|------|----------|
| 포트폴리오/개인 사이트 | 방문자 문의 실시간 응대 |
| 소규모 쇼핑몰 | 고객 상담 |
| 프리랜서 | 클라이언트 실시간 소통 |
| 스타트업 | 초기 고객 응대 (비용 절감) |
| 학원/교육업 | 학부모 문의 |

---

## 📄 라이선스

MIT License © 2026 Jahyeon

---

## 👨‍💻 개발자

**구자현 (Jahyeon Gu)**
- 🌐 [jahyeon.com](https://www.jahyeon.com)
- 📧 admin@jahyeon.com
