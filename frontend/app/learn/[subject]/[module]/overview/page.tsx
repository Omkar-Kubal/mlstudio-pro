"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { LearningModule } from "@/lib/content-types";
import ModuleContent from "@/components/learn/ModuleContent";

interface ContentResponse {
    _raw?: LearningModule;
    title: string;
}

export default function ModuleOverviewPage() {
    const params = useParams();
    const subjectSlug = params.subject as string;
    const moduleSlug = params.module as string;

    const [learningModule, setLearningModule] = useState<LearningModule | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/api/content?subject=${subjectSlug}&module=${moduleSlug}`)
            .then((res) => {
                if (!res.ok) throw new Error("Content not found");
                return res.json();
            })
            .then((data: ContentResponse) => {
                if (data._raw) {
                    setLearningModule(data._raw);
                } else {
                    throw new Error("Structured content not available");
                }
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [subjectSlug, moduleSlug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-muted">Loading content...</p>
                </div>
            </div>
        );
    }

    if (error || !learningModule) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error || "Content not available"}</p>
                    <Link
                        href={`/learn/${subjectSlug}/${moduleSlug}`}
                        className="text-primary hover:underline"
                    >
                        ← Back to module
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-surface/30">
                <div className="max-w-4xl mx-auto px-6 py-6">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm mb-4">
                        <Link
                            href="/learn"
                            className="text-muted hover:text-foreground transition-colors"
                        >
                            Learn
                        </Link>
                        <span className="text-muted/50">/</span>
                        <Link
                            href={`/learn/${subjectSlug}`}
                            className="text-muted hover:text-foreground transition-colors capitalize"
                        >
                            {subjectSlug.replace(/-/g, " ")}
                        </Link>
                        <span className="text-muted/50">/</span>
                        <span className="text-foreground capitalize">
                            {moduleSlug.replace(/-/g, " ")}
                        </span>
                    </nav>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground capitalize tracking-tight">
                        {learningModule.meta.module.replace(/-/g, " ")}
                    </h1>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                <ModuleContent module={learningModule} subjectSlug={subjectSlug} />
            </div>

            {/* Footer */}
            <footer className="border-t border-border py-8 text-center">
                <div className="max-w-4xl mx-auto px-6">
                    <Link
                        href={`/learn/${subjectSlug}`}
                        className="text-sm text-muted hover:text-primary transition-colors inline-flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to {subjectSlug.replace(/-/g, " ")} modules
                    </Link>
                </div>
            </footer>
        </main>
    );
}
