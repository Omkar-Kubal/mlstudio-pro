"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiFetch } from "@/adapters/api";
import Link from "next/link";

interface Stats {
    total_users: number;
    total_completions: number;
    popular_topics: { topic: string; count: number }[];
    active_modules: string[];
    // Session fields
    active_users_today?: number;
    total_sessions_today?: number;
    avg_duration_ms?: number;
    live_now?: number;
    returning_users?: number;
    current_pages?: { page: string; count: number }[];
    mock?: boolean;
}

function StatCard({
    icon, label, value, sub, accent,
}: {
    icon: string; label: string; value: string | number; sub?: string; accent?: "green" | "blue" | "amber";
}) {
    const dotColor = accent === "green" ? "bg-emerald-500" : accent === "blue" ? "bg-blue-500" : accent === "amber" ? "bg-amber-500" : "bg-[#525252]";
    const textColor = accent === "green" ? "text-emerald-400" : accent === "blue" ? "text-blue-400" : accent === "amber" ? "text-amber-400" : "text-white";
    return (
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-6 flex flex-col gap-2 hover:border-[#2a2a2a] transition-colors">
            <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#525252] text-xl">{icon}</span>
                {accent && <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${accent === "green" ? "animate-pulse" : ""}`} />}
            </div>
            <p className="text-xs text-[#525252] uppercase tracking-widest font-bold">{label}</p>
            <p className={`text-4xl font-black tracking-tighter ${textColor}`}>{value}</p>
            {sub && <p className="text-xs text-[#737373]">{sub}</p>}
        </div>
    );
}

function msToMinutes(ms: number): string {
    if (!ms) return "0m";
    const mins = Math.round(ms / 60000);
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
}

export default function AnalyticsPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        apiFetch<Stats>("/admin/stats")
            .then(setStats)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [user]);

    if (!user?.isAdmin) return null;

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-black text-white p-8 pt-24">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-10">
                        <Link href="/admin" className="text-[#525252] hover:text-white transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <div>
                            <span className="text-xs font-mono text-[#525252] uppercase tracking-[0.3em]">Admin</span>
                            <h1 className="text-4xl font-black tracking-tighter">Platform Analytics</h1>
                        </div>
                        {stats?.mock && (
                            <span className="ml-auto bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold px-3 py-1.5 rounded-full">
                                Mock Data
                            </span>
                        )}
                    </div>

                    {loading && (
                        <div className="flex items-center justify-center py-32">
                            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
                        </div>
                    )}

                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-6 py-4 rounded-xl text-sm">
                            Failed to load stats: {error}
                        </div>
                    )}

                    {stats && (
                        <>
                            {/* Live Session Row */}
                            <div className="mb-5">
                                <p className="text-xs font-bold uppercase tracking-widest text-[#525252] mb-3">Live</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <StatCard
                                        icon="wifi"
                                        label="Live Right Now"
                                        value={stats.live_now ?? 0}
                                        sub="active in the last 5 min"
                                        accent="green"
                                    />
                                    <StatCard
                                        icon="today"
                                        label="Active Today"
                                        value={stats.active_users_today ?? 0}
                                        sub="unique sessions in 24h"
                                        accent="blue"
                                    />
                                    <StatCard
                                        icon="timer"
                                        label="Avg Session"
                                        value={msToMinutes(stats.avg_duration_ms ?? 0)}
                                        sub="average session length"
                                    />
                                    <StatCard
                                        icon="replay"
                                        label="Returning Users"
                                        value={stats.returning_users ?? 0}
                                        sub="users with > 1 session"
                                        accent="amber"
                                    />
                                </div>
                            </div>

                            {/* Platform Stats Row */}
                            <div className="mb-10">
                                <p className="text-xs font-bold uppercase tracking-widest text-[#525252] mb-3">Platform</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <StatCard icon="group" label="Total Users" value={stats.total_users} />
                                    <StatCard icon="check_circle" label="Total Completions" value={stats.total_completions} />
                                    <StatCard icon="workspace_premium" label="Active Modules" value={stats.active_modules.length} sub="with ≥1 completion" />
                                    <StatCard icon="event_repeat" label="Sessions Today" value={stats.total_sessions_today ?? 0} />
                                </div>
                            </div>

                            {/* Live Pages + Popular Topics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Live pages */}
                                <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <h2 className="text-sm font-bold uppercase tracking-widest text-[#525252]">Pages Live Now</h2>
                                    </div>
                                    {(stats.current_pages ?? []).length > 0 ? (
                                        <div className="space-y-3">
                                            {(stats.current_pages ?? []).map(p => (
                                                <div key={p.page} className="flex items-center justify-between">
                                                    <span className="text-sm font-mono text-white">{p.page}</span>
                                                    <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                                        {p.count} {p.count === 1 ? "user" : "users"}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[#525252] text-sm">No active users right now.</p>
                                    )}
                                </div>

                                {/* Popular topics */}
                                <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-6">
                                    <h2 className="text-sm font-bold uppercase tracking-widest text-[#525252] mb-6">Most Completed Topics</h2>
                                    {stats.popular_topics.length > 0 ? (
                                        <div className="space-y-4">
                                            {stats.popular_topics.map((t, i) => {
                                                const maxCount = stats.popular_topics[0]?.count || 1;
                                                const pct = Math.round((t.count / maxCount) * 100);
                                                return (
                                                    <div key={t.topic}>
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <span className="text-sm font-mono text-white">{t.topic}</span>
                                                            <span className="text-xs text-[#525252]">{t.count} completions</span>
                                                        </div>
                                                        <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-700 ${i === 0 ? "bg-white" : "bg-[#404040]"}`}
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-[#525252] text-sm">No completions recorded yet.</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </ProtectedRoute>
    );
}
