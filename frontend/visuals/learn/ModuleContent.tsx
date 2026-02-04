"use client";

import type { LearningModule, Reference } from "@/lib/content-types";
import TopicRenderer from "./TopicRenderer";

interface ModuleContentProps {
    module: LearningModule;
    subjectSlug: string;
}

/**
 * ModuleContent - Renders full learning module content
 * 
 * Structure:
 * 1. Module Context (level, time)
 * 2. Overview
 * 3. Topics (topic-first rendering)
 * 4. Check Understanding (quiz)
 * 5. References
 */
export default function ModuleContent({ module, subjectSlug }: ModuleContentProps) {
    const { meta, overview, topics, quiz, references } = module;

    return (
        <div className="space-y-12">
            {/* Module Context */}
            <ModuleContext meta={meta} subjectSlug={subjectSlug} />

            {/* Overview */}
            <section>
                <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">info</span>
                    Overview
                </h2>
                <div className="space-y-4 bg-surface/30 border border-border rounded-lg p-6">
                    {overview.map((paragraph, idx) => (
                        <p key={idx} className="text-muted leading-relaxed">
                            {paragraph}
                        </p>
                    ))}
                </div>
            </section>

            {/* Topic Navigation */}
            {topics.length > 1 && (
                <TopicNav topics={topics} />
            )}

            {/* Topics */}
            <section>
                {topics.length === 0 ? (
                    <PlaceholderNotice />
                ) : (
                    topics.map((topic, idx) => (
                        <TopicRenderer
                            key={idx}
                            topic={topic}
                            topicIndex={idx}
                            totalTopics={topics.length}
                        />
                    ))
                )}
            </section>

            {/* Check Understanding */}
            {quiz.length > 0 && (
                <QuizSection questions={quiz} />
            )}

            {/* References */}
            {references.length > 0 && (
                <ReferencesSection references={references} />
            )}
        </div>
    );
}

/**
 * ModuleContext - Displays module-level metadata
 */
function ModuleContext({
    meta,
    subjectSlug
}: {
    meta: LearningModule["meta"];
    subjectSlug: string;
}) {
    const levelColors = {
        beginner: "bg-green-500/10 text-green-400 border-green-500/20",
        intermediate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        advanced: "bg-red-500/10 text-red-400 border-red-500/20",
    };

    return (
        <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-muted">
                <span className="capitalize">{subjectSlug.replace(/-/g, " ")}</span>
                {" → "}
                <span className="text-foreground capitalize">{meta.module.replace(/-/g, " ")}</span>
            </span>
            <span className="text-muted/30">|</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${levelColors[meta.level]}`}>
                {meta.level}
            </span>
            {meta.estimatedHours > 0 && (
                <>
                    <span className="text-muted/30">|</span>
                    <span className="text-muted flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        {meta.estimatedHours} {meta.estimatedHours === 1 ? "hour" : "hours"}
                    </span>
                </>
            )}
        </div>
    );
}

/**
 * TopicNav - Quick navigation for topics
 */
function TopicNav({ topics }: { topics: LearningModule["topics"] }) {
    return (
        <nav className="bg-surface/30 border border-border rounded-lg p-4">
            <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">
                In this module
            </h3>
            <ol className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {topics.map((topic, idx) => (
                    <li key={idx}>
                        <a
                            href={`#topic-${idx + 1}`}
                            className="flex items-center gap-3 text-sm text-muted hover:text-foreground transition-colors group"
                        >
                            <span className="w-6 h-6 rounded bg-surface border border-border flex items-center justify-center text-xs font-mono group-hover:border-primary/50 transition-colors">
                                {idx + 1}
                            </span>
                            <span className="truncate">{topic.title}</span>
                        </a>
                    </li>
                ))}
            </ol>
        </nav>
    );
}

/**
 * PlaceholderNotice - Shown when module has no topics
 */
function PlaceholderNotice() {
    return (
        <div className="text-center py-16 bg-surface/30 border border-border rounded-lg">
            <span className="material-symbols-outlined text-4xl text-muted/30 mb-4 block">
                construction
            </span>
            <p className="text-muted mb-2">This module is under development.</p>
            <p className="text-sm text-muted/60">Content will be added soon.</p>
        </div>
    );
}

/**
 * QuizSection - Check Understanding section
 */
function QuizSection({ questions }: { questions: string[] }) {
    return (
        <section className="border-t border-border pt-12">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">quiz</span>
                Check Your Understanding
            </h2>
            <p className="text-sm text-muted mb-6">
                Reflect on these questions to reinforce your learning:
            </p>
            <ol className="space-y-4">
                {questions.map((question, idx) => (
                    <li
                        key={idx}
                        className="bg-surface/30 border border-border rounded-lg p-4 flex gap-4"
                    >
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-mono text-primary">
                            {idx + 1}
                        </span>
                        <p className="text-muted leading-relaxed pt-1">
                            {question}
                        </p>
                    </li>
                ))}
            </ol>
        </section>
    );
}

/**
 * ReferencesSection - External resources
 */
function ReferencesSection({ references }: { references: Reference[] }) {
    return (
        <section className="border-t border-border pt-12">
            <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">link</span>
                References & Further Reading
            </h2>
            <ul className="space-y-2">
                {references.map((ref, idx) => (
                    <li key={idx}>
                        {ref.url ? (
                            <a
                                href={ref.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-muted hover:text-primary transition-colors flex items-center gap-2 group"
                            >
                                <span className="material-symbols-outlined text-sm text-muted/50 group-hover:text-primary/70">
                                    open_in_new
                                </span>
                                {ref.label}
                            </a>
                        ) : (
                            <span className="text-sm text-muted/60 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-muted/30">
                                    description
                                </span>
                                {ref.label}
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        </section>
    );
}
