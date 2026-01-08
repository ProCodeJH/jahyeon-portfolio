import { Check, ArrowRight, Zap, Shield, Database, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TiltCard } from "@/components/effects/TiltCard";
import { AnimatedSection } from "@/components/animations/AnimatedSection";

export const PricingTier = () => {
  const tiers = [
    {
      name: "Starter",
      price: "₩50만 ~",
      desc: "단일 페이지 / 기본 기능 / 빠른 구축",
      features: [
        "반응형 웹 디자인 (Mobile/PC)",
        "기본 SEO 최적화",
        "문의하기 폼 연동",
        "소셜 미디어 링크 연결",
        "SSL 보안 인증서 적용"
      ],
      icon: Zap,
      color: "from-blue-500 to-cyan-500",
      popular: false
    },
    {
      name: "Standard",
      price: "₩200만 ~",
      desc: "다중 페이지 / API 연동 / CMS",
      features: [
        "모든 Starter 기능 포함",
        "관리자 페이지 (CMS) 제공",
        "로그인 / 회원가입 기능",
        "블로그 / 게시판 기능",
        "기본 데이터베이스 연동",
        "구글 애널리틱스 연동"
      ],
      icon: Database,
      color: "from-purple-500 to-pink-500",
      popular: true
    },
    {
      name: "Pro",
      price: "₩500만 ~",
      desc: "고도화된 로직 / 결제 / 복잡한 데이터",
      features: [
        "모든 Standard 기능 포함",
        "결제 시스템 (PG) 연동",
        "실시간 채팅 / 알림 기능",
        "복잡한 비즈니스 로직 구현",
        "대용량 트래픽 최적화",
        "초기 클라우드 인프라 세팅"
      ],
      icon: Server,
      color: "from-orange-500 to-red-500",
      popular: false
    },
    {
      name: "Enterprise",
      price: "별도 협의",
      desc: "대규모 시스템 / 고가용성 / 전담 지원",
      features: [
        "맞춤형 아키텍처 설계",
        "마이크로서비스 (MSA) 전환",
        "전담 유지보수 계약",
        "24/7 장애 대응 지원",
        "보안 감수 및 모의해킹",
        "SLA(서비스 수준) 보장"
      ],
      icon: Shield,
      color: "from-slate-700 to-slate-900",
      popular: false
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
      {tiers.map((tier, idx) => (
        <AnimatedSection key={idx} delay={idx * 100}>
          <TiltCard sensitivity={5}>
            <div className={`relative h-full p-6 md:p-8 rounded-3xl bg-white border-2 ${tier.popular ? 'border-purple-500 shadow-2xl shadow-purple-500/20' : 'border-gray-100 shadow-xl'} flex flex-col justify-between overflow-hidden group hover:border-opacity-100 transition-all duration-300`}>

              {tier.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-lg">
                  POPULAR
                </div>
              )}

              <div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tier.color} flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  <tier.icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-2xl font-black text-gray-900 mb-2">{tier.name}</h3>
                <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 mb-2">
                  {tier.price}
                </div>
                <p className="text-sm text-gray-500 font-medium mb-6 min-h-[40px]">{tier.desc}</p>

                <div className="space-y-3 mb-8">
                  {tier.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`mt-1 w-4 h-4 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center flex-shrink-0`}>
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="text-sm text-gray-600 leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button className={`w-full rounded-xl bg-gradient-to-r ${tier.color} text-white font-bold hover:opacity-90 transition-opacity shadow-lg`}>
                Select Plan
              </Button>
            </div>
          </TiltCard>
        </AnimatedSection>
      ))}
    </div>
  );
};
