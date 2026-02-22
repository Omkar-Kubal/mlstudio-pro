"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Constants & Types ───────────────────────────────────────────────────────
const W = 640, H = 260;
const BINS_COUNT = 10;

// ─── Component ──────────────────────────────────────────────────────────────
export default function UniformDistributionPrimitive() {
    const [a, setA] = useState(0);
    const [b, setB] = useState(5);
    const [qx1, setQx1] = useState(1);
    const [qx2, setQx2] = useState(3);
    const [simCounts, setSimCounts] = useState<number[]>(new Array(BINS_COUNT).fill(0));

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number | undefined>(undefined);

    // ─── Simulation ─────────────────────────────────────────────────────────
    const simulateFairness = useCallback(() => {
        const N = 1000;
        const counts = new Array(BINS_COUNT).fill(0);
        for (let i = 0; i < N; i++) {
            const x = a + Math.random() * (b - a);
            const bin = Math.floor(((x - a) / (b - a)) * BINS_COUNT);
            const idx = Math.min(bin, BINS_COUNT - 1);
            counts[idx]++;
        }
        setSimCounts(counts);
    }, [a, b]);

    useEffect(() => {
        simulateFairness();
    }, [simulateFairness]);

    // ─── Drawing Logic ──────────────────────────────────────────────────────
    const draw = useCallback(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "hsl(var(--surface))";
        ctx.fillRect(0, 0, W, H);

        const M = { top: 20, right: 30, bottom: 40, left: 60 };
        const cw = W - M.left - M.right, ch = H - M.top - M.bottom;

        // X range logic: show more than just [a, b] to give context
        const xMin = Math.min(a - 2, qx1 - 1);
        const xMax = Math.max(b + 2, qx2 + 1);
        const height = 1 / (b - a);
        const yMax = height * 1.5;

        const tx = (x: number) => M.left + ((x - xMin) / (xMax - xMin)) * cw;
        const ty = (y: number) => M.top + ch - (y / yMax) * ch;

        // Grid & Background
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const vy = ty(yMax * (i / 4));
            ctx.beginPath(); ctx.moveTo(M.left, vy); ctx.lineTo(M.left + cw, vy); ctx.stroke();
            ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
            ctx.font = "8px var(--font-jetbrains)";
            ctx.textAlign = "right";
            ctx.fillText((yMax * (i / 4)).toFixed(3), M.left - 10, vy + 3);
        }

        // Probability Shading (Query)
        const qLo = Math.max(qx1, a);
        const qHi = Math.min(qx2, b);
        if (qLo < qHi) {
            ctx.fillStyle = "hsla(var(--amber-500), 0.15)";
            const sx = tx(qLo), sw = tx(qHi) - sx;
            ctx.fillRect(sx, ty(height), sw, ty(0) - ty(height));

            // Query Borders
            ctx.strokeStyle = "hsla(var(--amber-500), 0.5)";
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(sx, ty(0)); ctx.lineTo(sx, ty(height));
            ctx.moveTo(tx(qHi), ty(0)); ctx.lineTo(tx(qHi), ty(height));
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Uniform Rectangle
        const rx = tx(a), rw = tx(b) - rx;
        const ry = ty(height);

        const grad = ctx.createLinearGradient(0, ry, 0, ty(0));
        grad.addColorStop(0, "hsla(var(--primary), 0.3)");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(rx, ry, rw, ty(0) - ry);

        ctx.strokeStyle = "hsl(var(--primary))";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx + rw, ry);
        ctx.stroke();

        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(rx, ry); ctx.lineTo(rx, ty(0));
        ctx.moveTo(rx + rw, ry); ctx.lineTo(rx + rw, ty(0));
        ctx.stroke();

        // Baseline (tails)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.beginPath();
        ctx.moveTo(M.left, ty(0)); ctx.lineTo(rx, ty(0));
        ctx.moveTo(rx + rw, ty(0)); ctx.lineTo(M.left + cw, ty(0));
        ctx.stroke();

        // Markers a and b
        ctx.fillStyle = "hsl(var(--primary))";
        ctx.textAlign = "center";
        ctx.font = "bold 10px var(--font-jetbrains)";
        ctx.fillText(`a=${a.toFixed(1)}`, rx, ty(0) + 20);
        ctx.fillText(`b=${b.toFixed(1)}`, rx + rw, ty(0) + 20);

        // Height Annotation
        ctx.fillStyle = "hsl(var(--primary))";
        ctx.textAlign = "left";
        ctx.fillText(`h = 1/(b−a) = ${height.toFixed(3)}`, rx + rw + 10, ry + 5);

        requestRef.current = requestAnimationFrame(draw);
    }, [a, b, qx1, qx2]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(draw);
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, [draw]);

    // Stats
    const stats = useMemo(() => {
        const width = b - a;
        const mean = (a + b) / 2;
        const variance = Math.pow(width, 2) / 12;
        const qLo = Math.max(qx1, a);
        const qHi = Math.min(qx2, b);
        const prob = qLo < qHi ? (qHi - qLo) / width : 0;
        return { mean, variance, prob, std: Math.sqrt(variance) };
    }, [a, b, qx1, qx2]);

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">square</span>
                            Uniform Distribution
                        </h3>
                        <p className="text-xs text-muted/60 max-w-lg">
                            Every outcome in the range <span className="text-foreground font-bold">[a, b]</span> has the exact same probability density.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="bg-black/40 border border-border/60 rounded-xl px-5 py-3 flex flex-col items-center justify-center min-w-[120px]">
                        <span className="text-[9px] uppercase font-bold text-muted/50 tracking-widest mb-1">Mean</span>
                        <span className="text-3xl font-black text-primary">{stats.mean.toFixed(2)}</span>
                    </div>
                    <div className="bg-black/40 border border-border/60 rounded-xl px-5 py-3 flex flex-col items-center justify-center min-w-[120px]">
                        <span className="text-[9px] uppercase font-bold text-muted/50 tracking-widest mb-1">PDF Height</span>
                        <span className="text-3xl font-black text-emerald-400">{(1 / (b - a)).toFixed(3)}</span>
                    </div>
                </div>
            </div>

            {/* Main Interactive Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-4">
                    <div className="bg-black/60 border border-border rounded-xl overflow-hidden shadow-2xl relative">
                        <div className="absolute top-3 left-4 flex gap-4 text-[9px] font-bold text-muted/40 uppercase tracking-widest z-10">
                            <span>Interactive PDF Explorer</span>
                            <span className="text-amber-500">P({qx1} ≤ X ≤ {qx2}) = {(stats.prob * 100).toFixed(1)}%</span>
                        </div>
                        <canvas ref={canvasRef} width={W} height={H} className="w-full h-auto" />
                    </div>

                    {/* Query Controls */}
                    <div className="bg-surface2/30 border border-border rounded-xl p-4 flex gap-4 items-center flex-wrap">
                        <div className="text-[10px] font-bold text-muted uppercase tracking-widest mr-2">Query Bounds:</div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-muted">x₁</span>
                            <input
                                type="number" step="0.5" value={qx1} onChange={e => setQx1(+e.target.value)}
                                className="w-20 bg-black/40 border border-border rounded px-2 py-1 text-xs font-mono"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-muted">x₂</span>
                            <input
                                type="number" step="0.5" value={qx2} onChange={e => setQx2(+e.target.value)}
                                className="w-20 bg-black/40 border border-border rounded px-2 py-1 text-xs font-mono"
                            />
                        </div>
                        <div className="ml-auto text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                            Calculation: (min({qx2}, b) - max({qx1}, a)) / (b - a)
                        </div>
                    </div>
                </div>

                {/* Right Controls Panel */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-surface border border-border rounded-xl p-5 space-y-6">
                        <div className="space-y-4">
                            <div className="text-[10px] font-black text-muted uppercase tracking-widest border-b border-border pb-2">Range [a, b]</div>

                            <div className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold text-muted/60 uppercase">
                                        <span>Lower bound (a)</span>
                                        <span className="text-primary">{a.toFixed(1)}</span>
                                    </div>
                                    <input
                                        type="range" min="-10" max={b - 0.5} step="0.5"
                                        value={a} onChange={e => setA(+e.target.value)}
                                        className="w-full h-1 bg-border rounded-full appearance-none accent-primary cursor-pointer"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold text-muted/60 uppercase">
                                        <span>Upper bound (b)</span>
                                        <span className="text-primary">{b.toFixed(1)}</span>
                                    </div>
                                    <input
                                        type="range" min={a + 0.5} max="15" step="0.5"
                                        value={b} onChange={e => setB(+e.target.value)}
                                        className="w-full h-1 bg-border rounded-full appearance-none accent-primary cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-surface2 p-3 rounded-lg border border-border/40 text-center">
                                <span className="text-[9px] font-bold text-muted uppercase block mb-1 opacity-60">Variance</span>
                                <span className="text-sm font-black text-foreground">{stats.variance.toFixed(3)}</span>
                            </div>
                            <div className="bg-surface2 p-3 rounded-lg border border-border/40 text-center">
                                <span className="text-[9px] font-bold text-muted uppercase block mb-1 opacity-60">Std Dev</span>
                                <span className="text-sm font-black text-foreground">{stats.std.toFixed(3)}s</span>
                            </div>
                        </div>
                    </div>

                    {/* Fairness Simulation */}
                    <div className="bg-surface border border-border rounded-xl p-5 space-y-3 shadow-inner">
                        <div className="text-[10px] font-black text-muted uppercase tracking-widest border-b border-border pb-2 flex justify-between">
                            <span>Fairness Sim (1K samples)</span>
                            <button onClick={simulateFairness} className="text-primary hover:underline">RE-RUN</button>
                        </div>
                        <div className="flex items-end gap-1 h-20 pt-4 px-2">
                            {simCounts.map((count, i) => {
                                const max = Math.max(...simCounts, 1);
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(count / max) * 100}%` }}
                                        className="flex-1 bg-primary/40 rounded-t-sm border-x border-primary/20"
                                    />
                                );
                            })}
                        </div>
                        <div className="text-[9px] text-muted/60 leading-relaxed italic pt-2">
                            Each of the 10 bins should be equal. Random noise persists at N=1K, but the Law of Large Numbers dictates eventual uniformity.
                        </div>
                    </div>
                </div>
            </div>

            {/* Insight */}
            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex gap-3">
                <span className="material-symbols-outlined text-amber-500 text-lg">lightbulb</span>
                <p className="text-[10px] text-muted leading-relaxed italic">
                    <span className="text-foreground font-black uppercase not-italic tracking-tighter">Aha Moment:</span> Notice that as you <strong>widen the interval</strong> (b - a increases), the rectangle gets <strong>shorter</strong>. This is because the total area (Probability) must <strong>always equal 1.0</strong>.
                </p>
            </div>
        </div>
    );
}
