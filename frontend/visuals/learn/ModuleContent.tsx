"use client";

import { useState } from "react";
import type { LearningModule, Reference, QuizQuestion } from "@/adapters/content-types";
import { progressTracker } from "@/adapters/progress";
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
                <QuizSection questions={quiz} moduleSlug={meta.module} />
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
 * QuizSection - Interactive Check Understanding section
 */
function QuizSection({
    questions,
    moduleSlug
}: {
    questions: Array<string | QuizQuestion>,
    moduleSlug: string
}) {
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [showResults, setShowResults] = useState<Record<number, boolean>>({});

    const handleOptionSelect = (qIdx: number, oIdx: number) => {
        setAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
        setShowResults(prev => ({ ...prev, [qIdx]: true }));
    };

    const handleComplete = () => {
        progressTracker.completeModule(moduleSlug);
        alert("Module marked as complete! Your progress has been saved.");
    };

    return (
        <section className="border-t border-border pt-12 pb-20">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">quiz</span>
                Check Your Understanding
            </h2>

            <div className="space-y-8">
                {questions.map((q, qIdx) => {
                    if (typeof q === 'string') {
                        return (
                            <div key={qIdx} className="bg-surface/30 border border-border rounded-lg p-6 flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-mono text-primary">
                                    {qIdx + 1}
                                </span>
                                <p className="text-muted leading-relaxed pt-1">{q}</p>
                            </div>
                        );
                    }

                    const isCorrect = answers[qIdx] === q.correctAnswer;
                    const hasSelected = showResults[qIdx];

                    return (
                        <div key={q.id || qIdx} className="bg-surface/30 border border-border rounded-xl overflow-hidden">
                            <div className="p-6">
                                <div className="flex gap-4 mb-6">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-mono text-muted">
                                        Q{qIdx + 1}
                                    </span>
                                    <h4 className="text-foreground font-medium text-lg leading-snug pt-1">
                                        {q.question}
                                    </h4>
                                </div>

                                <div className="grid gap-3 ml-12">
                                    {q.options.map((option, oIdx) => {
                                        const isSelected = answers[qIdx] === oIdx;
                                        const isThisCorrect = oIdx === q.correctAnswer;

                                        let style = "border-border bg-surface/50 hover:bg-surface hover:border-primary/30";
                                        if (hasSelected) {
                                            if (isThisCorrect) style = "border-green-500/50 bg-green-500/10 text-green-400";
                                            else if (isSelected) style = "border-red-500/50 bg-red-500/10 text-red-400 opacity-80";
                                            else style = "border-border bg-surface/20 opacity-40";
                                        }

                                        return (
                                            <button
                                                key={oIdx}
                                                disabled={hasSelected}
                                                onClick={() => handleOptionSelect(qIdx, oIdx)}
                                                className={`w-full text-left p-4 rounded-lg border transition-all flex items-center justify-between group ${style}`}
                                            >
                                                <span>{option}</span>
                                                {hasSelected && isThisCorrect && (
                                                    <span className="material-symbols-outlined text-lg">check_circle</span>
                                                )}
                                                {hasSelected && isSelected && !isThisCorrect && (
                                                    <span className="material-symbols-outlined text-lg">cancel</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {hasSelected && (
                                <div className={`px-6 py-4 border-t ${isCorrect ? 'bg-green-500/5 border-green-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
                                    <p className="text-sm font-bold mb-1 flex items-center gap-2">
                                        {isCorrect ? (
                                            <>
                                                <span className="text-green-400">Correct Answer</span>
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-red-400">Incorrect Answer</span>
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                            </>
                                        )}
                                    </p>
                                    <p className="text-sm text-muted leading-relaxed">
                                        {q.explanation}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Completion Trigger */}
            <div className="mt-12 flex justify-center">
                <button
                    onClick={handleComplete}
                    className="group relative px-8 py-3 bg-primary text-black font-black uppercase tracking-widest rounded-lg transition-transform active:scale-95 hover:shadow-[0_0_30px_rgba(215,224,234,0.3)] shadow-silver-glow"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        Mark Module as Complete
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">verified</span>
                    </span>
                    <div className="absolute inset-0 bg-white/20 rounded-lg group-hover:scale-105 transition-transform duration-500 -z-10 blur-xl opacity-0 group-hover:opacity-100" />
                </button>
            </div>
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

