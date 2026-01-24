/**
 * AppFlowy Database - Types
 * 
 * 데이터베이스 뷰를 위한 타입 정의
 */

// ============================================
// 📊 데이터베이스 타입
// ============================================

export type ViewType = 'table' | 'kanban' | 'gallery' | 'calendar';

export type PropertyType =
    | 'text'
    | 'number'
    | 'select'
    | 'multi_select'
    | 'date'
    | 'checkbox'
    | 'url'
    | 'email'
    | 'person'
    | 'file'
    | 'relation';

export interface SelectOption {
    id: string;
    name: string;
    color: string;
}

export interface Property {
    id: string;
    name: string;
    type: PropertyType;
    width?: number;
    options?: SelectOption[]; // select, multi_select용
    isVisible?: boolean;
}

export interface CellValue {
    propertyId: string;
    value: any;
}

export interface Row {
    id: string;
    cells: Record<string, any>; // propertyId -> value
    createdAt: Date;
    updatedAt: Date;
}

export interface Database {
    id: string;
    name: string;
    icon?: string;
    properties: Property[];
    rows: Row[];
    views: View[];
    createdAt: Date;
    updatedAt: Date;
}

export interface View {
    id: string;
    name: string;
    type: ViewType;
    // 필터 & 정렬
    filters?: Filter[];
    sorts?: Sort[];
    // 뷰별 설정
    groupByPropertyId?: string; // kanban
    datePropertyId?: string; // calendar
    coverPropertyId?: string; // gallery
}

export interface Filter {
    propertyId: string;
    operator: 'equals' | 'contains' | 'not_empty' | 'is_empty' | 'gt' | 'lt';
    value?: any;
}

export interface Sort {
    propertyId: string;
    direction: 'asc' | 'desc';
}

// ============================================
// 🎨 색상 팔레트 (Select 옵션용)
// ============================================
export const SELECT_COLORS = [
    { name: 'gray', bg: '#E5E7EB', text: '#374151' },
    { name: 'brown', bg: '#FED7AA', text: '#9A3412' },
    { name: 'orange', bg: '#FFEDD5', text: '#C2410C' },
    { name: 'yellow', bg: '#FEF9C3', text: '#A16207' },
    { name: 'green', bg: '#D1FAE5', text: '#047857' },
    { name: 'blue', bg: '#DBEAFE', text: '#1D4ED8' },
    { name: 'purple', bg: '#E9D5FF', text: '#7C3AED' },
    { name: 'pink', bg: '#FCE7F3', text: '#BE185D' },
    { name: 'red', bg: '#FEE2E2', text: '#B91C1C' },
];

// ============================================
// 🛠️ 유틸리티 함수
// ============================================
export function createDefaultProperty(type: PropertyType, name: string): Property {
    return {
        id: `prop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name,
        type,
        isVisible: true,
        options: type === 'select' || type === 'multi_select' ? [] : undefined,
    };
}

export function createDefaultRow(properties: Property[]): Row {
    const cells: Record<string, any> = {};
    properties.forEach((prop) => {
        cells[prop.id] = getDefaultValue(prop.type);
    });

    return {
        id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        cells,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

function getDefaultValue(type: PropertyType): any {
    switch (type) {
        case 'text':
        case 'url':
        case 'email':
            return '';
        case 'number':
            return null;
        case 'checkbox':
            return false;
        case 'select':
            return null;
        case 'multi_select':
            return [];
        case 'date':
            return null;
        case 'person':
            return [];
        case 'file':
            return [];
        case 'relation':
            return [];
        default:
            return null;
    }
}

export function createDefaultDatabase(name: string): Database {
    const properties: Property[] = [
        { id: 'name', name: 'Name', type: 'text', isVisible: true },
        {
            id: 'status', name: 'Status', type: 'select', isVisible: true, options: [
                { id: 'todo', name: 'To Do', color: 'gray' },
                { id: 'in-progress', name: 'In Progress', color: 'blue' },
                { id: 'done', name: 'Done', color: 'green' },
            ]
        },
    ];

    return {
        id: `db-${Date.now()}`,
        name,
        properties,
        rows: [],
        views: [
            { id: 'view-1', name: 'Table', type: 'table' },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}
