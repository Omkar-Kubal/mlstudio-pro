"use client";

import { Component, ReactNode, createContext, useContext, useState, useEffect } from "react";

// ============================================
// Motion Preference Context
// ============================================

interface MotionPreferenceContextValue {
    reducedMotion: boolean;
}

const MotionPreferenceContext = createContext<MotionPreferenceContextValue>({ reducedMotion: false });

export function useMotionPreference() {
    return useContext(MotionPreferenceContext);
}

// ============================================
// Motion Preference Provider
// ============================================

export function MotionPreferenceProvider({ children }: { children: ReactNode }) {
    const [reducedMotion, setReducedMotion] = useState(() => {
        if (typeof window === "undefined") return false;
        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
        return prefersReduced || (connection?.saveData === true);
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
    }, []);

    return (
        <MotionPreferenceContext.Provider value={{ reducedMotion }}>
            {children}
        </MotionPreferenceContext.Provider>
    );
}

// ============================================
// Error Boundary for Primitive Isolation
// ============================================

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

export class PrimitiveErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Primitive Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

// ============================================
// Static Fallback Component
// ============================================

interface StaticFallbackProps {
    primitiveName: string;
    caption?: string;
}

export function StaticFallback({ primitiveName, caption }: StaticFallbackProps) {
    return (
        <div className="bg-surface/30 border border-border rounded-lg p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-surface rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            </div>
            <div>
                <p className="text-sm text-muted">Interactive visualization unavailable</p>
                <p className="text-xs text-muted/70 mt-1">{primitiveName}</p>
            </div>
            {caption && (
                <p className="text-xs text-muted italic">{caption}</p>
            )}
        </div>
    );
}

// ============================================
// Primitive Wrapper Component
// ============================================

interface PrimitiveWrapperProps {
    children: ReactNode;
    primitiveName: string;
    caption?: string;
    description?: string;
}

/**
 * PrimitiveWrapper - Centralized wrapper for all visual primitives
 * 
 * Provides:
 * - ErrorBoundary isolation (one primitive failure ≠ page failure)
 * - Static fallback on error
 * - Motion preference context
 * - Print mode handling
 */
export function PrimitiveWrapper({ children, primitiveName, caption, description }: PrimitiveWrapperProps) {
    const [isPrintMode, setIsPrintMode] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia("print").matches;
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia("print");
        const handler = (e: MediaQueryListEvent) => setIsPrintMode(e.matches);
        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
    }, []);

    // Show static fallback in print mode
    if (isPrintMode) {
        return <StaticFallback primitiveName={primitiveName} caption={caption} />;
    }

    return (
        <PrimitiveErrorBoundary fallback={<StaticFallback primitiveName={primitiveName} caption={caption} />}>
            <MotionPreferenceProvider>
                <div className="flex flex-col gap-4 w-full">
                    <div className="w-full overflow-x-auto primitive-canvas-wrapper">
                        {children}
                    </div>
                    {(caption || description) && (
                        <div className="bg-surface/30 border border-border p-4 rounded-xl space-y-2 backdrop-blur-sm shadow-sm">
                            {caption && (
                                <p className="text-sm font-bold text-foreground">
                                    {caption}
                                </p>
                            )}
                            {description && (
                                <p className="text-xs text-muted leading-relaxed">
                                    {description}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </MotionPreferenceProvider>
        </PrimitiveErrorBoundary>
    );
}

// ============================================
// Primitive Registry
// ============================================

/**
 * All registered primitive types
 * Used for validation and fallback handling
 */
export const REGISTERED_PRIMITIVES = [
    "parameter-sensitivity",
    "fit-progression",
    "distribution-evolution",
    "boundary-morphing",
    "metric-dashboard",
    "cluster-formation",
    "network-forward-pass",
    "gradient-backflow",
    "gradient-descent-optimizer",
    "descriptive-statistics",
    "population-sample",
    "central-tendency",
    "dispersion",
    "probability-distributions",
    "common-distributions",
    "conditional-probability",
    "law-of-large-numbers",
    "poisson-distribution",
    "exponential-distribution",
    "uniform-distribution",
    "vector-operations",
    "matrix-transformation",
    "matrix-properties",
    "linear-independence",
    "eigen-vectors",
    "svd",
    "objective-function",
    "gradient-chain-rule",
    "numpy-arrays",
    "broadcasting",
    "fancy-boolean-indexing",
    "memory-layout",
    "groupby",
    "rolling-average",
    "matplotlib-seaborn",
    "model-results",
    "decorators",
    "generators",
    "context-managers",
    "ml-pipelines",
    "outlier-detection",
    "data-validation",
    "categorical-encoding",
    "feature-scaling",
    "polynomial-features",
    "missing-data",
    "duplicate-data",
    "residual-analysis",
    "feature-selection",
    "domain-features",
    "tfidf",
    "cnn-features",
    "linear-regression",
    "regularization",
    "decision-tree",
    "random-forest",
    "gradient-boosting",
    "svr",
    "knn-regression",
    "regression-metrics",
    "logistic-regression",
    "decision-tree-classification",
    "svm",
    "naive-bayes",
    "knn-classification",
    "confusion-matrix",
    "roc-auc",
    "ensemble-methods",
    "neural-network",
    "activation-functions",
    "cnn",
    "rnn",
    "attention",
    "transformer",
    "dropout-bn",
    "transfer-learning",
    "nlp-pipeline",
    "word-embedding",
    "time-series",
    "anomaly-detection",
    "recommender",
    "clustering",
    "mlops",
    "ai-ethics"
] as const;

export type RegisteredPrimitiveType = typeof REGISTERED_PRIMITIVES[number];

export function isPrimitiveRegistered(type: string): type is RegisteredPrimitiveType {
    return REGISTERED_PRIMITIVES.includes(type as RegisteredPrimitiveType);
}

