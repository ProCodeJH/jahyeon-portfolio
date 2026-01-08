import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { PricingTier } from "@/components/pricing/PricingTier";
import { ScopeOptions } from "@/components/pricing/ScopeOptions";
import { CustomQuoteCTA } from "@/components/pricing/CustomQuoteCTA";
import { Sparkles, Briefcase, Zap } from "lucide-react";

export const Services = () => {
  return (
    <section className="py-20 md:py-32 lg:py-40 px-4 md:px-8 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden" id="services">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* 1. Header */}
        <AnimatedSection>
          <div className="text-center mb-16 md:mb-24">
            <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200/50 backdrop-blur-xl mb-6 shadow-sm">
              <Briefcase className="w-4 md:w-5 h-4 md:h-5 text-purple-600" />
              <span className="text-xs md:text-sm font-bold text-purple-600 tracking-wider uppercase">Professional Services</span>
            </div>

            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight text-gray-900">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
                Reasonable Pricing
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 animate-gradient-x">
                for Your Vision
              </span>
            </h2>

            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
              단순 제작이 아닌, <span className="font-bold text-gray-900">확장성과 유지보수</span>를 고려한<br className="hidden md:block" />
              구조적 개발을 진행합니다.
            </p>
          </div>
        </AnimatedSection>

        {/* 2. Pricing Tiers (Step 1) */}
        <div className="mb-20 md:mb-32">
          <AnimatedSection>
            <div className="flex items-center gap-4 mb-8 md:mb-12">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xl">1</div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Recommended Packages</h3>
            </div>
          </AnimatedSection>
          <PricingTier />
        </div>

        {/* 3. Scope & Options (Step 2) */}
        <div className="mb-20 md:mb-32">
          <AnimatedSection>
            <div className="flex items-center gap-4 mb-8 md:mb-12">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">2</div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Development Scope</h3>
            </div>
          </AnimatedSection>
          <ScopeOptions />
        </div>

        {/* 4. Custom Quote CTA (Step 3) */}
        <div>
          <AnimatedSection>
            <div className="flex items-center gap-4 mb-8 md:mb-12">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 font-bold text-xl">3</div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Get a Custom Quote</h3>
            </div>
          </AnimatedSection>
          <CustomQuoteCTA />
        </div>

      </div>
    </section>
  );
};
