"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

export default function TopicPage() {
    const params = useParams();
    const subjectSlug = params.subject as string;
    const moduleSlug = params.module as string;
    const topicSlug = params.topic as string;

    return (
        <main className="min-h-screen bg-background">
            {/* Breadcrumb */}
            <div className="border-b border-border py-4 px-6">
                <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm">
                    <Link href="/learn" className="text-muted hover:text-foreground transition-colors">
                        Learn
                    </Link>
                    <span className="text-muted">/</span>
                    <Link href={`/learn/${subjectSlug}`} className="text-muted hover:text-foreground transition-colors capitalize">
                        {subjectSlug.replace(/-/g, ' ')}
                    </Link>
                    <span className="text-muted">/</span>
                    <Link href={`/learn/${subjectSlug}/${moduleSlug}`} className="text-muted hover:text-foreground transition-colors capitalize">
                        {moduleSlug.replace(/-/g, ' ')}
                    </Link>
                    <span className="text-muted">/</span>
                    <span className="text-foreground capitalize">{topicSlug.replace(/-/g, ' ')}</span>
                </div>
            </div>

            {/* Three-Panel Layout (Placeholder) */}
            <div className="h-[calc(100vh-73px)] flex flex-col">
                {/* Top Section: Theory + Visual */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 border-b border-border">
                    {/* Theory Panel */}
                    <div className="border-r border-border p-8 overflow-y-auto">
                        <h2 className="text-2xl font-medium text-foreground mb-4 capitalize">
                            {topicSlug.replace(/-/g, ' ')}
                        </h2>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-muted">
                                Theory content will appear here.
                            </p>
                            <p className="text-muted mt-4">
                                This panel will contain structured paragraphs explaining the concept,
                                mathematical intuition, and references to the visual on the right.
                            </p>
                        </div>
                    </div>

                    {/* Visual Panel */}
                    <div className="p-8 bg-neutral-950 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-muted">Interactive visualization will appear here</p>
                            <p className="text-sm text-muted/60 mt-2">
                                (Sliders, graphs, and live parameter controls)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Code + Playground */}
                <div className="h-1/3 border-t border-border p-6 bg-neutral-900">
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-muted">Code editor and playground will appear here</p>
                            <p className="text-sm text-muted/60 mt-2">
                                (Live Python code with Run/Reset buttons)
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
