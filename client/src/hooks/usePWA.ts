/**
 * usePWA.ts
 * PWA 기능을 위한 커스텀 훅
 * Service Worker 등록, 설치 프롬프트, 업데이트 감지
 */

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAState {
    isInstallable: boolean;
    isInstalled: boolean;
    isUpdateAvailable: boolean;
    isOffline: boolean;
}

export function usePWA() {
    const [state, setState] = useState<PWAState>({
        isInstallable: false,
        isInstalled: false,
        isUpdateAvailable: false,
        isOffline: !navigator.onLine,
    });

    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

    // Service Worker 등록
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then((reg) => {
                    console.log('[PWA] Service Worker registered');
                    setRegistration(reg);

                    // 업데이트 감지
                    reg.addEventListener('updatefound', () => {
                        const newWorker = reg.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    setState((prev) => ({ ...prev, isUpdateAvailable: true }));
                                    console.log('[PWA] New version available');
                                }
                            });
                        }
                    });
                })
                .catch((err) => {
                    console.error('[PWA] Service Worker registration failed:', err);
                });
        }
    }, []);

    // 설치 프롬프트 캡처
    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setState((prev) => ({ ...prev, isInstallable: true }));
            console.log('[PWA] Install prompt captured');
        };

        // 이미 설치된 경우 감지
        const handleAppInstalled = () => {
            setDeferredPrompt(null);
            setState((prev) => ({ ...prev, isInstallable: false, isInstalled: true }));
            console.log('[PWA] App installed');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        // standalone 모드 체크 (이미 설치된 경우)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setState((prev) => ({ ...prev, isInstalled: true }));
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    // 오프라인 상태 감지
    useEffect(() => {
        const handleOnline = () => setState((prev) => ({ ...prev, isOffline: false }));
        const handleOffline = () => setState((prev) => ({ ...prev, isOffline: true }));

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // 설치 프롬프트 표시
    const promptInstall = useCallback(async () => {
        if (!deferredPrompt) {
            console.log('[PWA] No install prompt available');
            return false;
        }

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log('[PWA] Install prompt result:', outcome);

            if (outcome === 'accepted') {
                setState((prev) => ({ ...prev, isInstallable: false, isInstalled: true }));
            }

            setDeferredPrompt(null);
            return outcome === 'accepted';
        } catch (err) {
            console.error('[PWA] Install prompt error:', err);
            return false;
        }
    }, [deferredPrompt]);

    // 앱 업데이트
    const updateApp = useCallback(() => {
        if (registration?.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        }
    }, [registration]);

    return {
        ...state,
        promptInstall,
        updateApp,
    };
}

export default usePWA;
