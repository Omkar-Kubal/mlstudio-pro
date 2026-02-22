"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Constants ───────────────────────────────────────────────────────────────
const POP_SIZE = 2000;
const W_POP = 400, H_POP = 240;
const W_HIST = 320, H_HIST = 240;
const SAMPLE_OPTIONS = [10, 50, 100, 300];

// ─── Math Utils ─────────────────────────────────────────────────────────────
function randNormal(mean = 0, std = 1) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function randPopulation() {
    const which = Math.random();
    if (which < 0.6) return randNormal(35, 8);
    return randNormal(65, 12);
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function PopulationSamplePrimitive() {
    const popCanvasRef = useRef<HTMLCanvasElement>(null);
    const histCanvasRef = useRef<HTMLCanvasElement>(null);

    const [population] = useState(() => Array.from({ length: POP_SIZE }, () => ({
        v: randPopulation(),
        x: Math.random(),
        y: Math.random(),
    })));

    const [sampleSize, setSampleSize] = useState(50);
    const [sample, setSample] = useState<any[]>([]);
    const [biased, setBiased] = useState(false);
    const [scooping, setScooping] = useState(false);

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

    const scoop = useCallback(() => {
        setScooping(true);
        const delay = reducedMotion ? 100 : 400;

        setTimeout(() => {
            let s;
            if (biased) {
                // Biased: only sample from lower half of value space (< 45)
                const pool = population.filter(p => p.v < 45);
                s = Array.from({ length: Math.min(sampleSize, pool.length) }, () =>
                    pool[Math.floor(Math.random() * pool.length)]);
            } else {
                s = Array.from({ length: sampleSize }, () =>
                    population[Math.floor(Math.random() * population.length)]);
            }
            setSample(s);
            setScooping(false);
        }, delay);
    }, [population, sampleSize, biased, reducedMotion]);

    // Initial scoop
    useEffect(() => { scoop(); }, []);

    // Render Population Cloud
    useEffect(() => {
        const canvas = popCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, W_POP, H_POP);

        // Smooth rendering for points
        population.forEach(p => {
            const cx = p.x * (W_POP - 20) + 10;
            const cy = p.y * (H_POP - 20) + 10;
            const inSample = sample.some(s => s.x === p.x && s.y === p.y);

            ctx.beginPath();
            ctx.arc(cx, cy, inSample ? 3.5 : 1.5, 0, Math.PI * 2);

            if (inSample) {
                ctx.fillStyle = "hsl(var(--primary))";
                ctx.globalAlpha = 1;
                ctx.shadowBlur = 4;
                ctx.shadowColor = "hsl(var(--primary))";
            } else {
                ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
                ctx.globalAlpha = 0.3;
                ctx.shadowBlur = 0;
            }
            ctx.fill();
        });

        ctx.restore();
    }, [population, sample]);

    // Render Histogram
    useEffect(() => {
        const canvas = histCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, W_HIST, H_HIST);

        const N_BINS = 20, XMIN = 0, XMAX = 100;
        const BW = (XMAX - XMIN) / N_BINS;
        const PAD = { top: 30, right: 20, bottom: 40, left: 50 };
        const pW = W_HIST - PAD.left - PAD.right;
        const pH = H_HIST - PAD.top - PAD.bottom;

        function buildHist(data: number[]) {
            const bins = new Array(N_BINS).fill(0);
            data.forEach(v => {
                const b = Math.floor((v - XMIN) / BW);
                if (b >= 0 && b < N_BINS) bins[b]++;
            });
            return bins;
        }

        const popHist = buildHist(population.map(p => p.v));
        const samHist = sample.length ? buildHist(sample.map(p => p.v)) : null;
        const maxPopCount = Math.max(...popHist);

        // Gridlines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        for (let i = 0; i <= 3; i++) {
            const y = PAD.top + (i / 3) * pH;
            ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + pW, y); ctx.stroke();
        }

        const barW = pW / N_BINS;

        // Population Bars (Reference)
        popHist.forEach((c, i) => {
            const bH = (c / maxPopCount) * pH;
            const x = PAD.left + i * barW;
            const y = PAD.top + pH - bH;
            ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
            ctx.fillRect(x + 1, y, barW - 2, bH);
        });

        // Sample Bars (Overlay)
        if (samHist) {
            const samMax = Math.max(...samHist);
            samHist.forEach((c, i) => {
                if (c === 0) return;
                const bH = (c / Math.max(samMax, 1)) * pH * 0.9;
                const x = PAD.left + i * barW;
                const y = PAD.top + pH - bH;

                ctx.fillStyle = "hsl(var(--primary))";
                ctx.globalAlpha = 0.8;
                ctx.beginPath();
                if (ctx.roundRect) ctx.roundRect(x + 1, y, barW - 2, bH, [2, 2, 0, 0]);
                else ctx.rect(x + 1, y, barW - 2, bH);
                ctx.fill();
                ctx.globalAlpha = 1;
            });
        }

        // Axes
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(PAD.left, PAD.top);
        ctx.lineTo(PAD.left, PAD.top + pH);
        ctx.lineTo(PAD.left + pW, PAD.top + pH);
        ctx.stroke();

        // X Labels
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.font = "9px var(--font-jetbrains)";
        ctx.textAlign = "center";
        [0, 25, 50, 75, 100].forEach(v => {
            const cx = PAD.left + (v / 100) * pW;
            ctx.fillText(v.toString(), cx, PAD.top + pH + 15);
        });

        // Stats Comparison Readout inside canvas
        if (sample.length) {
            const popMean = (population.reduce((a, b) => a + b.v, 0) / POP_SIZE).toFixed(1);
            const samMean = (sample.reduce((a, b) => a + b.v, 0) / sample.length).toFixed(1);
            const diff = Math.abs(+popMean - +samMean).toFixed(1);
            const isClose = +diff < 5;

            ctx.textAlign = "right";
            ctx.font = "10px var(--font-jetbrains)";
            ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
            ctx.fillText(`Pop μ: ${popMean}`, PAD.left + pW - 10, PAD.top + 15);
            ctx.fillStyle = "hsl(var(--primary))";
            ctx.fillText(`Sample μ: ${samMean}`, PAD.left + pW - 10, PAD.top + 30);
            ctx.fillStyle = isClose ? "#10b981" : "#f43f5e"; // emerald-500 : rose-500
            ctx.fillText(`Error: ${diff}`, PAD.left + pW - 10, PAD.top + 45);
        }
    }, [population, sample]);

    const popMeanVal = useMemo(() => (population.reduce((a, b) => a + b.v, 0) / POP_SIZE).toFixed(1), [population]);
    const samMeanVal = useMemo(() => sample.length ? (sample.reduce((a, b) => a + b.v, 0) / sample.length).toFixed(1) : "—", [sample]);
    const diffVal = useMemo(() => sample.length ? Math.abs(+popMeanVal - +samMeanVal).toFixed(1) : "—", [popMeanVal, samMeanVal]);
    const representative = sample.length ? (+diffVal < 5) : true;

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6">
            {/* Header Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">group</span>
                        Population Inference
                    </h3>
                    <p className="text-xs text-muted/60">Estimating truth from a subset of reality</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-center">
                        <div className="text-[10px] font-mono text-muted uppercase tracking-wider">Population μ</div>
                        <div className="text-sm font-bold text-foreground">{popMeanVal}</div>
                    </div>
                    <div className="text-center border-l border-border pl-4">
                        <div className="text-[10px] font-mono text-muted uppercase tracking-wider">Sample μ</div>
                        <div className={`text-sm font-bold ${representative ? 'text-primary' : 'text-rose-500'}`}>{samMeanVal}</div>
                    </div>
                </div>
            </div>

            {/* Main Container for Canvases */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Population cloud */}
                <div className="space-y-2">
                    <div className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">Universe (N=2,000)</div>
                    <div className="relative rounded bg-slate-950/40 border border-border/50 overflow-hidden shadow-xl">
                        <canvas ref={popCanvasRef} width={W_POP} height={H_POP} className="w-full h-auto block" />
                        {scooping && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-primary/10 backdrop-blur-[1px] flex items-center justify-center"
                            >
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Histogram */}
                <div className="space-y-2">
                    <div className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">Property Distribution</div>
                    <div className="relative rounded bg-slate-950/40 border border-border/50 overflow-hidden shadow-xl">
                        <canvas ref={histCanvasRef} width={W_HIST} height={H_HIST} className="w-full h-auto block" />
                    </div>
                </div>
            </div>

            {/* Control Panel */}
            <div className="flex flex-col lg:flex-row gap-6 p-4 bg-surface rounded-lg border border-border/30">
                {/* Sample size */}
                <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Ladle Size (n)</label>
                        <span className="text-xs font-mono text-primary font-bold">{sampleSize}</span>
                    </div>
                    <div className="flex gap-2">
                        {SAMPLE_OPTIONS.map(s => (
                            <button
                                key={s}
                                onClick={() => setSampleSize(s)}
                                className={`flex-1 text-[10px] font-mono py-1.5 rounded transition-all border ${s === sampleSize
                                        ? 'bg-primary border-primary text-white shadow-lg'
                                        : 'bg-surface/50 border-border/50 text-muted hover:border-muted'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Action Toggle */}
                <div className="flex-1 space-y-3">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Sampling Method</label>
                    <button
                        onClick={() => setBiased(!biased)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded border transition-all ${biased
                                ? 'bg-rose-500/10 border-rose-500/50 text-rose-500'
                                : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">
                                {biased ? 'error' : 'check_circle'}
                            </span>
                            <span className="text-[10px] font-bold tracking-tight">
                                {biased ? 'BIASED (LOW ONLY)' : 'RANDOM MIX'}
                            </span>
                        </div>
                        <div className={`w-8 h-4 rounded-full relative transition-colors ${biased ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                            <motion.div
                                animate={{ x: biased ? 16 : 2 }}
                                className="absolute top-1 w-2 h-2 bg-white rounded-full"
                            />
                        </div>
                    </button>
                </div>

                {/* Scoop Button */}
                <div className="lg:w-48 flex items-end">
                    <button
                        onClick={scoop}
                        disabled={scooping}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-md font-bold text-[10px] tracking-[0.2em] transition-all shadow-lg ${scooping
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-primary text-white hover:bg-primary/90 shadow-primary/20 hover:scale-[1.02]'
                            }`}
                    >
                        <span className="material-symbols-outlined text-base">restaurant</span>
                        {scooping ? 'SCOOPING...' : 'TAKE SAMPLE'}
                    </button>
                </div>
            </div>

            {/* Insight Alert */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={biased ? "biased" : "random"}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg flex items-start gap-3 border ${biased
                            ? 'bg-rose-500/5 border-rose-500/10 text-rose-200/70'
                            : 'bg-primary/5 border-primary/10 text-muted'
                        }`}
                >
                    <span className={`material-symbols-outlined text-lg ${biased ? 'text-rose-500' : 'text-primary'}`}>
                        {biased ? 'report' : 'lightbulb'}
                    </span>
                    <p className="text-xs leading-relaxed italic">
                        {biased ? (
                            <><strong>Warning: Bias Detected.</strong> By only selecting from the "lower half" of the pot, your sample (μ={samMeanVal}) fails to represent the true population. In ML, this is identical to training on non-representative data.</>
                        ) : (
                            <><strong>Inference Success:</strong> Notice how even a small sample (n=50) captures the bimodal shape and mean of the 2,000-person population. Statistical sampling is the "cheat code" of science.</>
                        )}
                    </p>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
