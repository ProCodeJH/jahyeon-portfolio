import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Cpu, Code, Wrench, Award, ArrowRight, Github, Mail, ChevronRight, Zap, Shield, Terminal } from "lucide-react";

const SKILLS = [
  { name: "C/C++", level: 95 },
  { name: "Arduino", level: 90 },
  { name: "Python", level: 85 },
  { name: "Embedded Systems", level: 90 },
  { name: "IoT", level: 85 },
  { name: "RTOS", level: 80 },
];

const FEATURES = [
  {
    icon: Cpu,
    title: "임베디드 시스템",
    description: "마이크로컨트롤러 프로그래밍, 하드웨어 인터페이싱, 시스템 최적화",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Code,
    title: "펌웨어 개발",
    description: "C/C++ 저수준 프로그래밍, 부트로더, 디바이스 드라이버",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: Wrench,
    title: "IoT 솔루션",
    description: "연결된 디바이스, 센서 네트워크, 클라우드 통합",
    color: "from-green-500 to-green-600",
  },
  {
    icon: Shield,
    title: "RTOS & 실시간",
    description: "실시간 운영체제, 태스크 스케줄링, 결정적 시스템",
    color: "from-orange-500 to-orange-600",
  },
];

export default function Home() {
  const { data: projects } = trpc.projects.list.useQuery();
  const { data: certifications } = trpc.certifications.list.useQuery();

  const featuredProjects = projects?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-white">
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
                <span className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                  Certifications
                </span>
              </Link>
              <Link href="/resources">
                <span className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                  Resources
                </span>
              </Link>
              <Link href="/admin">
                <Button size="sm" variant="outline" className="rounded-full">
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-100 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2" />
        
        <div className="container mx-auto px-6 py-20 md:py-32 relative">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              임베디드 시스템 전문가
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              안녕하세요,
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                구자현
              </span>
              입니다
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-2xl">
              IoT, 펌웨어 개발, 실시간 운영체제를 전문으로 하는 임베디드 시스템 개발자입니다.
              현대 세계를 위한 효율적이고 신뢰할 수 있는 솔루션을 구축합니다.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/projects">
                <Button size="lg" className="rounded-full bg-gray-900 hover:bg-gray-800 text-white px-8 h-12 text-base">
                  프로젝트 보기
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base border-gray-300">
                  더 알아보기
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-12 mt-16 pt-8 border-t border-gray-200">
              <div>
                <div className="text-4xl font-bold text-gray-900">{projects?.length || 0}+</div>
                <div className="text-gray-500 mt-1">프로젝트</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900">{certifications?.length || 0}+</div>
                <div className="text-gray-500 mt-1">자격증</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900">3+</div>
                <div className="text-gray-500 mt-1">년 경험</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">전문 분야</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              임베디드 시스템 개발의 다양한 영역에서 전문성을 갖추고 있습니다
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white rounded-2xl overflow-hidden group">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">기술 스택</h2>
              <p className="text-xl text-gray-600 mb-8">
                다양한 프로그래밍 언어와 기술에 대한 깊은 이해를 바탕으로 최적의 솔루션을 제공합니다.
              </p>
              <Link href="/projects">
                <Button variant="outline" className="rounded-full">
                  프로젝트에서 확인하기
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="space-y-5">
              {SKILLS.map((skill, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-900">{skill.name}</span>
                    <span className="text-gray-500">{skill.level}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">최근 프로젝트</h2>
                <p className="text-xl text-gray-600">최근에 진행한 프로젝트들을 확인해보세요</p>
              </div>
              <Link href="/projects">
                <Button variant="outline" className="rounded-full hidden md:flex">
                  전체 보기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project) => (
                <Card key={project.id} className="border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white rounded-2xl overflow-hidden group">
                  {project.imageUrl && (
                    <div className="aspect-video overflow-hidden bg-gray-100">
                      <img 
                        src={project.imageUrl} 
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <CardContent className="p-5">
                    <Badge className="mb-3 bg-blue-100 text-blue-700 hover:bg-blue-100">
                      {project.category}
                    </Badge>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{project.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-8 md:hidden">
              <Link href="/projects">
                <Button variant="outline" className="rounded-full">
                  전체 보기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-12 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                함께 프로젝트를 진행해보세요
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                임베디드 시스템 개발에 관한 문의나 협업 제안을 환영합니다
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="rounded-full bg-white text-gray-900 hover:bg-gray-100 px-8">
                  <Mail className="mr-2 h-5 w-5" />
                  연락하기
                </Button>
                <Button size="lg" variant="outline" className="rounded-full border-white/30 text-white hover:bg-white/10 px-8">
                  <Github className="mr-2 h-5 w-5" />
                  GitHub
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-500">© 2024 Gu Jahyeon. All rights reserved.</div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
