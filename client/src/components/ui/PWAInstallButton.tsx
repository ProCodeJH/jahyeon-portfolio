/**
 * PWAInstallButton.tsx
 * PWA 앱 설치 버튼 및 오프라인 인디케이터
 */

import { useState } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { cn } from '@/lib/utils';
import { Download, RefreshCw, WifiOff, Check, X } from 'lucide-react';

interface PWAInstallButtonProps {
    className?: string;
    variant?: 'button' | 'banner' | 'minimal';
}

export function PWAInstallButton({ className, variant = 'button' }: PWAInstallButtonProps) {
    const { isInstallable, isInstalled, isUpdateAvailable, isOffline, promptInstall, updateApp } = usePWA();
    const [dismissed, setDismissed] = useState(false);

    // 이미 설치되었거나 닫았으면 표시 안함
    if (isInstalled || dismissed) {
        return null;
    }

    // 업데이트 가능 알림
    if (isUpdateAvailable) {
        return (
            <div className={cn(
                "fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl",
                "bg-blue-500 text-white shadow-lg shadow-blue-500/25",
                className
            )}>
                <RefreshCw className="w-5 h-5" />
                <span className="text-sm font-medium">새 버전이 있습니다</span>
                <button
                    onClick={updateApp}
                    className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                >
                    업데이트
                </button>
            </div>
        );
    }

    // 설치 가능한 경우
    if (!isInstallable) {
        return null;
    }

    if (variant === 'minimal') {
        return (
            <button
                onClick={promptInstall}
                className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg",
                    "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors",
                    className
                )}
            >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">앱 설치</span>
            </button>
        );
    }

    if (variant === 'banner') {
        return (
            <div className={cn(
                "fixed bottom-0 left-0 right-0 z-50 p-4",
                "bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent",
                className
            )}>
                <div className="max-w-lg mx-auto flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                        <Download className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium">앱으로 설치하기</h3>
                        <p className="text-white/50 text-sm truncate">홈 화면에 추가하여 빠르게 접근하세요</p>
                    </div>
                    <button
                        onClick={promptInstall}
                        className="shrink-0 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-medium rounded-xl transition-colors"
                    >
                        설치
                    </button>
                    <button
                        onClick={() => setDismissed(true)}
                        className="shrink-0 p-2 text-white/40 hover:text-white/60 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    // Default button variant
    return (
        <button
            onClick={promptInstall}
            className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl",
                "bg-emerald-500 hover:bg-emerald-400 text-black font-medium",
                "transition-all shadow-lg shadow-emerald-500/25",
                className
            )}
        >
            <Download className="w-5 h-5" />
            앱 설치
        </button>
    );
}

// 오프라인 인디케이터
export function OfflineIndicator({ className }: { className?: string }) {
    const { isOffline } = usePWA();

    if (!isOffline) return null;

    return (
        <div className={cn(
            "fixed top-4 left-1/2 -translate-x-1/2 z-50",
            "flex items-center gap-2 px-4 py-2 rounded-full",
            "bg-yellow-500/20 border border-yellow-500/30 text-yellow-400",
            "backdrop-blur-xl shadow-lg",
            className
        )}>
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">오프라인 모드</span>
        </div>
    );
}

// 설치 완료 토스트 (옵션)
export function InstallSuccessToast({ show, onClose }: { show: boolean; onClose: () => void }) {
    if (!show) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500 text-black shadow-lg animate-in slide-in-from-bottom-5">
            <Check className="w-5 h-5" />
            <span className="text-sm font-medium">앱이 설치되었습니다!</span>
            <button
                onClick={onClose}
                className="p-1 hover:bg-black/10 rounded-lg transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

export default PWAInstallButton;
