"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Constants & Types ───────────────────────────────────────────────────────
const W = 660, H = 400;
const HISTORY_STEP = 10;
const MAX_N = 2500;

type DistributionKey = 'fair_die' | 'coin' | 'exponential' | 'skewed';

interface Distribution {
    name: string;
    mu: number;
    sample: () => number;
}

const DISTRIBUTIONS: Record<DistributionKey, Distribution> = {
    fair_die: { name: 'Fair Die', mu: 3.5, sample: () => Math.floor(Math.random() * 6) + 1 },
    coin: { name: 'Coin Flip', mu: 0.5, sample: () => Math.random() < 0.5 ? 0 : 1 },
    exponential: { name: 'Exponential', mu: 2, sample: () => -2 * Math.log(1 - Math.random()) },
    skewed: {
        name: 'Skewed', mu: 1, sample: () => {
            const u1 = Math.random(), u2 = Math.random();
            return -Math.log(u1) - Math.log(u2);
        }
    }
};

interface Trial {
    id: string;
    color: string;
    sum: number;
    count: number;
    history: [number, number][]; // [n, runningMean]
}

const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
    "hsl(var(--emerald-500))",
    "hsl(var(--amber-500))",
    "hsl(var(--rose-500))"
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function LawOfLargeNumbersPrimitive() {
    const [distKey, setDistKey] = useState<DistributionKey>('fair_die');
    const [trials, setTrials] = useState<Trial[]>([]);
    const [running, setRunning] = useState(false);
    const [speed, setSpeed] = useState(100);
    const [n, setN] = useState(0);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const trialsRef = useRef<Trial[]>([]);
    const requestRef = useRef<number | undefined>(undefined);

    const currentDist = DISTRIBUTIONS[distKey];

    // Initialize
    const reset = useCallback((initialCount = 3) => {
        setRunning(false);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);

        const newTrials: Trial[] = Array.from({ length: initialCount }).map((_, i) => ({
            id: Math.random().toString(36).substr(2, 9),
            color: COLORS[i % COLORS.length],
            sum: 0,
            count: 0,
            history: [[0, 0]]
        }));

        trialsRef.current = newTrials;
        setTrials(newTrials);
        setN(0);
    }, []);

    useEffect(() => { reset(3); }, [reset, distKey]);

    const addTrial = () => {
        if (trialsRef.current.length >= COLORS.length) return;
        const newTrial: Trial = {
            id: Math.random().toString(36).substr(2, 9),
            color: COLORS[trialsRef.current.length],
            sum: 0,
            count: 0,
            history: [[0, 0]]
        };
        trialsRef.current = [...trialsRef.current, newTrial];
        setTrials(trialsRef.current);
    };

    const update = useCallback(() => {
        const activeDist = DISTRIBUTIONS[distKey];
        let maxNReached = true;

        for (const t of trialsRef.current) {
            if (t.count < MAX_N) {
                maxNReached = false;
                for (let i = 0; i < speed; i++) {
                    if (t.count >= MAX_N) break;
                    t.sum += activeDist.sample();
                    t.count++;
                    if (t.count % HISTORY_STEP === 0) {
                        t.history.push([t.count, t.sum / t.count]);
                    }
                }
            }
        }

        const currentMaxN = Math.max(...trialsRef.current.map(t => t.count));
        setN(currentMaxN);
        setTrials([...trialsRef.current]);

        if (maxNReached) {
            setRunning(false);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        }
    }, [distKey, speed]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, W, H);

        // Margins
        const M = { top: 30, right: 60, bottom: 50, left: 60 };
        const CW = W - M.left - M.right;
        const CH = H - M.top - M.bottom;

        const mu = DISTRIBUTIONS[distKey].mu;

        // Scale Logic
        const allMeans = trialsRef.current.flatMap(t => t.history.map(h => h[1])).filter(v => v > 0);
        let yMin = allMeans.length ? Math.min(...allMeans, mu) : 0;
        let yMax = allMeans.length ? Math.max(...allMeans, mu) : mu * 2;
        const yPad = (yMax - yMin) * 0.2 || 0.5;
        yMin -= yPad; yMax += yPad;

        const toX = (val: number) => M.left + (val / MAX_N) * CW;
        const toY = (val: number) => M.top + CH - ((val - yMin) / (yMax - yMin) * CH);

        // Grid Pins & Lines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;

        // Y-Axis Ticks
        ctx.font = "9px var(--font-jetbrains)";
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.textAlign = "right";
        for (let i = 0; i <= 5; i++) {
            const val = yMin + (yMax - yMin) * i / 5;
            const py = toY(val);
            ctx.beginPath(); ctx.moveTo(M.left, py); ctx.lineTo(M.left + CW, py); ctx.stroke();
            ctx.fillText(val.toFixed(1), M.left - 10, py + 3);
        }

        // X-Axis Ticks
        ctx.textAlign = "center";
        [0, 500, 1000, 1500, 2000, 2500].forEach(tx => {
            const px = toX(tx);
            ctx.beginPath(); ctx.moveTo(px, M.top); ctx.lineTo(px, M.top + CH); ctx.stroke();
            ctx.fillText(tx.toString(), px, M.top + CH + 20);
        });

        // TRUE VALUE LINE
        const muY = toY(mu);
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = "hsla(var(--emerald-500), 0.6)";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(M.left, muY); ctx.lineTo(M.left + CW, muY); ctx.stroke();
        ctx.setLineDash([]);

        // Label for mu
        ctx.fillStyle = "hsl(var(--emerald-500))";
        ctx.font = "bold 10px var(--font-jetbrains)";
        ctx.textAlign = "left";
        ctx.fillText(`μ = ${mu}`, M.left + CW + 10, muY + 3);

        // Draw Trials
        trialsRef.current.forEach(t => {
            if (t.history.length < 2) return;

            ctx.beginPath();
            ctx.strokeStyle = t.color;
            ctx.lineWidth = 2;
            ctx.lineJoin = "round";

            t.history.forEach(([tn, tm], idx) => {
                if (tn === 0) return;
                const px = toX(tn), py = toY(tm);
                idx === 1 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
            });
            ctx.stroke();

            // End Dot
            const last = t.history[t.history.length - 1];
            if (last[0] > 0) {
                ctx.beginPath();
                ctx.arc(toX(last[0]), toY(last[1]), 4, 0, Math.PI * 2);
                ctx.fillStyle = t.color;
                ctx.fill();
                ctx.strokeStyle = "black";
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });

        // Border
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 2;
        ctx.strokeRect(M.left, M.top, CW, CH);

    }, [distKey]);

    const animate = useCallback(() => {
        if (running) update();
        draw();
        requestRef.current = requestAnimationFrame(animate);
    }, [running, update, draw]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, [animate]);

    // Insights
    const convergence = useMemo(() => {
        if (n === 0) return 0;
        const mu = currentDist.mu;
        const distances = trialsRef.current.map(t => Math.abs((t.sum / t.count) - mu) / mu);
        const avgDist = distances.reduce((a, b) => a + b, 0) / distances.length;
        return Math.max(0, Math.min(100, (1 - avgDist * 4) * 100));
    }, [n, currentDist, trials]);

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">trending_flat</span>
                        The Law of Large Numbers
                    </h3>
                    <p className="text-xs text-muted/60 italic lowercase">Watching randomness converge into truth (N={n})</p>
                </div>
                <div className="flex items-center gap-2">
                    {(Object.keys(DISTRIBUTIONS) as DistributionKey[]).map(k => (
                        <button
                            key={k}
                            onClick={() => setDistKey(k)}
                            className={`px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase transition-all ${distKey === k ? "bg-emerald-500/20 border-emerald-500 text-emerald-500" : "bg-surface border-border text-muted hover:border-muted"
                                }`}
                        >
                            {DISTRIBUTIONS[k].name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-4">
                    <div className="bg-black/40 border border-border/50 rounded-xl overflow-hidden shadow-2xl relative">
                        <canvas ref={canvasRef} width={W} height={H} className="w-full h-auto" />
                        {!running && n === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                                <button onClick={() => setRunning(true)} className="px-6 py-3 bg-emerald-500 text-black font-black rounded-lg text-xs tracking-widest uppercase hover:scale-105 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                                    Begin Simulation
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="col-span-1 bg-surface/80 border border-border rounded-lg p-4 space-y-3">
                            <div className="text-[10px] font-bold text-muted uppercase tracking-widest">Simulation Speed</div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] text-muted/60">
                                    <span>Slower</span>
                                    <span className="text-emerald-500 font-mono font-bold">{speed}x</span>
                                </div>
                                <input
                                    type="range" min="10" max="800" step="10"
                                    value={speed} onChange={e => setSpeed(+e.target.value)}
                                    className="w-full h-1 bg-border rounded-full appearance-none accent-emerald-500"
                                />
                            </div>
                        </div>
                        <div className="col-span-2 flex gap-2">
                            <button
                                onClick={() => setRunning(!running)}
                                className={`flex-1 rounded-lg border font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${running ? "bg-rose-500/20 border-rose-500 text-rose-500" : "bg-emerald-500/20 border-emerald-500 text-emerald-500"
                                    }`}
                            >
                                <span className="material-symbols-outlined text-sm">{running ? "pause" : "play_arrow"}</span>
                                {running ? "Pause" : "Run Sampling"}
                            </button>
                            <button onClick={addTrial} className="px-4 bg-surface border border-border rounded-lg text-muted hover:text-white transition-all">
                                <span className="material-symbols-outlined text-sm">add</span>
                            </button>
                            <button onClick={() => reset()} className="px-4 bg-surface border border-border rounded-lg text-muted hover:text-rose-400 transition-all">
                                <span className="material-symbols-outlined text-sm">refresh</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
                        <div className="text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border pb-2">Running Trial Means</div>
                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                            {trials.map((t, idx) => {
                                const currentMean = t.count > 0 ? (t.sum / t.count) : 0;
                                const diff = Math.abs(currentMean - currentDist.mu);
                                return (
                                    <div key={t.id} className="flex items-center justify-between text-[11px]">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                                            <span className="text-muted font-medium">Trial {idx + 1}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono font-bold">{currentMean.toFixed(3)}</span>
                                            <span className={`text-[9px] font-mono ${diff < 0.01 ? "text-emerald-500" : "text-muted/40"}`}>
                                                Δ{diff.toFixed(3)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-surface/80 border border-border rounded-xl p-5 space-y-4 text-center">
                        <div className="text-[10px] font-bold text-muted uppercase tracking-widest">Convergence Meter</div>
                        <div className="relative inline-flex items-center justify-center">
                            <svg className="w-24 h-24 transform -rotate-90">
                                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-border/40" />
                                <motion.circle
                                    cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                                    className="text-emerald-500"
                                    style={{ strokeDasharray: 251.2, strokeDashoffset: 251.2 - (251.2 * convergence / 100) }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-lg font-black font-mono leading-none">{convergence.toFixed(0)}%</span>
                                <span className="text-[8px] text-muted uppercase font-bold tracking-tighter">Unified</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-muted leading-relaxed px-2">
                            At <span className="text-foreground">N={n.toLocaleString()}</span>, the mathematical truth is successfully drowning out the short-term noise.
                        </p>
                    </div>

                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex gap-3">
                        <span className="material-symbols-outlined text-emerald-500">psychology</span>
                        <p className="text-[10px] text-muted leading-relaxed">
                            <span className="text-emerald-500 font-bold uppercase italic">The Axiom:</span> In the short term, randomness is chaos. In the long term, it is perfectly predictable. This is the bedrock of insurance, gambling, and probability theory.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
