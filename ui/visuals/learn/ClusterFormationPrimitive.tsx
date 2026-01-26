"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ClusterFormationConfig } from "@/lib/visual-types";

interface Props {
    config: ClusterFormationConfig;
}

// Cluster colors palette (max 10)
const CLUSTER_COLORS = [
    "rgb(59, 130, 246)",   // Blue
    "rgb(249, 115, 22)",   // Orange
    "rgb(34, 197, 94)",    // Green
    "rgb(168, 85, 247)",   // Purple
    "rgb(236, 72, 153)",   // Pink
    "rgb(234, 179, 8)",    // Yellow
    "rgb(20, 184, 166)",   // Teal
    "rgb(239, 68, 68)",    // Red
    "rgb(99, 102, 241)",   // Indigo
    "rgb(245, 158, 11)"    // Amber
];

/**
 * ClusterFormationPrimitive - Phase 5 Visual Primitive
 * 
 * Shows k-Means clustering with:
 * - Animated centroid drift
 * - Point color transitions on reassignment
 * - Voronoi region visualization
 * - Inertia metric display
 * 
 * Per Spec: K slider drives clustering. Centroids drift smoothly.
 */
export default function ClusterFormationPrimitive({ config }: Props) {
    const { slider, data, showVoronoi, showInertia, caption } = config;

    // Primary control: K
    const [k, setK] = useState(slider.initial);

    // Reduced motion preference
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReducedMotion(mediaQuery.matches);
        const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
    }, []);

    // Run k-Means algorithm
    const { centroids, assignments, inertia } = useMemo(() => {
        return runKMeans(data.points, k, 50);
    }, [data.points, k]);

    // Cluster sizes
    const clusterSizes = useMemo(() => {
        const sizes = new Array(k).fill(0);
        assignments.forEach(a => sizes[a]++);
        return sizes;
    }, [assignments, k]);

    // Animation transition
    const springTransition = reducedMotion
        ? { duration: 0 }
        : { type: "spring" as const, stiffness: 150, damping: 20 };

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6">
            {/* Visualization Area */}
            <div className="relative aspect-square max-h-72 border border-border/50 rounded bg-surface/30 overflow-hidden">
                {/* Voronoi regions (simplified as colored sectors) */}
                {showVoronoi && (
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {/* Draw Voronoi regions using a grid approach */}
                        {Array.from({ length: 20 }).map((_, i) =>
                            Array.from({ length: 20 }).map((_, j) => {
                                const cx = (j + 0.5) / 20;
                                const cy = (i + 0.5) / 20;

                                // Find nearest centroid
                                let nearestIdx = 0;
                                let minDist = Infinity;
                                centroids.forEach((c, idx) => {
                                    const d = Math.sqrt((c.x - cx) ** 2 + (c.y - cy) ** 2);
                                    if (d < minDist) {
                                        minDist = d;
                                        nearestIdx = idx;
                                    }
                                });

                                return (
                                    <rect
                                        key={`${i}-${j}`}
                                        x={(j / 20) * 100}
                                        y={(i / 20) * 100}
                                        width={5.5}
                                        height={5.5}
                                        fill={CLUSTER_COLORS[nearestIdx % CLUSTER_COLORS.length]}
                                        opacity={0.15}
                                    />
                                );
                            })
                        )}
                    </svg>
                )}

                {/* Data Points */}
                {data.points.map((point, idx) => (
                    <motion.div
                        key={idx}
                        className="absolute w-2.5 h-2.5 rounded-full border border-white/30"
                        style={{
                            left: `${point.x * 100}%`,
                            top: `${point.y * 100}%`,
                        }}
                        initial={false}
                        animate={{
                            backgroundColor: CLUSTER_COLORS[assignments[idx] % CLUSTER_COLORS.length],
                            x: "-50%",
                            y: "-50%"
                        }}
                        transition={springTransition}
                    />
                ))}

                {/* Centroids */}
                <AnimatePresence mode="popLayout">
                    {centroids.map((centroid, idx) => (
                        <motion.div
                            key={`centroid-${idx}`}
                            className="absolute w-5 h-5 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                            style={{
                                backgroundColor: CLUSTER_COLORS[idx % CLUSTER_COLORS.length],
                            }}
                            initial={reducedMotion ? {} : { scale: 0, opacity: 0 }}
                            animate={{
                                left: `${centroid.x * 100}%`,
                                top: `${centroid.y * 100}%`,
                                x: "-50%",
                                y: "-50%",
                                scale: 1,
                                opacity: 1
                            }}
                            exit={reducedMotion ? {} : { scale: 0, opacity: 0 }}
                            transition={springTransition}
                        >
                            <span className="text-[8px] font-bold text-white">{idx + 1}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Axis labels */}
                <div className="absolute bottom-1 left-1 text-xs text-muted/50 font-mono">X</div>
                <div className="absolute top-1 left-1 text-xs text-muted/50 font-mono">Y</div>
            </div>

            {/* Cluster Legend */}
            <div className="flex flex-wrap gap-3 justify-center text-xs">
                {clusterSizes.map((size, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                        <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: CLUSTER_COLORS[idx % CLUSTER_COLORS.length] }}
                        />
                        <span className="text-muted">C{idx + 1}: {size}</span>
                    </div>
                ))}
            </div>

            {/* Inertia Display */}
            {showInertia && (
                <div className="flex items-center gap-3">
                    <span className="text-xs text-muted">Inertia:</span>
                    <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-primary"
                            initial={false}
                            animate={{ width: `${Math.min(inertia * 50, 100)}%` }}
                            transition={springTransition}
                        />
                    </div>
                    <span className="text-xs font-mono text-foreground">{inertia.toFixed(3)}</span>
                </div>
            )}

            {/* K Slider */}
            <div className="space-y-2">
                <label className="flex items-center justify-between text-sm">
                    <span className="text-muted">{slider.label}</span>
                    <span className="font-mono text-foreground">{k}</span>
                </label>
                <input
                    type="range"
                    min={slider.min}
                    max={slider.max}
                    step={slider.step}
                    value={k}
                    onChange={(e) => setK(Number(e.target.value))}
                    className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted/60">
                    <span>Under-clustered</span>
                    <span>Over-clustered</span>
                </div>
            </div>

            {/* Caption */}
            <p className="text-sm text-muted italic">{caption}</p>
        </div>
    );
}

// ============================================
// k-Means Algorithm
// ============================================

function runKMeans(
    points: Array<{ x: number; y: number }>,
    k: number,
    maxIter: number
): { centroids: Array<{ x: number; y: number }>; assignments: number[]; inertia: number } {
    if (points.length === 0 || k === 0) {
        return { centroids: [], assignments: [], inertia: 0 };
    }

    // Initialize centroids using k-means++ style
    const centroids: Array<{ x: number; y: number }> = [];
    const usedIndices = new Set<number>();

    // First centroid: random
    let firstIdx = Math.floor(Math.random() * points.length);
    // Use seeded selection based on k for determinism
    firstIdx = (k * 7) % points.length;
    centroids.push({ ...points[firstIdx] });
    usedIndices.add(firstIdx);

    // Subsequent centroids: pick points far from existing centroids
    while (centroids.length < k && centroids.length < points.length) {
        let maxDist = -1;
        let bestIdx = 0;

        points.forEach((p, idx) => {
            if (usedIndices.has(idx)) return;

            let minDistToCentroid = Infinity;
            centroids.forEach(c => {
                const d = Math.sqrt((p.x - c.x) ** 2 + (p.y - c.y) ** 2);
                minDistToCentroid = Math.min(minDistToCentroid, d);
            });

            if (minDistToCentroid > maxDist) {
                maxDist = minDistToCentroid;
                bestIdx = idx;
            }
        });

        centroids.push({ ...points[bestIdx] });
        usedIndices.add(bestIdx);
    }

    // Run k-means iterations
    let assignments = new Array(points.length).fill(0);

    for (let iter = 0; iter < maxIter; iter++) {
        // Assignment step: assign each point to nearest centroid
        const newAssignments = points.map(p => {
            let minDist = Infinity;
            let nearestIdx = 0;
            centroids.forEach((c, idx) => {
                const d = Math.sqrt((p.x - c.x) ** 2 + (p.y - c.y) ** 2);
                if (d < minDist) {
                    minDist = d;
                    nearestIdx = idx;
                }
            });
            return nearestIdx;
        });

        // Update step: move centroids to cluster means
        const sums = centroids.map(() => ({ x: 0, y: 0, count: 0 }));
        points.forEach((p, idx) => {
            const cluster = newAssignments[idx];
            sums[cluster].x += p.x;
            sums[cluster].y += p.y;
            sums[cluster].count++;
        });

        let converged = true;
        centroids.forEach((c, idx) => {
            if (sums[idx].count > 0) {
                const newX = sums[idx].x / sums[idx].count;
                const newY = sums[idx].y / sums[idx].count;
                if (Math.abs(c.x - newX) > 0.001 || Math.abs(c.y - newY) > 0.001) {
                    converged = false;
                }
                c.x = newX;
                c.y = newY;
            }
        });

        assignments = newAssignments;
        if (converged) break;
    }

    // Compute inertia (within-cluster sum of squares)
    let inertia = 0;
    points.forEach((p, idx) => {
        const c = centroids[assignments[idx]];
        if (c) {
            inertia += (p.x - c.x) ** 2 + (p.y - c.y) ** 2;
        }
    });

    return { centroids, assignments, inertia };
}
