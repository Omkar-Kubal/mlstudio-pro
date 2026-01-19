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
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        // Check for prefers-reduced-motion
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReducedMotion(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
        mediaQuery.addEventListener("change", handler);

        // Also check for saveData (connection.saveData)
        const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
        if (connection?.saveData) {
            setReducedMotion(true);
        }

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
export function PrimitiveWrapper({ children, primitiveName, caption }: PrimitiveWrapperProps) {
    const [isPrintMode, setIsPrintMode] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("print");
        setIsPrintMode(mediaQuery.matches);

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
                {children}
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
    "gradient-backflow"
] as const;

export type RegisteredPrimitiveType = typeof REGISTERED_PRIMITIVES[number];

export function isPrimitiveRegistered(type: string): type is RegisteredPrimitiveType {
    return REGISTERED_PRIMITIVES.includes(type as RegisteredPrimitiveType);
}
