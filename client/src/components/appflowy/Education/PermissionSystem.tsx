/**
 * 코딩쏙학원 - 권한 시스템
 * 
 * 사용자 역할 및 페이지별 권한 관리
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
    appFlowyDark, appFlowyLight, appFlowyFont, appFlowySpacing, ThemeMode
} from '@/styles/appflowy/design-system';
import { Shield, Eye, Edit, Lock, Users, UserPlus, X, Check } from 'lucide-react';

// ============================================
// 🔧 타입 정의
// ============================================
export type UserRole = 'owner' | 'admin' | 'teacher' | 'student' | 'guest';

export type Permission =
    | 'read'           // 읽기
    | 'comment'        // 댓글
    | 'edit'           // 편집
    | 'share'          // 공유
    | 'delete'         // 삭제
    | 'manage_members' // 멤버 관리
    | 'full_access';   // 전체 권한

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: UserRole;
}

export interface PagePermission {
    pageId: string;
    userId?: string;
    groupId?: string;
    permission: Permission;
    grantedBy: string;
    grantedAt: Date;
}

export interface Group {
    id: string;
    name: string;
    description?: string;
    memberIds: string[];
    createdAt: Date;
}

// ============================================
// 🎨 역할별 설정
// ============================================
export const ROLE_CONFIG: Record<UserRole, {
    label: string;
    color: string;
    defaultPermissions: Permission[];
    icon: any;
}> = {
    owner: {
        label: '소유자',
        color: '#9333EA',
        defaultPermissions: ['full_access'],
        icon: Shield,
    },
    admin: {
        label: '관리자',
        color: '#3B82F6',
        defaultPermissions: ['read', 'comment', 'edit', 'share', 'delete', 'manage_members'],
        icon: Shield,
    },
    teacher: {
        label: '선생님',
        color: '#10B981',
        defaultPermissions: ['read', 'comment', 'edit', 'share'],
        icon: Edit,
    },
    student: {
        label: '학생',
        color: '#F59E0B',
        defaultPermissions: ['read', 'comment'],
        icon: Eye,
    },
    guest: {
        label: '게스트',
        color: '#6B7280',
        defaultPermissions: ['read'],
        icon: Eye,
    },
};

export const PERMISSION_CONFIG: Record<Permission, {
    label: string;
    description: string;
    icon: any;
}> = {
    read: { label: '읽기', description: '콘텐츠 조회 가능', icon: Eye },
    comment: { label: '댓글', description: '댓글 작성 가능', icon: Edit },
    edit: { label: '편집', description: '콘텐츠 수정 가능', icon: Edit },
    share: { label: '공유', description: '다른 사용자와 공유 가능', icon: Users },
    delete: { label: '삭제', description: '콘텐츠 삭제 가능', icon: X },
    manage_members: { label: '멤버 관리', description: '멤버 추가/제거 가능', icon: UserPlus },
    full_access: { label: '전체 권한', description: '모든 권한 보유', icon: Shield },
};

// ============================================
// 🎯 권한 컨텍스트
// ============================================
interface PermissionContextValue {
    currentUser: User | null;
    users: User[];
    groups: Group[];
    pagePermissions: PagePermission[];

    // 권한 체크
    hasPermission: (pageId: string, permission: Permission) => boolean;
    canEdit: (pageId: string) => boolean;
    canDelete: (pageId: string) => boolean;
    canShare: (pageId: string) => boolean;
    canManageMembers: (pageId: string) => boolean;

    // 권한 관리
    grantPermission: (pageId: string, userId: string, permission: Permission) => void;
    revokePermission: (pageId: string, userId: string) => void;

    // 그룹 관리
    createGroup: (name: string, memberIds: string[]) => Group;
    addToGroup: (groupId: string, userId: string) => void;
    removeFromGroup: (groupId: string, userId: string) => void;
}

const PermissionContext = createContext<PermissionContextValue | null>(null);

export function usePermission() {
    const context = useContext(PermissionContext);
    if (!context) {
        throw new Error('usePermission must be used within PermissionProvider');
    }
    return context;
}

// ============================================
// 📦 권한 프로바이더
// ============================================
interface PermissionProviderProps {
    children: ReactNode;
    currentUser: User;
    initialUsers?: User[];
    initialGroups?: Group[];
    initialPermissions?: PagePermission[];
}

export function PermissionProvider({
    children,
    currentUser,
    initialUsers = [],
    initialGroups = [],
    initialPermissions = [],
}: PermissionProviderProps) {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [groups, setGroups] = useState<Group[]>(initialGroups);
    const [pagePermissions, setPagePermissions] = useState<PagePermission[]>(initialPermissions);

    // 권한 체크
    const hasPermission = useCallback((pageId: string, permission: Permission): boolean => {
        // 소유자는 모든 권한
        if (currentUser.role === 'owner') return true;

        // 역할 기본 권한 체크
        const roleConfig = ROLE_CONFIG[currentUser.role];
        if (roleConfig.defaultPermissions.includes('full_access')) return true;
        if (roleConfig.defaultPermissions.includes(permission)) return true;

        // 페이지별 권한 체크
        const userPermission = pagePermissions.find(
            p => p.pageId === pageId && p.userId === currentUser.id
        );
        if (userPermission?.permission === 'full_access') return true;
        if (userPermission?.permission === permission) return true;

        // 그룹 권한 체크
        const userGroups = groups.filter(g => g.memberIds.includes(currentUser.id));
        for (const group of userGroups) {
            const groupPermission = pagePermissions.find(
                p => p.pageId === pageId && p.groupId === group.id
            );
            if (groupPermission?.permission === 'full_access') return true;
            if (groupPermission?.permission === permission) return true;
        }

        return false;
    }, [currentUser, pagePermissions, groups]);

    const canEdit = useCallback((pageId: string) => hasPermission(pageId, 'edit'), [hasPermission]);
    const canDelete = useCallback((pageId: string) => hasPermission(pageId, 'delete'), [hasPermission]);
    const canShare = useCallback((pageId: string) => hasPermission(pageId, 'share'), [hasPermission]);
    const canManageMembers = useCallback((pageId: string) => hasPermission(pageId, 'manage_members'), [hasPermission]);

    // 권한 부여
    const grantPermission = useCallback((pageId: string, userId: string, permission: Permission) => {
        setPagePermissions(prev => [
            ...prev.filter(p => !(p.pageId === pageId && p.userId === userId)),
            {
                pageId,
                userId,
                permission,
                grantedBy: currentUser.id,
                grantedAt: new Date(),
            },
        ]);
    }, [currentUser.id]);

    // 권한 취소
    const revokePermission = useCallback((pageId: string, userId: string) => {
        setPagePermissions(prev =>
            prev.filter(p => !(p.pageId === pageId && p.userId === userId))
        );
    }, []);

    // 그룹 생성
    const createGroup = useCallback((name: string, memberIds: string[]): Group => {
        const group: Group = {
            id: `group-${Date.now()}`,
            name,
            memberIds,
            createdAt: new Date(),
        };
        setGroups(prev => [...prev, group]);
        return group;
    }, []);

    // 그룹에 추가
    const addToGroup = useCallback((groupId: string, userId: string) => {
        setGroups(prev => prev.map(g =>
            g.id === groupId
                ? { ...g, memberIds: [...g.memberIds, userId] }
                : g
        ));
    }, []);

    // 그룹에서 제거
    const removeFromGroup = useCallback((groupId: string, userId: string) => {
        setGroups(prev => prev.map(g =>
            g.id === groupId
                ? { ...g, memberIds: g.memberIds.filter(id => id !== userId) }
                : g
        ));
    }, []);

    return (
        <PermissionContext.Provider value={{
            currentUser,
            users,
            groups,
            pagePermissions,
            hasPermission,
            canEdit,
            canDelete,
            canShare,
            canManageMembers,
            grantPermission,
            revokePermission,
            createGroup,
            addToGroup,
            removeFromGroup,
        }}>
            {children}
        </PermissionContext.Provider>
    );
}

// ============================================
// 🎛️ 권한 설정 UI
// ============================================
interface PermissionSettingsProps {
    theme?: ThemeMode;
    pageId: string;
    onClose?: () => void;
}

export function PermissionSettings({
    theme = 'dark',
    pageId,
    onClose,
}: PermissionSettingsProps) {
    const colors = theme === 'dark' ? appFlowyDark : appFlowyLight;
    const { users, groups, pagePermissions, grantPermission, revokePermission } = usePermission();

    const [selectedUser, setSelectedUser] = useState<string>('');
    const [selectedPermission, setSelectedPermission] = useState<Permission>('read');

    const currentPermissions = pagePermissions.filter(p => p.pageId === pageId);

    const handleGrant = () => {
        if (selectedUser) {
            grantPermission(pageId, selectedUser, selectedPermission);
            setSelectedUser('');
        }
    };

    return (
        <div style={{
            width: 400,
            backgroundColor: colors.bg.surface,
            borderRadius: appFlowySpacing.radius.lg,
            boxShadow: colors.shadow.xl,
            fontFamily: appFlowyFont.family.default,
            overflow: 'hidden',
        }}>
            {/* 헤더 */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
                borderBottom: `1px solid ${colors.border.divider}`,
            }}>
                <h3 style={{
                    fontSize: appFlowyFont.size.md,
                    fontWeight: appFlowyFont.weight.semibold,
                    color: colors.text.title,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                }}>
                    <Shield size={18} />
                    권한 설정
                </h3>
                {onClose && (
                    <button
                        onClick={onClose}
                        style={{
                            padding: 4,
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: colors.icon.secondary,
                        }}
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* 멤버 추가 */}
            <div style={{ padding: 16, borderBottom: `1px solid ${colors.border.divider}` }}>
                <label style={{
                    display: 'block',
                    marginBottom: 8,
                    fontSize: appFlowyFont.size.sm,
                    color: colors.text.caption,
                }}>
                    멤버 추가
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                    <select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '8px 12px',
                            backgroundColor: colors.bg.tertiary,
                            border: `1px solid ${colors.border.primary}`,
                            borderRadius: appFlowySpacing.radius.md,
                            color: colors.text.body,
                            fontSize: appFlowyFont.size.sm,
                            fontFamily: 'inherit',
                        }}
                    >
                        <option value="">사용자 선택...</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                    <select
                        value={selectedPermission}
                        onChange={(e) => setSelectedPermission(e.target.value as Permission)}
                        style={{
                            padding: '8px 12px',
                            backgroundColor: colors.bg.tertiary,
                            border: `1px solid ${colors.border.primary}`,
                            borderRadius: appFlowySpacing.radius.md,
                            color: colors.text.body,
                            fontSize: appFlowyFont.size.sm,
                            fontFamily: 'inherit',
                        }}
                    >
                        {Object.entries(PERMISSION_CONFIG).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleGrant}
                        disabled={!selectedUser}
                        style={{
                            padding: '8px 12px',
                            backgroundColor: colors.brand.main,
                            border: 'none',
                            borderRadius: appFlowySpacing.radius.md,
                            color: '#fff',
                            cursor: selectedUser ? 'pointer' : 'not-allowed',
                            opacity: selectedUser ? 1 : 0.5,
                        }}
                    >
                        <UserPlus size={16} />
                    </button>
                </div>
            </div>

            {/* 현재 권한 목록 */}
            <div style={{ padding: 16, maxHeight: 300, overflowY: 'auto' }}>
                <label style={{
                    display: 'block',
                    marginBottom: 12,
                    fontSize: appFlowyFont.size.sm,
                    color: colors.text.caption,
                }}>
                    현재 권한 ({currentPermissions.length})
                </label>

                {currentPermissions.length === 0 ? (
                    <div style={{
                        padding: 24,
                        textAlign: 'center',
                        color: colors.text.caption,
                        fontSize: appFlowyFont.size.sm,
                    }}>
                        설정된 권한이 없습니다
                    </div>
                ) : (
                    currentPermissions.map(perm => {
                        const user = users.find(u => u.id === perm.userId);
                        const group = groups.find(g => g.id === perm.groupId);
                        const permConfig = PERMISSION_CONFIG[perm.permission];
                        const Icon = permConfig.icon;

                        return (
                            <div
                                key={`${perm.userId || perm.groupId}-${perm.pageId}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '10px 12px',
                                    backgroundColor: colors.bg.tertiary,
                                    borderRadius: appFlowySpacing.radius.md,
                                    marginBottom: 8,
                                }}
                            >
                                <div style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    backgroundColor: colors.brand.main,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontSize: appFlowyFont.size.sm,
                                    fontWeight: appFlowyFont.weight.bold,
                                }}>
                                    {(user?.name || group?.name || '?').charAt(0)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: appFlowyFont.size.sm,
                                        fontWeight: appFlowyFont.weight.medium,
                                        color: colors.text.body,
                                    }}>
                                        {user?.name || group?.name}
                                    </div>
                                    <div style={{
                                        fontSize: appFlowyFont.size.xs,
                                        color: colors.text.caption,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 4,
                                    }}>
                                        <Icon size={10} />
                                        {permConfig.label}
                                    </div>
                                </div>
                                <button
                                    onClick={() => perm.userId && revokePermission(pageId, perm.userId)}
                                    style={{
                                        padding: 4,
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: colors.status.error,
                                    }}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default PermissionProvider;
