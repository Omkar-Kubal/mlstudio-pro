"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import type { MetricDashboardConfig } from "@/adapters/visual-types";

interface Props {
    config: MetricDashboardConfig;
}

/**
 * MetricDashboardPrimitive - Phase 4 Visual Primitive
 * 
 * Multi-panel coordinated display for classification evaluation:
 * - Score Distribution with threshold line
 * - Confusion Matrix with animated counts
 * - Metric Gauges showing precision/recall tradeoff
 * - ROC/PR Curve with draggable point (bidirectional binding)
 * 
 * Per Spec: Threshold slider drives all panels simultaneously.
 */
export default function MetricDashboardPrimitive({ config }: Props) {
    const { slider, data, metrics, secondaryToggle, caption } = config;

    // Primary control: threshold
    const [threshold, setThreshold] = useState(slider.initial);

    // Secondary control: curve view (ROC vs PR)
    const [showPRCurve, setShowPRCurve] = useState(secondaryToggle?.initial === 1);

    // Reduced motion preference
    const [reducedMotion, setReducedMotion] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
    }, []);

    // Compute confusion matrix values
    const confusionMatrix = useMemo(() => {
        let tp = 0, fp = 0, fn = 0, tn = 0;
        data.predictions.forEach(p => {
            const predicted = p.probability >= threshold ? 1 : 0;
            if (predicted === 1 && p.actualLabel === 1) tp++;
            else if (predicted === 1 && p.actualLabel === 0) fp++;
            else if (predicted === 0 && p.actualLabel === 1) fn++;
            else tn++;
        });
        return { tp, fp, fn, tn };
    }, [data.predictions, threshold]);

    // Compute metrics
    const computedMetrics = useMemo(() => {
        const { tp, fp, fn, tn } = confusionMatrix;
        const total = tp + fp + fn + tn;

        const accuracy = total > 0 ? (tp + tn) / total : 0;
        const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
        const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
        const f1 = (precision + recall) > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
        const specificity = (tn + fp) > 0 ? tn / (tn + fp) : 0;

        // AUC is static (doesn't change with threshold) - compute once
        const auc = computeAUC(data.predictions);

        return { accuracy, precision, recall, f1, specificity, auc };
    }, [confusionMatrix, data.predictions]);

    // Compute ROC curve points
    const rocPoints = useMemo(() => {
        return computeROCPoints(data.predictions);
    }, [data.predictions]);

    // Compute PR curve points
    const prPoints = useMemo(() => {
        return computePRPoints(data.predictions);
    }, [data.predictions]);

    // Find current point on curve based on threshold
    const currentCurvePoint = useMemo(() => {
        const { tp, fp, fn, tn } = confusionMatrix;
        if (showPRCurve) {
            const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
            const precision = (tp + fp) > 0 ? tp / (tp + fp) : 1;
            return { x: recall, y: precision };
        } else {
            const tpr = (tp + fn) > 0 ? tp / (tp + fn) : 0;
            const fpr = (tn + fp) > 0 ? fp / (tn + fp) : 0;
            return { x: fpr, y: tpr };
        }
    }, [confusionMatrix, showPRCurve]);

    // Class balance
    const classBalance = useMemo(() => {
        const positives = data.predictions.filter(p => p.actualLabel === 1).length;
        const total = data.predictions.length;
        return positives / total;
    }, [data.predictions]);

    // Score distribution bins
    const scoreDistribution = useMemo(() => {
        return computeScoreDistribution(data.predictions, 25);
    }, [data.predictions]);

    // Animation transition
    const springTransition = reducedMotion
        ? { duration: 0 }
        : { type: "spring" as const, stiffness: 200, damping: 25 };

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6">
            {/* Top Row: Score Distribution + Confusion Matrix */}
            <div className="grid grid-cols-2 gap-4">
                {/* Panel A: Score Distribution */}
                <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted uppercase tracking-wide">Score Distribution</h4>
                    <div className="relative h-32 bg-surface/30 border border-border/50 rounded">
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            {/* Negative class histogram (blue) */}
                            {scoreDistribution.negative.map((count, i) => {
                                const x = (i / 25) * 100;
                                const w = 4;
                                const h = (count / scoreDistribution.maxCount) * 80;
                                return (
                                    <rect
                                        key={`neg-${i}`}
                                        x={x}
                                        y={100 - h}
                                        width={w}
                                        height={h}
                                        fill="rgba(59, 130, 246, 0.5)"
                                    />
                                );
                            })}
                            {/* Positive class histogram (orange) */}
                            {scoreDistribution.positive.map((count, i) => {
                                const x = (i / 25) * 100;
                                const w = 4;
                                const h = (count / scoreDistribution.maxCount) * 80;
                                return (
                                    <rect
                                        key={`pos-${i}`}
                                        x={x}
                                        y={100 - h}
                                        width={w}
                                        height={h}
                                        fill="rgba(249, 115, 22, 0.5)"
                                    />
                                );
                            })}
                            {/* Threshold line */}
                            <motion.line
                                x1={threshold * 100}
                                y1="0"
                                x2={threshold * 100}
                                y2="100"
                                stroke="white"
                                strokeWidth="2"
                                strokeDasharray="4,2"
                                initial={false}
                                animate={{ x1: threshold * 100, x2: threshold * 100 }}
                                transition={springTransition}
                            />
                        </svg>
                        <div className="absolute bottom-1 left-1 text-xs text-muted/50 font-mono">0</div>
                        <div className="absolute bottom-1 right-1 text-xs text-muted/50 font-mono">1</div>
                    </div>
                </div>

                {/* Panel B: Confusion Matrix */}
                <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted uppercase tracking-wide">Confusion Matrix</h4>
                    <div className="grid grid-cols-2 gap-1 h-32">
                        {/* TP */}
                        <motion.div
                            className="bg-green-500/30 border border-green-500/50 rounded flex flex-col items-center justify-center"
                            animate={{ backgroundColor: `rgba(34, 197, 94, ${0.2 + (confusionMatrix.tp / data.predictions.length) * 0.5})` }}
                            transition={springTransition}
                        >
                            <span className="text-xs text-green-400">TP</span>
                            <motion.span
                                className="text-lg font-bold text-green-300"
                                key={confusionMatrix.tp}
                                initial={reducedMotion ? {} : { scale: 1.2 }}
                                animate={{ scale: 1 }}
                            >
                                {confusionMatrix.tp}
                            </motion.span>
                        </motion.div>
                        {/* FP */}
                        <motion.div
                            className="bg-red-500/30 border border-red-500/50 rounded flex flex-col items-center justify-center"
                            animate={{ backgroundColor: `rgba(239, 68, 68, ${0.2 + (confusionMatrix.fp / data.predictions.length) * 0.5})` }}
                            transition={springTransition}
                        >
                            <span className="text-xs text-red-400">FP</span>
                            <motion.span
                                className="text-lg font-bold text-red-300"
                                key={confusionMatrix.fp}
                                initial={reducedMotion ? {} : { scale: 1.2 }}
                                animate={{ scale: 1 }}
                            >
                                {confusionMatrix.fp}
                            </motion.span>
                        </motion.div>
                        {/* FN */}
                        <motion.div
                            className="bg-yellow-500/30 border border-yellow-500/50 rounded flex flex-col items-center justify-center"
                            animate={{ backgroundColor: `rgba(234, 179, 8, ${0.2 + (confusionMatrix.fn / data.predictions.length) * 0.5})` }}
                            transition={springTransition}
                        >
                            <span className="text-xs text-yellow-400">FN</span>
                            <motion.span
                                className="text-lg font-bold text-yellow-300"
                                key={confusionMatrix.fn}
                                initial={reducedMotion ? {} : { scale: 1.2 }}
                                animate={{ scale: 1 }}
                            >
                                {confusionMatrix.fn}
                            </motion.span>
                        </motion.div>
                        {/* TN */}
                        <motion.div
                            className="bg-blue-500/30 border border-blue-500/50 rounded flex flex-col items-center justify-center"
                            animate={{ backgroundColor: `rgba(59, 130, 246, ${0.2 + (confusionMatrix.tn / data.predictions.length) * 0.5})` }}
                            transition={springTransition}
                        >
                            <span className="text-xs text-blue-400">TN</span>
                            <motion.span
                                className="text-lg font-bold text-blue-300"
                                key={confusionMatrix.tn}
                                initial={reducedMotion ? {} : { scale: 1.2 }}
                                animate={{ scale: 1 }}
                            >
                                {confusionMatrix.tn}
                            </motion.span>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Middle Row: Metric Gauges */}
            <div className="grid grid-cols-4 gap-3">
                {metrics.slice(0, 4).map(metric => (
                    <MetricGauge
                        key={metric}
                        name={metric}
                        value={computedMetrics[metric]}
                        isTradeoff={metric === 'precision' || metric === 'recall'}
                        reducedMotion={reducedMotion}
                    />
                ))}
            </div>

            {/* Bottom Row: ROC/PR Curve */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-medium text-muted uppercase tracking-wide">
                        {showPRCurve ? "Precision-Recall Curve" : "ROC Curve"}
                    </h4>
                    {secondaryToggle && (
                        <div className="flex gap-2">
                            {secondaryToggle.options.map((option, idx) => (
                                <button
                                    key={option}
                                    onClick={() => setShowPRCurve(idx === 1)}
                                    className={`px-2 py-0.5 text-xs rounded transition-colors ${(showPRCurve ? 1 : 0) === idx
                                        ? "bg-primary text-white"
                                        : "bg-surface text-muted hover:text-foreground"
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="relative h-32 bg-surface/30 border border-border/50 rounded">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {/* Reference line */}
                        {!showPRCurve && (
                            <line x1="0" y1="100" x2="100" y2="0" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4,4" />
                        )}
                        {/* Curve */}
                        <path
                            d={generateCurvePath(showPRCurve ? prPoints : rocPoints)}
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="2"
                        />
                        {/* Current operating point */}
                        <motion.circle
                            r="4"
                            fill="white"
                            stroke="hsl(var(--primary))"
                            strokeWidth="2"
                            initial={false}
                            animate={{
                                cx: currentCurvePoint.x * 100,
                                cy: (1 - currentCurvePoint.y) * 100
                            }}
                            transition={springTransition}
                        />
                    </svg>
                    <div className="absolute bottom-1 left-1 text-xs text-muted/50 font-mono">
                        {showPRCurve ? "Recall" : "FPR"}
                    </div>
                    <div className="absolute top-1 left-1 text-xs text-muted/50 font-mono">
                        {showPRCurve ? "Precision" : "TPR"}
                    </div>
                    <div className="absolute bottom-1 right-1 text-xs text-muted/50 font-mono">
                        AUC: {computedMetrics.auc.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Class Balance Indicator */}
            <div className="flex items-center gap-3 text-xs">
                <span className="text-muted">Class Balance:</span>
                <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden flex">
                    <div className="bg-orange-500" style={{ width: `${classBalance * 100}%` }} />
                    <div className="bg-blue-500" style={{ width: `${(1 - classBalance) * 100}%` }} />
                </div>
                <span className="text-muted font-mono">{(classBalance * 100).toFixed(0)}% / {((1 - classBalance) * 100).toFixed(0)}%</span>
            </div>

            {/* Threshold Slider */}
            <div className="space-y-2">
                <label className="flex items-center justify-between text-sm">
                    <span className="text-muted">{slider.label}</span>
                    <span className="font-mono text-foreground">{threshold.toFixed(2)}</span>
                </label>
                <input
                    type="range"
                    min={slider.min}
                    max={slider.max}
                    step={slider.step}
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
                />
            </div>

            {/* Caption */}
            <p className="text-sm text-muted italic">{caption}</p>
        </div>
    );
}

// ============================================
// Metric Gauge Component
// ============================================

function MetricGauge({ name, value, isTradeoff, reducedMotion }: {
    name: string;
    value: number;
    isTradeoff: boolean;
    reducedMotion: boolean;
}) {
    const displayName = name.charAt(0).toUpperCase() + name.slice(1);
    const color = isTradeoff
        ? (name === 'precision' ? 'bg-blue-500' : 'bg-orange-500')
        : 'bg-primary';

    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span className="text-muted">{displayName}</span>
                <span className="font-mono text-foreground">{(value * 100).toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-surface rounded-full overflow-hidden">
                <motion.div
                    className={`h-full ${color}`}
                    initial={false}
                    animate={{ width: `${value * 100}%` }}
                    transition={reducedMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 200, damping: 25 }}
                />
            </div>
        </div>
    );
}

// ============================================
// Computation Utilities
// ============================================

function computeScoreDistribution(predictions: Array<{ probability: number; actualLabel: 0 | 1 }>, bins: number) {
    const positive = new Array(bins).fill(0);
    const negative = new Array(bins).fill(0);

    predictions.forEach(p => {
        const bin = Math.min(Math.floor(p.probability * bins), bins - 1);
        if (p.actualLabel === 1) {
            positive[bin]++;
        } else {
            negative[bin]++;
        }
    });

    const maxCount = Math.max(...positive, ...negative, 1);
    return { positive, negative, maxCount };
}

function computeROCPoints(predictions: Array<{ probability: number; actualLabel: 0 | 1 }>) {
    const sorted = [...predictions].sort((a, b) => b.probability - a.probability);
    const totalPos = predictions.filter(p => p.actualLabel === 1).length;
    const totalNeg = predictions.filter(p => p.actualLabel === 0).length;

    const points: Array<{ x: number; y: number }> = [{ x: 0, y: 0 }];
    let tp = 0, fp = 0;

    sorted.forEach(p => {
        if (p.actualLabel === 1) tp++;
        else fp++;
        points.push({
            x: totalNeg > 0 ? fp / totalNeg : 0,
            y: totalPos > 0 ? tp / totalPos : 0
        });
    });

    return points;
}

function computePRPoints(predictions: Array<{ probability: number; actualLabel: 0 | 1 }>) {
    const sorted = [...predictions].sort((a, b) => b.probability - a.probability);
    const totalPos = predictions.filter(p => p.actualLabel === 1).length;

    const points: Array<{ x: number; y: number }> = [];
    let tp = 0, fp = 0;

    sorted.forEach(p => {
        if (p.actualLabel === 1) tp++;
        else fp++;
        const recall = totalPos > 0 ? tp / totalPos : 0;
        const precision = (tp + fp) > 0 ? tp / (tp + fp) : 1;
        points.push({ x: recall, y: precision });
    });

    return points;
}

function computeAUC(predictions: Array<{ probability: number; actualLabel: 0 | 1 }>) {
    const rocPoints = computeROCPoints(predictions);
    let auc = 0;
    for (let i = 1; i < rocPoints.length; i++) {
        const dx = rocPoints[i].x - rocPoints[i - 1].x;
        const avgY = (rocPoints[i].y + rocPoints[i - 1].y) / 2;
        auc += dx * avgY;
    }
    return Math.max(0, Math.min(1, auc));
}

function generateCurvePath(points: Array<{ x: number; y: number }>) {
    if (points.length === 0) return "";
    let path = `M ${points[0].x * 100} ${(1 - points[0].y) * 100}`;
    for (let i = 1; i < points.length; i++) {
        path += ` L ${points[i].x * 100} ${(1 - points[i].y) * 100}`;
    }
    return path;
}

