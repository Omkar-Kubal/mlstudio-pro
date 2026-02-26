"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { subjects, subjectMeta } from "@/adapters/subjects";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiFetch } from "@/adapters/api";

// Progress Ring component
function ProgressRing({ progress, size = 40 }: { progress: number; size?: number }) {
    const strokeDasharray = `${progress}, 100`;

    return (
        <div className={`relative`} style={{ width: size, height: size }}>
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                    className="text-[#262626]"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                />
                {progress > 0 && (
                    <path
                        className="text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray={strokeDasharray}
                        strokeLinecap="round"
                        strokeWidth="3"
                    />
                )}
            </svg>
            {progress === 100 ? (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                </div>
            ) : progress > 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#a0a0a0]">
                    {progress}%
                </div>
            ) : null}
        </div>
    );
}

// Material icon mapping for subjects
const subjectIcons: Record<string, string> = {
    "foundations": "analytics",
    "programming": "code",
    "data-handling": "database",
    "machine-learning": "psychology",
    "model-evaluation": "trending_up",
    "deep-learning": "hub",
    "applied-domains": "visibility",
};

// Format icons
const _formatIcons: Record<string, string> = {
    "theory": "menu_book",
    "code": "terminal",
    "visual": "visibility",
    "interactive": "touch_app",
};

// Difficulty colors
const difficultyColors: Record<string, string> = {
    "Beginner": "text-emerald-400",
    "Core": "text-amber-400",
    "Advanced": "text-rose-400",
};


export default function LearnPage() {
    const [progressData, setProgressData] = useState<{ unlocked_subjects?: number[] } | null>(null);

    useEffect(() => {
        apiFetch<{ unlocked_subjects?: number[] }>("/curriculum/progress")
            .then(data => setProgressData(data))
            .catch(err => console.error("Failed to fetch progress", err));
    }, []);

    // Sort subjects by order
    const sortedSubjects = [...subjects].sort((a, b) => a.order - b.order);

    // Filter to find the first unfinished subject that isn't locked
    const featuredSubject = sortedSubjects.find(s => {
        const isUnlocked = progressData?.unlocked_subjects?.includes(s.order) || s.order === 1;
        return isUnlocked;
    }) || sortedSubjects[0];

    // Empty state check
    if (!subjects || subjects.length === 0) {
        return (
            <main className="mx-auto flex w-full max-w-[1400px] flex-col px-6 lg:px-12 py-12 lg:py-20 min-h-screen items-center justify-center">
                <div className="text-center space-y-4">
                    <span className="material-symbols-outlined text-6xl text-[#525252]">school</span>
                    <h2 className="text-2xl font-bold text-white">No subjects available</h2>
                    <p className="text-[#a0a0a0]">Content is being prepared. Please check back soon.</p>
                </div>
            </main>
        );
    }

    return (
        <ProtectedRoute>
            <main className="mx-auto flex w-full max-w-[1400px] flex-col px-6 lg:px-12 py-12 lg:py-20 min-h-screen">
                {/* Editorial Header */}
                <section className="mb-12 md:mb-16 animate-fade-in-up">
                    <div className="flex flex-col gap-4 max-w-4xl">
                        <span className="text-[#525252] font-mono text-xs uppercase tracking-[0.2em] mb-2 pl-1">
                            Knowledge Base
                        </span>
                        <h1 className="text-white text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter">
                            The <span className="text-[#e0e0e0]">Curriculum</span>
                        </h1>
                        <p className="text-[#a0a0a0] text-lg md:text-xl font-normal leading-relaxed max-w-2xl mt-4 pl-1 border-l-2 border-[#262626] pl-6">
                            Your command center for Data Science mastery. Track progress, visualize complex concepts, and build a foundational understanding of machine intelligence.
                        </p>
                    </div>
                </section>

                {/* System Explanation */}
                <section className="mb-8 p-4 rounded-xl bg-[#0d0d0d] border border-[#1a1a1a]">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[#525252]">info</span>
                            <span className="text-sm text-[#737373]">
                                <strong className="text-[#a0a0a0]">How this works:</strong> Each <strong className="text-white">Subject</strong> is a learning track containing multiple <strong className="text-white">Modules</strong>.
                                Modules contain <strong className="text-white">Topics</strong> with theory, code, and interactive exercises.
                                Progress through them in order, or jump to what you need.
                            </span>
                        </div>
                    </div>
                </section>

                {/* Beginner Guidance */}
                <section className="mb-10 p-5 rounded-xl bg-gradient-to-r from-emerald-950/30 to-transparent border border-emerald-900/30">
                    <div className="flex items-start gap-4">
                        <div className="size-10 rounded-lg bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-emerald-400">lightbulb</span>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-1">New to Data Science?</h3>
                            <p className="text-sm text-[#a0a0a0] leading-relaxed">
                                Start with <Link href="/learn/foundations" className="text-emerald-400 hover:underline font-medium">Foundations</Link> — it builds the mathematical intuition you'll need for everything else.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[minmax(320px,auto)]">
                    {/* Featured Card (Wide) */}
                    <Link
                        href={`/learn/${featuredSubject.slug}`}
                        className="glass-card col-span-1 md:col-span-2 rounded-2xl p-8 flex flex-col justify-between group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black transition-all"
                    >
                        {/* Background Decorative Icon - Moved to bottom-right to avoid overlap */}
                        <div className="absolute -bottom-12 -right-12 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                            <span className="material-symbols-outlined text-[240px] leading-none">
                                {subjectIcons[featuredSubject.slug] || "school"}
                            </span>
                        </div>

                        <div className="flex justify-between items-start z-10">
                            <div className="size-12 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-center text-white">
                                <span className="material-symbols-outlined">
                                    {subjectIcons[featuredSubject.slug] || "school"}
                                </span>
                            </div>
                            <ProgressRing
                                progress={progressData?.unlocked_subjects?.includes(featuredSubject.order) ? 100 : 0}
                                size={56}
                            />
                        </div>
                        <div className="mt-8 z-10">
                            {/* Metadata row */}
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className="text-xs font-medium text-emerald-400">
                                    {subjectMeta[featuredSubject.slug]?.difficulty || "Beginner"}
                                </span>
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                                {featuredSubject.title}
                            </h3>
                            <p className="text-[#a0a0a0] mb-4 leading-relaxed max-w-md">
                                {featuredSubject.description}
                            </p>

                            <span className="flex items-center gap-2 bg-[#e0e0e0] hover:bg-white text-black text-sm font-semibold px-5 py-2.5 rounded-full transition-colors w-fit">
                                <span>Start Subject</span>
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </span>
                        </div>
                    </Link>

                    {/* Other Subject Cards */}
                    {sortedSubjects.filter(s => s.slug !== featuredSubject.slug).map((subject) => {
                        const isUnlocked = progressData?.unlocked_subjects?.includes(subject.order) || subject.order === 1;
                        const isLocked = !isUnlocked;
                        const meta = subjectMeta[subject.slug];

                        return (
                            <Link
                                key={subject.id}
                                href={isLocked ? '#' : `/learn/${subject.slug}`}
                                className={`glass-card rounded-2xl p-6 flex flex-col justify-between group focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black transition-all ${isLocked ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className={`size-10 rounded-lg bg-[#141414] border border-[#262626] flex items-center justify-center ${isLocked ? 'text-[#333]' : 'text-white'}`}>
                                        <span className="material-symbols-outlined">
                                            {subjectIcons[subject.slug] || "school"}
                                        </span>
                                    </div>
                                    {isLocked ? (
                                        <div className="flex items-center gap-1 text-[#444] text-xs font-mono uppercase tracking-wider border border-[#262626] px-2 py-1 rounded">
                                            <span className="material-symbols-outlined text-[12px]">lock</span>
                                            Locked
                                        </div>
                                    ) : (
                                        <ProgressRing progress={progressData?.unlocked_subjects?.includes(subject.order) ? 100 : 0} />
                                    )}
                                </div>
                                <div className="mt-4">
                                    {/* Metadata row */}
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className={`text-xs font-medium ${difficultyColors[meta?.difficulty] || 'text-[#737373]'}`}>
                                            {meta?.difficulty}
                                        </span>
                                        <span className="text-[#404040]">•</span>
                                        <span className="text-xs text-[#525252]">
                                            {meta?.modules} modules
                                        </span>
                                    </div>

                                    <h3 className={`text-xl font-bold mb-2 tracking-tight ${isLocked ? 'text-[#444]' : 'text-white group-hover:text-primary transition-colors'}`}>
                                        {subject.title}
                                    </h3>
                                    <p className={`text-sm mb-4 leading-relaxed ${isLocked ? 'text-[#333]' : 'text-[#a0a0a0]'}`}>
                                        {isLocked ? "Complete previous subjects to unlock." : subject.description}
                                    </p>

                                    <span className={`w-full flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all ${isLocked
                                        ? 'border border-[#262626] text-[#333]'
                                        : 'border border-[#404040] hover:border-white hover:text-white text-[#a0a0a0]'
                                        }`}>
                                        <span>{isLocked ? 'Locked' : 'View Modules'}</span>
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Progression Explanation */}
                <section className="mt-12 p-5 rounded-xl bg-[#0d0d0d] border border-[#1a1a1a]">
                    <div className="flex items-start gap-4">
                        <span className="material-symbols-outlined text-[#404040]">route</span>
                        <div className="text-sm text-[#737373]">
                            <strong className="text-[#a0a0a0]">Learning is flexible:</strong> Subjects are ordered by logical progression, but you can start anywhere based on your background.
                            Complete subjects to build foundational skills. "Completion" means finishing all topics within a subject — you can always revisit material.
                        </div>
                    </div>
                </section>


                {/* Bottom CTA */}
                <div className="mt-16 relative overflow-hidden rounded-2xl border border-[#262626] bg-[#0d0d0d]">
                    <div className="absolute inset-0 bg-subtle-glow opacity-60 pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-10 gap-8">
                        <div>
                            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">
                                Mastered the basics?
                            </h3>
                            <p className="text-[#a0a0a0]">Apply your knowledge in real-world scenarios.</p>
                        </div>
                        <Link href="/explore" className="group flex items-center gap-4 text-white hover:text-[#e0e0e0] transition-colors">
                            <span className="text-lg font-medium border-b border-white/30 pb-0.5 group-hover:border-[#e0e0e0]">
                                Explore Roadmap
                            </span>
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                                arrow_forward
                            </span>
                        </Link>
                    </div>
                </div>
            </main>
        </ProtectedRoute>
    );
}
