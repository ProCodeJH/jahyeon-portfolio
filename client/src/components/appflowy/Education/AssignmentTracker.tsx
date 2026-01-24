/**
 * 코딩쏙학원 - 과제 트래커 데이터베이스
 * 
 * 학생별 과제 제출 현황 추적
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    appFlowyDark, appFlowyLight, appFlowyFont, appFlowySpacing, ThemeMode
} from '@/styles/appflowy/design-system';
import {
    Plus, Filter, Search, Clock, CheckCircle, XCircle,
    AlertCircle, Calendar, User, FileText, MoreHorizontal,
    ArrowUpDown, Download, Upload
} from 'lucide-react';

// ============================================
// 🔧 타입 정의
// ============================================
export type AssignmentStatus = 'not_started' | 'in_progress' | 'submitted' | 'reviewed' | 'late';

export interface Assignment {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    courseId: string;
    courseName: string;
    createdAt: Date;
}

export interface Submission {
    id: string;
    assignmentId: string;
    studentId: string;
    studentName: string;
    status: AssignmentStatus;
    submittedAt?: Date;
    fileUrl?: string;
    score?: number;
    feedback?: string;
    updatedAt: Date;
}

export interface AssignmentTrackerProps {
    theme?: ThemeMode;
    assignments?: Assignment[];
    submissions?: Submission[];
    students?: { id: string; name: string }[];
    isTeacher?: boolean;
    currentStudentId?: string;
    onSubmit?: (assignmentId: string, fileUrl: string) => void;
    onGrade?: (submissionId: string, score: number, feedback: string) => void;
}

// ============================================
// 🎨 상태별 스타일
// ============================================
const STATUS_CONFIG: Record<AssignmentStatus, {
    label: string;
    color: string;
    bgColor: string;
    icon: any;
}> = {
    not_started: {
        label: '미시작',
        color: '#9CA3AF',
        bgColor: 'rgba(156, 163, 175, 0.1)',
        icon: Clock,
    },
    in_progress: {
        label: '진행중',
        color: '#F59E0B',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        icon: AlertCircle,
    },
    submitted: {
        label: '제출완료',
        color: '#10B981',
        bgColor: 'rgba(16, 185, 129, 0.1)',
        icon: CheckCircle,
    },
    reviewed: {
        label: '검토완료',
        color: '#8B5CF6',
        bgColor: 'rgba(139, 92, 246, 0.1)',
        icon: CheckCircle,
    },
    late: {
        label: '지각제출',
        color: '#EF4444',
        bgColor: 'rgba(239, 68, 68, 0.1)',
        icon: XCircle,
    },
};

// ============================================
// 🎯 과제 트래커
// ============================================
export function AssignmentTracker({
    theme = 'dark',
    assignments = sampleAssignments,
    submissions = sampleSubmissions,
    students = sampleStudents,
    isTeacher = true,
    currentStudentId,
    onSubmit,
    onGrade,
}: AssignmentTrackerProps) {
    const colors = theme === 'dark' ? appFlowyDark : appFlowyLight;

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<AssignmentStatus | 'all'>('all');
    const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'dueDate' | 'name'>('dueDate');

    // 과제별 제출 현황 계산
    const assignmentStats = useMemo(() => {
        const stats: Record<string, {
            total: number;
            submitted: number;
            late: number;
            statusCounts: Record<AssignmentStatus, number>;
        }> = {};

        assignments.forEach(a => {
            stats[a.id] = {
                total: students.length,
                submitted: 0,
                late: 0,
                statusCounts: {
                    not_started: students.length,
                    in_progress: 0,
                    submitted: 0,
                    reviewed: 0,
                    late: 0,
                },
            };
        });

        submissions.forEach(s => {
            if (stats[s.assignmentId]) {
                stats[s.assignmentId].statusCounts[s.status]++;
                stats[s.assignmentId].statusCounts.not_started--;

                if (s.status === 'submitted' || s.status === 'reviewed') {
                    stats[s.assignmentId].submitted++;
                }
                if (s.status === 'late') {
                    stats[s.assignmentId].late++;
                }
            }
        });

        return stats;
    }, [assignments, submissions, students]);

    // 필터링된 과제
    const filteredAssignments = useMemo(() => {
        return assignments
            .filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => {
                if (sortBy === 'dueDate') return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                return a.title.localeCompare(b.title);
            });
    }, [assignments, searchQuery, sortBy]);

    // 학생별 제출 상황 가져오기
    const getSubmission = (assignmentId: string, studentId: string) => {
        return submissions.find(s => s.assignmentId === assignmentId && s.studentId === studentId);
    };

    return (
        <div style={{
            fontFamily: appFlowyFont.family.default,
            color: colors.text.body,
        }}>
            {/* 헤더 */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                borderBottom: `1px solid ${colors.border.divider}`,
            }}>
                <h1 style={{
                    fontSize: appFlowyFont.size.xl,
                    fontWeight: appFlowyFont.weight.bold,
                    color: colors.text.title,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                }}>
                    📊 과제 트래커
                </h1>

                {/* 검색 & 필터 */}
                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        backgroundColor: colors.bg.tertiary,
                        borderRadius: appFlowySpacing.radius.md,
                    }}>
                        <Search size={16} color={colors.icon.secondary} />
                        <input
                            type="text"
                            placeholder="과제 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                color: colors.text.body,
                                fontSize: appFlowyFont.size.sm,
                                fontFamily: 'inherit',
                                outline: 'none',
                                width: 150,
                            }}
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
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
                        <option value="all">전체 상태</option>
                        {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>

                    {isTeacher && (
                        <button
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '8px 16px',
                                backgroundColor: colors.brand.main,
                                border: 'none',
                                borderRadius: appFlowySpacing.radius.md,
                                color: '#fff',
                                fontSize: appFlowyFont.size.sm,
                                fontWeight: appFlowyFont.weight.medium,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                            }}
                        >
                            <Plus size={16} /> 과제 추가
                        </button>
                    )}
                </div>
            </div>

            {/* 과제 테이블 */}
            <div style={{ padding: '16px 24px' }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                }}>
                    <thead>
                        <tr style={{ backgroundColor: colors.bg.tertiary }}>
                            <th style={thStyle(colors)}>
                                <button
                                    onClick={() => setSortBy('name')}
                                    style={sortButtonStyle(colors)}
                                >
                                    과제명 <ArrowUpDown size={12} />
                                </button>
                            </th>
                            <th style={thStyle(colors)}>과목</th>
                            <th style={thStyle(colors)}>
                                <button
                                    onClick={() => setSortBy('dueDate')}
                                    style={sortButtonStyle(colors)}
                                >
                                    마감일 <ArrowUpDown size={12} />
                                </button>
                            </th>
                            <th style={thStyle(colors)}>제출 현황</th>
                            <th style={thStyle(colors)}>진행률</th>
                            <th style={{ ...thStyle(colors), width: 80 }}>액션</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAssignments.map((assignment) => {
                            const stats = assignmentStats[assignment.id];
                            const progress = Math.round((stats.submitted / stats.total) * 100);
                            const isPastDue = new Date(assignment.dueDate) < new Date();

                            return (
                                <tr
                                    key={assignment.id}
                                    style={{
                                        borderBottom: `1px solid ${colors.border.secondary}`,
                                        backgroundColor: selectedAssignment === assignment.id
                                            ? colors.bg.hover
                                            : 'transparent',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => setSelectedAssignment(
                                        selectedAssignment === assignment.id ? null : assignment.id
                                    )}
                                >
                                    <td style={tdStyle(colors)}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <FileText size={16} color={colors.icon.secondary} />
                                            <span style={{ fontWeight: appFlowyFont.weight.medium }}>
                                                {assignment.title}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={tdStyle(colors)}>
                                        <span style={{
                                            padding: '2px 8px',
                                            backgroundColor: colors.tag.lightPurple.bg,
                                            color: colors.tag.lightPurple.text,
                                            borderRadius: 4,
                                            fontSize: appFlowyFont.size.xs,
                                        }}>
                                            {assignment.courseName}
                                        </span>
                                    </td>
                                    <td style={tdStyle(colors)}>
                                        <span style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4,
                                            color: isPastDue ? colors.status.error : colors.text.body,
                                        }}>
                                            <Calendar size={14} />
                                            {formatDate(assignment.dueDate)}
                                            {isPastDue && <span style={{ fontSize: 10 }}>⏰</span>}
                                        </span>
                                    </td>
                                    <td style={tdStyle(colors)}>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            {Object.entries(stats.statusCounts).map(([status, count]) => {
                                                if (count === 0) return null;
                                                const config = STATUS_CONFIG[status as AssignmentStatus];
                                                return (
                                                    <span
                                                        key={status}
                                                        title={config.label}
                                                        style={{
                                                            padding: '2px 6px',
                                                            backgroundColor: config.bgColor,
                                                            color: config.color,
                                                            borderRadius: 4,
                                                            fontSize: appFlowyFont.size.xs,
                                                            fontWeight: appFlowyFont.weight.medium,
                                                        }}
                                                    >
                                                        {count}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </td>
                                    <td style={tdStyle(colors)}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{
                                                flex: 1,
                                                height: 6,
                                                backgroundColor: colors.bg.tertiary,
                                                borderRadius: 3,
                                                overflow: 'hidden',
                                            }}>
                                                <div style={{
                                                    width: `${progress}%`,
                                                    height: '100%',
                                                    backgroundColor: progress === 100 ? colors.status.success : colors.brand.main,
                                                    transition: 'width 0.3s',
                                                }} />
                                            </div>
                                            <span style={{
                                                fontSize: appFlowyFont.size.xs,
                                                color: colors.text.caption,
                                                minWidth: 35,
                                            }}>
                                                {progress}%
                                            </span>
                                        </div>
                                    </td>
                                    <td style={tdStyle(colors)}>
                                        <button style={{
                                            padding: 6,
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            borderRadius: appFlowySpacing.radius.sm,
                                            color: colors.icon.secondary,
                                            cursor: 'pointer',
                                        }}>
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* 학생별 상세 (선택된 과제) */}
                <AnimatePresence>
                    {selectedAssignment && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{
                                marginTop: 16,
                                padding: 16,
                                backgroundColor: colors.bg.secondary,
                                borderRadius: appFlowySpacing.radius.lg,
                                overflow: 'hidden',
                            }}
                        >
                            <h3 style={{
                                fontSize: appFlowyFont.size.md,
                                fontWeight: appFlowyFont.weight.semibold,
                                marginBottom: 12,
                                color: colors.text.title,
                            }}>
                                👥 학생별 제출 현황
                            </h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                gap: 8,
                            }}>
                                {students.map(student => {
                                    const submission = getSubmission(selectedAssignment, student.id);
                                    const status = submission?.status || 'not_started';
                                    const config = STATUS_CONFIG[status];
                                    const Icon = config.icon;

                                    return (
                                        <div
                                            key={student.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                padding: 10,
                                                backgroundColor: config.bgColor,
                                                borderRadius: appFlowySpacing.radius.md,
                                            }}
                                        >
                                            <div style={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: '50%',
                                                backgroundColor: colors.brand.main,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#fff',
                                                fontSize: appFlowyFont.size.xs,
                                                fontWeight: appFlowyFont.weight.bold,
                                            }}>
                                                {student.name.charAt(0)}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{
                                                    fontSize: appFlowyFont.size.sm,
                                                    fontWeight: appFlowyFont.weight.medium,
                                                }}>
                                                    {student.name}
                                                </div>
                                                <div style={{
                                                    fontSize: appFlowyFont.size.xs,
                                                    color: config.color,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 4,
                                                }}>
                                                    <Icon size={10} />
                                                    {config.label}
                                                    {submission?.score !== undefined && ` · ${submission.score}점`}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// ============================================
// 🛠️ 헬퍼
// ============================================
const thStyle = (colors: typeof appFlowyLight): React.CSSProperties => ({
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: appFlowyFont.size.sm,
    fontWeight: appFlowyFont.weight.medium,
    color: colors.text.caption,
    borderBottom: `1px solid ${colors.border.primary}`,
});

const tdStyle = (colors: typeof appFlowyLight): React.CSSProperties => ({
    padding: '12px 16px',
    fontSize: appFlowyFont.size.sm,
});

const sortButtonStyle = (colors: typeof appFlowyLight): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    background: 'transparent',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontWeight: 'inherit',
    fontSize: 'inherit',
});

function formatDate(date: string) {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
}

// ============================================
// 📚 샘플 데이터
// ============================================
const sampleAssignments: Assignment[] = [
    { id: 'a1', title: 'Python 기초 문법 연습', description: '', dueDate: '2026-01-27', courseId: 'c1', courseName: 'Python', createdAt: new Date() },
    { id: 'a2', title: '조건문 과제', description: '', dueDate: '2026-01-30', courseId: 'c1', courseName: 'Python', createdAt: new Date() },
    { id: 'a3', title: 'HTML 포트폴리오 만들기', description: '', dueDate: '2026-02-03', courseId: 'c2', courseName: 'Web', createdAt: new Date() },
];

const sampleStudents = [
    { id: 's1', name: '홍길동' },
    { id: 's2', name: '김철수' },
    { id: 's3', name: '이영희' },
    { id: 's4', name: '박민수' },
];

const sampleSubmissions: Submission[] = [
    { id: 'sub1', assignmentId: 'a1', studentId: 's1', studentName: '홍길동', status: 'reviewed', score: 95, submittedAt: new Date(), updatedAt: new Date() },
    { id: 'sub2', assignmentId: 'a1', studentId: 's2', studentName: '김철수', status: 'submitted', submittedAt: new Date(), updatedAt: new Date() },
    { id: 'sub3', assignmentId: 'a1', studentId: 's3', studentName: '이영희', status: 'in_progress', updatedAt: new Date() },
    { id: 'sub4', assignmentId: 'a2', studentId: 's1', studentName: '홍길동', status: 'submitted', submittedAt: new Date(), updatedAt: new Date() },
];

export default AssignmentTracker;
