import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ExternalLink, Loader2, Award, Calendar, Building, ShieldCheck, X, CheckCircle, Sparkles } from "lucide-react";
import { GradientMeshBackground } from "@/components/backgrounds/GradientMeshBackground";
import { SubtleDots } from "@/components/backgrounds/SubtleDots";
import { TiltCard } from "@/components/effects/TiltCard";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { Navigation } from "@/components/layout/Navigation";

export default function Certifications() {
  const { data: certifications, isLoading } = trpc.certifications.list.useQuery();
  const [selectedCert, setSelectedCert] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 text-gray-900 overflow-hidden">
      {/* Clean Background */}
      <div className="fixed inset-0">
        <GradientMeshBackground />
        <SubtleDots />
      </div>

      {/* Navigation */}
      <Navigation />

      {/* Header */}
      <section className="pt-32 md:pt-36 lg:pt-40 pb-10 md:pb-12 lg:pb-16 px-4 md:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Award className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <p className="text-purple-600 font-medium text-xs md:text-sm tracking-wider uppercase">Credentials</p>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900">
              Certifications
            </h1>
            <p className="text-gray-600 text-base md:text-lg lg:text-xl max-w-2xl">
              Professional certifications in embedded systems, programming, and related technologies.
              <span className="flex items-center gap-2 text-purple-600 mt-2 md:mt-3 text-sm md:text-base font-medium">
                <ShieldCheck className="w-3 h-3 md:w-4 md:h-4" />All credentials verified and validated
              </span>
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Grid */}
      <section className="py-8 md:py-10 lg:py-12 pb-20 md:pb-24 lg:pb-32 px-4 md:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : !certifications?.length ? (
            <div className="text-center py-32">
              <Award className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2 text-gray-900">No certifications found</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
              {certifications.map((cert, index) => (
                <AnimatedSection key={cert.id} delay={index * 100}>
                  <TiltCard>
                    <div
                      className="group rounded-2xl md:rounded-3xl overflow-hidden bg-white border border-gray-200 hover:border-purple-300 transition-all duration-500 cursor-pointer hover:shadow-2xl"
                      onClick={() => setSelectedCert(cert)}
                    >
                      <div className="aspect-[4/3] overflow-hidden relative">
                        {cert.imageUrl ? (
                          <img src={cert.imageUrl} alt={cert.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100 flex items-center justify-center relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-20">
                              <div className="absolute top-10 left-10 w-24 h-24 border-2 border-purple-300 rounded-full" />
                              <div className="absolute bottom-10 right-10 w-32 h-32 border-2 border-blue-300 rounded-lg rotate-12" />
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-pink-300 rounded-full" />
                            </div>

                            <div className="relative z-10 w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-2xl shadow-purple-500/50">
                              <Award className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-white" />
                            </div>

                            {/* Sparkle Effects */}
                            <div className="absolute top-6 md:top-8 right-8 md:right-12">
                              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-purple-400 animate-pulse" />
                            </div>
                            <div className="absolute bottom-8 md:bottom-12 left-10 md:left-16" style={{ animationDelay: '1s' }}>
                              <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-blue-400 animate-pulse" />
                            </div>
                          </div>
                        )}

                        <div className="absolute top-3 md:top-4 right-3 md:right-4">
                          <span className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-white backdrop-blur-xl text-purple-600 text-[10px] md:text-xs font-medium border border-gray-200 shadow-lg">
                            <ShieldCheck className="w-2.5 h-2.5 md:w-3 md:h-3" />Verified
                          </span>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 right-3 md:right-4 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                          <Button className="w-full rounded-lg md:rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 h-10 md:h-12 text-sm md:text-base shadow-lg shadow-purple-500/30">
                            View Details
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 md:p-5 lg:p-6">
                        <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 group-hover:text-purple-600 transition-colors line-clamp-1 text-gray-900">{cert.title}</h3>
                        <div className="flex items-center gap-2 text-gray-600 text-xs md:text-sm mb-2 md:mb-3">
                          <Building className="w-3 h-3 md:w-4 md:h-4 text-purple-600" />
                          {cert.issuer}
                        </div>
                        <div className="flex items-center justify-between text-[10px] md:text-xs">
                          <div className="flex items-center gap-1 md:gap-1.5 text-gray-500">
                            <Calendar className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            {cert.issueDate}
                          </div>
                          {cert.expiryDate && (
                            <span className="px-1.5 md:px-2 py-0.5 md:py-1 rounded-full bg-gray-100 text-gray-600">
                              Exp: {cert.expiryDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-6" onClick={() => setSelectedCert(null)}>
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl md:rounded-3xl bg-white border border-gray-200 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 md:p-6 border-b border-gray-200 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 md:gap-5 min-w-0">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/50">
                  <Award className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                    <span className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-purple-100 text-purple-600 text-[10px] md:text-xs font-medium border border-purple-200">
                      <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3" />Verified
                    </span>
                  </div>
                  <h2 className="text-lg md:text-2xl font-bold text-gray-900 line-clamp-2">{selectedCert.title}</h2>
                  <p className="text-gray-600 mt-1 text-sm md:text-base">{selectedCert.issuer}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCert(null)}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 md:w-5 md:h-5 text-gray-900" />
              </button>
            </div>

            {selectedCert.imageUrl && (
              <div className="p-4 md:p-6 border-b border-gray-200">
                <div className="rounded-xl md:rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                  <img src={selectedCert.imageUrl} alt={selectedCert.title} className="w-full h-auto" />
                </div>
              </div>
            )}

            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="p-4 md:p-5 rounded-xl md:rounded-2xl bg-gray-50 border border-gray-200 hover:border-purple-300 transition-colors">
                  <p className="text-gray-600 text-xs md:text-sm mb-1.5 md:mb-2">Issue Date</p>
                  <p className="text-base md:text-lg font-semibold flex items-center gap-1.5 md:gap-2 text-gray-900">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4 text-purple-600" />
                    {selectedCert.issueDate}
                  </p>
                </div>
                {selectedCert.expiryDate && (
                  <div className="p-4 md:p-5 rounded-xl md:rounded-2xl bg-gray-50 border border-gray-200 hover:border-orange-300 transition-colors">
                    <p className="text-gray-600 text-xs md:text-sm mb-1.5 md:mb-2">Expiry Date</p>
                    <p className="text-base md:text-lg font-semibold flex items-center gap-1.5 md:gap-2 text-gray-900">
                      <Calendar className="w-3 h-3 md:w-4 md:h-4 text-orange-600" />
                      {selectedCert.expiryDate}
                    </p>
                  </div>
                )}
              </div>

              {selectedCert.credentialId && (
                <div className="p-4 md:p-5 rounded-xl md:rounded-2xl bg-gray-50 border border-gray-200 hover:border-purple-300 transition-colors">
                  <p className="text-gray-600 text-xs md:text-sm mb-1.5 md:mb-2">Credential ID</p>
                  <p className="font-mono text-purple-600 break-all text-xs md:text-sm">{selectedCert.credentialId}</p>
                </div>
              )}

              {selectedCert.description && (
                <div>
                  <p className="text-gray-600 text-xs md:text-sm mb-2 md:mb-3">Description</p>
                  <p className="text-gray-700 leading-relaxed text-sm md:text-base">{selectedCert.description}</p>
                </div>
              )}

              {selectedCert.credentialUrl && (
                <Button
                  className="w-full rounded-lg md:rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 h-12 md:h-14 text-sm md:text-base shadow-lg shadow-purple-500/30"
                  asChild
                >
                  <a href={selectedCert.credentialUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Verify Credential
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
