"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import type { BoundaryMorphingConfig } from "@/lib/visual-types";

interface Props {
    config: BoundaryMorphingConfig;
}

/**
 * BoundaryMorphingPrimitive - Phase 3 Visual Primitive
 * 
 * Shows how decision boundaries bend, split, merge, fragment as model flexibility changes.
 * 
 * Per Spec:
 * - Primary control: Flexibility slider (K for KNN, inverted)
 * - Secondary toggle: Hard boundary vs Probability gradient
 * - Boundary morphs continuously (no redraws)
 * - Region fills with class colors
 * - Reduced motion support
 */
export default function BoundaryMorphingPrimitive({ config }: Props) {
    const { slider, data, showProbabilityGradient, secondaryToggle, caption } = config;

    // Primary control: flexibility (K value for KNN)
    const [flexibility, setFlexibility] = useState(slider.initial);

    // Secondary control: probability gradient toggle
    const [showGradient, setShowGradient] = useState(secondaryToggle?.initial === 1);

    // Reduced motion preference
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReducedMotion(mediaQuery.matches);
        const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
    }, []);

    // Grid resolution for boundary computation (max 50x50 per spec)
    const gridSize = 40;

    // Compute decision boundary grid
    const boundaryGrid = useMemo(() => {
        const k = slider.inverted ? slider.max - flexibility + slider.min : flexibility;
        return computeKNNGrid(data.points, k, gridSize);
    }, [data.points, flexibility, slider.inverted, slider.max, slider.min, gridSize]);

    // Animation transition
    const springTransition = reducedMotion
        ? { duration: 0 }
        : { type: "spring" as const, stiffness: 150, damping: 20 };

    // Compute class counts for legend
    const classCounts = useMemo(() => {
        const class0 = data.points.filter(p => p.classLabel === 0).length;
        const class1 = data.points.filter(p => p.classLabel === 1).length;
        return { class0, class1 };
    }, [data.points]);

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6">
            {/* Visualization Area */}
            <div className="relative aspect-square max-h-64 border border-border/50 rounded bg-surface/30 overflow-hidden">
                {/* Decision Regions */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <pattern id="pattern-class0" patternUnits="userSpaceOnUse" width="4" height="4">
                            <circle cx="2" cy="2" r="0.5" fill="rgba(59, 130, 246, 0.3)" />
                        </pattern>
                        <pattern id="pattern-class1" patternUnits="userSpaceOnUse" width="4" height="4">
                            <line x1="0" y1="0" x2="4" y2="4" stroke="rgba(249, 115, 22, 0.3)" strokeWidth="0.5" />
                        </pattern>
                    </defs>

                    {/* Render grid cells with class predictions */}
                    {boundaryGrid.map((row, i) =>
                        row.map((cell, j) => {
                            const x = (j / gridSize) * 100;
                            const y = (i / gridSize) * 100;
                            const w = 100 / gridSize;
                            const h = 100 / gridSize;

                            if (showGradient) {
                                // Probability gradient mode
                                const blueOpacity = (1 - cell.probability) * 0.6;
                                const orangeOpacity = cell.probability * 0.6;
                                return (
                                    <motion.rect
                                        key={`${i}-${j}`}
                                        x={x}
                                        y={y}
                                        width={w + 0.5}
                                        height={h + 0.5}
                                        initial={false}
                                        animate={{
                                            fill: cell.probability > 0.5
                                                ? `rgba(249, 115, 22, ${orangeOpacity})`
                                                : `rgba(59, 130, 246, ${blueOpacity})`
                                        }}
                                        transition={springTransition}
                                    />
                                );
                            } else {
                                // Hard boundary mode
                                return (
                                    <motion.rect
                                        key={`${i}-${j}`}
                                        x={x}
                                        y={y}
                                        width={w + 0.5}
                                        height={h + 0.5}
                                        initial={false}
                                        animate={{
                                            fill: cell.prediction === 1
                                                ? "rgba(249, 115, 22, 0.25)"
                                                : "rgba(59, 130, 246, 0.25)"
                                        }}
                                        transition={springTransition}
                                    />
                                );
                            }
                        })
                    )}

                    {/* Decision boundary contour (where probability ≈ 0.5) */}
                    <path
                        d={computeBoundaryPath(boundaryGrid, gridSize)}
                        fill="none"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeOpacity="0.8"
                        className="pointer-events-none"
                    />
                </svg>

                {/* Data Points */}
                {data.points.map((point, idx) => (
                    <motion.div
                        key={idx}
                        className={`absolute w-3 h-3 rounded-full border-2 ${point.classLabel === 0
                                ? "bg-blue-500 border-blue-300"
                                : "bg-orange-500 border-orange-300"
                            }`}
                        style={{
                            left: `${point.x * 100}%`,
                            top: `${point.y * 100}%`,
                            transform: "translate(-50%, -50%)"
                        }}
                        initial={false}
                        whileHover={{ scale: 1.3 }}
                    />
                ))}

                {/* Axis labels */}
                <div className="absolute bottom-1 left-1 text-xs text-muted/50 font-mono">Feature 1</div>
                <div className="absolute top-1 left-1 text-xs text-muted/50 font-mono rotate-0">Feature 2</div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-muted">Class A ({classCounts.class0})</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-muted">Class B ({classCounts.class1})</span>
                </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
                {/* Flexibility Slider (Primary) */}
                <div className="space-y-2">
                    <label className="flex items-center justify-between text-sm">
                        <span className="text-muted">{slider.label}</span>
                        <span className="font-mono text-foreground">{flexibility}</span>
                    </label>
                    <input
                        type="range"
                        min={slider.min}
                        max={slider.max}
                        step={slider.step}
                        value={flexibility}
                        onChange={(e) => setFlexibility(Number(e.target.value))}
                        className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted/60">
                        <span>{slider.inverted ? "Fragmented" : "Smooth"}</span>
                        <span>{slider.inverted ? "Smooth" : "Fragmented"}</span>
                    </div>
                </div>

                {/* Boundary Style Toggle (Secondary) */}
                {secondaryToggle && (
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted">{secondaryToggle.label}:</span>
                        <div className="flex gap-2">
                            {secondaryToggle.options.map((option, idx) => (
                                <button
                                    key={option}
                                    onClick={() => setShowGradient(idx === 1)}
                                    className={`px-3 py-1 text-sm rounded transition-colors ${(showGradient ? 1 : 0) === idx
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
// KNN Computation Utilities
// ============================================

interface GridCell {
    prediction: 0 | 1;
    probability: number;
}

/**
 * Compute KNN predictions for a grid
 */
function computeKNNGrid(
    points: Array<{ x: number; y: number; classLabel: 0 | 1 }>,
    k: number,
    gridSize: number
): GridCell[][] {
    const grid: GridCell[][] = [];

    for (let i = 0; i < gridSize; i++) {
        const row: GridCell[] = [];
        for (let j = 0; j < gridSize; j++) {
            const qx = (j + 0.5) / gridSize;
            const qy = (i + 0.5) / gridSize;

            // Compute distances to all points
            const distances = points.map((p, idx) => ({
                idx,
                dist: Math.sqrt((p.x - qx) ** 2 + (p.y - qy) ** 2),
                classLabel: p.classLabel
            }));

            // Sort by distance and take k nearest
            distances.sort((a, b) => a.dist - b.dist);
            const kNearest = distances.slice(0, Math.min(k, points.length));

            // Count votes
            const class1Votes = kNearest.filter(d => d.classLabel === 1).length;
            const probability = class1Votes / kNearest.length;
            const prediction = probability >= 0.5 ? 1 : 0;

            row.push({ prediction, probability });
        }
        grid.push(row);
    }

    return grid;
}

/**
 * Compute SVG path for decision boundary (where probability ≈ 0.5)
 */
function computeBoundaryPath(grid: GridCell[][], gridSize: number): string {
    // Simple marching squares to find boundary contour
    const paths: string[] = [];
    const cellW = 100 / gridSize;
    const cellH = 100 / gridSize;

    for (let i = 0; i < gridSize - 1; i++) {
        for (let j = 0; j < gridSize - 1; j++) {
            const tl = grid[i][j].prediction;
            const tr = grid[i][j + 1].prediction;
            const bl = grid[i + 1][j].prediction;
            const br = grid[i + 1][j + 1].prediction;

            // Check if this cell has a boundary crossing
            const sum = tl + tr + bl + br;
            if (sum > 0 && sum < 4) {
                // There's a boundary in this cell
                const cx = (j + 0.5) * cellW;
                const cy = (i + 0.5) * cellH;

                // Simple: draw a small segment at boundary cells
                if (tl !== tr) {
                    const x = (j + 0.5) * cellW;
                    const y = i * cellH;
                    paths.push(`M ${x} ${y} L ${x} ${y + cellH}`);
                }
                if (tl !== bl) {
                    const x = j * cellW;
                    const y = (i + 0.5) * cellH;
                    paths.push(`M ${x} ${y} L ${x + cellW} ${y}`);
                }
            }
        }
    }

    return paths.join(" ");
}
