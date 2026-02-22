"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Constants & Types ───────────────────────────────────────────────────────
const TW = 900, TH = 180;
const LANE_COUNT = 5;
const LANE_H = TH / LANE_COUNT;
const SPARK_COLORS = ['#e63946', '#f4a261', '#e9c46a', '#10b981', '#3b82f6'];

interface Spark {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    size: number;
}

interface TimelineInterval {
    events: number[];
    count: number;
}

interface Example {
    emoji: string;
    label: string;
    lambda: number;
    desc: string;
}

const EXAMPLES: Example[] = [
    { emoji: "🌧", label: "Raindrops", lambda: 3, desc: "Raindrops hitting a specific tile per minute." },
    { emoji: "📞", label: "Call Center", lambda: 1, desc: "Incoming customer calls per minute." },
    { emoji: "🚗", label: "Road Accidents", lambda: 0.5, desc: "Minor traffic accidents in a city district per day." },
    { emoji: "📧", label: "Inbound Emails", lambda: 7, desc: "Emails received by a busy professional per hour." }
];

// ─── Mathematical Helpers ───────────────────────────────────────────────────
const poissonPMF = (k: number, lam: number) => {
    let logP = k * Math.log(lam) - lam;
    for (let i = 1; i <= k; i++) logP -= Math.log(i);
    return Math.exp(logP);
};

const poissonSample = (lam: number) => {
    const L = Math.exp(-lam);
    let k = 0, p = 1;
    do { k++; p *= Math.random(); } while (p > L);
    return k - 1;
};

// ─── Component ──────────────────────────────────────────────────────────────
export default function PoissonDistributionPrimitive() {
    const [lambda, setLambda] = useState(3);
    const [intervals, setIntervals] = useState<TimelineInterval[]>([]);
    const [simCounts, setSimCounts] = useState<number[]>([]);
    const [activeExample, setActiveExample] = useState(0);

    const timelineRef = useRef<HTMLCanvasElement>(null);
    const pmfRef = useRef<HTMLCanvasElement>(null);
    const histRef = useRef<HTMLCanvasElement>(null);
    const sparksRef = useRef<Spark[]>([]);
    const requestRef = useRef<number | undefined>(undefined);

    // ─── Simulation Logic ───────────────────────────────────────────────────
    const simulateTimeline = useCallback(() => {
        const newIntervals: TimelineInterval[] = [];
        for (let i = 0; i < LANE_COUNT; i++) {
            const count = poissonSample(lambda);
            const events = Array.from({ length: count }).map(() => Math.random()).sort((a, b) => a - b);
            newIntervals.push({ events, count });
        }
        setIntervals(newIntervals);

        // Trigger sparks
        sparksRef.current = [];
        const intervalW = (TW - 120) / LANE_COUNT;
        newIntervals.forEach((interval, lane) => {
            const ly = lane * LANE_H + LANE_H / 2;
            interval.events.forEach((t, ei) => {
                const ex = 60 + lane * intervalW + t * intervalW;
                setTimeout(() => {
                    for (let p = 0; p < 10; p++) {
                        const angle = Math.random() * Math.PI * 2;
                        const speed = 1 + Math.random() * 2;
                        sparksRef.current.push({
                            x: ex, y: ly,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed,
                            life: 1.0,
                            color: SPARK_COLORS[ei % SPARK_COLORS.length],
                            size: 1 + Math.random() * 2
                        });
                    }
                }, lane * 100 + ei * 50);
            });
        });
    }, [lambda]);

    const simulateHistogram = useCallback(() => {
        const counts = new Array(30).fill(0);
        for (let i = 0; i < 1000; i++) {
            const k = poissonSample(lambda);
            if (k < 30) counts[k]++;
        }
        setSimCounts(counts);
    }, [lambda]);

    useEffect(() => {
        simulateTimeline();
        simulateHistogram();
    }, [simulateTimeline, simulateHistogram]);

    // ─── Animation Loop ─────────────────────────────────────────────────────
    const draw = useCallback(() => {
        // Timeline Draw
        const tlCtx = timelineRef.current?.getContext("2d");
        if (tlCtx) {
            tlCtx.clearRect(0, 0, TW, TH);
            tlCtx.fillStyle = "hsl(var(--surface))";
            tlCtx.fillRect(0, 0, TW, TH);

            const intervalW = (TW - 120) / LANE_COUNT;

            // Grid & Backgrounds
            for (let i = 0; i < LANE_COUNT; i++) {
                const lx = 60 + i * intervalW;
                const ly = i * LANE_H;

                tlCtx.fillStyle = i % 2 === 0 ? "rgba(255, 255, 255, 0.02)" : "rgba(255, 255, 255, 0.04)";
                tlCtx.fillRect(lx, ly, intervalW, LANE_H - 4);

                // Tick lines
                tlCtx.strokeStyle = "rgba(255, 255, 255, 0.05)";
                tlCtx.lineWidth = 1;
                tlCtx.beginPath();
                tlCtx.moveTo(lx, ly + LANE_H / 2);
                tlCtx.lineTo(lx + intervalW, ly + LANE_H / 2);
                tlCtx.stroke();

                // Labels
                tlCtx.fillStyle = "rgba(255, 255, 255, 0.2)";
                tlCtx.font = "9px var(--font-jetbrains)";
                tlCtx.textAlign = "right";
                tlCtx.fillText(`#${i + 1}`, lx - 10, ly + LANE_H / 2 + 4);

                // Events
                if (intervals[i]) {
                    intervals[i].events.forEach((t, ei) => {
                        const ex = lx + t * intervalW;
                        const color = SPARK_COLORS[ei % SPARK_COLORS.length];
                        tlCtx.beginPath();
                        tlCtx.arc(ex, ly + LANE_H / 2, 3, 0, Math.PI * 2);
                        tlCtx.fillStyle = color;
                        tlCtx.fill();

                        // Halo
                        tlCtx.globalAlpha = 0.2;
                        tlCtx.beginPath();
                        tlCtx.arc(ex, ly + LANE_H / 2, 6, 0, Math.PI * 2);
                        tlCtx.fill();
                        tlCtx.globalAlpha = 1;
                    });
                }
            }

            // Sparks
            sparksRef.current = sparksRef.current.filter(s => s.life > 0);
            sparksRef.current.forEach(s => {
                s.x += s.vx; s.y += s.vy;
                s.vy += 0.05; // gravity
                s.vx *= 0.96;
                s.life -= 0.02;
                tlCtx.globalAlpha = s.life;
                tlCtx.fillStyle = s.color;
                tlCtx.beginPath();
                tlCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                tlCtx.fill();
                tlCtx.globalAlpha = 1;
            });
        }

        // PMF Draw
        const pmfCtx = pmfRef.current?.getContext("2d");
        if (pmfCtx) {
            const w = 300, h = 200;
            pmfCtx.clearRect(0, 0, w, h);
            const m = { t: 20, r: 20, b: 30, l: 40 };
            const cw = w - m.l - m.r, ch = h - m.t - m.b;
            const maxK = Math.max(12, Math.ceil(lambda * 2.2));
            const barW = Math.max(2, cw / (maxK + 1) - 4);

            const probs = Array.from({ length: maxK + 1 }).map((_, k) => poissonPMF(k, lambda));
            const maxP = Math.max(...probs, 0.1);

            // Grid
            pmfCtx.strokeStyle = "rgba(255, 255, 255, 0.05)";
            pmfCtx.font = "8px var(--font-jetbrains)";
            pmfCtx.textAlign = "right";
            for (let i = 0; i <= 4; i++) {
                const py = m.t + ch * (1 - i / 4);
                pmfCtx.beginPath(); pmfCtx.moveTo(m.l, py); pmfCtx.lineTo(m.l + cw, py); pmfCtx.stroke();
                pmfCtx.fillStyle = "rgba(255, 255, 255, 0.4)";
                pmfCtx.fillText((maxP * i / 4).toFixed(2), m.l - 5, py + 3);
            }

            // Theoretical Bars
            probs.forEach((p, k) => {
                const bx = m.l + k * (cw / (maxK + 1));
                const bh = (p / maxP) * ch;
                const by = m.t + ch - bh;

                const grad = pmfCtx.createLinearGradient(0, by, 0, by + bh);
                grad.addColorStop(0, "hsl(var(--primary))");
                grad.addColorStop(1, "hsla(var(--primary), 0.2)");
                pmfCtx.fillStyle = grad;
                pmfCtx.fillRect(bx + 2, by, barW, bh);
            });
        }

        // Histogram Draw
        const histCtx = histRef.current?.getContext("2d");
        if (histCtx && simCounts.length > 0) {
            const w = 300, h = 200;
            histCtx.clearRect(0, 0, w, h);
            const m = { t: 20, r: 20, b: 30, l: 40 };
            const cw = w - m.l - m.r, ch = h - m.t - m.b;
            const maxK = Math.max(12, Math.ceil(lambda * 2.2));
            const barW = Math.max(2, cw / (maxK + 1) - 4);
            const maxCount = Math.max(...simCounts, 10);

            simCounts.slice(0, maxK + 1).forEach((count, k) => {
                const bx = m.l + k * (cw / (maxK + 1));
                const bh = (count / maxCount) * ch;
                const by = m.t + ch - bh;
                histCtx.fillStyle = "hsla(var(--emerald-500), 0.6)";
                histCtx.fillRect(bx + 2, by, barW, bh);

                // Theoretical Line Highlight
                const expected = poissonPMF(k, lambda) * 1000;
                const ty = m.t + ch - (expected / maxCount) * ch;
                histCtx.fillStyle = "white";
                histCtx.fillRect(bx + barW / 2 - 1, ty - 1, 3, 3);
            });
        }

        requestRef.current = requestAnimationFrame(draw);
    }, [lambda, intervals, simCounts]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(draw);
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, [draw]);

    // Stats
    const stats = useMemo(() => ({
        mean: lambda,
        variance: lambda,
        mode: Math.floor(lambda),
        skew: 1 / Math.sqrt(lambda)
    }), [lambda]);

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-2">
                    <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">shutter_speed</span>
                        The Poisson Distribution
                    </h3>
                    <p className="text-xs text-muted/60 max-w-lg">
                        Counting <span className="text-foreground font-bold">rare, independent events</span> in a fixed interval. Defined entirely by its rate parameter <span className="text-primary font-bold">λ (Lambda)</span>.
                    </p>
                </div>
                <div className="bg-black/40 border border-border/60 rounded-xl px-6 py-3 flex flex-col items-center justify-center min-w-[140px] shadow-inner">
                    <span className="text-[10px] uppercase font-bold text-muted/50 tracking-widest">Rate (λ)</span>
                    <span className="text-4xl font-black text-primary drop-shadow-[0_0_8px_rgba(230,57,70,0.4)]">{lambda.toFixed(1)}</span>
                </div>
            </div>

            {/* Timeline Pane */}
            <div className="bg-black/60 border border-border rounded-xl overflow-hidden shadow-2xl relative group">
                <div className="absolute top-3 left-4 flex gap-4 text-[9px] font-bold text-muted/40 uppercase tracking-widest z-10 pointer-events-none">
                    <span>Timeline Simulation</span>
                    <span className="text-primary italic animate-pulse">Running {LANE_COUNT} parallel intervals...</span>
                </div>
                <canvas ref={timelineRef} width={TW} height={TH} className="w-full h-auto" />
                <button
                    onClick={simulateTimeline}
                    className="absolute bottom-3 right-4 p-2 bg-primary/20 hover:bg-primary/40 border border-primary/40 rounded-full text-primary transition-all group-hover:scale-110"
                >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                </button>
            </div>

            {/* Interaction Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Distribution Charts */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-surface/80 border border-border rounded-xl p-5 space-y-4 shadow-xl">
                        <div className="flex justify-between items-center text-[10px] font-black text-muted uppercase tracking-tighter">
                            <span>Theoretical PMF P(X=k)</span>
                        </div>
                        <canvas ref={pmfRef} width={300} height={200} className="w-full h-auto" />
                    </div>
                    <div className="bg-surface/80 border border-border rounded-xl p-5 space-y-4 shadow-xl">
                        <div className="flex justify-between items-center text-[10px] font-black text-muted uppercase tracking-tighter">
                            <span>1000-Interval Simulation</span>
                            <span className="text-emerald-500 font-mono">N=1k</span>
                        </div>
                        <canvas ref={histRef} width={300} height={200} className="w-full h-auto" />
                    </div>
                </div>

                {/* Controls & Scenarios */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-surface border border-border rounded-xl p-5 space-y-6">
                        <div className="space-y-4">
                            <div className="text-[10px] font-black text-muted uppercase tracking-widest border-b border-border pb-2">Rate Adjustment</div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-[11px] font-bold">
                                    <span className="text-muted/60 italic lowercase">Lambda (λ)</span>
                                    <span className="text-primary">{lambda.toFixed(1)}</span>
                                </div>
                                <input
                                    type="range" min="0.5" max="15" step="0.5"
                                    value={lambda} onChange={e => setLambda(+e.target.value)}
                                    className="w-full h-1.5 bg-border rounded-full appearance-none accent-primary cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: "Mean", val: stats.mean.toFixed(1), icon: "equalizer" },
                                { label: "Variance", val: stats.variance.toFixed(1), icon: "vibration" },
                                { label: "Mode", val: stats.mode, icon: "vertical_align_top" },
                                { label: "Skew", val: stats.skew.toFixed(2), icon: "align_horizontal_left" },
                            ].map(s => (
                                <div key={s.label} className="bg-surface2 p-3 rounded-lg border border-border/40 text-center">
                                    <span className="text-[9px] font-bold text-muted uppercase block mb-1 opacity-60 tracking-tighter">{s.label}</span>
                                    <span className="text-lg font-black text-foreground">{s.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
                        <div className="text-[10px] font-black text-muted uppercase tracking-widest border-b border-border pb-2">Real-World Logic</div>
                        <div className="space-y-2">
                            {EXAMPLES.map((ex, i) => (
                                <button
                                    key={ex.label}
                                    onClick={() => { setLambda(ex.lambda); setActiveExample(i); }}
                                    className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-all text-left ${activeExample === i ? "bg-emerald-500/10 border-emerald-500/40" : "bg-surface2/50 border-transparent hover:border-border"
                                        }`}
                                >
                                    <span className="text-xl">{ex.emoji}</span>
                                    <div>
                                        <div className={`text-[11px] font-bold ${activeExample === i ? "text-emerald-500" : "text-muted"}`}>{ex.label}</div>
                                        <div className="text-[9px] text-muted/60 leading-tight mt-0.5">{ex.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex gap-3">
                        <span className="material-symbols-outlined text-amber-500 text-lg">lightbulb</span>
                        <p className="text-[10px] text-muted leading-relaxed italic">
                            <span className="text-foreground font-black uppercase not-italic tracking-tighter">Did you know?</span> A unique property of the Poisson distribution is that its <span className="font-bold">Mean equals its Variance</span>. As λ increases, the distribution starts mirroring the Normal curve.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
