/**
 * 코딩쏙학원 - 학습일지 템플릿
 * 
 * 학생이 매일 기록하는 학습일지
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    appFlowyDark, appFlowyLight, appFlowyFont, appFlowySpacing, ThemeMode
} from '@/styles/appflowy/design-system';
import {
    Calendar, Clock, Target, BookOpen, Code, CheckCircle2,
    Plus, Trash2, Smile, Meh, Frown, Star
} from 'lucide-react';

// ============================================
// 🔧 타입 정의
// ============================================
export interface LearningEntry {
    id: string;
    date: string;
    studentId: string;
    studentName: string;

    // 오늘의 학습
    todayLearned: string[];
    codeSnippet?: string;
    language?: string;

    // 자기 평가
    mood: 'great' | 'good' | 'okay';
    understanding: 1 | 2 | 3 | 4 | 5;
    difficulty: 1 | 2 | 3 | 4 | 5;

    // 회고
    challenge: string;
    solution: string;
    nextGoal: string;

    // 메타
    duration: number; // 분 단위
    createdAt: Date;
    updatedAt: Date;
}

export interface LearningJournalProps {
    theme?: ThemeMode;
    studentId: string;
    studentName: string;
    onSave?: (entry: LearningEntry) => void;
    initialEntry?: Partial<LearningEntry>;
}

// ============================================
// 🎯 학습일지 템플릿
// ============================================
export function LearningJournalTemplate({
    theme = 'dark',
    studentId,
    studentName,
    onSave,
    initialEntry,
}: LearningJournalProps) {
    const colors = theme === 'dark' ? appFlowyDark : appFlowyLight;
    const today = new Date().toISOString().split('T')[0];

    const [entry, setEntry] = useState<Partial<LearningEntry>>({
        date: today,
        studentId,
        studentName,
        todayLearned: [''],
        mood: 'good',
        understanding: 3,
        difficulty: 3,
        challenge: '',
        solution: '',
        nextGoal: '',
        duration: 60,
        ...initialEntry,
    });

    const updateField = <K extends keyof LearningEntry>(
        field: K,
        value: LearningEntry[K]
    ) => {
        setEntry(prev => ({ ...prev, [field]: value }));
    };

    const addLearningItem = () => {
        setEntry(prev => ({
            ...prev,
            todayLearned: [...(prev.todayLearned || []), ''],
        }));
    };

    const updateLearningItem = (index: number, value: string) => {
        setEntry(prev => {
            const items = [...(prev.todayLearned || [])];
            items[index] = value;
            return { ...prev, todayLearned: items };
        });
    };

    const removeLearningItem = (index: number) => {
        setEntry(prev => ({
            ...prev,
            todayLearned: (prev.todayLearned || []).filter((_, i) => i !== index),
        }));
    };

    const handleSave = () => {
        const fullEntry: LearningEntry = {
            id: `entry-${Date.now()}`,
            date: entry.date || today,
            studentId,
            studentName,
            todayLearned: entry.todayLearned || [],
            codeSnippet: entry.codeSnippet,
            language: entry.language,
            mood: entry.mood || 'good',
            understanding: entry.understanding || 3,
            difficulty: entry.difficulty || 3,
            challenge: entry.challenge || '',
            solution: entry.solution || '',
            nextGoal: entry.nextGoal || '',
            duration: entry.duration || 60,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        onSave?.(fullEntry);
    };

    return (
        <div
            style={{
                maxWidth: 720,
                margin: '0 auto',
                padding: 24,
                fontFamily: appFlowyFont.family.default,
                color: colors.text.body,
            }}
        >
            {/* 헤더 */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{
                    fontSize: appFlowyFont.size['3xl'],
                    fontWeight: appFlowyFont.weight.bold,
                    color: colors.text.title,
                    marginBottom: 8,
                }}>
                    📚 오늘의 학습일지
                </h1>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    color: colors.text.caption,
                    fontSize: appFlowyFont.size.sm,
                }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={14} /> {entry.date}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={14} />
                        <input
                            type="number"
                            value={entry.duration}
                            onChange={(e) => updateField('duration', Number(e.target.value))}
                            style={{
                                width: 50,
                                background: 'transparent',
                                border: 'none',
                                color: colors.text.caption,
                                fontFamily: 'inherit',
                            }}
                        />분
                    </span>
                    <span>👤 {studentName}</span>
                </div>
            </div>

            {/* 섹션 1: 오늘 배운 것 */}
            <Section
                title="📝 오늘 배운 것"
                icon={<BookOpen size={18} />}
                colors={colors}
            >
                {entry.todayLearned?.map((item, index) => (
                    <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <span style={{ color: colors.brand.main }}>•</span>
                        <input
                            type="text"
                            value={item}
                            onChange={(e) => updateLearningItem(index, e.target.value)}
                            placeholder="배운 내용을 입력하세요..."
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                color: colors.text.body,
                                fontSize: appFlowyFont.size.base,
                                fontFamily: 'inherit',
                                outline: 'none',
                            }}
                        />
                        <button
                            onClick={() => removeLearningItem(index)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: colors.icon.secondary,
                                cursor: 'pointer',
                                opacity: entry.todayLearned!.length > 1 ? 1 : 0.3,
                            }}
                            disabled={entry.todayLearned!.length <= 1}
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
                <button
                    onClick={addLearningItem}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '6px 12px',
                        background: 'transparent',
                        border: `1px dashed ${colors.border.primary}`,
                        borderRadius: appFlowySpacing.radius.md,
                        color: colors.text.caption,
                        fontSize: appFlowyFont.size.sm,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                    }}
                >
                    <Plus size={14} /> 항목 추가
                </button>
            </Section>

            {/* 섹션 2: 코드 스니펫 */}
            <Section
                title="💻 오늘의 코드"
                icon={<Code size={18} />}
                colors={colors}
            >
                <div style={{ marginBottom: 8 }}>
                    <select
                        value={entry.language || 'python'}
                        onChange={(e) => updateField('language', e.target.value)}
                        style={{
                            padding: '4px 8px',
                            background: colors.bg.tertiary,
                            border: `1px solid ${colors.border.primary}`,
                            borderRadius: appFlowySpacing.radius.sm,
                            color: colors.text.body,
                            fontSize: appFlowyFont.size.sm,
                            fontFamily: 'inherit',
                        }}
                    >
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="scratch">Scratch</option>
                        <option value="html">HTML/CSS</option>
                    </select>
                </div>
                <textarea
                    value={entry.codeSnippet || ''}
                    onChange={(e) => updateField('codeSnippet', e.target.value)}
                    placeholder="# 오늘 작성한 코드를 붙여넣기 하세요..."
                    style={{
                        width: '100%',
                        minHeight: 120,
                        padding: 12,
                        background: colors.bg.tertiary,
                        border: `1px solid ${colors.border.primary}`,
                        borderRadius: appFlowySpacing.radius.md,
                        color: colors.text.body,
                        fontSize: appFlowyFont.size.sm,
                        fontFamily: appFlowyFont.family.code,
                        resize: 'vertical',
                    }}
                />
            </Section>

            {/* 섹션 3: 자기 평가 */}
            <Section
                title="📊 자기 평가"
                icon={<Star size={18} />}
                colors={colors}
            >
                {/* 기분 */}
                <div style={{ marginBottom: 16 }}>
                    <label style={{
                        display: 'block',
                        marginBottom: 8,
                        fontSize: appFlowyFont.size.sm,
                        color: colors.text.caption,
                    }}>
                        오늘 기분
                    </label>
                    <div style={{ display: 'flex', gap: 12 }}>
                        {[
                            { value: 'great' as const, icon: Smile, label: '아주 좋음' },
                            { value: 'good' as const, icon: Meh, label: '보통' },
                            { value: 'okay' as const, icon: Frown, label: '어려웠음' },
                        ].map(({ value, icon: Icon, label }) => (
                            <button
                                key={value}
                                onClick={() => updateField('mood', value)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 4,
                                    padding: 12,
                                    border: `2px solid ${entry.mood === value ? colors.brand.main : colors.border.primary}`,
                                    borderRadius: appFlowySpacing.radius.md,
                                    background: entry.mood === value ? colors.brand.light : 'transparent',
                                    cursor: 'pointer',
                                }}
                            >
                                <Icon size={24} color={entry.mood === value ? colors.brand.main : colors.icon.secondary} />
                                <span style={{ fontSize: appFlowyFont.size.xs, color: colors.text.caption }}>
                                    {label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 이해도/난이도 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <RatingInput
                        label="이해도"
                        value={entry.understanding || 3}
                        onChange={(v) => updateField('understanding', v as 1 | 2 | 3 | 4 | 5)}
                        colors={colors}
                    />
                    <RatingInput
                        label="난이도"
                        value={entry.difficulty || 3}
                        onChange={(v) => updateField('difficulty', v as 1 | 2 | 3 | 4 | 5)}
                        colors={colors}
                    />
                </div>
            </Section>

            {/* 섹션 4: 회고 */}
            <Section
                title="💭 오늘의 회고"
                icon={<Target size={18} />}
                colors={colors}
            >
                <TextArea
                    label="어려웠던 점"
                    value={entry.challenge || ''}
                    onChange={(v) => updateField('challenge', v)}
                    placeholder="오늘 어려웠던 점이 있나요?"
                    colors={colors}
                />
                <TextArea
                    label="해결 방법"
                    value={entry.solution || ''}
                    onChange={(v) => updateField('solution', v)}
                    placeholder="어떻게 해결했나요? (또는 해결할 계획)"
                    colors={colors}
                />
                <TextArea
                    label="다음 목표"
                    value={entry.nextGoal || ''}
                    onChange={(v) => updateField('nextGoal', v)}
                    placeholder="다음 수업에서 배우고 싶은 것"
                    colors={colors}
                />
            </Section>

            {/* 저장 버튼 */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                style={{
                    width: '100%',
                    padding: '14px 24px',
                    background: `linear-gradient(135deg, ${colors.brand.main}, ${colors.brand.purple})`,
                    border: 'none',
                    borderRadius: appFlowySpacing.radius.lg,
                    color: '#fff',
                    fontSize: appFlowyFont.size.md,
                    fontWeight: appFlowyFont.weight.semibold,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                }}
            >
                <CheckCircle2 size={20} />
                학습일지 저장하기
            </motion.button>
        </div>
    );
}

// ============================================
// 📦 헬퍼 컴포넌트
// ============================================
function Section({
    title,
    icon,
    children,
    colors
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    colors: typeof appFlowyLight;
}) {
    return (
        <div style={{ marginBottom: 32 }}>
            <h2 style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: appFlowyFont.size.lg,
                fontWeight: appFlowyFont.weight.semibold,
                color: colors.text.title,
                marginBottom: 16,
                paddingBottom: 8,
                borderBottom: `1px solid ${colors.border.divider}`,
            }}>
                {icon} {title}
            </h2>
            {children}
        </div>
    );
}

function RatingInput({
    label,
    value,
    onChange,
    colors,
}: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    colors: typeof appFlowyLight;
}) {
    return (
        <div>
            <label style={{
                display: 'block',
                marginBottom: 8,
                fontSize: appFlowyFont.size.sm,
                color: colors.text.caption,
            }}>
                {label}
            </label>
            <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4, 5].map(n => (
                    <button
                        key={n}
                        onClick={() => onChange(n)}
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: appFlowySpacing.radius.sm,
                            border: `1px solid ${n <= value ? colors.brand.main : colors.border.primary}`,
                            background: n <= value ? colors.brand.main : 'transparent',
                            color: n <= value ? '#fff' : colors.text.caption,
                            fontSize: appFlowyFont.size.sm,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                        }}
                    >
                        {n}
                    </button>
                ))}
            </div>
        </div>
    );
}

function TextArea({
    label,
    value,
    onChange,
    placeholder,
    colors,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    colors: typeof appFlowyLight;
}) {
    return (
        <div style={{ marginBottom: 12 }}>
            <label style={{
                display: 'block',
                marginBottom: 6,
                fontSize: appFlowyFont.size.sm,
                color: colors.text.caption,
            }}>
                {label}
            </label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    width: '100%',
                    minHeight: 80,
                    padding: 12,
                    background: colors.bg.tertiary,
                    border: `1px solid ${colors.border.primary}`,
                    borderRadius: appFlowySpacing.radius.md,
                    color: colors.text.body,
                    fontSize: appFlowyFont.size.base,
                    fontFamily: 'inherit',
                    resize: 'vertical',
                }}
            />
        </div>
    );
}

export default LearningJournalTemplate;
