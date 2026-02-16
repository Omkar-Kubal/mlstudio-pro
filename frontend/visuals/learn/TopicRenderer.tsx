"use client";

import type { Topic as LearningTopic, CodeSnippet } from "@/lib/content-types";
import type { FitProgressionConfig, ParameterSensitivityConfig, DistributionEvolutionConfig, BoundaryMorphingConfig, MetricDashboardConfig, ClusterFormationConfig, NetworkForwardPassConfig, GradientBackflowConfig } from "@/lib/visual-types";
import { getVisualConfig } from "@/lib/visual-configs";
import CodeEditor from "./CodeEditor";
import ParameterSensitivityPrimitive from "./ParameterSensitivityPrimitive";
import FitProgressionPrimitive from "./FitProgressionPrimitive";
import DistributionEvolutionPrimitive from "./DistributionEvolutionPrimitive";
import BoundaryMorphingPrimitive from "./BoundaryMorphingPrimitive";
import MetricDashboardPrimitive from "./MetricDashboardPrimitive";
import ClusterFormationPrimitive from "./ClusterFormationPrimitive";
import NetworkForwardPassPrimitive from "./NetworkForwardPassPrimitive";
import GradientBackflowPrimitive from "./GradientBackflowPrimitive";
import { PrimitiveWrapper, isPrimitiveRegistered } from "./PrimitiveWrapper";

interface TopicRendererProps {
    topic: LearningTopic;
    topicIndex: number;
    totalTopics: number;
}

/**
 * TopicRenderer - Renders a single learning topic as a first-class unit
 * 
 * Structure (consistent order):
 * 1. Topic Header (numbered, titled)
 * 2. Theory Section
 * 3. Visual Intuition (conceptual)
 * 4. Code Examples (with descriptions)
 */

/**
 * FormulaRenderer - Simple component to render math expressions
 * Supports simple LaTeX surrounded by $$ (e.g. $$\mu = \sigma^2$$)
 */
function FormulaRenderer({ text }: { text: string }) {
    // Regex to find content between $$...$$
    const parts = text.split(/(\$\$.*?\$\$)/g);

    return (
        <span className="leading-relaxed">
            {parts.map((part, idx) => {
                if (part.startsWith("$$") && part.endsWith("$$")) {
                    const formula = part.slice(2, -2);
                    return (
                        <span
                            key={idx}
                            className="inline-flex items-center mx-1 px-2 py-0.5 bg-primary/5 border border-primary/10 rounded font-mono text-primary text-[1.1em] italic"
                            title="Mathematical Formula"
                        >
                            {/* Simple replacement mapping for common symbols */}
                            {formula
                                .replace(/\\mu/g, 'μ')
                                .replace(/\\sigma/g, 'σ')
                                .replace(/\\alpha/g, 'α')
                                .replace(/\\beta/g, 'β')
                                .replace(/\\sum/g, 'Σ')
                                .replace(/\\bar\{x\}/g, 'x̄')
                                .replace(/\\hat\{y\}/g, 'ŷ')
                                .replace(/\\infty/g, '∞')
                                .replace(/\\Delta/g, 'Δ')
                                .replace(/\\theta/g, 'θ')
                                .replace(/\\approx/g, '≈')
                                .replace(/\\sqrt/g, '√')
                                .replace(/\^2/g, '²')
                                .replace(/\^3/g, '³')
                                .replace(/\_i/g, 'ᵢ')
                                .replace(/\_j/g, 'ⱼ')
                                .replace(/\_n/g, 'ₙ')
                                .replace(/\\frac\{(.*?)\}\{(.*?)\}/g, '($1 / $2)')
                            }
                        </span>
                    );
                }
                return <span key={idx}>{part}</span>;
            })}
        </span>
    );
}
export default function TopicRenderer({ topic, topicIndex, totalTopics }: TopicRendererProps) {
    // Check if this topic has a visual config
    const visualConfig = getVisualConfig(topic.title);

    return (
        <article
            className="mb-16 pb-12 border-b border-border last:border-b-0 last:mb-0 last:pb-0"
            id={`topic-${topicIndex + 1}`}
        >
            {/* Topic Header */}
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-mono text-muted tracking-wide uppercase">
                        Topic {topicIndex + 1} of {totalTopics}
                    </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                    {topic.title}
                </h2>
            </header>

            {/* Theory Section */}
            <section className="mb-10">
                <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">school</span>
                    Concept
                </h3>
                <div className="space-y-4">
                    {topic.theory.map((paragraph, idx) => (
                        <p
                            key={idx}
                            className="text-muted leading-relaxed text-base border-l-2 border-transparent hover:border-primary/30 pl-4 -ml-4 transition-colors"
                        >
                            <FormulaRenderer text={paragraph} />
                        </p>
                    ))}
                </div>
            </section>

            {/* Visual Intuition */}
            {topic.visualIntuition.length > 0 && (
                <section className="mb-10">
                    <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">visibility</span>
                        Visual Intuition
                    </h3>

                    {/* Config-driven animation OR placeholder */}
                    {visualConfig ? (
                        <VisualIntuitionWithAnimation
                            topic={topic}
                            config={visualConfig}
                        />
                    ) : (
                        <VisualIntuitionPlaceholder topic={topic} />
                    )}
                </section>
            )}

            {/* Code Examples */}
            {topic.code.length > 0 && (
                <section>
                    <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">code</span>
                        Code Examples
                    </h3>
                    <div className="space-y-6">
                        {topic.code.map((snippet, idx) => (
                            <CodeBlock
                                key={idx}
                                snippet={snippet}
                                index={idx}
                                total={topic.code.length}
                            />
                        ))}
                    </div>
                </section>
            )}
        </article>
    );
}

/**
 * CodeBlock - Renders a code snippet with its description
 */
function CodeBlock({
    snippet,
    index,
    total
}: {
    snippet: CodeSnippet;
    index: number;
    total: number;
}) {
    return (
        <div className="space-y-2">
            {/* Code Description */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-foreground font-medium">
                    {snippet.description}
                </p>
                {total > 1 && (
                    <span className="text-xs text-muted font-mono">
                        {index + 1}/{total}
                    </span>
                )}
            </div>

            {/* Code Editor */}
            <CodeEditor
                code={snippet.content}
                language={snippet.language}
                editable={true}
            />
        </div>
    );
}

/**
 * VisualIntuitionWithAnimation - Renders animation with fallback
 * Selects correct primitive based on config type
 */
function VisualIntuitionWithAnimation({
    topic,
    config
}: {
    topic: LearningTopic;
    config: NonNullable<ReturnType<typeof getVisualConfig>>;
}) {
    // Determine which primitive to render based on config type
    const primitiveType = "primitiveType" in config ? config.primitiveType : "parameter-sensitivity";

    // Validate primitive is registered
    if (!isPrimitiveRegistered(primitiveType)) {
        return <VisualIntuitionPlaceholder topic={topic} />;
    }

    return (
        <PrimitiveWrapper primitiveName={primitiveType} caption={config.caption}>
            <div className="space-y-4">
                {/* Animation - select primitive based on config type */}
                {primitiveType === "fit-progression" ? (
                    <FitProgressionPrimitive config={config as FitProgressionConfig} />
                ) : primitiveType === "distribution-evolution" ? (
                    <DistributionEvolutionPrimitive config={config as DistributionEvolutionConfig} />
                ) : primitiveType === "boundary-morphing" ? (
                    <BoundaryMorphingPrimitive config={config as BoundaryMorphingConfig} />
                ) : primitiveType === "metric-dashboard" ? (
                    <MetricDashboardPrimitive config={config as MetricDashboardConfig} />
                ) : primitiveType === "cluster-formation" ? (
                    <ClusterFormationPrimitive config={config as ClusterFormationConfig} />
                ) : primitiveType === "network-forward-pass" ? (
                    <NetworkForwardPassPrimitive config={config as NetworkForwardPassConfig} />
                ) : primitiveType === "gradient-backflow" ? (
                    <GradientBackflowPrimitive config={config as GradientBackflowConfig} />
                ) : (
                    <ParameterSensitivityPrimitive config={config as ParameterSensitivityConfig} />
                )}

                {/* Caption */}
                <p className="text-xs text-muted text-center italic">
                    {config.caption}
                </p>
            </div>
        </PrimitiveWrapper>
    );
}

/**
 * VisualIntuitionPlaceholder - Static placeholder for Visual Intuition
 */
function VisualIntuitionPlaceholder({ topic }: { topic: LearningTopic }) {
    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6">
            <div className="space-y-3">
                {topic.visualIntuition.map((intuition, idx) => (
                    <p
                        key={idx}
                        className="text-muted leading-relaxed text-sm italic"
                    >
                        {intuition}
                    </p>
                ))}
            </div>
            {topic.visualSuggestions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                    <span className="text-xs text-muted/60 block mb-2">
                        Visualization ideas for this concept:
                    </span>
                    <ul className="text-xs text-muted/80 space-y-1">
                        {topic.visualSuggestions.map((suggestion, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                                <span className="text-primary/60">•</span>
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
