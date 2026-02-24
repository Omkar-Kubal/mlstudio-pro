"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Constants ───────────────────────────────────────────────────────────────
const W = 600, H = 180;
const X_PAD = 60;
const X_MIN = 0, X_MAX = 100;
const FIXED_POINTS = [18, 22, 25, 27, 30, 31, 33, 35, 38, 40, 42, 45, 47, 50];

// ─── Math Utils ─────────────────────────────────────────────────────────────
function toCanvas(v: number) { return X_PAD + ((v - X_MIN) / (X_MAX - X_MIN)) * (W - 2 * X_PAD); }
function fromCanvas(cx: number) { return X_MIN + ((cx - X_PAD) / (W - 2 * X_PAD)) * (X_MAX - X_MIN); }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

function computeStats(pts: number[]) {
    const sorted = [...pts].sort((a, b) => a - b);
    const mean = pts.reduce((a, b) => a + b, 0) / pts.length;
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

    // Mode: most frequent (binned for visual stability)
    const bins: Record<number, number> = {};
    pts.forEach(v => { const b = Math.round(v / 5) * 5; bins[b] = (bins[b] || 0) + 1; });
    const sortedBins = Object.entries(bins).sort((a, b) => b[1] - a[1]);
    const modeVal = sortedBins.length > 0 ? +sortedBins[0][0] : mean;

    return { mean, median, mode: modeVal };
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function CentralTendencyPrimitive() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [outlier, setOutlier] = useState(55);
    const [dragging, setDragging] = useState(false);

    const allPoints = useMemo(() => [...FIXED_POINTS, outlier], [outlier]);
    const stats = useMemo(() => computeStats(allPoints), [allPoints]);

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

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const Y_MID = H / 2;
        ctx.clearRect(0, 0, W, H);

        // Grid System (Subtle Background)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
        ctx.lineWidth = 1;
        [20, 40, 60, 80].forEach(v => {
            const cx = toCanvas(v);
            ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();
        });

        // Main Axis
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(X_PAD, Y_MID + 35);
        ctx.lineTo(W - X_PAD, Y_MID + 35);
        ctx.stroke();

        // Ticks & Labels
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.font = "10px var(--font-jetbrains)";
        ctx.textAlign = "center";
        [0, 20, 40, 60, 80, 100].forEach(v => {
            const cx = toCanvas(v);
            ctx.beginPath();
            ctx.moveTo(cx, Y_MID + 35);
            ctx.lineTo(cx, Y_MID + 42);
            ctx.stroke();
            ctx.fillText(v.toString(), cx, Y_MID + 55);
        });

        // Fixed Density Points
        FIXED_POINTS.forEach(v => {
            const cx = toCanvas(v);
            ctx.beginPath();
            ctx.arc(cx, Y_MID, 4, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
            ctx.fill();
        });

        // Draggable Outlier
        const ocx = toCanvas(outlier);
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = "hsl(var(--accent))";
        ctx.beginPath();
        ctx.arc(ocx, Y_MID, 8, 0, Math.PI * 2);
        ctx.fillStyle = "hsl(var(--accent))";
        ctx.fill();
        ctx.restore();

        // Outlier Label
        ctx.fillStyle = "black";
        ctx.font = "bold 9px var(--font-jetbrains)";
        ctx.fillText("X", ocx, Y_MID + 3.5);

        // Indicators Data
        const indicators = [
            { val: stats.mean, color: "hsl(var(--primary))", label: "Mean", yOff: -55 },
            { val: stats.median, color: "hsl(var(--secondary))", label: "Median", yOff: -38 },
            { val: stats.mode, color: "#10b981", label: "Mode", yOff: -21 },
        ];

        indicators.forEach(({ val, color, label, yOff }) => {
            const cx = toCanvas(val);

            // Vertical dashed line
            ctx.beginPath();
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.moveTo(cx, Y_MID - 20);
            ctx.lineTo(cx, Y_MID + 35);
            ctx.stroke();
            ctx.setLineDash([]);

            // Triangle Pointer
            ctx.beginPath();
            ctx.moveTo(cx - 5, Y_MID - 20);
            ctx.lineTo(cx + 5, Y_MID - 20);
            ctx.lineTo(cx, Y_MID - 12);
            ctx.fillStyle = color;
            ctx.fill();

            // Text Label
            ctx.font = "bold 10px var(--font-jetbrains)";
            ctx.fillStyle = color;
            ctx.textAlign = "center";
            ctx.fillText(`${label}: ${val.toFixed(1)}`, cx, Y_MID + yOff);
        });

    }, [outlier, stats]);

    useEffect(() => { render(); }, [render]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!dragging || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const scaleX = W / rect.width;
        setOutlier(clamp(Math.round(fromCanvas(cx * scaleX)), 0, 100));
    }, [dragging]);

    const divergence = stats.mean - stats.median;
    const isSkewed = Math.abs(divergence) > 5;

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">balance</span>
                        Balance & Typicality
                    </h3>
                    <p className="text-xs text-muted/60 lowercase italic">Outlier sensitivity visualization</p>
                </div>
                <div className={`px-3 py-1.5 rounded-full border text-[10px] font-bold tracking-widest uppercase transition-all ${isSkewed ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
                    }`}>
                    {isSkewed ? 'Skew detected' : 'Near Symmetric'}
                </div>
            </div>

            <div
                className={`relative rounded bg-slate-950/40 border border-border/50 overflow-hidden shadow-2xl transition-all cursor-${dragging ? 'grabbing' : 'grab'}`}
                onPointerDown={(e) => {
                    const rect = canvasRef.current?.getBoundingClientRect();
                    if (!rect) return;
                    const cx = (e.clientX - rect.left) * (W / rect.width);
                    const ocx = toCanvas(outlier);
                    if (Math.abs(cx - ocx) < 25) {
                        setDragging(true);
                        (e.target as HTMLElement).setPointerCapture(e.pointerId);
                    }
                }}
                onPointerMove={handlePointerMove}
                onPointerUp={(e) => {
                    setDragging(false);
                    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
                }}
            >
                <canvas ref={canvasRef} width={W} height={H} className="w-full h-auto block touch-none" />

                {/* Interaction hint */}
                <div className="absolute top-3 right-3 flex items-center gap-2 px-2 py-1 bg-black/40 rounded border border-white/5 pointer-events-none">
                    <span className="material-symbols-outlined text-[12px] text-accent animate-pulse">drag_pan</span>
                    <span className="text-[9px] font-bold text-muted/50 uppercase">Drag Outlier</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                    { label: "Mean", val: stats.mean, color: "text-primary", bg: "bg-primary/5", border: "border-primary/20", icon: "average", desc: "Outlier magnet" },
                    { label: "Median", val: stats.median, color: "text-secondary", bg: "bg-secondary/5", border: "border-secondary/20", icon: "view_day", desc: "Positional pivot" },
                    { label: "Mode", val: stats.mode, color: "text-emerald-500", bg: "bg-emerald-500/5", border: "border-emerald-500/20", icon: "category", desc: "Density peak" },
                ].map((item) => (
                    <div key={item.label} className={`p-4 rounded-lg border ${item.bg} ${item.border} space-y-1 transition-all`}>
                        <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${item.color}`}>{item.label}</span>
                            <span className={`material-symbols-outlined text-sm ${item.color}`}>{item.icon}</span>
                        </div>
                        <div className="text-2xl font-bold font-mono tracking-tighter tabular-nums text-foreground">
                            {item.val.toFixed(1)}
                        </div>
                        <p className="text-[10px] text-muted/50 italic leading-none">{item.desc}</p>
                    </div>
                ))}
            </div>

            <div className={`p-4 rounded-lg border flex gap-3 transition-colors ${isSkewed ? 'bg-primary/5 border-primary/10' : 'bg-surface border-border/30'
                }`}>
                <span className={`material-symbols-outlined ${isSkewed ? 'text-primary' : 'text-muted'}`}>
                    {isSkewed ? 'trending_up' : 'info'}
                </span>
                <div className="space-y-1">
                    <p className="text-xs text-muted leading-relaxed">
                        <span className="text-foreground font-bold uppercase tracking-tighter">Observational Gap:</span>
                        The divergence between Mean and Median is <span className="font-mono font-bold text-primary">{Math.abs(divergence).toFixed(2)}</span>.
                        {isSkewed ? (
                            " Notice how the Mean is 'pulled' toward the extreme value, while the Median remains anchored in the data cluster."
                        ) : (
                            " When data is symmetric, the Mean and Median overlap perfectly. This is the ideal 'Normal' balance."
                        )}
                    </p>
                    <div className="h-1 w-full bg-border/20 rounded-full overflow-hidden mt-2">
                        <motion.div
                            animate={{ width: `${Math.min(100, Math.abs(divergence) * 2)}%` }}
                            className={`h-full ${isSkewed ? 'bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]' : 'bg-muted'}`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

