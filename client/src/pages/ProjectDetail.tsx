import { useEffect, useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "wouter";
import {
    ExternalLink,
    Github,
    Loader2,
    Eye,
    Code,
    Play,
    ArrowLeft,
    Calendar,
    Tag,
    Layers,
    Share2,
    ChevronRight,
    ChevronLeft,
    Image as ImageIcon,
    ZoomIn,
} from "lucide-react";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { Navigation } from "@/components/layout/Navigation";

/**
 * 🎯 프로젝트 상세 페이지 - WEB-3
 * 
 * Midnight Neon 테마 기반의 풀 페이지 상세 뷰
 * - URL 라우팅: /projects/:id (wouter)
 * - 이미지 갤러리 슬라이더
 * - 기술 스택 배지 표시
 * - 조회수 자동 카운트
 * - 관련 프로젝트 추천
 */

// 🖼️ 이미지 갤러리 슬라이더 컴포넌트
interface ImageGallerySliderProps {
    images: string[];
    title: string;
}

function ImageGallerySlider({ images, title }: ImageGallerySliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);

    const goToPrevious = useCallback(() => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }, [images.length]);

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, [images.length]);

    // 키보드 네비게이션
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") goToPrevious();
            if (e.key === "ArrowRight") goToNext();
            if (e.key === "Escape") setIsZoomed(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [goToPrevious, goToNext]);

    if (images.length === 0) {
        return (
            <div className="w-full h-full bg-gradient-to-br from-midnight-card via-midnight to-midnight-card flex items-center justify-center">
                <Code className="w-32 h-32 text-frost-muted/20" />
            </div>
        );
    }

    return (
        <>
            {/* 메인 갤러리 */}
            <div className="relative w-full h-full group">
                <img
                    src={images[currentIndex]}
                    alt={`${title} - Image ${currentIndex + 1}`}
                    className="w-full h-full object-cover cursor-zoom-in transition-transform duration-700"
                    onClick={() => setIsZoomed(true)}
                />

                {/* 그라데이션 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/40 to-transparent pointer-events-none" />

                {/* 네비게이션 버튼 (2개 이상일 때만) */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-midnight/80 backdrop-blur-xl border border-electric/30 text-frost hover:bg-electric hover:text-midnight transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-lg"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); goToNext(); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-midnight/80 backdrop-blur-xl border border-electric/30 text-frost hover:bg-electric hover:text-midnight transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-lg"
                            aria-label="Next image"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </>
                )}

                {/* 줌 버튼 */}
                <button
                    onClick={() => setIsZoomed(true)}
                    className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-midnight/80 backdrop-blur-xl border border-electric/30 text-frost hover:bg-electric hover:text-midnight transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center"
                    aria-label="Zoom image"
                >
                    <ZoomIn className="w-5 h-5" />
                </button>

                {/* 인디케이터 (2개 이상일 때만) */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentIndex
                                        ? "bg-electric scale-125 shadow-[0_0_10px_rgba(0,255,136,0.5)]"
                                        : "bg-frost/40 hover:bg-frost/60"
                                    }`}
                                aria-label={`Go to image ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}

                {/* 이미지 카운터 */}
                {images.length > 1 && (
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-midnight/80 backdrop-blur-xl border border-electric/20 text-frost text-sm font-[family-name:var(--font-mono)]">
                        <ImageIcon className="w-4 h-4 inline-block mr-2 text-electric" />
                        {currentIndex + 1} / {images.length}
                    </div>
                )}
            </div>

            {/* 풀스크린 줌 모달 */}
            {isZoomed && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
                    onClick={() => setIsZoomed(false)}
                >
                    <img
                        src={images[currentIndex]}
                        alt={`${title} - Image ${currentIndex + 1}`}
                        className="max-w-full max-h-full object-contain"
                    />

                    {/* 줌 내비게이션 */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-electric/20 border border-electric/50 text-electric hover:bg-electric hover:text-midnight transition-all flex items-center justify-center"
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-electric/20 border border-electric/50 text-electric hover:bg-electric hover:text-midnight transition-all flex items-center justify-center"
                            >
                                <ChevronRight className="w-8 h-8" />
                            </button>
                        </>
                    )}

                    {/* ESC 힌트 */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-frost-muted text-sm font-[family-name:var(--font-mono)]">
                        Press ESC or click to close
                    </div>
                </div>
            )}
        </>
    );
}

// 🏷️ 기술 스택 배지 컴포넌트
interface TechBadgeProps {
    tech: string;
    size?: "sm" | "md" | "lg";
}

function TechBadge({ tech, size = "md" }: TechBadgeProps) {
    // 태그별 색상 생성
    const getTagColor = (tag: string) => {
        const colors = [
            "#00FF88", // electric green
            "#22D3EE", // cyan
            "#6366F1", // indigo
            "#F59E0B", // amber
            "#EC4899", // pink
            "#8B5CF6", // violet
            "#10B981", // emerald
            "#EF4444", // red
            "#3B82F6", // blue
        ];
        const hash = tag.split("").reduce((acc, char) => char.charCodeAt(0) + acc, 0);
        return colors[hash % colors.length];
    };

    const color = getTagColor(tech);

    const sizeClasses = {
        sm: "px-2 py-1 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-5 py-3 text-base",
    };

    return (
        <span
            className={`${sizeClasses[size]} rounded-full font-medium transition-all hover:scale-105 cursor-default inline-flex items-center gap-1.5`}
            style={{
                backgroundColor: `${color}15`,
                border: `1px solid ${color}40`,
                color: color,
            }}
        >
            <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: color }}
            />
            {tech}
        </span>
    );
}

export default function ProjectDetail() {
    // URL 파라미터에서 프로젝트 ID 추출 (wouter)
    const params = useParams<{ id: string }>();
    const projectId = parseInt(params.id || "0", 10);

    // 프로젝트 데이터 페칭
    const { data: project, isLoading, error } = trpc.projects.get.useQuery(
        { id: projectId },
        { enabled: projectId > 0 }
    );

    // 관련 프로젝트 목록 (같은 카테고리)
    const { data: allProjects } = trpc.projects.list.useQuery();

    // 조회수 증가 뮤테이션
    const incrementViewMutation = trpc.projects.incrementView.useMutation();

    // 페이지 진입 시 조회수 증가
    useEffect(() => {
        if (projectId > 0) {
            incrementViewMutation.mutate({ id: projectId });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    // 기술 스택 파싱
    const parseTechnologies = (tech: string): string[] =>
        tech ? tech.split(",").map((t) => t.trim()).filter((t) => t.length > 0) : [];

    // 관련 프로젝트 필터링 (같은 카테고리, 현재 프로젝트 제외)
    const relatedProjects = allProjects
        ?.filter((p) => p.id !== projectId && p.category === project?.category)
        .slice(0, 3);

    // 이미지 배열 생성 (메인 이미지 + 썸네일)
    const getProjectImages = (): string[] => {
        if (!project) return [];
        const images: string[] = [];
        if (project.imageUrl) images.push(project.imageUrl);
        if (project.thumbnailUrl && project.thumbnailUrl !== project.imageUrl) {
            images.push(project.thumbnailUrl);
        }
        return images;
    };

    // 공유 기능
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: project?.title,
                    text: project?.description,
                    url: window.location.href,
                });
            } catch (err) {
                console.log("Share cancelled");
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("링크가 복사되었습니다!");
        }
    };

    // 로딩 상태
    if (isLoading) {
        return (
            <div className="min-h-screen bg-midnight flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-electric" />
                    <p className="font-[family-name:var(--font-mono)] text-frost-muted text-lg">
                        Loading project...
                    </p>
                </div>
            </div>
        );
    }

    // 에러 상태
    if (error || !project) {
        return (
            <div className="min-h-screen bg-midnight text-frost flex flex-col">
                <Navigation />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center max-w-md mx-auto px-4">
                        <Code className="w-24 h-24 text-frost-muted/30 mx-auto mb-6" />
                        <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold mb-4 text-frost">
                            프로젝트를 찾을 수 없습니다
                        </h2>
                        <p className="text-frost-muted mb-8">
                            요청하신 프로젝트가 존재하지 않거나 삭제되었을 수 있습니다.
                        </p>
                        <Link href="/projects">
                            <Button className="rounded-full bg-electric text-midnight hover:bg-electric/90 px-8 py-6 text-lg font-semibold">
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                프로젝트 목록으로
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const technologies = parseTechnologies(project.technologies);
    const projectImages = getProjectImages();

    return (
        <div className="min-h-screen bg-midnight text-frost overflow-hidden">
            {/* 🌊 MIDNIGHT NEON BACKGROUND */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-midnight via-midnight-card to-midnight" />
                <div
                    className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-electric/10 rounded-full blur-[180px] animate-pulse"
                />
                <div
                    className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-indigo/15 rounded-full blur-[150px]"
                    style={{ animation: "pulse 4s ease-in-out infinite alternate" }}
                />
                <div
                    className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-accent-cyan/10 rounded-full blur-[120px]"
                    style={{ animation: "pulse 3s ease-in-out infinite alternate-reverse" }}
                />
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,136,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />
            </div>

            {/* Navigation */}
            <Navigation />

            {/* Hero Section with Image Gallery Slider */}
            <section className="relative z-10">
                {/* 히어로 이미지 갤러리 */}
                <div className="relative h-[40vh] md:h-[50vh] lg:h-[60vh] overflow-hidden">
                    <ImageGallerySlider images={projectImages} title={project.title} />

                    {/* Breadcrumb & Back Button */}
                    <div className="absolute top-24 md:top-28 left-0 right-0 px-4 md:px-8 z-10">
                        <div className="max-w-7xl mx-auto">
                            <AnimatedSection>
                                <div className="flex items-center gap-2 text-frost-muted text-sm font-[family-name:var(--font-mono)]">
                                    <Link href="/">
                                        <span className="hover:text-electric transition-colors cursor-pointer">
                                            Home
                                        </span>
                                    </Link>
                                    <ChevronRight className="w-4 h-4" />
                                    <Link href="/projects">
                                        <span className="hover:text-electric transition-colors cursor-pointer">
                                            Projects
                                        </span>
                                    </Link>
                                    <ChevronRight className="w-4 h-4" />
                                    <span className="text-electric truncate max-w-[200px]">
                                        {project.title}
                                    </span>
                                </div>
                            </AnimatedSection>
                        </div>
                    </div>

                    {/* 뷰 카운트 뱃지 */}
                    <div className="absolute top-24 md:top-28 right-4 md:right-8 z-10">
                        <AnimatedSection delay={100}>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-midnight/90 backdrop-blur-xl border border-electric/20 shadow-lg">
                                <Eye className="w-4 h-4 text-electric" />
                                <span className="font-[family-name:var(--font-mono)] text-sm text-frost">
                                    {project.viewCount?.toLocaleString() || 0} views
                                </span>
                            </div>
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="relative z-10 px-4 md:px-8 py-12 md:py-16 lg:py-20">
                <div className="max-w-5xl mx-auto">
                    {/* Back Button */}
                    <AnimatedSection>
                        <Link href="/projects">
                            <button className="flex items-center gap-2 text-frost-muted hover:text-electric transition-colors mb-8 group">
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                <span className="font-[family-name:var(--font-mono)] text-base">
                                    Back to Projects
                                </span>
                            </button>
                        </Link>
                    </AnimatedSection>

                    {/* Title & Category */}
                    <AnimatedSection delay={100}>
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric/10 border border-electric/30">
                                <Layers className="w-4 h-4 text-electric" />
                                <span className="font-[family-name:var(--font-mono)] text-sm text-electric uppercase tracking-wider">
                                    {project.category?.replace("_", " ") || "Project"}
                                </span>
                            </div>
                            {project.createdAt && (
                                <div className="flex items-center gap-2 text-frost-muted text-sm">
                                    <Calendar className="w-4 h-4" />
                                    <span className="font-[family-name:var(--font-mono)]">
                                        {new Date(project.createdAt).toLocaleDateString("ko-KR", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </AnimatedSection>

                    {/* Project Title */}
                    <AnimatedSection delay={150}>
                        <h1
                            className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1] mb-6"
                            style={{ textShadow: "0 0 80px rgba(0,255,136,0.3)" }}
                        >
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-frost via-electric to-frost">
                                {project.title}
                            </span>
                        </h1>
                    </AnimatedSection>

                    {/* Description */}
                    <AnimatedSection delay={200}>
                        <p className="font-[family-name:var(--font-body)] text-lg md:text-xl lg:text-2xl text-frost-muted leading-relaxed mb-10 max-w-4xl">
                            {project.description}
                        </p>
                    </AnimatedSection>

                    {/* Action Buttons */}
                    <AnimatedSection delay={250}>
                        <div className="flex flex-wrap gap-4 mb-12">
                            {project.projectUrl && (
                                <a
                                    href={project.projectUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-105 transition-all h-14 px-8 text-lg font-semibold shadow-xl shadow-purple-500/30">
                                        <ExternalLink className="w-5 h-5 mr-3" />
                                        Live Demo
                                    </Button>
                                </a>
                            )}
                            {project.githubUrl && (
                                <a
                                    href={project.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button
                                        variant="outline"
                                        className="rounded-full border-2 border-frost/30 bg-midnight-card/50 backdrop-blur-xl text-frost hover:border-electric hover:text-electric hover:scale-105 transition-all h-14 px-8 text-lg font-semibold"
                                    >
                                        <Github className="w-5 h-5 mr-3" />
                                        Source Code
                                    </Button>
                                </a>
                            )}
                            {project.videoUrl && (
                                <a
                                    href={project.videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button
                                        variant="outline"
                                        className="rounded-full border-2 border-accent-cyan/50 bg-midnight-card/50 backdrop-blur-xl text-accent-cyan hover:border-accent-cyan hover:bg-accent-cyan/10 hover:scale-105 transition-all h-14 px-8 text-lg font-semibold"
                                    >
                                        <Play className="w-5 h-5 mr-3" />
                                        Watch Video
                                    </Button>
                                </a>
                            )}
                            <Button
                                variant="outline"
                                onClick={handleShare}
                                className="rounded-full border-2 border-frost/20 bg-midnight-card/30 backdrop-blur-xl text-frost-muted hover:border-electric hover:text-electric transition-all h-14 px-6"
                            >
                                <Share2 className="w-5 h-5" />
                            </Button>
                        </div>
                    </AnimatedSection>

                    {/* Technologies Section with Badges */}
                    {technologies.length > 0 && (
                        <AnimatedSection delay={300}>
                            <div className="mb-16">
                                <div className="flex items-center gap-3 mb-6">
                                    <Tag className="w-5 h-5 text-electric" />
                                    <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-frost">
                                        Technologies Used
                                    </h2>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {technologies.map((tech, i) => (
                                        <TechBadge key={i} tech={tech} size="lg" />
                                    ))}
                                </div>
                            </div>
                        </AnimatedSection>
                    )}

                    {/* Video Embed (if YouTube) */}
                    {project.videoUrl && project.videoUrl.includes("youtube") && (
                        <AnimatedSection delay={350}>
                            <div className="mb-16">
                                <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-frost mb-6 flex items-center gap-3">
                                    <Play className="w-5 h-5 text-electric" />
                                    Project Demo
                                </h2>
                                <div className="aspect-video rounded-2xl overflow-hidden border border-midnight-border shadow-2xl shadow-electric/10">
                                    <iframe
                                        src={project.videoUrl
                                            .replace("watch?v=", "embed/")
                                            .replace("youtu.be/", "youtube.com/embed/")}
                                        title={project.title}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            </div>
                        </AnimatedSection>
                    )}
                </div>
            </section>

            {/* Related Projects Section */}
            {relatedProjects && relatedProjects.length > 0 && (
                <section className="relative z-10 px-4 md:px-8 py-16 md:py-20 border-t border-midnight-border">
                    <div className="max-w-7xl mx-auto">
                        <AnimatedSection>
                            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold mb-10 text-center">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric via-accent-cyan to-electric">
                                    Related Projects
                                </span>
                            </h2>
                        </AnimatedSection>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedProjects.map((relProject, index) => {
                                const relTechnologies = parseTechnologies(relProject.technologies);

                                return (
                                    <AnimatedSection key={relProject.id} delay={index * 100}>
                                        <Link href={`/projects/${relProject.id}`}>
                                            <div className="group relative rounded-2xl overflow-hidden bg-midnight-card border border-midnight-border hover:border-electric/50 transition-all hover:shadow-[0_0_40px_rgba(0,255,136,0.15)] cursor-pointer">
                                                {/* Image */}
                                                <div className="aspect-[4/3] overflow-hidden relative">
                                                    {relProject.imageUrl || relProject.thumbnailUrl ? (
                                                        <>
                                                            <img
                                                                src={relProject.imageUrl || relProject.thumbnailUrl || ""}
                                                                alt={relProject.title}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/40 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
                                                        </>
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-midnight-card to-midnight flex items-center justify-center">
                                                            <Code className="w-16 h-16 text-frost-muted/30" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="p-5">
                                                    <h3 className="text-xl font-bold text-frost group-hover:text-electric transition-colors mb-2 line-clamp-1">
                                                        {relProject.title}
                                                    </h3>
                                                    <p className="text-frost-muted text-sm line-clamp-2 mb-4">
                                                        {relProject.description}
                                                    </p>
                                                    {relTechnologies.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {relTechnologies.slice(0, 3).map((tech, i) => (
                                                                <TechBadge key={i} tech={tech} size="sm" />
                                                            ))}
                                                            {relTechnologies.length > 3 && (
                                                                <span className="px-2 py-1 rounded-full bg-electric/10 text-electric text-xs font-medium">
                                                                    +{relTechnologies.length - 3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    </AnimatedSection>
                                );
                            })}
                        </div>

                        {/* View All Projects Link */}
                        <AnimatedSection delay={400}>
                            <div className="text-center mt-12">
                                <Link href="/projects">
                                    <Button
                                        variant="outline"
                                        className="rounded-full border-2 border-electric/50 text-electric hover:bg-electric hover:text-midnight transition-all h-12 px-8 text-lg font-semibold"
                                    >
                                        View All Projects
                                        <ChevronRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </AnimatedSection>
                    </div>
                </section>
            )}

            {/* Footer Space */}
            <div className="h-20" />
        </div>
    );
}
