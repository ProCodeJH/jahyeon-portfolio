/**
 * SEOHead.tsx
 * SEO 최적화를 위한 메타 태그 컴포넌트
 * Open Graph, Twitter Cards, 기본 SEO 태그 지원
 */

import { useEffect } from "react";

interface SEOHeadProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: "website" | "article" | "profile";
    keywords?: string[];
    author?: string;
    noindex?: boolean;
}

const DEFAULT_TITLE = "Jahyeon | 코딩쏙쏙 포트폴리오";
const DEFAULT_DESCRIPTION = "C언어, Python, Arduino 교육 전문. 임베디드 시스템, IoT 프로젝트를 통한 실무 중심 프로그래밍 교육.";
const DEFAULT_IMAGE = "/og-image.jpg";
const SITE_URL = "https://jahyeon.dev";

export function SEOHead({
    title = DEFAULT_TITLE,
    description = DEFAULT_DESCRIPTION,
    image = DEFAULT_IMAGE,
    url = SITE_URL,
    type = "website",
    keywords = ["프로그래밍 교육", "C언어", "Python", "Arduino", "임베디드", "IoT", "코딩 교육"],
    author = "Jahyeon",
    noindex = false,
}: SEOHeadProps) {
    useEffect(() => {
        // Title
        document.title = title;

        // Meta description
        updateMeta("description", description);

        // Keywords
        updateMeta("keywords", keywords.join(", "));

        // Author
        updateMeta("author", author);

        // Robots
        updateMeta("robots", noindex ? "noindex, nofollow" : "index, follow");

        // Open Graph
        updateMeta("og:title", title, true);
        updateMeta("og:description", description, true);
        updateMeta("og:image", image.startsWith("http") ? image : `${SITE_URL}${image}`, true);
        updateMeta("og:url", url, true);
        updateMeta("og:type", type, true);
        updateMeta("og:site_name", "Jahyeon Portfolio", true);
        updateMeta("og:locale", "ko_KR", true);

        // Twitter Cards
        updateMeta("twitter:card", "summary_large_image");
        updateMeta("twitter:title", title);
        updateMeta("twitter:description", description);
        updateMeta("twitter:image", image.startsWith("http") ? image : `${SITE_URL}${image}`);

        // Canonical URL
        updateCanonical(url);

        // Structured Data (JSON-LD)
        updateStructuredData({
            "@context": "https://schema.org",
            "@type": type === "article" ? "Article" : "WebSite",
            "name": title,
            "description": description,
            "url": url,
            "author": {
                "@type": "Person",
                "name": author,
            },
            "image": image.startsWith("http") ? image : `${SITE_URL}${image}`,
        });
    }, [title, description, image, url, type, keywords, author, noindex]);

    return null; // This component only manages document head
}

// Helper functions
function updateMeta(name: string, content: string, isProperty = false) {
    const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
    let meta = document.querySelector(selector) as HTMLMetaElement | null;

    if (!meta) {
        meta = document.createElement("meta");
        if (isProperty) {
            meta.setAttribute("property", name);
        } else {
            meta.setAttribute("name", name);
        }
        document.head.appendChild(meta);
    }

    meta.setAttribute("content", content);
}

function updateCanonical(url: string) {
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

    if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
    }

    link.setAttribute("href", url);
}

function updateStructuredData(data: Record<string, unknown>) {
    const existingScript = document.querySelector('script[type="application/ld+json"]');

    if (existingScript) {
        existingScript.textContent = JSON.stringify(data);
    } else {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
    }
}

// Pre-configured SEO components for common pages
export function HomeSEO() {
    return (
        <SEOHead
            title="Jahyeon | 코딩쏙쏙 포트폴리오"
            description="C언어, Python, Arduino 교육 전문. 임베디드 시스템, IoT 프로젝트를 통한 실무 중심 프로그래밍 교육."
            keywords={["프로그래밍 교육", "C언어", "Python", "Arduino", "임베디드", "IoT", "코딩 교육", "포트폴리오"]}
        />
    );
}

export function ProjectsSEO() {
    return (
        <SEOHead
            title="프로젝트 | Jahyeon Portfolio"
            description="C언어, Python, Arduino를 활용한 다양한 임베디드 및 IoT 프로젝트 포트폴리오."
            url={`${SITE_URL}/projects`}
            keywords={["프로젝트", "포트폴리오", "C언어", "Python", "Arduino", "임베디드", "IoT"]}
        />
    );
}

export function ResourcesSEO() {
    return (
        <SEOHead
            title="수업자료 | Jahyeon Portfolio"
            description="C언어, Python, Arduino 수업자료 및 강의 영상. 프로그래밍 학습을 위한 다양한 자료 제공."
            url={`${SITE_URL}/resources`}
            keywords={["수업자료", "강의", "프로그래밍", "C언어", "Python", "Arduino", "학습"]}
        />
    );
}

export default SEOHead;
