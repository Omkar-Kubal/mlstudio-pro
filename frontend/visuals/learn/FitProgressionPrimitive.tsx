"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FitProgressionConfig } from "@/lib/visual-types";

interface Props {
    config: FitProgressionConfig;
}

/**
 * FitProgressionPrimitive - Visualizes Underfitting → Good Fit → Overfitting
 * 
 * Per Spec:
 * - Primary control: Complexity slider (continuous morph)
 * - Secondary control: "Show Test Data" toggle (reveal moment)
 * - Model curve morphs (no redraws)
 * - Train/Test error bars show generalization gap
 * - Reduced motion support
 */
export default function FitProgressionPrimitive({ config }: Props) {
    const { slider, data, caption } = config;

    // Primary control: complexity
    const [complexity, setComplexity] = useState(slider.initial);

    // Secondary control: show test data (reveal moment)
    const [showTestData, setShowTestData] = useState(false);

    // Reduced motion preference
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReducedMotion(mediaQuery.matches);
        const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
    }, []);

    // Compute polynomial coefficients using least squares
    const coefficients = useMemo(() => {
        return fitPolynomial(data.trainPoints, complexity);
    }, [data.trainPoints, complexity]);

    // Compute errors
    const { trainError, testError } = useMemo(() => {
        const trainErr = computeError(data.trainPoints, coefficients);
        const testErr = computeError(data.testPoints, coefficients);
        return { trainError: trainErr, testError: testErr };
    }, [data.trainPoints, data.testPoints, coefficients]);

    // Generate curve points for rendering (min 200 for smoothness per spec)
    const curvePoints = useMemo(() => {
        const points: { x: number; y: number }[] = [];
        for (let i = 0; i <= 200; i++) {
            const x = i / 200;
            const y = evaluatePolynomial(x, coefficients);
            points.push({ x, y });
        }
        return points;
    }, [coefficients]);

    // Animation variants
    const springTransition = reducedMotion
        ? { duration: 0 }
        : { type: "spring" as const, stiffness: 200, damping: 25 };

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6">
            {/* Scatter Plot with Curve */}
            <div className="relative h-48 border border-border/50 rounded bg-surface/30">
                {/* Y-axis */}
                <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between py-2 text-xs text-muted font-mono">
                    <span>1</span>
                    <span>0</span>
                </div>

                {/* Plot area */}
                <div className="absolute left-8 right-0 top-0 bottom-0">
                    {/* Grid lines */}
                    <div className="absolute left-0 right-0 top-1/2 h-px bg-border/30" />
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/30" />

                    {/* Polynomial curve - using motion.path for morphing */}
                    <svg className="absolute inset-0 w-full h-full overflow-visible">
                        <defs>
                            <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
                            </linearGradient>
                        </defs>
                        {/* Fill under curve */}
                        <motion.path
                            d={generateFilledCurvePath(curvePoints)}
                            fill="url(#curveFill)"
                            initial={false}
                            animate={{ d: generateFilledCurvePath(curvePoints) }}
                            transition={springTransition}
                        />
                        {/* Curve stroke */}
                        <motion.path
                            d={generateCurvePath(curvePoints)}
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="2.5"
                            initial={false}
                            animate={{ d: generateCurvePath(curvePoints) }}
                            transition={springTransition}
                        />
                    </svg>

                    {/* Training points (always visible) */}
                    {data.trainPoints.map((point, idx) => (
                        <motion.div
                            key={`train-${idx}`}
                            className="absolute w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-blue-400"
                            style={{
                                left: `${point.x * 100}%`,
                                bottom: `${point.y * 100}%`,
                            }}
                            initial={false}
                            animate={{
                                x: "-50%",
                                y: "50%"
                            }}
                        />
                    ))}

                    {/* Test points (hidden by default, revealed via toggle) */}
                    <AnimatePresence>
                        {showTestData && data.testPoints.map((point, idx) => (
                            <motion.div
                                key={`test-${idx}`}
                                className="absolute w-2 h-2 rounded-full border-2 border-orange-400 bg-transparent"
                                style={{
                                    left: `${point.x * 100}%`,
                                    bottom: `${point.y * 100}%`,
                                }}
                                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1, x: "-50%", y: "50%" }}
                                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
                                transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
                            />
                        ))}
                    </AnimatePresence>
                </div>

                {/* X-axis labels */}
                <div className="absolute left-8 right-0 bottom-0 h-4 flex justify-between px-1 text-xs text-muted font-mono">
                    <span>0</span>
                    <span>1</span>
                </div>
            </div>

            {/* Error Bars */}
            <div className="grid grid-cols-2 gap-6">
                {/* Training Error */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            Train Error
                        </span>
                        <span className="font-mono text-foreground">
                            {trainError.toFixed(3)}
                        </span>
                    </div>
                    <div className="h-2 bg-surface rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-blue-500"
                            initial={false}
                            animate={{ width: `${Math.min(trainError * 200, 100)}%` }}
                            transition={springTransition}
                        />
                    </div>
                </div>

                {/* Test Error (always visible, emphasized when test data shown) */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className={`text-muted flex items-center gap-1 transition-opacity ${showTestData ? 'opacity-100' : 'opacity-50'}`}>
                            <span className="w-2 h-2 rounded-full border-2 border-orange-400 bg-transparent" />
                            Test Error
                        </span>
                        <span className={`font-mono transition-opacity ${showTestData ? 'text-foreground' : 'text-muted'}`}>
                            {testError.toFixed(3)}
                        </span>
                    </div>
                    <div className="h-2 bg-surface rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full transition-colors ${showTestData ? 'bg-orange-500' : 'bg-orange-500/30'}`}
                            initial={false}
                            animate={{ width: `${Math.min(testError * 200, 100)}%` }}
                            transition={springTransition}
                        />
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
                {/* Complexity Slider (Primary) */}
                <div className="space-y-2">
                    <label className="flex items-center justify-between text-sm">
                        <span className="text-muted">{slider.label}</span>
                        <span className="font-mono text-foreground">{complexity}</span>
                    </label>
                    <input
                        type="range"
                        min={slider.min}
                        max={slider.max}
                        step={slider.step}
                        value={complexity}
                        onChange={(e) => setComplexity(Number(e.target.value))}
                        className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                </div>

                {/* Show Test Data Toggle (Secondary - Reveal Moment) */}
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted">Show Test Data</span>
                    <button
                        onClick={() => setShowTestData(!showTestData)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${showTestData ? 'bg-orange-500' : 'bg-surface'
                            }`}
                    >
                        <motion.div
                            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                            initial={false}
                            animate={{ left: showTestData ? '1.5rem' : '0.25rem' }}
                            transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 30 }}
                        />
                    </button>
                </div>
            </div>

            {/* Caption */}
            <p className="text-sm text-muted italic">{caption}</p>
        </div>
    );
}

// ============================================
// Polynomial Fitting Utilities
// ============================================

/**
 * Fit polynomial using least squares
 */
function fitPolynomial(
    points: Array<{ x: number; y: number }>,
    degree: number
): number[] {
    const n = points.length;
    const d = Math.min(degree, n - 1);

    // Build Vandermonde matrix
    const X: number[][] = [];
    const Y: number[] = [];

    for (const p of points) {
        const row: number[] = [];
        for (let j = 0; j <= d; j++) {
            row.push(Math.pow(p.x, j));
        }
        X.push(row);
        Y.push(p.y);
    }

    // Solve X^T * X * coeffs = X^T * Y
    const XtX = matMul(transpose(X), X);
    const XtY = matVecMul(transpose(X), Y);
    const coeffs = solveLinearSystem(XtX, XtY);

    return coeffs;
}

/**
 * Evaluate polynomial at x
 */
function evaluatePolynomial(x: number, coeffs: number[]): number {
    let result = 0;
    for (let i = 0; i < coeffs.length; i++) {
        result += coeffs[i] * Math.pow(x, i);
    }
    // Clamp to reasonable range
    return Math.max(-0.5, Math.min(1.5, result));
}

/**
 * Compute RMSE error
 */
function computeError(
    points: Array<{ x: number; y: number }>,
    coeffs: number[]
): number {
    if (points.length === 0) return 0;

    let sumSq = 0;
    for (const p of points) {
        const predicted = evaluatePolynomial(p.x, coeffs);
        const diff = predicted - p.y;
        sumSq += diff * diff;
    }
    return Math.sqrt(sumSq / points.length);
}

/**
 * Generate SVG path for curve stroke
 */
function generateCurvePath(points: Array<{ x: number; y: number }>): string {
    if (points.length === 0) return "";

    const pathParts: string[] = [];
    for (let i = 0; i < points.length; i++) {
        const x = points[i].x * 100;
        const y = (1 - points[i].y) * 100;
        if (i === 0) {
            pathParts.push(`M ${x}% ${y}%`);
        } else {
            pathParts.push(`L ${x}% ${y}%`);
        }
    }
    return pathParts.join(" ");
}

/**
 * Generate SVG path for filled area under curve
 */
function generateFilledCurvePath(points: Array<{ x: number; y: number }>): string {
    if (points.length === 0) return "";

    let path = `M 0% 100%`;
    for (const p of points) {
        const x = p.x * 100;
        const y = (1 - p.y) * 100;
        path += ` L ${x}% ${y}%`;
    }
    path += ` L 100% 100% Z`;
    return path;
}

// ============================================
// Matrix Utilities
// ============================================

function transpose(A: number[][]): number[][] {
    if (A.length === 0) return [];
    const rows = A.length;
    const cols = A[0].length;
    const result: number[][] = [];
    for (let j = 0; j < cols; j++) {
        const row: number[] = [];
        for (let i = 0; i < rows; i++) {
            row.push(A[i][j]);
        }
        result.push(row);
    }
    return result;
}

function matMul(A: number[][], B: number[][]): number[][] {
    const rowsA = A.length;
    const colsA = A[0]?.length || 0;
    const colsB = B[0]?.length || 0;
    const result: number[][] = [];

    for (let i = 0; i < rowsA; i++) {
        const row: number[] = [];
        for (let j = 0; j < colsB; j++) {
            let sum = 0;
            for (let k = 0; k < colsA; k++) {
                sum += A[i][k] * B[k][j];
            }
            row.push(sum);
        }
        result.push(row);
    }
    return result;
}

function matVecMul(A: number[][], v: number[]): number[] {
    return A.map(row => row.reduce((sum, val, i) => sum + val * v[i], 0));
}

function solveLinearSystem(A: number[][], b: number[]): number[] {
    const n = A.length;
    const aug: number[][] = A.map((row, i) => [...row, b[i]]);

    // Forward elimination with partial pivoting
    for (let col = 0; col < n; col++) {
        let maxRow = col;
        for (let row = col + 1; row < n; row++) {
            if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) {
                maxRow = row;
            }
        }
        [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

        if (Math.abs(aug[col][col]) < 1e-10) {
            continue;
        }

        for (let row = col + 1; row < n; row++) {
            const factor = aug[row][col] / aug[col][col];
            for (let j = col; j <= n; j++) {
                aug[row][j] -= factor * aug[col][j];
            }
        }
    }

    // Back substitution
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        let sum = aug[i][n];
        for (let j = i + 1; j < n; j++) {
            sum -= aug[i][j] * x[j];
        }
        x[i] = Math.abs(aug[i][i]) > 1e-10 ? sum / aug[i][i] : 0;
    }

    return x;
}
