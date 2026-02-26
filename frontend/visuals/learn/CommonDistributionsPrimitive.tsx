"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Constants & Types ──────────────────────────────────────────────────────
const W = 600, H = 360;
const M = { top: 30, right: 30, bottom: 50, left: 60 };
const CW = W - M.left - M.right;
const CH = H - M.top - M.bottom;

type DistType = 'normal' | 'binomial' | 'poisson' | 'uniform';

const COLORS: Record<DistType, string> = {
    normal: "hsl(var(--primary))",
    binomial: "hsl(var(--secondary))",
    poisson: "#10b981", // Emerald
    uniform: "hsl(var(--accent))",
};

// ─── Math Helpers ──────────────────────────────────────────────────────────
function _factorial(n: number): number {
    if (n <= 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
}

function binomCoeff(n: number, k: number): number {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    if (k > n / 2) k = n - k;
    let c = 1;
    for (let i = 0; i < k; i++) c *= (n - i) / (i + 1);
    return c;
}

function normalPDF(x: number, mu: number, sigma: number) {
    return Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));
}

function binomialPMF(k: number, n: number, p: number) {
    return binomCoeff(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

function poissonPMF(k: number, lambda: number) {
    // Use log space to avoid overflow
    let logP = k * Math.log(lambda) - lambda;
    for (let i = 1; i <= k; i++) logP -= Math.log(i);
    return Math.exp(logP);
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function CommonDistributionsPrimitive() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [activeDist, setActiveDist] = useState<DistType>('normal');
    const [overlayAll, setOverlayAll] = useState(false);

    // Parameter State
    const [params, setParams] = useState({
        mu: 0, sigma: 1,
        nBinom: 20, pBinom: 0.5,
        lambda: 5,
        uniformA: -2, uniformB: 2
    });

    const updateParam = (key: keyof typeof params, val: number) => {
        setParams(prev => ({ ...prev, [key]: val }));
    };

    const currentStats = useMemo(() => {
        switch (activeDist) {
            case 'normal':
                return { mean: params.mu, variance: params.sigma ** 2, skew: 0, support: "(-∞, +∞)" };
            case 'binomial':
                const bv = params.nBinom * params.pBinom * (1 - params.pBinom);
                return {
                    mean: params.nBinom * params.pBinom,
                    variance: bv,
                    skew: (1 - 2 * params.pBinom) / Math.sqrt(bv || 1),
                    support: `{0, ..., ${params.nBinom}}`
                };
            case 'poisson':
                return { mean: params.lambda, variance: params.lambda, skew: 1 / Math.sqrt(params.lambda), support: "{0, 1, 2, ...}" };
            case 'uniform':
                const range = params.uniformB - params.uniformA;
                return { mean: (params.uniformA + params.uniformB) / 2, variance: (range ** 2) / 12, skew: 0, support: `[${params.uniformA}, ${params.uniformB}]` };
            default:
                return { mean: 0, variance: 0, skew: 0, support: "" };
        }
    }, [activeDist, params]);

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, W, H);

        const distsToDraw: DistType[] = overlayAll ? ['normal', 'binomial', 'poisson', 'uniform'] : [activeDist];

        // Determine Axis Ranges
        let xMin = -5, xMax = 5; const yMax = 0.5;

        if (overlayAll || activeDist === 'binomial' || activeDist === 'poisson') {
            xMax = Math.max(10, params.nBinom, params.lambda * 2.5);
            xMin = -2;
        }
        if (activeDist === 'uniform') {
            xMin = params.uniformA - 2;
            xMax = params.uniformB + 2;
        }

        const xSpan = xMax - xMin;
        const toCX = (x: number) => M.left + ((x - xMin) / xSpan) * CW;
        const toCY = (y: number) => M.top + CH - (y / yMax) * CH;

        // Grid System
        ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
        ctx.lineWidth = 1;
        [0.1, 0.2, 0.3, 0.4].forEach(y => {
            const py = toCY(y);
            ctx.beginPath(); ctx.moveTo(M.left, py); ctx.lineTo(M.left + CW, py); ctx.stroke();
        });

        // Axis Lines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(M.left, M.top);
        ctx.lineTo(M.left, M.top + CH);
        ctx.lineTo(M.left + CW, M.top + CH);
        ctx.stroke();

        // X Ticks
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.font = "10px var(--font-jetbrains)";
        ctx.textAlign = "center";
        const xStep = xSpan > 20 ? 5 : 2;
        for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += xStep) {
            if (x === 0) continue;
            const cx = toCX(x);
            ctx.fillText(x.toString(), cx, M.top + CH + 20);
        }

        // Draw Distributions
        distsToDraw.forEach(d => {
            const color = COLORS[d];
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = 2.5;

            if (d === 'normal') {
                ctx.beginPath();
                for (let i = 0; i <= 200; i++) {
                    const x = xMin + (i / 200) * xSpan;
                    const y = normalPDF(x, params.mu, params.sigma);
                    if (i === 0) { ctx.moveTo(toCX(x), toCY(y)); } else { ctx.lineTo(toCX(x), toCY(y)); }
                }
                ctx.stroke();
                if (!overlayAll) {
                    ctx.globalAlpha = 0.1;
                    ctx.lineTo(toCX(xMax), toCY(0));
                    ctx.lineTo(toCX(xMin), toCY(0));
                    ctx.fill();
                    ctx.globalAlpha = 1;
                }
            } else if (d === 'binomial') {
                const barW = Math.max(2, (CW / xSpan) * 0.6);
                for (let k = 0; k <= params.nBinom; k++) {
                    const y = binomialPMF(k, params.nBinom, params.pBinom);
                    const cx = toCX(k);
                    const cy = toCY(y);
                    ctx.globalAlpha = overlayAll ? 0.6 : 1;
                    ctx.fillRect(cx - barW / 2, cy, barW, M.top + CH - cy);
                    ctx.globalAlpha = 1;
                }
            } else if (d === 'poisson') {
                const _barW = Math.max(2, (CW / xSpan) * 0.4);
                for (let k = 0; k <= xMax; k++) {
                    const y = poissonPMF(k, params.lambda);
                    const cx = toCX(k);
                    const cy = toCY(y);
                    ctx.save();
                    ctx.translate(cx, cy);
                    ctx.beginPath();
                    ctx.arc(0, 0, 3, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();

                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.lineTo(cx, M.top + CH);
                    ctx.lineWidth = 1;
                    ctx.globalAlpha = 0.4;
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            } else if (d === 'uniform') {
                const h = 1 / (params.uniformB - params.uniformA);
                const cxA = toCX(params.uniformA);
                const cxB = toCX(params.uniformB);
                const cyH = toCY(h);
                const cy0 = toCY(0);

                ctx.beginPath();
                ctx.moveTo(toCX(xMin), cy0);
                ctx.lineTo(cxA, cy0);
                ctx.lineTo(cxA, cyH);
                ctx.lineTo(cxB, cyH);
                ctx.lineTo(cxB, cy0);
                ctx.lineTo(toCX(xMax), cy0);
                ctx.stroke();

                if (!overlayAll) {
                    ctx.globalAlpha = 0.1;
                    ctx.fillRect(cxA, cyH, cxB - cxA, cy0 - cyH);
                    ctx.globalAlpha = 1;
                }
            }
        });

    }, [activeDist, overlayAll, params]);

    useEffect(() => { render(); }, [render]);

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">functions</span>
                        Distribution Explorer
                    </h3>
                    <div className="flex gap-2 pt-1">
                        {(['normal', 'binomial', 'poisson', 'uniform'] as DistType[]).map(d => (
                            <button
                                key={d}
                                onClick={() => { setActiveDist(d); setOverlayAll(false); }}
                                className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-tight border transition-all ${activeDist === d && !overlayAll ? "border-primary text-primary bg-primary/10" : "border-border text-muted hover:text-foreground hover:border-muted"
                                    }`}
                                style={{ color: activeDist === d && !overlayAll ? COLORS[d] : undefined, borderColor: activeDist === d && !overlayAll ? COLORS[d] : undefined }}
                            >
                                {d}
                            </button>
                        ))}
                        <button
                            onClick={() => setOverlayAll(!overlayAll)}
                            className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-tight border transition-all ${overlayAll ? "border-accent text-accent bg-accent/10" : "border-border text-muted/40 hover:text-foreground"
                                }`}
                        >
                            Overlay All
                        </button>
                    </div>
                </div>
                <div className="hidden sm:block">
                    <div className="px-3 py-1.5 rounded-full border border-border bg-black/20 font-mono text-[10px] text-muted tracking-tighter">
                        Density Kernel: <span className="text-foreground font-bold italic">f(x) | P(X=k)</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Canvas Area */}
                <div className="lg:col-span-8 relative rounded bg-slate-950/40 border border-border/50 overflow-hidden shadow-2xl">
                    <canvas ref={canvasRef} width={W} height={H} className="w-full h-auto block touch-none" />

                    {/* Legend for Overlay */}
                    <AnimatePresence>
                        {overlayAll && (
                            <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="absolute top-4 right-4 space-y-2 bg-black/60 p-3 rounded-lg border border-white/5 backdrop-blur-md"
                            >
                                {(['normal', 'binomial', 'poisson', 'uniform'] as DistType[]).map(d => (
                                    <div key={d} className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[d] }} />
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted/80">{d}</span>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Controls Area */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-surface/80 border border-border rounded-lg p-4 space-y-4">
                        <div className="text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border pb-2">
                            {activeDist} Parameters
                        </div>

                        <div className="space-y-4 min-h-[140px]">
                            {activeDist === 'normal' && (
                                <>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-medium text-muted">
                                            <span>Mean (μ)</span>
                                            <span className="font-mono text-primary">{params.mu.toFixed(1)}</span>
                                        </div>
                                        <input type="range" min="-3" max="3" step="0.1" value={params.mu} onChange={e => updateParam('mu', +e.target.value)} className="w-full h-1 bg-border/40 rounded-full appearance-none accent-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-medium text-muted">
                                            <span>Std Dev (σ)</span>
                                            <span className="font-mono text-primary">{params.sigma.toFixed(1)}</span>
                                        </div>
                                        <input type="range" min="0.3" max="3" step="0.1" value={params.sigma} onChange={e => updateParam('sigma', +e.target.value)} className="w-full h-1 bg-border/40 rounded-full appearance-none accent-primary" />
                                    </div>
                                </>
                            )}
                            {activeDist === 'binomial' && (
                                <>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-medium text-muted">
                                            <span>Trials (n)</span>
                                            <span className="font-mono text-secondary">{params.nBinom}</span>
                                        </div>
                                        <input type="range" min="5" max="50" step="1" value={params.nBinom} onChange={e => updateParam('nBinom', +e.target.value)} className="w-full h-1 bg-border/40 rounded-full appearance-none accent-secondary" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-medium text-muted">
                                            <span>Probability (p)</span>
                                            <span className="font-mono text-secondary">{params.pBinom.toFixed(2)}</span>
                                        </div>
                                        <input type="range" min="0.05" max="0.95" step="0.05" value={params.pBinom} onChange={e => updateParam('pBinom', +e.target.value)} className="w-full h-1 bg-border/40 rounded-full appearance-none accent-secondary" />
                                    </div>
                                </>
                            )}
                            {activeDist === 'poisson' && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-medium text-muted">
                                        <span>Rate (λ)</span>
                                        <span className="font-mono text-emerald-500">{params.lambda.toFixed(1)}</span>
                                    </div>
                                    <input type="range" min="0.5" max="15" step="0.5" value={params.lambda} onChange={e => updateParam('lambda', +e.target.value)} className="w-full h-1 bg-border/40 rounded-full appearance-none accent-emerald-500" />
                                </div>
                            )}
                            {activeDist === 'uniform' && (
                                <>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-medium text-muted">
                                            <span>Min (a)</span>
                                            <span className="font-mono text-accent">{params.uniformA.toFixed(1)}</span>
                                        </div>
                                        <input type="range" min="-5" max="0" step="0.5" value={params.uniformA} onChange={e => updateParam('uniformA', +e.target.value)} className="w-full h-1 bg-border/40 rounded-full appearance-none accent-accent" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-medium text-muted">
                                            <span>Max (b)</span>
                                            <span className="font-mono text-accent">{params.uniformB.toFixed(1)}</span>
                                        </div>
                                        <input type="range" min="1" max="10" step="0.5" value={params.uniformB} onChange={e => updateParam('uniformB', +e.target.value)} className="w-full h-1 bg-border/40 rounded-full appearance-none accent-accent" />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="bg-surface/80 border border-border rounded-lg p-4 space-y-3">
                        <div className="text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border pb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">analytics</span>
                            Live Statistics
                        </div>
                        <div className="space-y-2.5">
                            {[
                                { label: "Expected Value", val: currentStats.mean.toFixed(2), color: "text-foreground" },
                                { label: "Variance", val: currentStats.variance.toFixed(2), color: "text-muted" },
                                { label: "Skewness", val: currentStats.skew.toFixed(2), color: "text-muted" },
                                { label: "Support", val: currentStats.support, color: "text-accent/80 font-mono tracking-tighter" },
                            ].map(s => (
                                <div key={s.label} className="flex items-center justify-between">
                                    <span className="text-[10px] text-muted uppercase font-medium tracking-tight">{s.label}</span>
                                    <span className={`text-[11px] font-bold ${s.color}`}>{s.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-primary text-sm">history_edu</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-muted">Theory Context</span>
                        </div>
                        <p className="text-[10px] text-muted leading-relaxed">
                            {activeDist === 'normal' ? "The Gaussian distribution is the fundamental model for errors and natural variations via the Central Limit Theorem." :
                                activeDist === 'binomial' ? "Models the number of successes in fixed trials. Notice how it looks 'normal' as N increases (Galton's Law)." :
                                    activeDist === 'poisson' ? "Models events occurring at a constant rate. Used for queueing theory and radioactive decay." :
                                        "Every outcome in the range is equally likely. The default model for total uncertainty."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

