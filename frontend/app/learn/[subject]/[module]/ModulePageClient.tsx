"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Topic } from "@/adapters/learning";
import { ParsedContent } from "@/adapters/content-types";
import { topics as allTopics } from "@/adapters/topics";
import { loadModuleBySlug, toParsedContent } from "@/adapters/content-json";

interface ModulePageClientProps {
    subjectSlug: string;
    moduleSlug: string;
}

export default function ModulePageClient({ subjectSlug, moduleSlug }: ModulePageClientProps) {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [content, setContent] = useState<ParsedContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasContent, setHasContent] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Get topics for this module directly from adapter
                const filteredTopics = allTopics.filter(t =>
                    t.moduleSlug === moduleSlug && t.subjectSlug === subjectSlug
                );
                setTopics(filteredTopics);

                // Load content directly from adapter
                const learningModule = await loadModuleBySlug(subjectSlug, moduleSlug);
                if (learningModule) {
                    setHasContent(true);
                    const parsed = toParsedContent(learningModule);
                    setContent(parsed);
                }
            } catch (err) {
                console.error("Failed to load module content:", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [subjectSlug, moduleSlug]);

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
        <main className="min-h-screen bg-background py-20 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Breadcrumb */}
                <div className="mb-8 flex items-center gap-2 text-sm">
                    <Link href="/learn" className="text-muted hover:text-foreground transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Learn
                    </Link>
                    <span className="text-muted">/</span>
                    <Link href={`/learn/${subjectSlug}`} className="text-muted hover:text-foreground transition-colors capitalize">
                        {subjectSlug.replace(/-/g, ' ')}
                    </Link>
                    <span className="text-muted">/</span>
                    <span className="text-foreground capitalize">{moduleSlug.replace(/-/g, ' ')}</span>
                </div>

                {/* Header */}
                <div className="mb-12 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 capitalize tracking-tight">
                        {moduleSlug.replace(/-/g, ' ')}
                    </h1>
                    <p className="text-lg text-muted">
                        {content ? content.title : 'Explore topics in this module'}
                    </p>
                </div>

                {/* Content Preview (if available) */}
                {hasContent && content && (
                    <div className="mb-10">
                        <Link href={`/learn/${subjectSlug}/${moduleSlug}/overview`}>
                            <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full -mr-10 -mt-10" />
                                <div className="flex items-center justify-between relative z-10">
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-xs font-bold text-black bg-primary px-2 py-1 rounded">
                                                Start Here
                                            </span>
                                            <span className="size-2 bg-primary rounded-full animate-pulse" />
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                            {content.title}
                                        </h3>
                                        <p className="text-sm text-muted">
                                            {content.codeSnippets.length} code examples · {content.sections.length} sections
                                        </p>
                                    </div>
                                    <span className="material-symbols-outlined text-2xl text-primary group-hover:translate-x-1 transition-transform">
                                        arrow_forward
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                )}

                {/* Topics List */}
                {topics.length > 0 && (
                    <>
                        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">menu_book</span>
                            Topics
                        </h2>
                        <div className="space-y-3">
                            {topics.map((topic, _index) => (
                                <Link
                                    key={topic.id}
                                    href={`/learn/${subjectSlug}/${moduleSlug}/${topic.slug}`}
                                    className="glass-panel rounded-lg p-5 flex items-center justify-between group transition-all-custom hover:shadow-silver-glow-hover"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center text-sm text-muted font-mono">
                                            {String(topic.order).padStart(2, '0')}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                                                {topic.title}
                                            </h3>
                                            <p className="text-sm text-muted mt-1">{topic.description}</p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-muted group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0">
                                        arrow_forward
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </>
                )}

                {topics.length === 0 && !hasContent && (
                    <div className="text-center py-12 glass-panel rounded-xl">
                        <span className="material-symbols-outlined text-4xl text-muted/30 mb-4">folder_open</span>
                        <p className="text-muted mb-4">No content available for this module yet.</p>
                        <Link href={`/learn/${subjectSlug}`} className="text-primary hover:underline text-sm inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Back to modules
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
