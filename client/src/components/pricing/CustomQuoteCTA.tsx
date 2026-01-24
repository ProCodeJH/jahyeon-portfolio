import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const CustomQuoteCTA = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
    toast.success("견적 요청이 성공적으로 전송되었습니다.");
  };

  if (submitted) {
    return (
      <AnimatedSection>
        <div className="text-center py-16 bg-white/50 backdrop-blur-xl border border-purple-100 rounded-3xl shadow-xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">요청이 접수되었습니다!</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            작성해주신 내용을 검토하여 24시간 이내에<br />상세 견적서와 함께 연락드리겠습니다.
          </p>
          <Button
            className="mt-8 bg-gray-900 text-white rounded-xl"
            onClick={() => setSubmitted(false)}
          >
            추가 문의하기
          </Button>
        </div>
      </AnimatedSection>
    );
  }

  return (
    <AnimatedSection>
      <div className="bg-white/80 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-0">
          {/* Left: Info */}
          <div className="p-8 md:p-12 lg:p-16 bg-gradient-to-br from-purple-900 to-blue-900 text-white flex flex-col justify-between">
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight">
                정확한 견적이<br />궁금하신가요?
              </h2>
              <p className="text-purple-200 text-lg mb-8 leading-relaxed">
                프로젝트의 규모와 요구사항에 따라<br />
                합리적이고 투명한 견적을 제안드립니다.
              </p>

              <ul className="space-y-4">
                {[
                  "상세 요구사항 분석 및 기획 지원",
                  "기술 스택 제안 및 아키텍처 설계",
                  "유지보수 및 확장성 고려",
                  "투명한 견적 산출 근거 제공"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-purple-300" />
                    </div>
                    <span className="text-purple-100">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <p className="text-sm text-purple-200 mb-2 font-bold uppercase tracking-wider">Disclaimer</p>
              <p className="text-xs text-purple-100/80 leading-relaxed">
                본 견적은 프로젝트 범위, 요구사항, 일정에 따라 변동될 수 있으며 최종 금액은 상세 협의 후 확정됩니다. 초기 상담은 무료로 진행됩니다.
              </p>
            </div>
          </div>

          {/* Right: Form */}
          <div className="p-8 md:p-12 lg:p-16 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-bold text-gray-900">프로젝트 유형</Label>
                <div className="grid grid-cols-2 gap-3">
                  {["웹 사이트", "웹 애플리케이션", "모바일 앱", "시스템/솔루션"].map((type) => (
                    <div key={type} className="flex items-center space-x-2 p-3 rounded-xl border border-gray-200 hover:border-purple-500 transition-colors cursor-pointer">
                      <Checkbox id={type} />
                      <label htmlFor={type} className="text-sm font-medium cursor-pointer flex-1">{type}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">이름 / 회사명</Label>
                  <Input id="name" placeholder="홍길동 / ABC Corp" className="h-12 rounded-xl bg-gray-50 border-gray-200" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">연락처</Label>
                  <Input id="contact" placeholder="010-0000-0000" className="h-12 rounded-xl bg-gray-50 border-gray-200" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>예산 범위 (선택)</Label>
                <select className="w-full h-12 px-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">예산 범위를 선택해주세요</option>
                  <option value="under_500">500만원 미만</option>
                  <option value="500_1000">500만원 ~ 1,000만원</option>
                  <option value="1000_3000">1,000만원 ~ 3,000만원</option>
                  <option value="3000_5000">3,000만원 ~ 5,000만원</option>
                  <option value="over_5000">5,000만원 이상</option>
                  <option value="consult">협의 필요</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc">프로젝트 내용</Label>
                <Textarea id="desc" placeholder="구현하고자 하는 기능, 참고 사이트 등을 자유롭게 적어주세요." className="min-h-[120px] rounded-xl bg-gray-50 border-gray-200 resize-none" required />
              </div>

              <Button type="submit" className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/30" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                견적 요청하기
              </Button>
            </form>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};
