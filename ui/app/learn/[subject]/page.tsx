"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Module } from "@/types/learning";
import { subjects } from "@/data/subjects";

// Progress bar component
function ProgressBar({ progress }: { progress: number }) {
    return (
        <div className="w-full h-1 bg-[#2e3033] rounded-full">
            <div
                className={`h-full rounded-full transition-all duration-500 ${progress === 100
                    ? 'bg-primary shadow-[0_0_10px_rgba(215,224,234,0.5)]'
                    : 'bg-primary'
                    }`}
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}

// Sample progress data (preview only — connects to user account in full version)
const moduleProgress: Record<string, number> = {
    "statistics": 0,
    "probability": 0,
    "linear-algebra": 0,
    "optimization": 0,
    "python-basics": 0,
    "numpy": 0,
    "pandas": 0,
    "visualization": 0,
    "regression": 0,
    "classification": 0,
    "clustering": 0,
    "trees-ensembles": 0,
};

export default function SubjectPage() {
    const params = useParams();
    const subjectSlug = params.subject as string;

    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);

    // Get subject info
    const subject = subjects.find(s => s.slug === subjectSlug);

    useEffect(() => {
        fetch(`/api/modules?subject=${subjectSlug}`)
            .then((res) => res.json())
            .then((data) => {
                setModules(data);
                setLoading(false);
            });
    }, [subjectSlug]);

    // Calculate overall progress
    const overallProgress = modules.length > 0
        ? Math.round(modules.reduce((acc, m) => acc + (moduleProgress[m.slug] || 0), 0) / modules.length)
        : 0;

    const completedModules = modules.filter(m => (moduleProgress[m.slug] || 0) === 100).length;
    const currentModule = modules.find(m => {
        const progress = moduleProgress[m.slug] || 0;
        return progress > 0 && progress < 100;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-muted">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="flex-grow pt-24 pb-20 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full">
            {/* Navigation breadcrumb */}
            <div className="mb-8">
                <Link href="/learn" className="text-sm text-muted hover:text-foreground transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Back to Curriculum
                </Link>
            </div>

            {/* Hero Section */}
            <section className="mb-16 mt-8 grid lg:grid-cols-[2fr_1fr] gap-12 items-end">
                <div className="flex flex-col gap-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        {subject?.title || subjectSlug.replace(/-/g, ' ')} Path
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[1.1] text-white capitalize">
                        {subject?.title || subjectSlug.replace(/-/g, ' ')}
                    </h1>
                    <p className="text-lg md:text-xl text-muted max-w-2xl leading-relaxed font-light">
                        {subject?.description || 'Master the core concepts and build practical skills through interactive modules.'}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-2">
                        <div className="flex items-center gap-2 text-sm text-muted bg-[#1a1a1a] px-3 py-1.5 rounded border border-[#262626]">
                            <span className="material-symbols-outlined text-lg">schedule</span>
                            <span>{modules.length * 2}h Total</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted bg-[#1a1a1a] px-3 py-1.5 rounded border border-[#262626]">
                            <span className="material-symbols-outlined text-lg">school</span>
                            <span>{modules.length} Modules</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted bg-[#1a1a1a] px-3 py-1.5 rounded border border-[#262626]">
                            <span className="material-symbols-outlined text-lg">verified</span>
                            <span>Certificate Included</span>
                        </div>
                    </div>
                </div>

                {/* Decorative SVG */}
                <div className="hidden lg:flex justify-end relative">
                    <div className="absolute inset-0 bg-primary/10 blur-[80px] rounded-full transform translate-x-10 -translate-y-10" />
                    <div className="relative z-10 w-full max-w-xs aspect-square border border-white/5 bg-white/5 backdrop-blur-sm rounded-2xl flex items-center justify-center p-8 shadow-2xl">
                        <svg className="w-full h-full text-primary opacity-80" fill="none" viewBox="0 0 200 200">
                            <path d="M100 20L170 60V140L100 180L30 140V60L100 20Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
                            <path d="M100 20V100M170 60L100 100M30 60L100 100M100 180V100" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
                            <circle cx="100" cy="100" fill="currentColor" fillOpacity="0.2" r="10" />
                            <circle cx="100" cy="20" fill="currentColor" r="4" />
                            <circle cx="170" cy="60" fill="currentColor" r="4" />
                            <circle cx="170" cy="140" fill="currentColor" r="4" />
                            <circle cx="100" cy="180" fill="currentColor" r="4" />
                            <circle cx="30" cy="140" fill="currentColor" r="4" />
                            <circle cx="30" cy="60" fill="currentColor" r="4" />
                        </svg>
                    </div>
                </div>
            </section>

            {/* Stats Row */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                <div className="glass-panel p-5 rounded-lg flex flex-col shadow-silver-glow">
                    <span className="text-xs text-muted uppercase font-semibold tracking-wider">Overall Progress</span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">{overallProgress}%</span>
                        <span className="text-sm text-muted">completed</span>
                    </div>
                    <div className="w-full h-1 bg-[#2e3033] rounded-full mt-3">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${overallProgress}%` }} />
                    </div>
                </div>
                <div className="glass-panel p-5 rounded-lg flex flex-col shadow-silver-glow">
                    <span className="text-xs text-muted uppercase font-semibold tracking-wider">Modules</span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">{completedModules}</span>
                        <span className="text-sm text-muted">/ {modules.length} done</span>
                    </div>
                </div>
                <div className="glass-panel p-5 rounded-lg flex flex-col shadow-silver-glow">
                    <span className="text-xs text-muted uppercase font-semibold tracking-wider">Current Streak</span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">5</span>
                        <span className="text-sm text-muted">days</span>
                    </div>
                </div>
                <Link
                    href="#"
                    className="glass-panel p-5 rounded-lg flex flex-col shadow-silver-glow hover:bg-white/5 transition-colors cursor-pointer group"
                >
                    <span className="text-xs text-muted uppercase font-semibold tracking-wider group-hover:text-primary transition-colors">Resources</span>
                    <div className="mt-2 flex items-center justify-between">
                        <span className="text-xl font-bold text-white">View Docs</span>
                        <span className="material-symbols-outlined text-primary -rotate-45 group-hover:rotate-0 transition-transform">arrow_forward</span>
                    </div>
                </Link>
            </section>

            {/* Module Grid Header */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Modules</h2>
                <div className="flex gap-2">
                    <button className="p-2 rounded bg-[#1a1a1a] border border-[#2e3033] text-white hover:border-primary/50 transition-colors">
                        <span className="material-symbols-outlined text-lg">view_module</span>
                    </button>
                    <button className="p-2 rounded bg-transparent border border-transparent text-muted hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-lg">view_list</span>
                    </button>
                </div>
            </div>

            {/* Module Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {modules.map((module, index) => {
                    const progress = moduleProgress[module.slug] || 0;
                    const isCompleted = progress === 100;
                    const isCurrent = currentModule?.slug === module.slug;
                    const isLocked = index > 0 && (moduleProgress[modules[index - 1]?.slug] || 0) < 50 && progress === 0;

                    return (
                        <Link
                            key={module.id}
                            href={isLocked ? '#' : `/learn/${subjectSlug}/${module.slug}`}
                            className={`glass-panel rounded-lg p-6 flex flex-col h-full relative overflow-hidden transition-all-custom group ${isCurrent
                                ? 'shadow-[inset_0_1px_0_0_rgba(215,224,234,0.2),0_0_0_1px_rgba(215,224,234,0.3)] bg-gradient-to-b from-white/[0.08] to-transparent'
                                : isLocked
                                    ? 'opacity-50 cursor-not-allowed grayscale-[0.5] hover:opacity-60'
                                    : 'shadow-silver-glow hover:shadow-silver-glow-hover'
                                }`}
                        >
                            {/* Background glow for current module */}
                            {isCurrent && (
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full -mr-10 -mt-10" />
                            )}

                            {/* Lock overlay */}
                            {isLocked && (
                                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                                    <div className="size-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white/50">lock</span>
                                    </div>
                                </div>
                            )}

                            {/* Header */}
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${isCurrent
                                    ? 'text-black bg-primary'
                                    : isCompleted
                                        ? 'text-primary border border-primary/30 bg-primary/10'
                                        : 'text-primary border border-primary/30 bg-primary/5'
                                    }`}>
                                    Module {String(index + 1).padStart(2, '0')}
                                </span>
                                <span className="text-xs text-muted flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">schedule</span>
                                    {45 + index * 15}m
                                </span>
                            </div>

                            {/* Content */}
                            <h3 className={`text-xl font-bold mb-2 relative z-10 transition-colors ${isLocked ? 'text-muted' : 'text-white group-hover:text-primary'
                                }`}>
                                {module.title}
                            </h3>
                            <p className={`text-sm leading-relaxed mb-6 flex-grow relative z-10 ${isLocked ? 'text-muted/70' : 'text-muted'
                                }`}>
                                {module.description}
                            </p>

                            {/* Progress and CTA */}
                            <div className="mt-auto relative z-10">
                                {!isLocked && (
                                    <>
                                        <div className="flex justify-between text-xs mb-2">
                                            <span className="text-white">Progress</span>
                                            <span className={`font-mono ${isCompleted ? 'text-primary' : 'text-muted'}`}>
                                                {progress}%
                                            </span>
                                        </div>
                                        <ProgressBar progress={progress} />
                                    </>
                                )}
                                <button
                                    className={`w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors mt-6 ${isCurrent
                                        ? 'bg-primary text-[#0a0a0a] hover:bg-white shadow-[0_0_15px_rgba(215,224,234,0.2)]'
                                        : isCompleted
                                            ? 'bg-[#2e3033] text-muted hover:bg-[#3e4044]'
                                            : isLocked
                                                ? 'bg-[#1a1a1a] text-muted border border-[#2e3033] cursor-not-allowed'
                                                : 'bg-[#2e3033] text-white hover:bg-primary hover:text-black border border-transparent hover:border-primary/50'
                                        }`}
                                    disabled={isLocked}
                                >
                                    {isCompleted ? (
                                        <>
                                            <span className="material-symbols-outlined text-sm">check_circle</span>
                                            Completed
                                        </>
                                    ) : isCurrent ? (
                                        <>
                                            Continue Learning
                                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </>
                                    ) : isLocked ? (
                                        'Locked'
                                    ) : (
                                        'Start Module'
                                    )}
                                </button>
                            </div>
                        </Link>
                    );
                })}
            </section>
        </main>
    );
}
