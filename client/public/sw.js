/**
 * Service Worker for Jahyeon Portfolio PWA
 * 오프라인 캐싱 및 백그라운드 동기화 지원
 */

const CACHE_NAME = 'jahyeon-portfolio-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
];

// API 패턴 (캐시하지 않음)
const API_PATTERNS = [
    /\/api\//,
    /\/trpc\//,
];

// 설치 이벤트 - 정적 자산 캐싱
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    // 즉시 활성화
    self.skipWaiting();
});

// 활성화 이벤트 - 오래된 캐시 정리
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    // 모든 클라이언트 제어
    self.clients.claim();
});

// Fetch 이벤트 - 네트워크 우선, 캐시 폴백 전략
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // API 요청은 캐시하지 않음
    if (API_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
        return;
    }

    // GET 요청만 캐싱
    if (request.method !== 'GET') {
        return;
    }

    event.respondWith(
        // 네트워크 우선 전략
        fetch(request)
            .then((response) => {
                // 유효한 응답만 캐싱
                if (response.ok) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // 네트워크 실패 시 캐시에서 제공
                return caches.match(request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // 캐시에도 없으면 오프라인 페이지 (있는 경우)
                    if (request.destination === 'document') {
                        return caches.match('/');
                    }
                    return new Response('Offline', {
                        status: 503,
                        statusText: 'Service Unavailable',
                    });
                });
            })
    );
});

// 푸시 알림 (나중에 확장 가능)
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body || '새로운 알림이 있습니다',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: { url: data.url || '/' },
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Jahyeon Portfolio', options)
    );
});

// 알림 클릭
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window' }).then((clients) => {
            // 이미 열린 창이 있으면 포커스
            for (const client of clients) {
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            // 없으면 새 창 열기
            return self.clients.openWindow(url);
        })
    );
});

console.log('[SW] Service Worker loaded');
