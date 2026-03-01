"use client";

import React, { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiFetch } from "@/adapters/api";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { topics } from "@/adapters/topics";

interface ProgressStats {
    completed_topics: Record<string, string[]>;
    unlocked_modules: string[];
    unlocked_subjects: number[];
}

interface Profile {
    display_name: string;
    persona: string;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<ProgressStats | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                const [progressData, profileData] = await Promise.all([
                    apiFetch<ProgressStats>("/curriculum/progress"),
                    apiFetch<Profile>("/profile").catch(() => ({ display_name: "Explorer", persona: "Beginner" }))
                ]);
                setStats(progressData);
                setProfile(profileData);
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const totalTopicsCompleted = () => {
        if (!stats?.completed_topics) return 0;
        return Object.values(stats.completed_topics).reduce((acc, topics) => acc + topics.length, 0);
    };

    const masteryLevel = () => {
        const count = totalTopicsCompleted();
        if (count > 20) return "Grandmaster";
        if (count > 10) return "Acolyte";
        if (count > 5) return "Apprentice";
        return "Initiate";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-black p-6 lg:p-12 overflow-hidden relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-6xl mx-auto space-y-12 relative z-10">
                    {/* Header */}
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <span className="text-primary font-mono text-xs uppercase tracking-[0.2em] animate-pulse">Neural Interface Active</span>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
                                Greetings, <span className="text-primary">{profile?.display_name || "Explorer"}</span>
                            </h1>
                            <p className="text-muted text-lg max-w-xl italic">
                                &quot;{profile?.persona === 'Advanced' ? 'The mathematics of the universe are waiting to be solved.' : 'Your journey into the heart of artificial intelligence continues.'}&quot;
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <Link href="/profile" className="flex items-center gap-4 bg-surface p-4 rounded-2xl border border-border hover:border-primary/50 transition-all group">
                                <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-primary">person</span>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <span className="block text-[10px] text-muted uppercase tracking-widest font-bold">Profile Info</span>
                                    <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">Settings & Persona</span>
                                </div>
                            </Link>

                            <div className="flex items-center gap-4 bg-surface p-4 rounded-2xl border border-border shadow-2xl shadow-primary/5">
                                <div className="size-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                    <span className="material-symbols-outlined text-emerald-400">military_tech</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-muted uppercase tracking-widest font-bold">Rank</span>
                                    <span className="text-xl font-black italic text-emerald-400 tracking-tighter">{masteryLevel()}</span>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-surface/30 p-8 rounded-3xl border border-border backdrop-blur-xl space-y-2 group hover:border-primary/30 transition-all">
                            <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-xl text-primary">done_all</span>
                            </div>
                            <span className="text-5xl font-black text-white lining-nums">{totalTopicsCompleted()}</span>
                            <p className="text-xs text-muted uppercase tracking-[0.2em] font-bold">Topics Mastered</p>
                        </div>
                        <div className="bg-surface/30 p-8 rounded-3xl border border-border backdrop-blur-xl space-y-2 group hover:border-primary/30 transition-all">
                            <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-xl text-primary">lock_open</span>
                            </div>
                            <span className="text-5xl font-black text-white lining-nums">{stats?.unlocked_modules.length || 0}</span>
                            <p className="text-xs text-muted uppercase tracking-[0.2em] font-bold">Modules Unlocked</p>
                        </div>
                        <div className="bg-surface/30 p-8 rounded-3xl border border-border backdrop-blur-xl relative overflow-hidden group hover:border-primary/30 transition-all">
                            <div className="absolute bottom-0 right-0 opacity-10 group-hover:scale-125 transition-transform">
                                <span className="material-symbols-outlined text-[120px] text-primary">trending_up</span>
                            </div>
                            <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-xl text-primary">data_usage</span>
                            </div>
                            <span className="text-5xl font-black text-primary lining-nums">
                                {Math.round(((totalTopicsCompleted()) / Math.max(1, topics.length)) * 100)}%
                            </span>
                            <p className="text-xs text-muted uppercase tracking-[0.2em] font-bold">Total Knowledge</p>
                        </div>
                    </div>

                    {/* Quick Access */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-6">
                            <h2 className="text-2xl font-black tracking-tighter">Current Learning Path</h2>
                            <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Link href="/learn" className="group p-8 rounded-2xl border border-border bg-surface/50 hover:border-primary/50 transition-all relative overflow-hidden ring-1 ring-white/5">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative z-10 space-y-4">
                                    <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary transition-colors">
                                        <span className="material-symbols-outlined group-hover:text-black">school</span>
                                    </div>
                                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">Resume Curriculum</h3>
                                    <p className="text-sm text-muted leading-relaxed">Continue from where you left off. Every topic mastered brings you closer to artificial general intelligence.</p>
                                    <div className="pt-4 flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                                        Enter Learning Center <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </div>
                                </div>
                            </Link>

                            {/* Dynamic Module Hint */}
                            <div className="p-8 rounded-2xl border border-border/50 bg-surface/20 flex flex-col justify-center items-center text-center space-y-4">
                                <span className="material-symbols-outlined text-muted text-4xl">upcoming</span>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-muted">Next Recommended Milestone</p>
                                    <p className="text-xs text-[#525252]">Complete &quot;Linear Algebra Foundations&quot; to unlock Neural Networks.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </ProtectedRoute>
    );
}