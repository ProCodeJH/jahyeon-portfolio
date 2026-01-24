/**
 * 코딩쏙학원 - Notion API 연동
 * 
 * Notion 데이터베이스와 동기화
 */

import { useState, useCallback } from 'react';

// ============================================
// 🔧 타입 정의
// ============================================
export interface NotionConfig {
    apiToken: string;
    databaseId?: string;
    workspaceId?: string;
}

export interface NotionPage {
    id: string;
    title: string;
    icon?: string;
    cover?: string;
    properties: Record<string, NotionProperty>;
    createdTime: string;
    lastEditedTime: string;
    url: string;
}

export interface NotionProperty {
    id: string;
    type: string;
    value: any;
}

export interface NotionDatabase {
    id: string;
    title: string;
    description?: string;
    properties: Record<string, NotionPropertySchema>;
    url: string;
}

export interface NotionPropertySchema {
    id: string;
    name: string;
    type: string;
    options?: { id: string; name: string; color: string }[];
}

export interface NotionSyncResult {
    success: boolean;
    synced: number;
    errors: string[];
    lastSyncAt: Date;
}

// ============================================
// 🎯 Notion API 클라이언트
// ============================================
export class NotionClient {
    private apiToken: string;
    private baseUrl = 'https://api.notion.com/v1';
    private version = '2022-06-28';

    constructor(apiToken: string) {
        this.apiToken = apiToken;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.apiToken}`,
                'Notion-Version': this.version,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Notion API Error: ${response.status}`);
        }

        return response.json();
    }

    // ============================================
    // 📚 데이터베이스 메서드
    // ============================================

    /**
     * 데이터베이스 조회
     */
    async getDatabase(databaseId: string): Promise<NotionDatabase> {
        const data = await this.request<any>(`/databases/${databaseId}`);

        return {
            id: data.id,
            title: data.title?.[0]?.plain_text || 'Untitled',
            description: data.description?.[0]?.plain_text,
            properties: data.properties,
            url: data.url,
        };
    }

    /**
     * 데이터베이스 쿼리 (페이지 목록)
     */
    async queryDatabase(
        databaseId: string,
        options: {
            filter?: any;
            sorts?: any[];
            pageSize?: number;
            startCursor?: string;
        } = {}
    ): Promise<{ results: NotionPage[]; hasMore: boolean; nextCursor?: string }> {
        const data = await this.request<any>(`/databases/${databaseId}/query`, {
            method: 'POST',
            body: JSON.stringify({
                filter: options.filter,
                sorts: options.sorts,
                page_size: options.pageSize || 100,
                start_cursor: options.startCursor,
            }),
        });

        return {
            results: data.results.map((page: any) => this.parsePage(page)),
            hasMore: data.has_more,
            nextCursor: data.next_cursor,
        };
    }

    /**
     * 페이지 생성
     */
    async createPage(
        databaseId: string,
        properties: Record<string, any>,
        children?: any[]
    ): Promise<NotionPage> {
        const data = await this.request<any>('/pages', {
            method: 'POST',
            body: JSON.stringify({
                parent: { database_id: databaseId },
                properties: this.formatProperties(properties),
                children,
            }),
        });

        return this.parsePage(data);
    }

    /**
     * 페이지 업데이트
     */
    async updatePage(
        pageId: string,
        properties: Record<string, any>
    ): Promise<NotionPage> {
        const data = await this.request<any>(`/pages/${pageId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                properties: this.formatProperties(properties),
            }),
        });

        return this.parsePage(data);
    }

    /**
     * 페이지 삭제 (아카이브)
     */
    async deletePage(pageId: string): Promise<void> {
        await this.request(`/pages/${pageId}`, {
            method: 'PATCH',
            body: JSON.stringify({ archived: true }),
        });
    }

    // ============================================
    // 🛠️ 헬퍼 메서드
    // ============================================

    private parsePage(data: any): NotionPage {
        const properties: Record<string, NotionProperty> = {};

        for (const [key, value] of Object.entries(data.properties || {})) {
            properties[key] = {
                id: (value as any).id,
                type: (value as any).type,
                value: this.extractPropertyValue(value as any),
            };
        }

        return {
            id: data.id,
            title: this.getPageTitle(data),
            icon: data.icon?.emoji || data.icon?.external?.url,
            cover: data.cover?.external?.url || data.cover?.file?.url,
            properties,
            createdTime: data.created_time,
            lastEditedTime: data.last_edited_time,
            url: data.url,
        };
    }

    private getPageTitle(data: any): string {
        const titleProp = Object.values(data.properties || {}).find(
            (p: any) => p.type === 'title'
        ) as any;
        return titleProp?.title?.[0]?.plain_text || 'Untitled';
    }

    private extractPropertyValue(prop: any): any {
        switch (prop.type) {
            case 'title':
                return prop.title?.[0]?.plain_text || '';
            case 'rich_text':
                return prop.rich_text?.[0]?.plain_text || '';
            case 'number':
                return prop.number;
            case 'select':
                return prop.select?.name;
            case 'multi_select':
                return prop.multi_select?.map((s: any) => s.name) || [];
            case 'date':
                return prop.date?.start;
            case 'checkbox':
                return prop.checkbox;
            case 'url':
                return prop.url;
            case 'email':
                return prop.email;
            case 'phone_number':
                return prop.phone_number;
            case 'status':
                return prop.status?.name;
            default:
                return null;
        }
    }

    private formatProperties(props: Record<string, any>): Record<string, any> {
        const formatted: Record<string, any> = {};

        for (const [key, value] of Object.entries(props)) {
            if (typeof value === 'string') {
                // 기본적으로 rich_text로 처리
                formatted[key] = {
                    rich_text: [{ text: { content: value } }],
                };
            } else if (typeof value === 'number') {
                formatted[key] = { number: value };
            } else if (typeof value === 'boolean') {
                formatted[key] = { checkbox: value };
            } else if (value instanceof Date) {
                formatted[key] = { date: { start: value.toISOString() } };
            } else if (Array.isArray(value)) {
                formatted[key] = {
                    multi_select: value.map(v => ({ name: v })),
                };
            } else {
                formatted[key] = value;
            }
        }

        return formatted;
    }
}

// ============================================
// 🪝 Notion 동기화 훅
// ============================================
export interface UseNotionSyncOptions {
    apiToken: string;
    databaseId: string;
    autoSync?: boolean;
    syncInterval?: number; // ms
}

export function useNotionSync(options: UseNotionSyncOptions) {
    const { apiToken, databaseId, autoSync = false, syncInterval = 60000 } = options;

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastSync, setLastSync] = useState<Date | null>(null);
    const [pages, setPages] = useState<NotionPage[]>([]);

    const client = new NotionClient(apiToken);

    const sync = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { results } = await client.queryDatabase(databaseId);
            setPages(results);
            setLastSync(new Date());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Sync failed');
        } finally {
            setIsLoading(false);
        }
    }, [databaseId]);

    const createItem = useCallback(async (properties: Record<string, any>) => {
        setIsLoading(true);
        try {
            const page = await client.createPage(databaseId, properties);
            setPages(prev => [...prev, page]);
            return page;
        } finally {
            setIsLoading(false);
        }
    }, [databaseId]);

    const updateItem = useCallback(async (pageId: string, properties: Record<string, any>) => {
        setIsLoading(true);
        try {
            const page = await client.updatePage(pageId, properties);
            setPages(prev => prev.map(p => p.id === pageId ? page : p));
            return page;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const deleteItem = useCallback(async (pageId: string) => {
        setIsLoading(true);
        try {
            await client.deletePage(pageId);
            setPages(prev => prev.filter(p => p.id !== pageId));
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        pages,
        isLoading,
        error,
        lastSync,
        sync,
        createItem,
        updateItem,
        deleteItem,
    };
}

// ============================================
// 📋 학습 데이터 변환기
// ============================================
export const learningDataTransformer = {
    /**
     * 학습일지 → Notion 페이지 프로퍼티
     */
    toNotionProperties(entry: {
        studentName: string;
        date: string;
        todayLearned: string[];
        mood: string;
        understanding: number;
        nextGoal: string;
    }) {
        return {
            Name: { title: [{ text: { content: `${entry.studentName} - ${entry.date}` } }] },
            Date: { date: { start: entry.date } },
            'Today Learned': { rich_text: [{ text: { content: entry.todayLearned.join('\n') } }] },
            Mood: { select: { name: entry.mood } },
            Understanding: { number: entry.understanding },
            'Next Goal': { rich_text: [{ text: { content: entry.nextGoal } }] },
        };
    },

    /**
     * Notion 페이지 → 학습일지
     */
    fromNotionPage(page: NotionPage) {
        return {
            id: page.id,
            date: page.properties['Date']?.value || '',
            studentName: page.title.split(' - ')[0] || '',
            todayLearned: (page.properties['Today Learned']?.value || '').split('\n'),
            mood: page.properties['Mood']?.value || 'good',
            understanding: page.properties['Understanding']?.value || 3,
            nextGoal: page.properties['Next Goal']?.value || '',
        };
    },

    /**
     * 과제 → Notion 페이지 프로퍼티
     */
    assignmentToNotion(assignment: {
        title: string;
        dueDate: string;
        status: string;
        studentName: string;
    }) {
        return {
            Name: { title: [{ text: { content: assignment.title } }] },
            'Due Date': { date: { start: assignment.dueDate } },
            Status: { select: { name: assignment.status } },
            Student: { rich_text: [{ text: { content: assignment.studentName } }] },
        };
    },
};

export default NotionClient;
