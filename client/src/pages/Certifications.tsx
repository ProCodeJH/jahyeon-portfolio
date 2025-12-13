import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "wouter";
import { ExternalLink, Loader2, Award, Calendar, Building, ShieldCheck } from "lucide-react";

export default function Certifications() {
  const { data: certifications, isLoading } = trpc.certifications.list.useQuery();
  const [selectedCert, setSelectedCert] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity cursor-pointer">
                Gu Jahyeon
              </span>
            </Link>
            <div className="flex items-center gap-8">
              <Link href="/about">
                <span className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                  About
                </span>
              </Link>
              <Link href="/projects">
                <span className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                  Projects
                </span>
              </Link>
              <Link href="/certifications">
                <span className="text-sm font-medium text-blue-600 cursor-pointer">
                  Certifications
                </span>
              </Link>
              <Link href="/resources">
                <span className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                  Resources
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full text-green-600 text-sm font-medium mb-4">
            <Award className="h-4 w-4" />
            자격 및 인증
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Certifications
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            임베디드 시스템 및 관련 기술 분야에서 취득한 전문 자격증입니다.
          </p>
        </div>

        {/* Certifications Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-500">자격증을 불러오는 중...</p>
          </div>
        ) : !certifications?.length ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Award className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">자격증이 없습니다</h3>
            <p className="text-gray-500">아직 등록된 자격증이 없습니다.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map((cert) => (
              <Card 
                key={cert.id} 
                className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white rounded-2xl cursor-pointer"
                onClick={() => setSelectedCert(cert)}
              >
                {/* Image */}
                <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-green-50 to-blue-50 relative">
                  {cert.imageUrl ? (
                    <img 
                      src={cert.imageUrl} 
                      alt={cert.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                        <Award className="h-12 w-12 text-white" />
                      </div>
                    </div>
                  )}
                  
                  {/* Verified Badge */}
                  <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-medium">
                      <ShieldCheck className="h-3 w-3" />
                      인증됨
                    </div>
                  </div>
                </div>

                <CardContent className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {cert.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                    <Building className="h-4 w-4" />
                    {cert.issuer}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Calendar className="h-4 w-4" />
                      {cert.issueDate}
                    </div>
                    {cert.expiryDate && (
                      <Badge variant="outline" className="text-xs">
                        ~{cert.expiryDate}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Certification Detail Modal */}
      <Dialog open={!!selectedCert} onOpenChange={(open) => !open && setSelectedCert(null)}>
        <DialogContent className="max-w-2xl bg-white rounded-2xl">
          {selectedCert && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Award className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                      {selectedCert.title}
                    </DialogTitle>
                    <p className="text-gray-500 mt-1">{selectedCert.issuer}</p>
                  </div>
                </div>
              </DialogHeader>
              
              {selectedCert.imageUrl && (
                <div className="aspect-video overflow-hidden rounded-xl bg-gray-100 mt-4">
                  <img 
                    src={selectedCert.imageUrl} 
                    alt={selectedCert.title}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1">발급일</p>
                    <p className="font-medium text-gray-900">{selectedCert.issueDate}</p>
                  </div>
                  {selectedCert.expiryDate && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500 mb-1">만료일</p>
                      <p className="font-medium text-gray-900">{selectedCert.expiryDate}</p>
                    </div>
                  )}
                </div>

                {selectedCert.credentialId && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1">자격증 번호</p>
                    <p className="font-mono text-gray-900">{selectedCert.credentialId}</p>
                  </div>
                )}

                {selectedCert.description && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">설명</p>
                    <p className="text-gray-700">{selectedCert.description}</p>
                  </div>
                )}

                {selectedCert.credentialUrl && (
                  <Button className="w-full rounded-xl bg-gray-900 hover:bg-gray-800" asChild>
                    <a href={selectedCert.credentialUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      자격증 확인하기
                    </a>
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t bg-white py-12 mt-20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-500">© 2024 Gu Jahyeon. Embedded Systems Developer.</p>
        </div>
      </footer>
    </div>
  );
}
