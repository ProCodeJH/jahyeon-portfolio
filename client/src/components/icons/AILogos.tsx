// Official AI Brand SVG Logo Components
// Sources: Brandfetch, Wikimedia Commons, Official Brand Guidelines

import React from "react";

interface LogoProps {
    className?: string;
}

// OpenAI Official Logo (Black/White hexagon pattern)
export const OpenAILogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364l2.0201-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
    </svg>
);

// Google Gemini Logo (Multi-color star pattern)
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

// Anthropic Claude Logo (Orange/Brown star pattern)
export const AnthropicLogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.3042 3.44205H20.2125L13.8017 20.558H10.8934L17.3042 3.44205ZM3.78754 3.44205H6.69583L10.1042 14.1017L6.99583 20.558H3.78754L8.50421 8.89538L3.78754 3.44205ZM13.1959 3.44205H16.1042L12.6959 14.1017L15.8042 20.558H19.0125L14.2959 8.89538L17.3042 3.44205H13.1959Z" />
    </svg>
);

// Claude AI Symbol (Simpler version)
export const ClaudeLogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="#D97706">
        <path d="M4.709 15.955l6.626-11.593a.749.749 0 0 1 1.33 0l6.626 11.593c.294.515-.073 1.16-.665 1.16H5.374c-.592 0-.96-.645-.665-1.16z" />
        <path d="M12 7.144L6.783 16.24h10.434L12 7.144z" fill="#FFF" />
    </svg>
);

// GitHub Logo
export const GitHubLogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
);

// Microsoft Logo (4 squares)
export const MicrosoftLogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 23 23" fill="none">
        <rect width="11" height="11" fill="#F25022" />
        <rect x="12" width="11" height="11" fill="#7FBA00" />
        <rect y="12" width="11" height="11" fill="#00A4EF" />
        <rect x="12" y="12" width="11" height="11" fill="#FFB900" />
    </svg>
);

// Meta Logo
export const MetaLogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a4.892 4.892 0 0 0 1.036 1.98c.482.527 1.098.934 1.846 1.008.804.074 1.51-.253 2.153-.67.61-.411 1.19-.945 1.807-1.533a42.472 42.472 0 0 0 1.756-1.848c1.073-1.172 2.19-2.483 3.196-3.832.975-1.306 1.873-2.658 2.456-3.893.388-.792.622-1.505.622-2.131 0-1.056-.508-2.063-1.37-2.782-.86-.718-2.033-1.082-3.339-.96l-.127.015a6.382 6.382 0 0 0-1.735.585c-.536.261-1.037.6-1.503 1.01A9.143 9.143 0 0 0 6.915 4.03zm5.171 2.378c.21 0 .388.085.517.213.129.127.201.3.201.494 0 .496-.263 1.238-.71 2.082-.481.896-1.233 1.97-2.154 3.118a42.587 42.587 0 0 1-2.982 3.477l-.189.195c-.574.58-1.114 1.104-1.582 1.398-.5.314-.93.376-1.362.342a2.061 2.061 0 0 1-.779-.368 2.707 2.707 0 0 1-.578-1.13 6.49 6.49 0 0 1-.146-1.335c0-2.209.588-4.504 1.606-6.14.955-1.538 2.185-2.468 3.597-2.468 1.032 0 1.821.451 2.377 1.097.504.583.808 1.355.808 2.115 0 .508-.148 1.088-.456 1.77-.48.977-1.32 2.288-2.302 3.5a42.077 42.077 0 0 1-2.29 2.633l-.04.042a.69.69 0 0 0-.04.65c.12.244.398.4.65.295l.056-.026a.698.698 0 0 0 .27-.248c.75-.961 1.533-2.02 2.23-3.033a26.98 26.98 0 0 0 2.055-3.22c.403-.777.69-1.505.69-2.126 0-.386-.097-.72-.283-.978-.186-.257-.463-.419-.811-.419z" />
        <path d="M17.085 4.03c-1.027 0-1.812.448-2.366 1.091-.503.583-.808 1.359-.808 2.12 0 .507.148 1.087.455 1.768.481.977 1.32 2.29 2.302 3.502a42.472 42.472 0 0 0 2.33 2.676l.04.041a.69.69 0 0 1 .04.65c-.12.244-.397.4-.65.296l-.055-.026a.698.698 0 0 1-.27-.248c-.75-.961-1.533-2.02-2.231-3.034a26.98 26.98 0 0 1-2.054-3.219c-.404-.777-.691-1.505-.691-2.126 0-.387.098-.72.284-.978.186-.258.462-.419.811-.419.21 0 .387.085.516.213.13.127.202.3.202.494 0 .496-.263 1.237-.71 2.081-.482.896-1.234 1.97-2.155 3.118a42.587 42.587 0 0 0-2.982 3.477l-.188.196c-.574.579-1.114 1.103-1.582 1.397-.501.314-.93.376-1.363.342a2.061 2.061 0 0 0-.779-.368 2.707 2.707 0 0 0-.577-1.13 6.49 6.49 0 0 0-.147-1.335c0-2.209.589-4.504 1.607-6.14.955-1.538 2.185-2.468 3.597-2.468 1.406 0 2.626.934 3.597 2.468 1.018 1.636 1.606 3.931 1.606 6.14 0 .707-.07 1.37-.21 1.974a4.892 4.892 0 0 1-1.036 1.98c-.483.527-1.098.934-1.847 1.007-.804.074-1.51-.252-2.152-.669-.61-.412-1.19-.946-1.807-1.534a42.472 42.472 0 0 1-1.757-1.848c-1.073-1.172-2.19-2.482-3.195-3.831-.975-1.307-1.874-2.659-2.456-3.894-.388-.792-.622-1.505-.622-2.131 0-1.056.508-2.063 1.37-2.782.859-.718 2.033-1.082 3.339-.96l.126.015c.6.084 1.18.291 1.736.585.535.261 1.036.6 1.502 1.01A9.143 9.143 0 0 1 17.085 4.03z" />
    </svg>
);

// Mistral AI Logo (M shape)
export const MistralLogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <rect x="0" y="0" width="4.8" height="4.8" fill="#F7D046" />
        <rect x="9.6" y="0" width="4.8" height="4.8" fill="#F7D046" />
        <rect x="19.2" y="0" width="4.8" height="4.8" />
        <rect x="0" y="4.8" width="4.8" height="4.8" />
        <rect x="4.8" y="4.8" width="4.8" height="4.8" fill="#F2A73B" />
        <rect x="9.6" y="4.8" width="4.8" height="4.8" />
        <rect x="14.4" y="4.8" width="4.8" height="4.8" fill="#F2A73B" />
        <rect x="19.2" y="4.8" width="4.8" height="4.8" />
        <rect x="0" y="9.6" width="4.8" height="4.8" />
        <rect x="9.6" y="9.6" width="4.8" height="4.8" />
        <rect x="19.2" y="9.6" width="4.8" height="4.8" />
        <rect x="0" y="14.4" width="4.8" height="4.8" />
        <rect x="9.6" y="14.4" width="4.8" height="4.8" />
        <rect x="19.2" y="14.4" width="4.8" height="4.8" />
        <rect x="0" y="19.2" width="4.8" height="4.8" />
        <rect x="9.6" y="19.2" width="4.8" height="4.8" />
        <rect x="19.2" y="19.2" width="4.8" height="4.8" />
    </svg>
);

// Vercel Logo (Triangle)
export const VercelLogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 22.525H0l12-21.05 12 21.05z" />
    </svg>
);

// Cursor AI Logo
export const CursorLogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M5.727 0L24 18.273l-6.545 5.454L0 6.545z" />
        <path d="M17.455 18.273L24 24l-6.545-5.727z" opacity="0.5" />
    </svg>
);

// Cohere Logo (Circles)
export const CohereLogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="6" r="5" />
        <circle cx="6" cy="16" r="5" />
        <circle cx="18" cy="16" r="5" />
    </svg>
);

// Hugging Face Logo
export const HuggingFaceLogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="#FFD21E">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.09.682-.218.682-.484 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.607.069-.607 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.831.092-.646.35-1.088.636-1.337-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.481A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z" />
        <circle cx="8.5" cy="11" r="1.5" fill="#000" />
        <circle cx="15.5" cy="11" r="1.5" fill="#000" />
        <path d="M9 15c.9 1.2 2.4 2 4 2s3.1-.8 4-2" stroke="#000" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
);

// Perplexity AI Logo
export const PerplexityLogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l7.09 3.54L12 11.27 4.91 7.72 12 4.18zM4 8.82l7 3.5v7.86l-7-3.5V8.82zm9 11.36v-7.86l7-3.5v7.86l-7 3.5z" />
    </svg>
);

// xAI Grok Logo
export const GrokLogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 4h6l2 4 2-4h6v16h-6v-8l-2 4-2-4v8H4V4z" />
    </svg>
);

// Antigravity Logo (Custom)
export const AntigravityLogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none">
        <defs>
            <linearGradient id="ag-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="10" stroke="url(#ag-grad)" strokeWidth="2" fill="none" />
        <path d="M12 6l4 9H8l4-9z" fill="url(#ag-grad)" />
        <circle cx="12" cy="18" r="1.5" fill="url(#ag-grad)" />
    </svg>
);

// Jules (GitHub) Logo
export const JulesLogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none">
        <defs>
            <linearGradient id="jules-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
        </defs>
        <rect x="3" y="5" width="18" height="14" rx="3" stroke="url(#jules-grad)" strokeWidth="2" fill="none" />
        <path d="M7 9h10M7 12h6M7 15h8" stroke="url(#jules-grad)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="17" cy="14" r="2" fill="url(#jules-grad)" />
    </svg>
);

export default {
    OpenAILogo,
    GoogleGeminiLogo,
    AnthropicLogo,
    ClaudeLogo,
    GitHubLogo,
    MicrosoftLogo,
    MetaLogo,
    MistralLogo,
    VercelLogo,
    CursorLogo,
    CohereLogo,
    HuggingFaceLogo,
    PerplexityLogo,
    GrokLogo,
    AntigravityLogo,
    JulesLogo
};
