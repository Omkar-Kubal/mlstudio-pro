"use client";

import { useState, useMemo } from "react";
import type { FitProgressionConfig } from "@/lib/visual-types";

interface Props {
    config: FitProgressionConfig;
}

/**
 * FitProgressionPrimitive - Visualizes Underfitting → Good Fit → Overfitting
 * 
 * Learner Goal: "See how model complexity affects fit quality and generalization"
 * 
 * Shows:
 * - Scatter plot with training data
 * - Polynomial curve that changes with complexity
 * - Train/Test error bars that diverge when overfitting
 */
export default function FitProgressionPrimitive({ config }: Props) {
    const { slider, data, caption } = config;

    // Complexity controlled by slider
    const [complexity, setComplexity] = useState(slider.initial);

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

    // Generate curve points for rendering
    const curvePoints = useMemo(() => {
        const points: { x: number; y: number }[] = [];
        for (let i = 0; i <= 100; i++) {
            const x = i / 100;
            const y = evaluatePolynomial(x, coefficients);
            points.push({ x, y });
        }
        return points;
    }, [coefficients]);

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

                    {/* Polynomial curve */}
                    <svg className="absolute inset-0 w-full h-full overflow-visible">
                        <path
                            d={generateCurvePath(curvePoints)}
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="2"
                            className="transition-all duration-150"
                        />
                    </svg>

                    {/* Training points */}
                    {data.trainPoints.map((point, idx) => (
                        <div
                            key={`train-${idx}`}
                            className="absolute w-2 h-2 rounded-full bg-blue-500 border border-blue-400"
                            style={{
                                left: `${point.x * 100}%`,
                                bottom: `${point.y * 100}%`,
                                transform: "translate(-50%, 50%)"
                            }}
                        />
                    ))}

                    {/* Test points (smaller, different color) */}
                    {data.testPoints.map((point, idx) => (
                        <div
                            key={`test-${idx}`}
                            className="absolute w-1.5 h-1.5 rounded-full bg-orange-400/60 border border-orange-300/60"
                            style={{
                                left: `${point.x * 100}%`,
                                bottom: `${point.y * 100}%`,
                                transform: "translate(-50%, 50%)"
                            }}
                        />
                    ))}
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
                        <span className="text-muted">Train Error</span>
                        <span className="font-mono text-foreground">
                            {(trainError * 100).toFixed(0)}%
                        </span>
                    </div>
                    <div className="h-2 bg-surface rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-150"
                            style={{ width: `${Math.min(trainError * 100, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Test Error */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted">Test Error</span>
                        <span className="font-mono text-foreground">
                            {(testError * 100).toFixed(0)}%
                        </span>
                    </div>
                    <div className="h-2 bg-surface rounded-full overflow-hidden">
                        <div
                            className="h-full bg-orange-500 transition-all duration-150"
                            style={{ width: `${Math.min(testError * 100, 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Slider */}
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
        </div>
    );
}

// ============================================
// Polynomial Fitting Utilities
// ============================================

/**
 * Fit polynomial using least squares (simplified for small degrees)
 */
function fitPolynomial(
    points: Array<{ x: number; y: number }>,
    degree: number
): number[] {
    const n = points.length;
    const d = Math.min(degree, n - 1); // Can't fit higher degree than n-1

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

    // Solve X^T * X * coeffs = X^T * Y using simple approach
    // This is a simplified least squares for small matrices
    const XtX = matMul(transpose(X), X);
    const XtY = matVecMul(transpose(X), Y);

    // Solve using Gaussian elimination (simplified)
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
    // Clamp to reasonable range for visualization
    return Math.max(-0.5, Math.min(1.5, result));
}

/**
 * Compute mean squared error
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
    return Math.sqrt(sumSq / points.length); // RMSE, capped at 1
}

/**
 * Generate SVG path for curve
 */
function generateCurvePath(points: Array<{ x: number; y: number }>): string {
    if (points.length === 0) return "";

    const pathParts: string[] = [];
    for (let i = 0; i < points.length; i++) {
        const x = points[i].x * 100;
        const y = (1 - points[i].y) * 100; // Flip Y for SVG
        if (i === 0) {
            pathParts.push(`M ${x}% ${y}%`);
        } else {
            pathParts.push(`L ${x}% ${y}%`);
        }
    }
    return pathParts.join(" ");
}

// ============================================
// Matrix Utilities (minimal implementation)
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
    // Simple Gaussian elimination with partial pivoting
    const n = A.length;
    const aug: number[][] = A.map((row, i) => [...row, b[i]]);

    // Forward elimination
    for (let col = 0; col < n; col++) {
        // Find pivot
        let maxRow = col;
        for (let row = col + 1; row < n; row++) {
            if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) {
                maxRow = row;
            }
        }
        [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

        // Check for singular matrix
        if (Math.abs(aug[col][col]) < 1e-10) {
            continue;
        }

        // Eliminate
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
