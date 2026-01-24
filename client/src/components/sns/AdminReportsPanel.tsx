import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Shield, AlertTriangle, Check, X, Ban, Eye,
    MessageSquare, Flag, Users, Loader2, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface Report {
    id: number;
    reporterId: number;
    targetType: string;
    targetId: number;
    reason: string;
    details?: string;
    status: string;
    createdAt: string;
}

const REPORT_REASONS: Record<string, { label: string; color: string }> = {
    spam: { label: "스팸", color: "bg-yellow-500" },
    abuse: { label: "욕설/비방", color: "bg-red-500" },
    violence: { label: "폭력", color: "bg-red-600" },
    nsfw: { label: "부적절", color: "bg-pink-500" },
    other: { label: "기타", color: "bg-gray-500" },
};

export function AdminReportsPanel() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("pending");
    const [processing, setProcessing] = useState<number | null>(null);

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        setLoading(true);
        try {
            // Mock data for demo - in production, call sns.reports.list API
            setReports([
                {
                    id: 1,
                    reporterId: 1,
                    targetType: "post",
                    targetId: 123,
                    reason: "spam",
                    details: "반복적인 광고 게시물",
                    status: "pending",
                    createdAt: new Date(Date.now() - 3600000).toISOString(),
                },
                {
                    id: 2,
                    reporterId: 2,
                    targetType: "comment",
                    targetId: 456,
                    reason: "abuse",
                    details: "욕설 포함",
                    status: "pending",
                    createdAt: new Date(Date.now() - 7200000).toISOString(),
                },
            ]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (reportId: number, action: "resolve" | "dismiss") => {
        setProcessing(reportId);
        try {
            // Call API to update report status
            await new Promise(resolve => setTimeout(resolve, 500));
            setReports(prev => prev.map(r =>
                r.id === reportId ? { ...r, status: action === "resolve" ? "resolved" : "dismissed" } : r
            ));
            toast.success(action === "resolve" ? "신고가 처리되었습니다" : "신고가 기각되었습니다");
        } catch (e) {
            toast.error("처리 실패");
        } finally {
            setProcessing(null);
        }
    };

    const filteredReports = reports.filter(r => {
        if (activeTab === "pending") return r.status === "pending";
        if (activeTab === "resolved") return r.status === "resolved";
        return true;
    });

    const pendingCount = reports.filter(r => r.status === "pending").length;

    return (
        <div className="bg-midnight-card rounded-xl border border-white/10 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                        <Shield className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">신고 관리</h2>
                        <p className="text-sm text-frost-muted">
                            {pendingCount}건의 미처리 신고
                        </p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={loadReports} className="border-white/10">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    새로고침
                </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-white/5 mb-4">
                    <TabsTrigger value="pending" className="data-[state=active]:bg-electric data-[state=active]:text-midnight">
                        대기중 ({pendingCount})
                    </TabsTrigger>
                    <TabsTrigger value="resolved" className="data-[state=active]:bg-electric data-[state=active]:text-midnight">
                        처리됨
                    </TabsTrigger>
                    <TabsTrigger value="all" className="data-[state=active]:bg-electric data-[state=active]:text-midnight">
                        전체
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab}>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-electric" />
                        </div>
                    ) : filteredReports.length === 0 ? (
                        <div className="text-center py-12 text-frost-muted">
                            <Flag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>신고가 없습니다</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredReports.map((report) => {
                                const reasonInfo = REPORT_REASONS[report.reason] || REPORT_REASONS.other;
                                return (
                                    <div
                                        key={report.id}
                                        className={`p-4 rounded-xl border transition-all ${report.status === "pending"
                                                ? "bg-red-500/5 border-red-500/20"
                                                : "bg-white/5 border-white/10"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-lg ${reasonInfo.color}/20`}>
                                                    <AlertTriangle className={`w-5 h-5 text-${reasonInfo.color.replace('bg-', '')}`} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${reasonInfo.color} text-white`}>
                                                            {reasonInfo.label}
                                                        </span>
                                                        <span className="text-frost-muted text-sm">
                                                            {report.targetType === "post" ? "게시물" : report.targetType === "comment" ? "댓글" : "사용자"} #{report.targetId}
                                                        </span>
                                                    </div>
                                                    {report.details && (
                                                        <p className="text-frost text-sm mb-2">{report.details}</p>
                                                    )}
                                                    <p className="text-xs text-frost-muted">
                                                        {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true, locale: ko })}
                                                    </p>
                                                </div>
                                            </div>

                                            {report.status === "pending" && (
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleAction(report.id, "dismiss")}
                                                        disabled={processing === report.id}
                                                        className="border-white/10 text-frost-muted hover:text-frost"
                                                    >
                                                        <X className="w-4 h-4 mr-1" />
                                                        기각
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleAction(report.id, "resolve")}
                                                        disabled={processing === report.id}
                                                        className="bg-red-500 hover:bg-red-600 text-white"
                                                    >
                                                        {processing === report.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Check className="w-4 h-4 mr-1" />
                                                                처리
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            )}

                                            {report.status !== "pending" && (
                                                <span className={`px-3 py-1 text-xs rounded-full font-medium ${report.status === "resolved" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                                                    }`}>
                                                    {report.status === "resolved" ? "처리됨" : "기각됨"}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
