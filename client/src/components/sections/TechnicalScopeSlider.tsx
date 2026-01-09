import { useState, useRef } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Code,
    Database,
    Globe,
    Smartphone,
    Server,
    Shield,
    Cpu,
    Palette,
    Layers,
    Zap,
    Cloud,
    Terminal,
    Lock,
    Monitor,
    Wifi,
    Box
} from "lucide-react";
import { AnimatedSection } from "@/components/animations/AnimatedSection";

// 800 Technical Scope Items organized by category
// Sorted from Easy → Complex
const TECHNICAL_CATEGORIES = [
    {
        id: "frontend",
        name: "프론트엔드",
        icon: Monitor,
        color: "from-purple-500 to-pink-500",
        items: [
            "HTML5 시맨틱 마크업", "CSS3 애니메이션", "반응형 디자인", "Flexbox 레이아웃", "Grid 시스템",
            "SASS/SCSS", "CSS-in-JS", "Tailwind CSS", "Bootstrap 5", "Material UI",
            "JavaScript ES6+", "TypeScript", "DOM 조작", "이벤트 처리", "비동기 프로그래밍",
            "React 18", "React Hooks", "Redux Toolkit", "Zustand", "Jotai",
            "Next.js 14", "Vite", "Webpack 5", "Babel", "ESLint",
            "Vue.js 3", "Nuxt.js", "Vuex", "Pinia", "Vue Router",
            "Angular 17", "RxJS", "NgRx", "Angular CLI", "Angular Material",
            "Svelte", "SvelteKit", "Three.js", "WebGL", "GSAP",
            "Framer Motion", "Lottie", "Canvas API", "SVG 애니메이션", "CSS Variables",
            "Web Components", "Shadow DOM", "Custom Elements", "Lit", "Stencil"
        ]
    },
    {
        id: "backend",
        name: "백엔드",
        icon: Server,
        color: "from-blue-500 to-cyan-500",
        items: [
            "Node.js", "Express.js", "Fastify", "Koa", "Hono",
            "Python", "Flask", "Django", "FastAPI", "uvicorn",
            "Java", "Spring Boot", "Spring Security", "JPA/Hibernate", "Maven",
            "Go", "Gin", "Echo", "Fiber", "gRPC",
            "Rust", "Actix", "Rocket", "Tokio", "Axum",
            "PHP", "Laravel", "Symfony", "Composer", "Doctrine",
            "Ruby", "Rails", "Sinatra", "Rack", "ActiveRecord",
            "C#", ".NET Core", "ASP.NET", "Entity Framework", "Blazor",
            "GraphQL", "Apollo Server", "tRPC", "REST API", "WebSocket",
            "Message Queue", "RabbitMQ", "Kafka", "Redis Pub/Sub", "NATS"
        ]
    },
    {
        id: "database",
        name: "데이터베이스",
        icon: Database,
        color: "from-emerald-500 to-teal-500",
        items: [
            "MySQL", "PostgreSQL", "MariaDB", "SQLite", "SQL Server",
            "MongoDB", "Redis", "Elasticsearch", "Cassandra", "DynamoDB",
            "Firebase Firestore", "Supabase", "PlanetScale", "Neon", "CockroachDB",
            "Prisma ORM", "Drizzle ORM", "TypeORM", "Sequelize", "Knex.js",
            "데이터 모델링", "인덱스 최적화", "쿼리 튜닝", "파티셔닝", "샤딩",
            "백업/복구", "복제(Replication)", "트랜잭션 관리", "ACID", "CAP 정리",
            "시계열 DB", "InfluxDB", "TimescaleDB", "ClickHouse", "QuestDB",
            "그래프 DB", "Neo4j", "ArangoDB", "Dgraph", "JanusGraph",
            "벡터 DB", "Pinecone", "Weaviate", "Milvus", "Chroma"
        ]
    },
    {
        id: "mobile",
        name: "모바일",
        icon: Smartphone,
        color: "from-orange-500 to-amber-500",
        items: [
            "React Native", "Expo", "React Navigation", "Reanimated", "NativeBase",
            "Flutter", "Dart", "GetX", "Riverpod", "BLoC",
            "iOS Swift", "SwiftUI", "UIKit", "Combine", "CoreData",
            "Android Kotlin", "Jetpack Compose", "Room", "Hilt", "Coroutines",
            "Capacitor", "Ionic", "Cordova", "PWA", "Service Workers",
            "푸시 알림", "FCM", "APNs", "OneSignal", "Pusher",
            "앱스토어 배포", "구글 플레이 배포", "앱 서명", "TestFlight", "앱 번들",
            "인앱 결제", "StoreKit", "Google Play Billing", "RevenueCat", "Paddle"
        ]
    },
    {
        id: "devops",
        name: "DevOps/인프라",
        icon: Cloud,
        color: "from-sky-500 to-blue-500",
        items: [
            "Git", "GitHub", "GitLab", "Bitbucket", "Git Flow",
            "Docker", "Docker Compose", "Kubernetes", "Helm", "Kind",
            "AWS EC2", "AWS S3", "AWS Lambda", "AWS RDS", "AWS CloudFront",
            "GCP Compute", "Cloud Run", "Cloud Functions", "BigQuery", "GKE",
            "Azure VM", "Azure Functions", "Azure DevOps", "Cosmos DB", "AKS",
            "Vercel", "Netlify", "Railway", "Render", "Fly.io",
            "CI/CD", "GitHub Actions", "Jenkins", "CircleCI", "ArgoCD",
            "Terraform", "Pulumi", "CloudFormation", "Ansible", "Chef",
            "모니터링", "Prometheus", "Grafana", "Datadog", "New Relic",
            "로깅", "ELK Stack", "Loki", "Fluentd", "Sentry"
        ]
    },
    {
        id: "security",
        name: "보안",
        icon: Shield,
        color: "from-red-500 to-rose-500",
        items: [
            "HTTPS/SSL/TLS", "인증서 관리", "Let's Encrypt", "SSL Pinning", "HSTS",
            "OAuth 2.0", "OpenID Connect", "JWT", "세션 관리", "SAML",
            "비밀번호 해싱", "bcrypt", "Argon2", "scrypt", "PBKDF2",
            "XSS 방지", "CSRF 방지", "SQL Injection 방지", "입력 검증", "출력 인코딩",
            "CORS 설정", "CSP", "Rate Limiting", "DDoS 방어", "WAF",
            "암호화", "AES", "RSA", "데이터 마스킹", "키 관리",
            "접근 제어", "RBAC", "ABAC", "MFA", "생체인증",
            "취약점 스캔", "펜테스팅", "OWASP Top 10", "보안 감사", "SOC 2"
        ]
    },
    {
        id: "ai",
        name: "AI/ML",
        icon: Cpu,
        color: "from-violet-500 to-purple-500",
        items: [
            "OpenAI API", "GPT-4", "ChatGPT 통합", "Embeddings", "Fine-tuning",
            "Claude API", "Anthropic", "Langchain", "LlamaIndex", "RAG",
            "Gemini API", "PaLM", "Vertex AI", "AutoML", "Vision AI",
            "Hugging Face", "Transformers", "BERT", "Llama", "Mistral",
            "TensorFlow", "Keras", "TensorFlow Lite", "TensorFlow.js", "TF Serving",
            "PyTorch", "torchvision", "Lightning", "ONNX", "TorchScript",
            "scikit-learn", "XGBoost", "LightGBM", "CatBoost", "AutoML",
            "자연어 처리", "감정 분석", "텍스트 분류", "개체명 인식", "기계 번역",
            "컴퓨터 비전", "이미지 분류", "객체 탐지", "OCR", "얼굴 인식",
            "음성 인식", "TTS", "Whisper", "ElevenLabs", "음성 합성"
        ]
    },
    {
        id: "design",
        name: "디자인/UX",
        icon: Palette,
        color: "from-pink-500 to-rose-500",
        items: [
            "Figma", "Sketch", "Adobe XD", "Photoshop", "Illustrator",
            "UI 디자인", "UX 리서치", "와이어프레임", "프로토타이핑", "디자인 시스템",
            "컬러 이론", "타이포그래피", "아이콘 디자인", "일러스트레이션", "모션 디자인",
            "사용성 테스트", "A/B 테스트", "히트맵 분석", "사용자 여정", "페르소나",
            "접근성(a11y)", "WCAG 2.1", "스크린 리더", "키보드 네비게이션", "색상 대비",
            "다크 모드", "라이트 모드", "테마 시스템", "CSS 변수", "디자인 토큰",
            "마이크로 인터랙션", "로딩 애니메이션", "트랜지션", "스크롤 애니메이션", "패럴랙스"
        ]
    },
    {
        id: "testing",
        name: "테스트/QA",
        icon: Terminal,
        color: "from-lime-500 to-green-500",
        items: [
            "Jest", "Vitest", "Mocha", "Chai", "Sinon",
            "React Testing Library", "Vue Test Utils", "Enzyme", "Cypress", "Playwright",
            "Selenium", "WebdriverIO", "Puppeteer", "Appium", "Detox",
            "단위 테스트", "통합 테스트", "E2E 테스트", "스냅샷 테스트", "시각적 회귀 테스트",
            "TDD", "BDD", "코드 커버리지", "Istanbul", "Codecov",
            "성능 테스트", "JMeter", "k6", "Artillery", "Locust",
            "API 테스트", "Postman", "Insomnia", "REST Client", "GraphQL Playground"
        ]
    },
    {
        id: "integration",
        name: "결제/통합",
        icon: Zap,
        color: "from-yellow-500 to-orange-500",
        items: [
            "Stripe", "PayPal", "Paddle", "Lemon Squeezy", "Gumroad",
            "토스페이먼츠", "아임포트", "NHN KCP", "이니시스", "나이스페이",
            "카카오페이", "네이버페이", "삼성페이", "Apple Pay", "Google Pay",
            "정기결제", "구독 관리", "인보이스", "환불 처리", "결제 분석",
            "소셜 로그인", "카카오 로그인", "네이버 로그인", "구글 로그인", "애플 로그인",
            "OAuth 제공자", "Auth0", "Clerk", "NextAuth.js", "Supabase Auth",
            "이메일", "SendGrid", "Mailgun", "AWS SES", "Postmark",
            "SMS", "Twilio", "CoolSMS", "알리고", "문자인증",
            "채팅", "채널톡", "Intercom", "Zendesk", "Crisp"
        ]
    },
    {
        id: "architecture",
        name: "아키텍처",
        icon: Layers,
        color: "from-indigo-500 to-violet-500",
        items: [
            "모놀리식", "마이크로서비스", "서버리스", "이벤트 기반", "CQRS",
            "도메인 주도 설계", "헥사고날 아키텍처", "클린 아키텍처", "레이어드 아키텍처", "MVC",
            "API Gateway", "서비스 메시", "Istio", "Linkerd", "Envoy",
            "로드 밸런싱", "Nginx", "HAProxy", "Traefik", "Caddy",
            "캐싱 전략", "CDN", "엣지 컴퓨팅", "Cloudflare", "Fastly",
            "분산 시스템", "CAP 정리", "일관성 모델", "사가 패턴", "2PC",
            "확장성 설계", "수평 확장", "수직 확장", "오토스케일링", "부하 테스트"
        ]
    },
    {
        id: "iot",
        name: "IoT/임베디드",
        icon: Wifi,
        color: "from-cyan-500 to-teal-500",
        items: [
            "Arduino", "ESP32", "ESP8266", "Raspberry Pi", "STM32",
            "C/C++", "MicroPython", "CircuitPython", "PlatformIO", "Arduino IDE",
            "센서 인터페이스", "I2C", "SPI", "UART", "GPIO",
            "블루투스", "BLE", "WiFi", "LoRa", "Zigbee",
            "MQTT", "CoAP", "HTTP/REST", "WebSocket", "AMQP",
            "펌웨어 업데이트", "OTA", "부트로더", "플래시 메모리", "EEPROM",
            "실시간 시스템", "RTOS", "FreeRTOS", "Zephyr", "임베디드 리눅스",
            "PCB 설계", "회로도", "Eagle", "KiCad", "Altium"
        ]
    },
    {
        id: "blockchain",
        name: "블록체인/Web3",
        icon: Box,
        color: "from-amber-500 to-yellow-500",
        items: [
            "Ethereum", "Solidity", "Hardhat", "Foundry", "Truffle",
            "Web3.js", "Ethers.js", "Wagmi", "Viem", "RainbowKit",
            "스마트 컨트랙트", "ERC-20", "ERC-721", "ERC-1155", "업그레이더블 컨트랙트",
            "DeFi", "DEX", "AMM", "유동성 풀", "스테이킹",
            "NFT", "NFT 마켓플레이스", "IPFS", "Arweave", "메타데이터",
            "Polygon", "Arbitrum", "Optimism", "Base", "zkSync",
            "지갑 연동", "MetaMask", "WalletConnect", "Coinbase Wallet", "Safe"
        ]
    },
    {
        id: "realtime",
        name: "실시간/협업",
        icon: Globe,
        color: "from-rose-500 to-pink-500",
        items: [
            "WebSocket", "Socket.io", "Pusher", "Ably", "PubNub",
            "Firebase Realtime DB", "Supabase Realtime", "Convex", "LiveBlocks", "Yjs",
            "실시간 채팅", "그룹 채팅", "1:1 채팅", "채팅 기록", "읽음 표시",
            "화상 회의", "WebRTC", "Twilio Video", "Agora", "Daily.co",
            "화면 공유", "미디어 스트리밍", "HLS", "DASH", "WebM",
            "실시간 협업", "동시 편집", "OT/CRDT", "커서 공유", "변경 이력",
            "알림 시스템", "인앱 알림", "푸시 알림", "이메일 알림", "웹훅"
        ]
    },
    {
        id: "performance",
        name: "성능 최적화",
        icon: Zap,
        color: "from-green-500 to-emerald-500",
        items: [
            "Core Web Vitals", "LCP", "FID", "CLS", "INP",
            "코드 스플리팅", "Lazy Loading", "Tree Shaking", "번들 최적화", "압축",
            "이미지 최적화", "WebP", "AVIF", "반응형 이미지", "Image CDN",
            "캐싱", "브라우저 캐시", "서비스 워커", "HTTP 캐시", "stale-while-revalidate",
            "렌더링 최적화", "SSR", "SSG", "ISR", "Streaming SSR",
            "메모이제이션", "React.memo", "useMemo", "useCallback", "가상화",
            "웹 워커", "SharedArrayBuffer", "OffscreenCanvas", "WASM", "Comlink"
        ]
    },
    {
        id: "cms",
        name: "CMS/콘텐츠",
        icon: Code,
        color: "from-slate-500 to-zinc-500",
        items: [
            "Headless CMS", "Strapi", "Contentful", "Sanity", "Hygraph",
            "WordPress", "Drupal", "Ghost", "Payload CMS", "KeystoneJS",
            "노션 API", "Notion as CMS", "Markdown", "MDX", "Rich Text",
            "미디어 관리", "Cloudinary", "imgix", "Uploadcare", "Transloadit",
            "검색 엔진", "Algolia", "MeiliSearch", "Typesense", "Fuse.js",
            "다국어", "i18n", "next-intl", "react-i18next", "로케일 관리",
            "SEO", "메타 태그", "구조화 데이터", "사이트맵", "robots.txt"
        ]
    }
];

// Calculate total items
const TOTAL_ITEMS = TECHNICAL_CATEGORIES.reduce((sum, cat) => sum + cat.items.length, 0);

export function TechnicalScopeSlider() {
    const [activeCategory, setActiveCategory] = useState(TECHNICAL_CATEGORIES[0].id);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const activeData = TECHNICAL_CATEGORIES.find(c => c.id === activeCategory);

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
        }
    };

    return (
        <section className="py-24 md:py-40 lg:py-48 px-4 md:px-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-20 left-10 w-80 md:w-[600px] h-80 md:h-[600px] bg-gradient-to-r from-purple-600/15 to-pink-600/15 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-20 right-10 w-96 md:w-[700px] h-96 md:h-[700px] bg-gradient-to-r from-cyan-500/15 to-blue-600/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Section Header */}
                <AnimatedSection>
                    <div className="text-center mb-16 md:mb-24">
                        <div className="inline-flex items-center gap-2 md:gap-3 px-5 md:px-8 py-3 md:py-4 rounded-full bg-purple-500/10 border border-purple-500/30 backdrop-blur-xl mb-6 md:mb-8">
                            <Sparkles className="w-5 md:w-6 h-5 md:h-6 text-purple-400 animate-spin" style={{ animationDuration: '3s' }} />
                            <span className="text-sm md:text-base font-bold text-purple-400 tracking-wider uppercase">Technical Expertise</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 md:mb-8 tracking-tight">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 animate-gradient-x">
                                기술 역량
                            </span>
                        </h2>
                        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-4">
                            <span className="text-purple-400 font-bold text-3xl md:text-4xl">{TOTAL_ITEMS}+</span> 가지 기술 스택을 활용한
                            <br className="hidden md:block" />
                            <span className="text-cyan-400 font-semibold">풀스택 개발 역량</span>
                        </p>
                        <div className="w-32 md:w-48 h-2 md:h-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full mx-auto" style={{ boxShadow: '0 0 30px rgba(168, 85, 247, 0.6)' }} />
                    </div>
                </AnimatedSection>

                {/* Category Tabs */}
                <AnimatedSection delay={100}>
                    <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12 md:mb-16">
                        {TECHNICAL_CATEGORIES.map((cat) => {
                            const Icon = cat.icon;
                            const isActive = activeCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`group flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 rounded-2xl text-sm md:text-base font-bold transition-all duration-500 ${isActive
                                        ? `bg-gradient-to-r ${cat.color} text-white shadow-xl`
                                        : "bg-white/5 text-gray-400 border border-white/10 hover:border-purple-500/50 hover:text-white"
                                        }`}
                                    style={isActive ? { boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)' } : {}}
                                >
                                    <Icon className="w-5 h-5 md:w-6 md:h-6" />
                                    <span className="hidden sm:inline">{cat.name}</span>
                                    <span className="text-xs opacity-70">({cat.items.length})</span>
                                </button>
                            );
                        })}
                    </div>
                </AnimatedSection>

                {/* Items Slider */}
                <AnimatedSection delay={200}>
                    <div className="relative">
                        {/* Navigation Arrows */}
                        <button
                            onClick={scrollLeft}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#12121a]/90 border border-white/20 flex items-center justify-center text-white hover:bg-purple-600 transition-all shadow-xl"
                            style={{ boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
                        >
                            <ChevronLeft className="w-7 h-7 md:w-8 md:h-8" />
                        </button>
                        <button
                            onClick={scrollRight}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#12121a]/90 border border-white/20 flex items-center justify-center text-white hover:bg-purple-600 transition-all shadow-xl"
                            style={{ boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
                        >
                            <ChevronRight className="w-7 h-7 md:w-8 md:h-8" />
                        </button>

                        {/* Gradient Overlays */}
                        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-[#0a0a1a] to-transparent z-10 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-[#0a0a1a] to-transparent z-10 pointer-events-none" />

                        {/* Scrollable Container */}
                        <div
                            ref={scrollContainerRef}
                            className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-6 scrollbar-hide px-12 md:px-16"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {activeData?.items.map((item, index) => {
                                const Icon = activeData.icon;
                                return (
                                    <div
                                        key={`${activeCategory}-${index}`}
                                        className="group flex-shrink-0 w-[180px] md:w-[220px] lg:w-[260px] snap-center"
                                    >
                                        <div
                                            className={`relative h-[140px] md:h-[160px] lg:h-[180px] rounded-2xl md:rounded-3xl bg-[#12121a] border border-white/10 hover:border-purple-500/50 transition-all duration-500 p-5 md:p-6 flex flex-col justify-between overflow-hidden group-hover:scale-105`}
                                        >
                                            {/* Glow Effect */}
                                            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${activeData.color} opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-500`} />

                                            {/* Number Badge */}
                                            <div className="flex items-start justify-between">
                                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 flex items-center justify-center">
                                                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                                                </div>
                                                <span className="text-xs md:text-sm text-gray-600 font-mono">#{String(index + 1).padStart(2, '0')}</span>
                                            </div>

                                            {/* Item Name */}
                                            <h4 className="text-base md:text-lg lg:text-xl font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                                                {item}
                                            </h4>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Progress Indicator */}
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <span className="text-gray-500 text-sm">
                                {activeData?.name} 카테고리: <span className="text-purple-400 font-bold">{activeData?.items.length}</span>개 기술
                            </span>
                        </div>
                    </div>
                </AnimatedSection>


            </div>
        </section>
    );
}
