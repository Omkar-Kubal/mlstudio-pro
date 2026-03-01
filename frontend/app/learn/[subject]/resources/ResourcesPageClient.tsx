"use client";

import Link from "next/link";
import { subjects } from "@/adapters/subjects";

interface ResourcesPageClientProps {
    subjectSlug: string;
}

export default function ResourcesPageClient({ subjectSlug }: ResourcesPageClientProps) {
    const subject = subjects.find(s => s.slug === subjectSlug);

    return (
        <main className="min-h-screen bg-background pt-24 pb-20 px-6 sm:px-8 lg:px-12 max-w-4xl mx-auto w-full">
            {/* Navigation breadcrumb */}
            <div className="mb-8">
                <Link href={`/learn/${subjectSlug}`} className="text-sm text-muted hover:text-foreground transition-colors flex items-center gap-2 font-mono uppercase tracking-widest">
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Back to {subject?.title || subjectSlug}
                </Link>
            </div>

            <div className="flex flex-col gap-6 mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider w-fit">
                    Resources & Documentation
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white capitalize leading-tight">
                    {subject?.title || subjectSlug.replace(/-/g, " ")} Resources
                </h1>
                <p className="text-lg text-muted font-light leading-relaxed">
                    Supplemental materials, cheat sheets, and external references to deepen your understanding of {subject?.title || subjectSlug}.
                </p>
            </div>

            <div className="grid gap-6">
                <div className="glass-panel p-8 rounded-xl border border-white/5 bg-white/[0.02] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full -mr-10 -mt-10" />
                    <div className="flex items-start gap-6 relative z-10">
                        <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-primary">menu_book</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Subject Documentation</h3>
                            <p className="text-muted text-sm leading-relaxed mb-4">
                                Comprehensive guides and technical documentation covering the core concepts of this subject.
                            </p>
                            <button className="text-primary text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all uppercase tracking-widest">
                                View Docs <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-8 rounded-xl border border-white/5 bg-white/[0.02] relative overflow-hidden group">
                    <div className="flex items-start gap-6 relative z-10">
                        <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-primary">description</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Cheat Sheets</h3>
                            <p className="text-muted text-sm leading-relaxed mb-4">
                                Quick reference guides and summaries of key formulas, terminology, and patterns.
                            </p>
                            <button className="text-primary text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all uppercase tracking-widest">
                                Download PDF <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-8 rounded-xl border border-white/5 bg-white/[0.02] relative overflow-hidden group opacity-50 grayscale cursor-not-allowed">
                    <div className="flex items-start gap-6 relative z-10">
                        <div className="size-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-muted">lock</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-muted mb-2">Practice Problems</h3>
                            <p className="text-muted/60 text-sm leading-relaxed mb-4">
                                Curated set of exercises to test your knowledge. Unlocks after completing all modules.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-16 p-8 rounded-2xl border border-dashed border-white/10 text-center">
                <span className="material-symbols-outlined text-4xl text-muted/20 mb-4 font-light">info</span>
                <p className="text-muted text-sm max-w-md mx-auto leading-relaxed">
                    We are constantly updating our resource library. Check back soon for more interactive materials and datasets.
                </p>
            </div>
        </main>
    );
}
