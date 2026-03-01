"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── Constants ───────────────────────────────────────────────────────────────
const W = 600, H = 360;
const X_MIN = -4, X_MAX = 4;
const N_BINS = 30;
const MEAN = 0, STD = 1;
const SAMPLE_SIZES = [10, 50, 200, 1000, 5000, 10000];

// ─── Math Utils ─────────────────────────────────────────────────────────────
function randNormal(mean = 0, std = 1) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function normalPDF(x: number, mean: number, std: number) {
    return (1 / (std * Math.sqrt(2 * Math.PI))) *
        Math.exp(-0.5 * ((x - mean) / std) ** 2);
}

function buildHistogram(samples: number[]) {
    const binWidth = (X_MAX - X_MIN) / N_BINS;
    const counts = new Array(N_BINS).fill(0);
    samples.forEach(v => {
        const bin = Math.floor((v - X_MIN) / binWidth);
        if (bin >= 0 && bin < N_BINS) counts[bin]++;
    });
    return counts;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function DescriptiveStatisticsPrimitive() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<NodeJS.Timeout | null>(null);

    const [nIndex, setNIndex] = useState(2); // Start with n=200
    const [samples, setSamples] = useState<number[]>([]);
    const [animating, setAnimating] = useState(false);
    const [showCurve, setShowCurve] = useState(true);

    const N = SAMPLE_SIZES[nIndex];

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

    useEffect(() => {
        setSamples(Array.from({ length: N }, () => randNormal(MEAN, STD)));
    }, [N]);

    const stats = useMemo(() => {
        if (samples.length === 0) return { mean: "—", std: "—" };
        const m = samples.reduce((a, b) => a + b, 0) / samples.length;
        const v = samples.reduce((a, b) => a + (b - m) ** 2, 0) / samples.length;
        return { mean: m.toFixed(3), std: Math.sqrt(v).toFixed(3) };
    }, [samples]);

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || samples.length === 0) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, W, H);
        const PAD = { top: 30, right: 30, bottom: 50, left: 60 };
        const pW = W - PAD.left - PAD.right;
        const pH = H - PAD.top - PAD.bottom;

        // Grid System
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = PAD.top + (i / 4) * pH;
            ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + pW, y); ctx.stroke();
        }

        // Histogram Calculation
        const counts = buildHistogram(samples);
        const binWidth = (X_MAX - X_MIN) / N_BINS;
        const _densities = counts.map(c => c / (samples.length * binWidth));
        const maxDensity = 0.5; // Fixed scale for better comparison across N
        const barW = (pW / N_BINS) - 1;

        // Draw Histogram
        counts.forEach((c, i) => {
            const density = c / (samples.length * binWidth);
            const bH = (density / maxDensity) * pH;
            const x = PAD.left + (i / N_BINS) * pW + 0.5;
            const y = PAD.top + pH - bH;

            const grad = ctx.createLinearGradient(x, y, x, y + bH);
            grad.addColorStop(0, "rgba(59, 130, 246, 0.8)"); // blue-500
            grad.addColorStop(1, "rgba(59, 130, 246, 0.2)");

            ctx.fillStyle = grad;
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(x, y, barW, bH, [3, 3, 0, 0]);
            } else {
                ctx.rect(x, y, barW, bH);
            }
            ctx.fill();
        });

        // Draw Ideal PDF Curve
        if (showCurve) {
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = "#D4D4D4";
            ctx.lineWidth = 2.5;
            ctx.shadowColor = "#D4D4D4";
            ctx.shadowBlur = 8;

            for (let i = 0; i <= 150; i++) {
                const x = X_MIN + (i / 150) * (X_MAX - X_MIN);
                const pdf = normalPDF(x, MEAN, STD);
                const cx = PAD.left + ((x - X_MIN) / (X_MAX - X_MIN)) * pW;
                const cy = PAD.top + pH - (pdf / maxDensity) * pH;
                if (i === 0) { ctx.moveTo(cx, cy); } else { ctx.lineTo(cx, cy); }
            }
            ctx.stroke();
            ctx.restore();
        }

        // Axes
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(PAD.left, PAD.top);
        ctx.lineTo(PAD.left, PAD.top + pH);
        ctx.lineTo(PAD.left + pW, PAD.top + pH);
        ctx.stroke();

        // Labels
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.font = "10px var(--font-jetbrains)";
        ctx.textAlign = "center";

        [-3, -2, -1, 0, 1, 2, 3].forEach(v => {
            const cx = PAD.left + ((v - X_MIN) / (X_MAX - X_MIN)) * pW;
            ctx.fillText(v === 0 ? "μ" : `${v}σ`, cx, PAD.top + pH + 20);
        });

        ctx.save();
        ctx.translate(20, PAD.top + pH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText("Probability Density", 0, 0);
        ctx.restore();

    }, [samples, showCurve]);

    useEffect(() => { render(); }, [render]);

    const autoPlay = useCallback(() => {
        setAnimating(true);
        let idx = 0;
        setNIndex(0);

        function advance() {
            idx++;
            if (idx >= SAMPLE_SIZES.length) {
                setAnimating(false);
                return;
            }
            setNIndex(idx);
            animRef.current = setTimeout(advance, reducedMotion ? 400 : 800);
        }
        animRef.current = setTimeout(advance, 800);
    }, [reducedMotion]);

    useEffect(() => () => { if (animRef.current) clearTimeout(animRef.current); }, []);

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">analytics</span>
                        Distribution Convergence
                    </h3>
                    <p className="text-xs text-muted/60 italic">From individual chaos to predictable geometry</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-center">
                        <div className="text-[10px] font-mono text-muted uppercase tracking-wider">Mean</div>
                        <div className={`text-sm font-bold ${Math.abs(+stats.mean) < 0.1 ? 'text-emerald-400' : 'text-foreground'}`}>{stats.mean}</div>
                    </div>
                    <div className="text-center border-l border-border pl-4">
                        <div className="text-[10px] font-mono text-muted uppercase tracking-wider">Std Dev</div>
                        <div className={`text-sm font-bold ${Math.abs(+stats.std - 1) < 0.1 ? 'text-emerald-400' : 'text-foreground'}`}>{stats.std}</div>
                    </div>
                </div>
            </div>

            <div className="relative rounded bg-slate-950/40 border border-border/50 overflow-hidden shadow-2xl">
                <canvas ref={canvasRef} width={W} height={H} className="w-full h-auto block" />
                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded border border-white/5 font-mono text-xs text-blue-400 font-bold">
                    n = {N.toLocaleString()}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-muted uppercase tracking-tight">Select Sample Size</label>
                    <div className="flex gap-1.5">
                        {SAMPLE_SIZES.map((s, i) => (
                            <button
                                key={s}
                                onClick={() => !animating && setNIndex(i)}
                                disabled={animating}
                                className={`text-[10px] font-mono px-2 py-0.5 rounded transition-all ${i === nIndex ? 'bg-primary text-white' : 'bg-surface hover:bg-surface/70 text-muted'}`}
                            >
                                {s >= 1000 ? `${s / 1000}k` : s}
                            </button>
                        ))}
                    </div>
                </div>
                <input
                    type="range" min={0} max={SAMPLE_SIZES.length - 1} step={1}
                    value={nIndex} onChange={e => !animating && setNIndex(+e.target.value)}
                    className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={autoPlay}
                    disabled={animating}
                    className={`flex-1 flex items-center justify-center gap-2 px-8 py-3 rounded-full font-bold text-xs tracking-widest transition-all ${animating
                        ? 'bg-primary/20 text-primary cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
                        }`}
                >
                    <span className="material-symbols-outlined text-base">
                        {animating ? 'hourglass_empty' : 'play_arrow'}
                    </span>
                    {animating ? 'CONVERGING...' : 'AUTO CONVERGE'}
                </button>

                <label className="flex items-center gap-3 px-6 py-3 rounded-full border border-border bg-surface/50 text-muted hover:text-foreground cursor-pointer transition-all">
                    <input
                        type="checkbox" checked={showCurve} onChange={e => setShowCurve(e.target.checked)}
                        className="w-4 h-4 accent-primary rounded border-border"
                    />
                    <span className="text-xs font-bold uppercase tracking-wider">Show Ideal Form</span>
                </label>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
                <p className="text-xs text-muted leading-relaxed text-center">
                    <span className="text-foreground font-semibold uppercase tracking-tighter">Law of Large Numbers:</span>
                    Observe how the histogram bars merge into the smooth <span className="text-primary font-bold">Bell Curve</span> as sample size increases. At small <span className="font-mono">n</span>, the mean is an accident; at large <span className="font-mono">n</span>, it is a mathematical certainty.
                </p>
            </div>
        </div>
    );
}

