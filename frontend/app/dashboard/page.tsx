"use client";

import React, { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiFetch } from "@/adapters/api";
import Link from "next/link";

interface ProgressStats {
    completed_topics: string[];
    unlocked_modules: string[];
}

export default function DashboardPage() {
    const [stats, setStats] = useState<ProgressStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const data = await apiFetch<ProgressStats>("/curriculum/progress");
                setStats(data);
            } catch (err) {
                console.error("Failed to fetch progress:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProgress();
    }, []);

    const masteryLevel = () => {
        const count = stats?.completed_topics.length || 0;
        if (count > 20) return "Grandmaster";
        if (count > 10) return "Acolyte";
        if (count > 5) return "Apprentice";
        return "Initiate";
    };

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-background p-6 lg:p-12">
                <div className="max-w-6xl mx-auto space-y-12">
                    {/* Header */}
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <span className="text-primary font-mono text-xs uppercase tracking-[0.2em]">Student Portal</span>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
                                Dashboard
                            </h1>
                        </div>
                        <div className="flex items-center gap-4 bg-surface p-4 rounded-xl border border-border">
                            <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                                <span className="material-symbols-outlined text-primary">military_tech</span>
                            </div>
                            <div>
                                <span className="block text-[10px] text-muted uppercase tracking-widest">Mastery Level</span>
                                <span className="text-xl font-bold italic">{masteryLevel()}</span>
                            </div>
                        </div>
                    </header>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-surface/50 p-8 rounded-2xl border border-border backdrop-blur-sm space-y-2">
                            <span className="text-4xl font-black text-white">{stats?.completed_topics.length || 0}</span>
                            <p className="text-xs text-muted uppercase tracking-widest">Topics Completed</p>
                        </div>
                        <div className="bg-surface/50 p-8 rounded-2xl border border-border backdrop-blur-sm space-y-2">
                            <span className="text-4xl font-black text-white">{stats?.unlocked_modules.length || 0}</span>
                            <p className="text-xs text-muted uppercase tracking-widest">Modules Unlocked</p>
                        </div>
                        <div className="bg-surface/50 p-8 rounded-2xl border border-border backdrop-blur-sm space-y-2">
                            <span className="text-4xl font-black text-primary">
                                {Math.round(((stats?.completed_topics.length || 0) / 40) * 100)}%
                            </span>
                            <p className="text-xs text-muted uppercase tracking-widest">Overall Progress</p>
                        </div>
                    </div>

                    {/* Quick Access */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold">Resume Learning</h2>
                            <div className="h-px flex-1 bg-border" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Link href="/learn" className="group p-6 rounded-xl border border-border bg-surface hover:border-primary transition-all">
                                <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">Go to Curriculum</h3>
                                <p className="text-xs text-muted leading-relaxed">Continue your journey through the foundations of ML.</p>
                            </Link>
                            {/* We could list specific modules here if we have better logic */}
                        </div>
                    </section>
                </div>
            </main>
        </ProtectedRoute>
    );
}
