import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Github, Mail, MapPin, Calendar, GraduationCap, Briefcase, Heart, Code, Cpu, Wrench, ArrowRight } from "lucide-react";

const TIMELINE = [
  {
    year: "2024",
    title: "임베디드 시스템 개발",
    description: "IoT 및 임베디드 시스템 프로젝트 진행",
    icon: Cpu,
  },
  {
    year: "2023",
    title: "프로그래밍 학습",
    description: "C, Python, Arduino 프로그래밍 심화 학습",
    icon: Code,
  },
  {
    year: "2022",
    title: "개발 시작",
    description: "프로그래밍과 하드웨어에 관심을 가지고 학습 시작",
    icon: GraduationCap,
  },
];

const INTERESTS = [
  { icon: Cpu, label: "임베디드 시스템" },
  { icon: Code, label: "펌웨어 개발" },
  { icon: Wrench, label: "하드웨어 설계" },
  { icon: Heart, label: "오픈소스" },
];

export default function About() {
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
                <span className="text-sm font-medium text-blue-600 cursor-pointer">
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
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-600 text-sm font-medium mb-6">
              <Briefcase className="h-4 w-4" />
              About Me
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              임베디드 시스템으로
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                세상을 연결합니다
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              안녕하세요! 저는 임베디드 시스템 개발을 전문으로 하는 개발자 구자현입니다.
              마이크로컨트롤러, IoT, 펌웨어 개발에 깊은 관심을 가지고 있으며,
              하드웨어와 소프트웨어를 연결하는 일에 열정을 쏟고 있습니다.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-5 w-5 text-blue-500" />
                <span>대한민국</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-5 w-5 text-blue-500" />
                <span>개발 경력 3년+</span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button className="rounded-full bg-gray-900 hover:bg-gray-800 px-6">
                <Mail className="mr-2 h-4 w-4" />
                연락하기
              </Button>
              <Button variant="outline" className="rounded-full px-6">
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div>
          </div>

          {/* Profile Image Placeholder */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center">
              <div className="w-48 h-48 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-7xl font-bold text-white">GJ</span>
              </div>
            </div>
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-200 rounded-2xl -z-10" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-200 rounded-2xl -z-10" />
          </div>
        </div>

        {/* Interests */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">관심 분야</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {INTERESTS.map((interest, index) => {
              const Icon = interest.icon;
              return (
                <Card key={index} className="border-0 shadow-sm hover:shadow-lg transition-all bg-white rounded-2xl">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <p className="font-medium text-gray-900">{interest.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">경력</h2>
          <div className="max-w-2xl mx-auto">
            {TIMELINE.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex gap-6 mb-8 last:mb-0">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    {index < TIMELINE.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 mt-4" />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="text-sm text-blue-600 font-medium mb-1">{item.year}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border-0 rounded-3xl overflow-hidden">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              프로젝트를 확인해보세요
            </h2>
            <p className="text-gray-300 mb-8 max-w-xl mx-auto">
              다양한 임베디드 시스템 프로젝트와 자격증을 확인하실 수 있습니다.
            </p>
            <Link href="/projects">
              <Button size="lg" className="rounded-full bg-white text-gray-900 hover:bg-gray-100 px-8">
                프로젝트 보기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white py-12 mt-20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-500">© 2024 Gu Jahyeon. Embedded Systems Developer.</p>
        </div>
      </footer>
    </div>
  );
}
