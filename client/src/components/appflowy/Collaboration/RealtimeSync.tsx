/**
 * AppFlowy Collaboration - Realtime Sync
 * 
 * Yjs 기반 실시간 협업 기능
 * - 문서 동기화
 * - 다중 커서
 * - 사용자 인식 (Awareness)
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import * as Y from 'yjs';
// import { WebsocketProvider } from 'y-websocket';

// ============================================
// 🔧 타입 정의
// ============================================
export interface CollaboratorInfo {
    id: string;
    name: string;
    color: string;
    cursor?: {
        anchor: number;
        head: number;
    };
}

export interface RealtimeState {
    isConnected: boolean;
    isSynced: boolean;
    collaborators: CollaboratorInfo[];
}

// ============================================
// 🎨 커서 색상 팔레트
// ============================================
const CURSOR_COLORS = [
    '#F87171', // red
    '#FB923C', // orange
    '#FBBF24', // yellow
    '#34D399', // green
    '#60A5FA', // blue
    '#A78BFA', // purple
    '#F472B6', // pink
    '#2DD4BF', // teal
];

function getRandomColor(): string {
    return CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
}

// ============================================
// 🪝 실시간 협업 훅
// ============================================
interface UseRealtimeOptions {
    roomId: string;
    userName: string;
    serverUrl?: string;
}

export function useRealtime({
    roomId,
    userName,
    serverUrl = 'wss://demos.yjs.dev',
}: UseRealtimeOptions) {
    const [isConnected, setIsConnected] = useState(false);
    const [isSynced, setIsSynced] = useState(false);
    const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([]);

    // Yjs 문서
    const ydoc = useMemo(() => new Y.Doc(), []);

    // 공유 콘텐츠
    const yContent = useMemo(() => ydoc.getXmlFragment('content'), [ydoc]);

    // 현재 사용자 정보
    const userInfo = useMemo(() => ({
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: userName,
        color: getRandomColor(),
    }), [userName]);

    // WebSocket 연결 (실제 구현시 주석 해제)
    useEffect(() => {
        // TODO: 실제 WebSocket 프로바이더 연결
        // const provider = new WebsocketProvider(serverUrl, roomId, ydoc);
        // 
        // provider.on('status', ({ status }: { status: string }) => {
        //   setIsConnected(status === 'connected');
        // });
        // 
        // provider.on('synced', (synced: boolean) => {
        //   setIsSynced(synced);
        // });
        // 
        // // Awareness (커서, 선택 영역 공유)
        // provider.awareness.setLocalState(userInfo);
        // 
        // provider.awareness.on('change', () => {
        //   const states = Array.from(provider.awareness.getStates().values());
        //   setCollaborators(states.filter((s) => s.id !== userInfo.id));
        // });
        // 
        // return () => {
        //   provider.destroy();
        // };

        // 시뮬레이션
        const timer = setTimeout(() => {
            setIsConnected(true);
            setIsSynced(true);

            // 가상 협업자
            setCollaborators([
                { id: 'user-1', name: 'Alice', color: '#60A5FA' },
                { id: 'user-2', name: 'Bob', color: '#34D399' },
            ]);
        }, 500);

        return () => clearTimeout(timer);
    }, [roomId, serverUrl, ydoc, userInfo]);

    // 커서 위치 업데이트
    const updateCursor = useCallback((anchor: number, head: number) => {
        // provider.awareness.setLocalStateField('cursor', { anchor, head });
        console.log('Cursor updated:', { anchor, head });
    }, []);

    // 연결 해제
    const disconnect = useCallback(() => {
        // provider.disconnect();
        setIsConnected(false);
        setCollaborators([]);
    }, []);

    // 재연결
    const reconnect = useCallback(() => {
        // provider.connect();
        setIsConnected(true);
    }, []);

    return {
        // 상태
        isConnected,
        isSynced,
        collaborators,
        userInfo,

        // Yjs 객체
        ydoc,
        yContent,

        // 액션
        updateCursor,
        disconnect,
        reconnect,
    };
}

// ============================================
// 🎯 협업자 커서 컴포넌트
// ============================================
interface CollaboratorCursorProps {
    collaborator: CollaboratorInfo;
    position: { top: number; left: number };
}

export function CollaboratorCursor({ collaborator, position }: CollaboratorCursorProps) {
    return (
        <div
            className="absolute pointer-events-none z-50 transition-all duration-100"
            style={{ top: position.top, left: position.left }}
        >
            {/* 커서 라인 */}
            <div
                className="w-0.5 h-5"
                style={{ backgroundColor: collaborator.color }}
            />

            {/* 이름 태그 */}
            <div
                className="absolute top-0 left-1 px-1.5 py-0.5 rounded text-xs font-medium text-white whitespace-nowrap"
                style={{ backgroundColor: collaborator.color }}
            >
                {collaborator.name}
            </div>
        </div>
    );
}

// ============================================
// 📊 연결 상태 표시
// ============================================
interface ConnectionStatusProps {
    isConnected: boolean;
    isSynced: boolean;
    collaboratorsCount: number;
    className?: string;
}

export function ConnectionStatus({
    isConnected,
    isSynced,
    collaboratorsCount,
    className,
}: ConnectionStatusProps) {
    return (
        <div className={`flex items-center gap-2 text-sm ${className}`}>
            {/* 연결 상태 인디케이터 */}
            <div className="flex items-center gap-1.5">
                <div
                    className={`w-2 h-2 rounded-full ${isConnected
                            ? isSynced
                                ? 'bg-green-500'
                                : 'bg-yellow-500 animate-pulse'
                            : 'bg-red-500'
                        }`}
                />
                <span className="text-gray-500">
                    {isConnected
                        ? isSynced
                            ? 'Connected'
                            : 'Syncing...'
                        : 'Disconnected'}
                </span>
            </div>

            {/* 협업자 수 */}
            {collaboratorsCount > 0 && (
                <div className="flex items-center gap-1 text-gray-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    <span>{collaboratorsCount + 1}</span>
                </div>
            )}
        </div>
    );
}

// ============================================
// 👥 협업자 아바타 목록
// ============================================
interface CollaboratorAvatarsProps {
    collaborators: CollaboratorInfo[];
    currentUser: CollaboratorInfo;
    maxVisible?: number;
}

export function CollaboratorAvatars({
    collaborators,
    currentUser,
    maxVisible = 5,
}: CollaboratorAvatarsProps) {
    const allUsers = [currentUser, ...collaborators];
    const visibleUsers = allUsers.slice(0, maxVisible);
    const hiddenCount = allUsers.length - maxVisible;

    return (
        <div className="flex items-center -space-x-2">
            {visibleUsers.map((user, index) => (
                <div
                    key={user.id}
                    className="relative w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium text-white"
                    style={{
                        backgroundColor: user.color,
                        zIndex: visibleUsers.length - index,
                    }}
                    title={user.name}
                >
                    {user.name.charAt(0).toUpperCase()}
                </div>
            ))}

            {hiddenCount > 0 && (
                <div
                    className="relative w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-400 flex items-center justify-center text-xs font-medium text-white"
                >
                    +{hiddenCount}
                </div>
            )}
        </div>
    );
}

// ============================================
// 📦 기본 내보내기
// ============================================
export default {
    useRealtime,
    CollaboratorCursor,
    ConnectionStatus,
    CollaboratorAvatars,
};
