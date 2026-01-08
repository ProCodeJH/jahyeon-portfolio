import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { Check, Info } from "lucide-react";

export const ScopeOptions = () => {
  const options = [
    {
      category: "기능 (Features)",
      items: [
        { name: "로그인/회원관리", desc: "JWT 인증, OAuth 소셜 로그인", cost: "+ 협의" },
        { name: "관리자 페이지", desc: "데이터 CRUD, 통계 대시보드", cost: "+ 협의" },
        { name: "결제 연동", desc: "PG사 연동, 정기 결제", cost: "+ 협의" },
        { name: "실시간 기능", desc: "WebSocket 채팅, 알림", cost: "+ 협의" },
        { name: "배포/운영", desc: "CI/CD, 도메인, SSL", cost: "+ 협의" },
      ]
    },
    {
      category: "비기능 (Non-Functional)",
      items: [
        { name: "성능 최적화", desc: "로딩 속도 개선, 캐싱 전략", cost: "기본 포함" },
        { name: "보안 강화", desc: "OWASP Top 10, 암호화", cost: "기본 포함" },
        { name: "확장성 설계", desc: "모듈화, 유지보수 용이성", cost: "기본 포함" },
        { name: "SEO 최적화", desc: "메타태그, 시멘틱 마크업", cost: "기본 포함" },
        { name: "반응형 UI", desc: "모바일/태블릿 완벽 대응", cost: "기본 포함" },
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {options.map((opt, idx) => (
        <AnimatedSection key={idx} delay={idx * 200}>
          <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-3xl p-6 md:p-8 shadow-xl">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-2 h-8 bg-purple-600 rounded-full" />
              {opt.category}
            </h3>
            <div className="space-y-4">
              {opt.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 hover:border-purple-200 transition-colors shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                  <span className={`text-xs md:text-sm font-bold px-3 py-1 rounded-full ${item.cost.includes('기본') ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                    {item.cost}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      ))}
    </div>
  );
};
