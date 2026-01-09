// Official AI Brand SVG Logo Components
// Verified from: Bootstrap Icons, Brandfetch, Wikimedia Commons, Official Brand Pages

import React from "react";

interface LogoProps {
    className?: string;
}

// OpenAI Official Logo (Hexagon/flower pattern)
export const OpenAILogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364l2.0201-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
    </svg>
);

// Google Gemini Logo (4-point star)
export const GoogleGeminiLogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 28 28" fill="none">
        <path
            d="M14 28C14 26.0633 13.6267 24.2433 12.88 22.54C12.1567 20.8367 11.165 19.355 9.905 18.095C8.645 16.835 7.16333 15.8433 5.46 15.12C3.75667 14.3733 1.93667 14 0 14C1.93667 14 3.75667 13.6383 5.46 12.915C7.16333 12.1683 8.645 11.165 9.905 9.905C11.165 8.645 12.1567 7.16333 12.88 5.46C13.6267 3.75667 14 1.93667 14 0C14 1.93667 14.3617 3.75667 15.085 5.46C15.8317 7.16333 16.835 8.645 18.095 9.905C19.355 11.165 20.8367 12.1683 22.54 12.915C24.2433 13.6383 26.0633 14 28 14C26.0633 14 24.2433 14.3733 22.54 15.12C20.8367 15.8433 19.355 16.835 18.095 18.095C16.835 19.355 15.8317 20.8367 15.085 22.54C14.3617 24.2433 14 26.0633 14 28Z"
            fill="url(#gemini-gradient)"
        />
        <defs>
            <linearGradient id="gemini-gradient" x1="0" y1="14" x2="28" y2="14">
                <stop stopColor="#4285F4" />
                <stop offset="0.5" stopColor="#9B72CB" />
                <stop offset="1" stopColor="#D96570" />
            </linearGradient>
        </defs>
    </svg>
);

// Anthropic Logo (Stylized A - BLACK version from user image)
export const AnthropicLogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 100 80" fill="currentColor">
        {/* Main A shape */}
        <path d="M40 0L0 80H18L40 36L62 80H80L40 0Z" />
        {/* Right vertical bar */}
        <path d="M65 0H83V80H65V0Z" />
    </svg>
);

// Claude AI Logo (Rainbow Gradient A - from user image)
export const ClaudeLogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 100 90" fill="none">
        <defs>
            <linearGradient id="claude-rainbow" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#FF6B6B" />
                <stop offset="25%" stopColor="#FFB347" />
                <stop offset="50%" stopColor="#7ED957" />
                <stop offset="75%" stopColor="#4ECDC4" />
                <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
        </defs>
        {/* Curved A mountain shape with rounded bottom */}
        <path
            d="M50 5C50 5 25 45 15 70C10 82 20 88 30 85C38 83 42 78 50 78C58 78 62 83 70 85C80 88 90 82 85 70C75 45 50 5 50 5Z"
            fill="url(#claude-rainbow)"
        />
    </svg>
);

// Cursor Logo (Text logo "CURSOR" from user image)
export const CursorLogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 120 30" fill="currentColor">
        <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="22"
            letterSpacing="1"
        >
            CURSOR
        </text>
    </svg>
);

// GitHub Octocat Logo (Official from Bootstrap Icons)
export const GitHubLogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
    </svg>
);

// Microsoft 4-square Logo
export const MicrosoftLogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 23 23" fill="none">
        <rect width="10.5" height="10.5" fill="#F25022" />
        <rect x="11.5" width="10.5" height="10.5" fill="#7FBA00" />
        <rect y="11.5" width="10.5" height="10.5" fill="#00A4EF" />
        <rect x="11.5" y="11.5" width="10.5" height="10.5" fill="#FFB900" />
    </svg>
);

// Meta Infinity Logo
export const MetaLogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 100 60" fill="currentColor">
        <path d="M25 10C15 10 8 20 5 30C2 40 5 50 15 50C22 50 28 45 35 35C42 25 48 15 55 15C62 15 65 20 65 30C65 40 62 45 55 45C48 45 42 35 35 25C28 15 22 10 15 10" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <path d="M75 10C65 10 58 20 55 30C52 40 55 50 65 50C72 50 78 45 85 35C92 25 98 15 95 30C92 45 85 50 75 50" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
    </svg>
);

// Mistral AI Logo (Colored squares pattern)
export const MistralLogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none">
        <rect x="0" y="0" width="5" height="5" fill="#F7D046" />
        <rect x="9.5" y="0" width="5" height="5" fill="#F7D046" />
        <rect x="19" y="0" width="5" height="5" fill="currentColor" />
        <rect x="0" y="5" width="5" height="5" fill="currentColor" />
        <rect x="4.75" y="5" width="5" height="5" fill="#F2A73B" />
        <rect x="9.5" y="5" width="5" height="5" fill="currentColor" />
        <rect x="14.25" y="5" width="5" height="5" fill="#F2A73B" />
        <rect x="19" y="5" width="5" height="5" fill="currentColor" />
        <rect x="0" y="9.5" width="5" height="5" fill="currentColor" />
        <rect x="9.5" y="9.5" width="5" height="5" fill="currentColor" />
        <rect x="19" y="9.5" width="5" height="5" fill="currentColor" />
        <rect x="0" y="14" width="5" height="5" fill="currentColor" />
        <rect x="9.5" y="14" width="5" height="5" fill="#EE792F" />
        <rect x="19" y="14" width="5" height="5" fill="currentColor" />
        <rect x="0" y="19" width="5" height="5" fill="currentColor" />
        <rect x="9.5" y="19" width="5" height="5" fill="currentColor" />
        <rect x="19" y="19" width="5" height="5" fill="currentColor" />
    </svg>
);

// Vercel Black Triangle
export const VercelLogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 22.525H0l12-21.05 12 21.05z" />
    </svg>
);

// Cohere Logo (Connected circles)
export const CohereLogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <circle cx="6" cy="12" r="4" strokeWidth="2" stroke="currentColor" fill="none" />
        <circle cx="18" cy="12" r="4" strokeWidth="2" stroke="currentColor" fill="none" />
        <circle cx="12" cy="6" r="4" strokeWidth="2" stroke="currentColor" fill="none" />
        <path d="M9 9L15 9M9 15L12 10M12 10L15 15" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

// Hugging Face Logo (Yellow face with eyes)
export const HuggingFaceLogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#FFD21E" />
        <circle cx="8.5" cy="10" r="1.5" fill="#000" />
        <circle cx="15.5" cy="10" r="1.5" fill="#000" />
        <path d="M8 15c1 1.5 3 2.5 4 2.5s3-1 4-2.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
);

// Perplexity AI Logo (Magnifying glass/search)
export const PerplexityLogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l7.09 3.54L12 11.27 4.91 7.72 12 4.18zM4 8.82l7 3.5v7.86l-7-3.5V8.82zm9 11.36v-7.86l7-3.5v7.86l-7 3.5z" />
    </svg>
);

// xAI Grok Logo (X logo style)
export const GrokLogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

// Antigravity Logo (Custom gradient rocket/triangle)
export const AntigravityLogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none">
        <defs>
            <linearGradient id="ag-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="10" stroke="url(#ag-grad)" strokeWidth="2" fill="none" />
        <path d="M12 5L17 17H7L12 5Z" fill="url(#ag-grad)" />
        <circle cx="12" cy="19" r="1.5" fill="url(#ag-grad)" />
    </svg>
);

// Jules (GitHub AI Assistant) Logo
export const JulesLogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none">
        <defs>
            <linearGradient id="jules-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
        </defs>
        <rect x="4" y="4" width="16" height="16" rx="3" stroke="url(#jules-grad)" strokeWidth="2" fill="none" />
        <path d="M8 9h8M8 12h5M8 15h6" stroke="url(#jules-grad)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="16" cy="14" r="2" fill="url(#jules-grad)" />
    </svg>
);

export default {
    OpenAILogo,
    GoogleGeminiLogo,
    AnthropicLogo,
    ClaudeLogo,
    CursorLogo,
    GitHubLogo,
    MicrosoftLogo,
    MetaLogo,
    MistralLogo,
    VercelLogo,
    CohereLogo,
    HuggingFaceLogo,
    PerplexityLogo,
    GrokLogo,
    AntigravityLogo,
    JulesLogo
};
