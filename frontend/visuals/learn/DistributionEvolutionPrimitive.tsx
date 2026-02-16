"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DistributionEvolutionConfig } from "@/lib/visual-types";

interface Props {
    config: DistributionEvolutionConfig;
}

/**
 * DistributionEvolutionPrimitive - Phase 1 Visual Primitive
 * 
 * Shows how distribution shape changes with parameters:
 * - Sample size convergence
 * - Outlier effects
 * - Scaling transformations
 * - Skew visualization
 * 
 * Per spec: Slider-driven, morphing (not redrawing), with mean/median/spread overlays.
 */
export default function DistributionEvolutionPrimitive({ config }: Props) {
    const { slider, mode, distribution, showMean, showMedian, showSpread, secondaryToggle, caption } = config;

    // Primary control: slider value
    const [paramValue, setParamValue] = useState(slider.initial);

    // Secondary control: toggle state
    const [toggleState, setToggleState] = useState<0 | 1>(secondaryToggle?.initial ?? 0);

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

    // Generate samples based on current parameter
    const samples = useMemo(() => {
        return generateSamples(distribution, paramValue, mode);
    }, [distribution, paramValue, mode]);

    // Compute statistics
    const stats = useMemo(() => {
        const sorted = [...samples].sort((a, b) => a - b);
        const sum = sorted.reduce((acc, v) => acc + v, 0);
        const mean = sum / sorted.length;
        const mid = Math.floor(sorted.length / 2);
        const median = sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
        const variance = sorted.reduce((acc, v) => acc + (v - mean) ** 2, 0) / sorted.length;
        const std = Math.sqrt(variance);
        return { mean, median, std, min: sorted[0], max: sorted[sorted.length - 1] };
    }, [samples]);

    // Compute histogram bins
    const bins = useMemo(() => {
        return computeBins(samples, 30);
    }, [samples]);

    // Axis bounds (fixed to avoid jitter)
    const axisMin = distribution.mean - 4 * distribution.std;
    const axisMax = distribution.mean + 4 * distribution.std;
    const toPercent = (val: number) => ((val - axisMin) / (axisMax - axisMin)) * 100;

    const showDensity = toggleState === 1;

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6">
            {/* Visualization Area */}
            <div className="relative h-48">
                {/* Y-axis grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-px bg-border/30" />
                    ))}
                </div>

                {/* X-axis */}
                <div className="absolute left-0 right-0 bottom-0 h-px bg-border" />

                {/* Histogram or Density */}
                <AnimatePresence mode="wait">
                    {!showDensity ? (
                        <motion.div
                            key="histogram"
                            initial={reducedMotion ? {} : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={reducedMotion ? {} : { opacity: 0 }}
                            className="absolute inset-0 flex items-end"
                        >
                            {bins.map((bin, idx) => {
                                const left = toPercent(bin.x0);
                                const width = toPercent(bin.x1) - left;
                                const height = (bin.count / Math.max(...bins.map(b => b.count))) * 100;
                                return (
                                    <motion.div
                                        key={idx}
                                        className="absolute bottom-0 bg-primary/60 border-t border-l border-r border-primary/80"
                                        initial={reducedMotion ? {} : { height: 0 }}
                                        animate={{
                                            height: `${Math.max(height, 0)}%`,
                                            left: `${left}%`,
                                            width: `${Math.max(width - 0.5, 0.5)}%`
                                        }}
                                        transition={reducedMotion ? { duration: 0 } : {
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 30
                                        }}
                                        style={{
                                            left: `${left}%`,
                                            width: `${Math.max(width - 0.5, 0.5)}%`
                                        }}
                                    />
                                );
                            })}
                        </motion.div>
                    ) : (
                        <motion.svg
                            key="density"
                            initial={reducedMotion ? {} : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={reducedMotion ? {} : { opacity: 0 }}
                            className="absolute inset-0 w-full h-full"
                            preserveAspectRatio="none"
                        >
                            <defs>
                                <linearGradient id="densityGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.6" />
                                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.1" />
                                </linearGradient>
                            </defs>
                            <motion.path
                                d={generateDensityPath(bins, axisMin, axisMax)}
                                fill="url(#densityGradient)"
                                stroke="var(--color-primary)"
                                strokeWidth="2"
                                initial={reducedMotion ? {} : { pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={reducedMotion ? { duration: 0 } : { duration: 0.5 }}
                            />
                        </motion.svg>
                    )}
                </AnimatePresence>

                {/* Mean indicator */}
                {showMean && (
                    <motion.div
                        className="absolute bottom-0 w-0.5 bg-red-500"
                        style={{ height: "90%" }}
                        animate={{
                            left: `${toPercent(stats.mean)}%`,
                            transform: "translateX(-50%)"
                        }}
                        transition={reducedMotion ? { duration: 0 } : {
                            type: "spring",
                            stiffness: 200,
                            damping: 25
                        }}
                    >
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-medium text-red-500 whitespace-nowrap">
                            Mean: {stats.mean.toFixed(1)}
                        </div>
                    </motion.div>
                )}

                {/* Median indicator */}
                {showMedian && (
                    <motion.div
                        className="absolute bottom-0 w-0.5 bg-green-500"
                        style={{ height: "85%" }}
                        animate={{
                            left: `${toPercent(stats.median)}%`,
                            transform: "translateX(-50%)"
                        }}
                        transition={reducedMotion ? { duration: 0 } : {
                            type: "spring",
                            stiffness: 200,
                            damping: 25
                        }}
                    >
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-medium text-green-500 whitespace-nowrap">
                            Median: {stats.median.toFixed(1)}
                        </div>
                    </motion.div>
                )}

                {/* Spread indicator (1 std dev) */}
                {showSpread && (
                    <motion.div
                        className="absolute bottom-2 h-1 bg-blue-500/50 rounded-full"
                        animate={{
                            left: `${toPercent(stats.mean - stats.std)}%`,
                            width: `${toPercent(stats.mean + stats.std) - toPercent(stats.mean - stats.std)}%`
                        }}
                        transition={reducedMotion ? { duration: 0 } : {
                            type: "spring",
                            stiffness: 200,
                            damping: 25
                        }}
                    >
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs text-blue-400 whitespace-nowrap">
                            σ = {stats.std.toFixed(1)}
                        </div>
                    </motion.div>
                )}

                {/* Axis labels */}
                <div className="absolute left-0 -bottom-6 text-xs text-muted font-mono">{axisMin.toFixed(0)}</div>
                <div className="absolute right-0 -bottom-6 text-xs text-muted font-mono">{axisMax.toFixed(0)}</div>
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-6 text-xs text-muted font-mono">{distribution.mean.toFixed(0)}</div>
            </div>

            {/* Controls */}
            <div className="space-y-4 pt-4">
                {/* Primary slider */}
                <div className="space-y-2">
                    <label className="flex items-center justify-between text-sm">
                        <span className="text-muted">{slider.label}</span>
                        <span className="font-mono text-foreground">{Math.round(paramValue)}</span>
                    </label>
                    <input
                        type="range"
                        min={slider.min}
                        max={slider.max}
                        step={slider.step}
                        value={paramValue}
                        onChange={(e) => setParamValue(Number(e.target.value))}
                        className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                </div>

                {/* Secondary toggle */}
                {secondaryToggle && (
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted">{secondaryToggle.label}:</span>
                        <div className="flex gap-2">
                            {secondaryToggle.options.map((option, idx) => (
                                <button
                                    key={option}
                                    onClick={() => setToggleState(idx as 0 | 1)}
                                    className={`px-3 py-1 text-sm rounded transition-colors ${toggleState === idx
                                        ? "bg-primary text-white"
                                        : "bg-surface text-muted hover:text-foreground"
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Caption */}
            <p className="text-sm text-muted italic">{caption}</p>
        </div>
    );
}

// ============================================
// Helper Functions
// ============================================

/**
 * Seeded random number generator for reproducibility
 */
function seededRandom(seed: number): () => number {
    return () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
}

/**
 * Box-Muller transform to generate normal samples
 */
function normalSample(mean: number, std: number, random: () => number): number {
    const u1 = random();
    const u2 = random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * std + mean;
}

/**
 * Generate samples based on distribution config and current parameter
 */
function generateSamples(
    distribution: { type: string; mean: number; std: number; skew?: number },
    sampleSize: number,
    mode: string
): number[] {
    const random = seededRandom(42); // Fixed seed for reproducibility
    const samples: number[] = [];

    for (let i = 0; i < sampleSize; i++) {
        if (distribution.type === "normal") {
            samples.push(normalSample(distribution.mean, distribution.std, random));
        } else if (distribution.type === "uniform") {
            const range = distribution.std * Math.sqrt(12);
            samples.push(distribution.mean - range / 2 + random() * range);
        } else {
            // Default to normal
            samples.push(normalSample(distribution.mean, distribution.std, random));
        }
    }

    return samples;
}

/**
 * Compute histogram bins using Rice rule for bin count
 */
function computeBins(samples: number[], maxBins: number = 30): Array<{ x0: number; x1: number; count: number }> {
    if (samples.length === 0) return [];

    const sorted = [...samples].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    // Rice rule for bin count, capped
    const binCount = Math.min(maxBins, Math.ceil(2 * Math.pow(samples.length, 1 / 3)));
    const binWidth = (max - min) / binCount || 1;

    const bins: Array<{ x0: number; x1: number; count: number }> = [];

    for (let i = 0; i < binCount; i++) {
        const x0 = min + i * binWidth;
        const x1 = min + (i + 1) * binWidth;
        const count = samples.filter(s => s >= x0 && (i === binCount - 1 ? s <= x1 : s < x1)).length;
        bins.push({ x0, x1, count });
    }

    return bins;
}

/**
 * Generate SVG path for density curve (smoothed histogram)
 */
function generateDensityPath(
    bins: Array<{ x0: number; x1: number; count: number }>,
    axisMin: number,
    axisMax: number
): string {
    if (bins.length === 0) return "";

    const maxCount = Math.max(...bins.map(b => b.count));
    const toX = (val: number) => ((val - axisMin) / (axisMax - axisMin)) * 100;
    const toY = (count: number) => 100 - (count / maxCount) * 90;

    // Create smooth curve through bin centers
    const points = bins.map(bin => ({
        x: toX((bin.x0 + bin.x1) / 2),
        y: toY(bin.count)
    }));

    if (points.length === 0) return "";

    // Start at bottom left
    let path = `M ${toX(axisMin)} 100`;
    path += ` L ${points[0].x} ${points[0].y}`;

    // Smooth curve through points using quadratic beziers
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpx = (prev.x + curr.x) / 2;
        path += ` Q ${prev.x} ${prev.y} ${cpx} ${(prev.y + curr.y) / 2}`;
    }

    // Final point
    const last = points[points.length - 1];
    path += ` L ${last.x} ${last.y}`;
    path += ` L ${toX(axisMax)} 100`;
    path += " Z";

    return path;
}
