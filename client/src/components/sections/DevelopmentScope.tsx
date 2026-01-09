import { useState } from "react";
import {
    Package,
    Zap,
    Crown,
    Building2,
    Check,
    ChevronRight,
    MessageSquare,
    Shield,
    Gauge,
    Server,
    CreditCard,
    Users,
    Lock,
    Rocket,
    ArrowRight,
    Send,
    Sparkles
} from "lucide-react";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { TiltCard } from "@/components/effects/TiltCard";

// Package definitions
const packages = [
    {
        id: "starter",
        name: "Starter",
        nameKo: "스타터",
        price: "₩300만 ~",
        description: "소규모 프로젝트 및 랜딩페이지에 적합",
        icon: Package,
        color: "from-emerald-500 to-teal-500",
        features: [
            "반응형 웹 디자인",
            "기본 페이지 (최대 5개)",
            "연락처 폼",
            "기본 SEO 최적화",
            "1개월 무상 유지보수"
        ],
        popular: false
    },
    {
        id: "standard",
        name: "Standard",
        nameKo: "스탠다드",
        price: "₩800만 ~",
        description: "중소규모 비즈니스 웹사이트에 최적화",
        icon: Zap,
        color: "from-purple-500 to-pink-500",
        features: [
            "Starter 패키지 전체 포함",
            "페이지 확장 (최대 15개)",
            "회원 시스템 (로그인/가입)",
            "관리자 대시보드",
            "기본 결제 연동",
            "3개월 무상 유지보수"
        ],
        popular: true
    },
    {
        id: "pro",
        name: "Pro",
        nameKo: "프로",
        price: "₩2,000만 ~",
        description: "고급 기능이 필요한 대규모 프로젝트",
        icon: Crown,
        color: "from-orange-500 to-amber-500",
        features: [
            "Standard 패키지 전체 포함",
            "무제한 페이지",
            "고급 관리자 기능",
            "실시간 채팅/알림",
            "다중 결제 시스템",
            "성능 최적화",
            "6개월 무상 유지보수"
        ],
        popular: false
    },
    {
        id: "enterprise",
        name: "Enterprise",
        nameKo: "엔터프라이즈",
        price: "별도 협의",
        description: "대기업급 맞춤형 솔루션",
        icon: Building2,
        color: "from-cyan-500 to-blue-500",
        features: [
            "Pro 패키지 전체 포함",
            "맞춤형 아키텍처 설계",
            "전용 인프라 구축",
            "24/7 기술 지원",
            "SLA 보장",
            "전담 PM 배정",
            "연간 유지보수 계약"
        ],
        popular: false
    }
];

// Functional options
const functionalOptions = [
    { name: "회원 관리 시스템", description: "로그인, 회원가입, 프로필 관리", price: "₩150만 ~", icon: Users },
    { name: "관리자 페이지", description: "콘텐츠/회원/주문 관리 대시보드", price: "₩200만 ~", icon: Shield },
    { name: "결제 시스템", description: "국내외 PG 연동, 정기결제", price: "₩300만 ~", icon: CreditCard },
    { name: "실시간 기능", description: "채팅, 알림, 실시간 업데이트", price: "₩250만 ~", icon: MessageSquare },
    { name: "배포 및 인프라", description: "AWS/GCP 구축, CI/CD, 모니터링", price: "₩150만 ~", icon: Server },
];

// Non-functional requirements
const nonFunctionalReqs = [
    { name: "성능 최적화", description: "Core Web Vitals 최적화, CDN 구성", icon: Gauge },
    { name: "보안 강화", description: "HTTPS, XSS/CSRF 방지, 데이터 암호화", icon: Lock },
    { name: "확장성 설계", description: "마이크로서비스, 로드밸런싱, 오토스케일링", icon: Rocket },
];

interface QuoteFormData {
    projectType: string;
    coreFeatures: string;
    timeline: string;
    budgetRange: string;
    referenceSites: string;
    name: string;
    email: string;
    phone: string;
    message: string;
}

export function DevelopmentScope() {
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState<QuoteFormData>({
        projectType: "",
        coreFeatures: "",
        timeline: "",
        budgetRange: "",
        referenceSites: "",
        name: "",
        email: "",
        phone: "",
        message: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitResult(null);

        try {
            const response = await fetch("/api/quote-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                setSubmitResult({ success: true, message: "견적 요청이 성공적으로 전송되었습니다!" });
                setFormData({
                    projectType: "",
                    coreFeatures: "",
                    timeline: "",
                    budgetRange: "",
                    referenceSites: "",
                    name: "",
                    email: "",
                    phone: "",
                    message: ""
                });
                setIsFormOpen(false);
            } else {
                setSubmitResult({ success: false, message: result.message || "전송 중 오류가 발생했습니다." });
            }
        } catch {
            setSubmitResult({ success: false, message: "네트워크 오류가 발생했습니다." });
        } finally {
            setIsSubmitting(false);
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
                            <span className="text-sm md:text-base font-bold text-purple-400 tracking-wider uppercase">Development Scope</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 md:mb-8 tracking-tight">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 animate-gradient-x">
                                합리적 견적 제안
                            </span>
                        </h2>
                        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-6">
                            기준 + 옵션 + 맞춤 <span className="text-purple-400 font-semibold">3단계 하이브리드 가격 구조</span>로
                            <br className="hidden md:block" />
                            투명하고 합리적인 견적을 제안합니다.
                        </p>
                        <div className="w-32 md:w-48 h-2 md:h-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full mx-auto" style={{ boxShadow: '0 0 30px rgba(168, 85, 247, 0.6)' }} />
                    </div>
                </AnimatedSection>

                {/* Stage 1: Package Cards */}
                <div className="mb-24 md:mb-32">
                    <AnimatedSection>
                        <h3 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
                            <span className="text-purple-400">Stage 1.</span> 패키지 기반 견적
                        </h3>
                        <p className="text-gray-400 text-center mb-12 text-lg">프로젝트 규모에 맞는 패키지를 선택하세요</p>
                    </AnimatedSection>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {packages.map((pkg, idx) => (
                            <AnimatedSection key={pkg.id} delay={idx * 100}>
                                <TiltCard sensitivity={8}>
                                    <div
                                        className={`group relative h-full rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 ${selectedPackage === pkg.id
                                                ? 'ring-2 ring-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.3)]'
                                                : ''
                                            }`}
                                        onClick={() => setSelectedPackage(pkg.id)}
                                    >
                                        {/* Popular Badge */}
                                        {pkg.popular && (
                                            <div className="absolute top-4 right-4 z-20">
                                                <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-xs font-bold tracking-wider uppercase" style={{ boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)' }}>
                                                    인기
                                                </span>
                                            </div>
                                        )}

                                        {/* Glow Border */}
                                        <div className={`absolute -inset-0.5 bg-gradient-to-r ${pkg.color} rounded-3xl opacity-0 group-hover:opacity-100 blur transition-all duration-500`} />

                                        <div className="relative h-full bg-[#12121a] rounded-3xl border border-white/10 p-6 md:p-8 flex flex-col group-hover:border-purple-500/50 transition-all duration-500">
                                            {/* Icon */}
                                            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${pkg.color}/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                                                <pkg.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                                            </div>

                                            {/* Name & Price */}
                                            <h4 className="text-xl md:text-2xl font-bold text-white mb-1">{pkg.name}</h4>
                                            <p className="text-gray-500 text-sm mb-4">{pkg.nameKo}</p>

                                            <div className="mb-4">
                                                <span className={`text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r ${pkg.color}`}>
                                                    {pkg.price}
                                                </span>
                                                {pkg.id !== "enterprise" && <span className="text-gray-500 text-sm ml-1">부터</span>}
                                            </div>

                                            <p className="text-gray-400 text-sm mb-6">{pkg.description}</p>

                                            {/* Features */}
                                            <ul className="space-y-3 flex-1">
                                                {pkg.features.map((feature, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                                        <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            {/* CTA */}
                                            <button
                                                className={`mt-6 w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${selectedPackage === pkg.id
                                                        ? `bg-gradient-to-r ${pkg.color} text-white`
                                                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                                    }`}
                                            >
                                                {selectedPackage === pkg.id ? '선택됨' : '선택하기'}
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </TiltCard>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>

                {/* Stage 2: Options & Scope */}
                <div className="mb-24 md:mb-32">
                    <AnimatedSection>
                        <h3 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
                            <span className="text-cyan-400">Stage 2.</span> 기능 옵션 선택
                        </h3>
                        <p className="text-gray-400 text-center mb-12 text-lg">필요한 기능을 추가하여 맞춤형 견적을 구성하세요</p>
                    </AnimatedSection>

                    {/* Functional Options */}
                    <div className="mb-16">
                        <h4 className="text-xl font-bold text-purple-400 mb-6 flex items-center gap-2">
                            <Zap className="w-5 h-5" /> 기능 옵션
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {functionalOptions.map((option, idx) => (
                                <AnimatedSection key={idx} delay={idx * 50}>
                                    <div className="group relative rounded-2xl bg-[#12121a] border border-white/10 p-5 md:p-6 hover:border-purple-500/50 transition-all duration-500 cursor-pointer">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                                                <option.icon className="w-6 h-6 text-purple-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h5 className="text-lg font-bold text-white mb-1">{option.name}</h5>
                                                <p className="text-gray-500 text-sm mb-2">{option.description}</p>
                                                <span className="text-cyan-400 font-bold text-sm">{option.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                </AnimatedSection>
                            ))}
                        </div>
                    </div>

                    {/* Non-Functional Requirements */}
                    <div>
                        <h4 className="text-xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
                            <Shield className="w-5 h-5" /> 비기능 요건 (기술 품질)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            {nonFunctionalReqs.map((req, idx) => (
                                <AnimatedSection key={idx} delay={idx * 50}>
                                    <div className="group relative rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-white/10 p-5 md:p-6 hover:border-cyan-500/50 transition-all duration-500">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center flex-shrink-0">
                                                <req.icon className="w-6 h-6 text-cyan-400" />
                                            </div>
                                            <div>
                                                <h5 className="text-lg font-bold text-white mb-1">{req.name}</h5>
                                                <p className="text-gray-400 text-sm">{req.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                </AnimatedSection>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Stage 3: Custom Quote CTA */}
                <AnimatedSection>
                    <div className="relative rounded-3xl overflow-hidden">
                        {/* Glow Background */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 opacity-30 blur-xl" />

                        <div className="relative bg-[#12121a] rounded-3xl border border-white/10 p-8 md:p-12 lg:p-16">
                            <div className="text-center max-w-3xl mx-auto">
                                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                                    <span className="text-pink-400">Stage 3.</span> 맞춤 견적 요청
                                </h3>
                                <p className="text-lg md:text-xl text-gray-400 mb-8">
                                    프로젝트의 세부 요구사항을 알려주시면<br className="hidden md:block" />
                                    <span className="text-purple-400 font-semibold">24시간 내</span> 상세 견적서를 보내드립니다.
                                </p>

                                {!isFormOpen ? (
                                    <button
                                        onClick={() => setIsFormOpen(true)}
                                        className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-lg hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] transition-all duration-500 hover:scale-105"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                        맞춤 견적 요청하기
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                ) : (
                                    <form onSubmit={handleSubmit} className="mt-8 text-left space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-300 mb-2">프로젝트 유형 *</label>
                                                <select
                                                    required
                                                    value={formData.projectType}
                                                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none transition-colors"
                                                >
                                                    <option value="">선택해주세요</option>
                                                    <option value="웹사이트">웹사이트</option>
                                                    <option value="웹 애플리케이션">웹 애플리케이션</option>
                                                    <option value="이커머스">이커머스</option>
                                                    <option value="교육 플랫폼">교육 플랫폼</option>
                                                    <option value="기업 솔루션">기업 솔루션</option>
                                                    <option value="기타">기타</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-300 mb-2">예상 일정 *</label>
                                                <select
                                                    required
                                                    value={formData.timeline}
                                                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none transition-colors"
                                                >
                                                    <option value="">선택해주세요</option>
                                                    <option value="1개월 이내">1개월 이내</option>
                                                    <option value="1-3개월">1-3개월</option>
                                                    <option value="3-6개월">3-6개월</option>
                                                    <option value="6개월 이상">6개월 이상</option>
                                                    <option value="협의 필요">협의 필요</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-300 mb-2">핵심 기능 *</label>
                                            <textarea
                                                required
                                                rows={3}
                                                value={formData.coreFeatures}
                                                onChange={(e) => setFormData({ ...formData, coreFeatures: e.target.value })}
                                                placeholder="프로젝트에 필요한 핵심 기능을 설명해주세요"
                                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors resize-none"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-300 mb-2">예산 범위 (선택)</label>
                                                <select
                                                    value={formData.budgetRange}
                                                    onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none transition-colors"
                                                >
                                                    <option value="">선택해주세요</option>
                                                    <option value="500만원 미만">500만원 미만</option>
                                                    <option value="500만원 - 1,000만원">500만원 - 1,000만원</option>
                                                    <option value="1,000만원 - 3,000만원">1,000만원 - 3,000만원</option>
                                                    <option value="3,000만원 - 5,000만원">3,000만원 - 5,000만원</option>
                                                    <option value="5,000만원 이상">5,000만원 이상</option>
                                                    <option value="협의 필요">협의 필요</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-300 mb-2">참고 사이트 (선택)</label>
                                                <input
                                                    type="text"
                                                    value={formData.referenceSites}
                                                    onChange={(e) => setFormData({ ...formData, referenceSites: e.target.value })}
                                                    placeholder="참고할 만한 사이트 URL"
                                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
                                                />
                                            </div>
                                        </div>

                                        <div className="border-t border-white/10 pt-6">
                                            <h4 className="text-lg font-bold text-white mb-4">연락처 정보</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-300 mb-2">이름 *</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none transition-colors"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-300 mb-2">이메일 *</label>
                                                    <input
                                                        type="email"
                                                        required
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none transition-colors"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-300 mb-2">연락처 *</label>
                                                    <input
                                                        type="tel"
                                                        required
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        placeholder="010-0000-0000"
                                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-300 mb-2">추가 메시지 (선택)</label>
                                            <textarea
                                                rows={3}
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                placeholder="추가로 전달하고 싶은 내용이 있다면 작성해주세요"
                                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors resize-none"
                                            />
                                        </div>

                                        {submitResult && (
                                            <div className={`p-4 rounded-xl ${submitResult.success ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {submitResult.message}
                                            </div>
                                        )}

                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-lg hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSubmitting ? (
                                                    <>처리 중...</>
                                                ) : (
                                                    <>
                                                        <Send className="w-5 h-5" />
                                                        견적 요청 보내기
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsFormOpen(false)}
                                                className="px-6 py-4 rounded-2xl bg-white/5 text-gray-400 font-bold hover:bg-white/10 transition-colors"
                                            >
                                                취소
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </AnimatedSection>

                {/* Disclaimer */}
                <AnimatedSection>
                    <div className="mt-12 text-center">
                        <p className="text-gray-500 text-sm">
                            ※ 모든 가격은 부가세 별도이며, 프로젝트 복잡도에 따라 변동될 수 있습니다.<br />
                            정확한 견적은 상담 후 제공됩니다.
                        </p>
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
}
