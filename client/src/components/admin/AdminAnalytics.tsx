/**
 * AdminAnalytics.tsx
 * 분석 대시보드 컴포넌트
 * Admin.tsx에서 분리됨
 */

import { trpc } from "@/lib/trpc";

// ============================================
// 🚀 AdminAnalytics Component
// ============================================
export default function AdminAnalytics() {
    const { data: projects } = trpc.projects.list.useQuery();
    const { data: resources } = trpc.resources.list.useQuery();

    return (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
            <h2 className="text-xl font-light text-white mb-6">Analytics Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white/[0.02] rounded-xl border border-white/5">
                    <h3 className="text-white/70 mb-4">Top Projects</h3>
                    <div className="space-y-3">
                        {projects?.slice()
                            .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
                            .slice(0, 5)
                            .map((p, i) => (
                                <div key={p.id} className="flex items-center justify-between">
                                    <span className="text-white text-sm truncate">{i + 1}. {p.title}</span>
                                    <span className="text-emerald-400 text-sm">{p.viewCount || 0}</span>
                                </div>
                            ))}
                    </div>
                </div>
                <div className="p-6 bg-white/[0.02] rounded-xl border border-white/5">
                    <h3 className="text-white/70 mb-4">Top Resources</h3>
                    <div className="space-y-3">
                        {resources?.slice()
                            .sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))
                            .slice(0, 5)
                            .map((r, i) => (
                                <div key={r.id} className="flex items-center justify-between">
                                    <span className="text-white text-sm truncate">{i + 1}. {r.title}</span>
                                    <span className="text-emerald-400 text-sm">{r.downloadCount || 0}</span>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
