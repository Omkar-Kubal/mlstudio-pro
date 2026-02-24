"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Constants ───────────────────────────────────────────────────────────────
const W = 600, H = 400;
const XMIN = -2, XMAX = 2, YMIN = -1.5, YMAX = 2.5;

const OPTIMIZERS: Record<string, { name: string; color: string; glyph: string; desc: string }> = {
    GD: {
        name: "GD",
        color: "#60a5fa",
        glyph: "●",
        desc: "Fixed step",
    },
    Momentum: {
        name: "Momentum",
        color: "#f472b6",
        glyph: "▲",
        desc: "Past velocity",
    },
    Adam: {
        name: "Adam",
        color: "#34d399",
        glyph: "◆",
        desc: "Adaptive rates",
    },
};

// ─── Math Utils ─────────────────────────────────────────────────────────────
function toCanvas(x: number, y: number) {
    return [
        ((x - XMIN) / (XMAX - XMIN)) * W,
        H - ((y - YMIN) / (YMAX - YMIN)) * H,
    ];
}

function loss(x: number, y: number) {
    return (
        0.3 * (1 - x) ** 2 * Math.exp(-(x ** 2) - (y + 1) ** 2) -
        (x / 5 - x ** 3 - y ** 5) * Math.exp(-(x ** 2) - y ** 2) -
        (1 / 3) * Math.exp(-((x + 1) ** 2) - y ** 2) +
        0.1 * x ** 2 +
        0.1 * y ** 2
    );
}

function gradient(x: number, y: number, eps = 1e-4) {
    return [
        (loss(x + eps, y) - loss(x - eps, y)) / (2 * eps),
        (loss(x, y + eps) - loss(x, y - eps)) / (2 * eps),
    ];
}

function makeOptimizerState(x0: number, y0: number) {
    return {
        GD: { x: x0, y: y0, trail: [[x0, y0]] },
        Momentum: { x: x0, y: y0, vx: 0, vy: 0, trail: [[x0, y0]] },
        Adam: { x: x0, y: y0, mx: 0, my: 0, vx: 0, vy: 0, t: 0, trail: [[x0, y0]] },
    };
}

function stepAll(states: any, lr: number, noise: number) {
    const next: any = {};

    // GD
    {
        const s = states.GD;
        const n = noise > 0 ? (Math.random() - 0.5) * noise : 0;
        const [gx, gy] = gradient(s.x + n, s.y + n);
        const nx = s.x - lr * gx;
        const ny = s.y - lr * gy;
        next.GD = { x: nx, y: ny, trail: [...s.trail.slice(-80), [nx, ny]] };
    }

    // Momentum
    {
        const s = states.Momentum;
        const β = 0.85;
        const n = noise > 0 ? (Math.random() - 0.5) * noise : 0;
        const [gx, gy] = gradient(s.x + n, s.y + n);
        const vx = β * s.vx - lr * gx;
        const vy = β * s.vy - lr * gy;
        const nx = s.x + vx;
        const ny = s.y + vy;
        next.Momentum = { x: nx, y: ny, vx, vy, trail: [...s.trail.slice(-80), [nx, ny]] };
    }

    // Adam
    {
        const s = states.Adam;
        const β1 = 0.9, β2 = 0.999, ε = 1e-8;
        const n = noise > 0 ? (Math.random() - 0.5) * noise : 0;
        const [gx, gy] = gradient(s.x + n, s.y + n);
        const t = s.t + 1;
        const mx = β1 * s.mx + (1 - β1) * gx;
        const my = β1 * s.my + (1 - β1) * gy;
        const vx = β2 * s.vx + (1 - β2) * gx * gx;
        const vy = β2 * s.vy + (1 - β2) * gy * gy;
        const mxH = mx / (1 - Math.pow(β1, t));
        const myH = my / (1 - Math.pow(β1, t));
        const vxH = vx / (1 - Math.pow(β2, t));
        const vyH = vy / (1 - Math.pow(β2, t));
        const nx = s.x - lr * mxH / (Math.sqrt(vxH) + ε);
        const ny = s.y - lr * myH / (Math.sqrt(vyH) + ε);
        next.Adam = { x: nx, y: ny, mx, my, vx, vy, t, trail: [...s.trail.slice(-80), [nx, ny]] };
    }

    return next;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function GradientDescentOptimizer() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contourRef = useRef<HTMLCanvasElement | null>(null);
    const animRef = useRef<number | null>(null);
    const statesRef = useRef<any>(null);

    const START = { x: -1.5, y: 1.8 };
    const [running, setRunning] = useState(false);
    const [step, setStep] = useState(0);
    const [lr, setLr] = useState(0.08);
    const [noise, setNoise] = useState(0);
    const [active, setActive] = useState<Record<string, boolean>>({ GD: true, Momentum: true, Adam: true });
    const [losses, setLosses] = useState<Record<string, string>>({});

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

    const reset = useCallback(() => {
        setRunning(false);
        if (animRef.current) cancelAnimationFrame(animRef.current);
        statesRef.current = makeOptimizerState(START.x, START.y);
        setStep(0);
        setLosses({});
        render();
    }, [START.x, START.y]);

    useEffect(() => { reset(); }, [reset]);

    useEffect(() => {
        const off = document.createElement("canvas");
        off.width = W; off.height = H;
        const ctx = off.getContext("2d");
        if (ctx) {
            drawContours(ctx);
            contourRef.current = off;
            render();
        }
    }, []);

    function drawContours(ctx: CanvasRenderingContext2D) {
        const img = ctx.createImageData(W, H);
        let lmin = Infinity, lmax = -Infinity;
        for (let px = 0; px < W; px += 4) {
            for (let py = 0; py < H; py += 4) {
                const x = XMIN + (px / W) * (XMAX - XMIN);
                const y = YMIN + (1 - py / H) * (YMAX - YMIN);
                const v = loss(x, y);
                if (v < lmin) lmin = v;
                if (v > lmax) lmax = v;
            }
        }
        for (let px = 0; px < W; px++) {
            for (let py = 0; py < H; py++) {
                const x = XMIN + (px / W) * (XMAX - XMIN);
                const y = YMIN + (1 - py / H) * (YMAX - YMIN);
                const v = loss(x, y);
                const t = Math.max(0, Math.min(1, (v - lmin) / (lmax - lmin)));

                // Match project brand color palette (Navy -> Teal -> Primary)
                let r, g, b;
                if (t < 0.35) {
                    const s = t / 0.35;
                    r = Math.round(15 + s * 10); g = Math.round(23 + s * 60); b = Math.round(42 + s * 80);
                } else if (t < 0.7) {
                    const s = (t - 0.35) / 0.35;
                    r = Math.round(25 + s * 120); g = Math.round(83 + s * 120); b = Math.round(122 - s * 50);
                } else {
                    const s = (t - 0.7) / 0.3;
                    r = Math.round(145 + s * 60); g = Math.round(203 - s * 100); b = Math.round(72 - s * 40);
                }
                const idx = (py * W + px) * 4;
                img.data[idx] = r; img.data[idx + 1] = g; img.data[idx + 2] = b; img.data[idx + 3] = 255;
            }
        }
        ctx.putImageData(img, 0, 0);
        ctx.save();
        ctx.globalAlpha = 0.12; ctx.strokeStyle = "#fff"; ctx.lineWidth = 0.4;
        const NLEVELS = 10;
        for (let l = 0; l < NLEVELS; l++) {
            const lv = lmin + (l / NLEVELS) * (lmax - lmin);
            const stepSize = 4;
            for (let px = 0; px < W - stepSize; px += stepSize) {
                for (let py = 0; py < H - stepSize; py += stepSize) {
                    const corners = [[px, py], [px + stepSize, py], [px, py + stepSize], [px + stepSize, py + stepSize]]
                        .map(([cx, cy]) => loss(XMIN + (cx / W) * (XMAX - XMIN), YMIN + (1 - cy / H) * (YMAX - YMIN)) - lv);
                    if (corners.some(v => v >= 0) && corners.some(v => v < 0)) {
                        ctx.beginPath(); ctx.arc(px + stepSize / 2, py + stepSize / 2, 0.4, 0, Math.PI * 2); ctx.stroke();
                    }
                }
            }
        }
        ctx.restore();
    }

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !contourRef.current) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(contourRef.current, 0, 0);

        // Start pin
        const [sx, sy] = toCanvas(START.x, START.y);
        ctx.save();
        ctx.beginPath(); ctx.arc(sx, sy, 4, 0, Math.PI * 2);
        ctx.fillStyle = "hsl(var(--primary))"; ctx.shadowColor = "hsl(var(--primary))"; ctx.shadowBlur = 8;
        ctx.fill(); ctx.restore();

        if (statesRef.current) {
            Object.entries(statesRef.current).forEach(([key, s]: [string, any]) => {
                if (!active[key]) return;
                const color = OPTIMIZERS[key].color;
                const trail = s.trail;
                if (trail.length < 2) return;
                ctx.save();
                for (let i = 1; i < trail.length; i++) {
                    const alpha = 0.3 + 0.7 * (i / trail.length);
                    const width = 1.2 + 1.8 * (i / trail.length);
                    const [x1, y1] = toCanvas(trail[i - 1][0], trail[i - 1][1]);
                    const [x2, y2] = toCanvas(trail[i][0], trail[i][1]);
                    ctx.beginPath(); ctx.strokeStyle = color; ctx.globalAlpha = alpha;
                    ctx.lineWidth = width; ctx.lineCap = "round";
                    ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
                }
                ctx.restore();
                const [cx, cy] = toCanvas(s.x, s.y);
                ctx.save();
                ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2);
                ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 10; ctx.fill();
                ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2);
                ctx.fillStyle = "#fff"; ctx.fill(); ctx.restore();
            });
        }
    }, [START.x, START.y, active]);

    useEffect(() => {
        if (!running) return;
        const interval = reducedMotion ? 4 : 2;
        let frame = 0;
        const tick = () => {
            if (frame % interval === 0) {
                statesRef.current = stepAll(statesRef.current, lr, noise);
                const nL: any = {};
                Object.entries(statesRef.current).forEach(([k, s]: [string, any]) => nL[k] = loss(s.x, s.y).toFixed(3));
                setLosses(nL); setStep(s => s + 1);
            }
            frame++; render();
            animRef.current = requestAnimationFrame(tick);
        };
        animRef.current = requestAnimationFrame(tick);
        return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    }, [running, lr, noise, active, render, reducedMotion]);

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">landscape</span>
                        Optimization Dynamics
                    </h3>
                    <p className="text-xs text-muted/60">Exploring loss landscapes with adaptive paths</p>
                </div>
                <div className="px-2 py-1 bg-surface border border-border rounded text-[10px] font-mono text-muted uppercase tracking-widest shadow-inner">
                    Step {step}
                </div>
            </div>

            <div className="relative rounded bg-surface/30 border border-border/50 overflow-hidden shadow-2xl group">
                <canvas ref={canvasRef} width={W} height={H} className="w-full h-auto block" />
                <div className="absolute top-4 left-4 pointer-events-none">
                    <div className="text-[10px] font-bold text-primary/60 uppercase tracking-tighter bg-black/20 backdrop-blur-sm px-1.5 py-0.5 rounded">
                        Loss Surface Grid
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(OPTIMIZERS).map(([key, opt]) => (
                    <button
                        key={key}
                        onClick={() => setActive(p => ({ ...p, [key]: !p[key] }))}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left ${active[key]
                                ? 'bg-surface border-primary/50 shadow-lg translate-y-[-2px]'
                                : 'bg-surface/20 border-border/20 grayscale opacity-40 hover:opacity-100 hover:grayscale-0'
                            }`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg`} style={{ backgroundColor: `${opt.color}20`, color: opt.color }}>
                            {opt.glyph}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-foreground flex justify-between">
                                <span>{opt.name}</span>
                                {active[key] && losses[key] && <span className="font-mono text-[9px] text-muted">L:{losses[key]}</span>}
                            </div>
                            <div className="text-[10px] text-muted truncate">{opt.desc}</div>
                        </div>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <label className="flex items-center justify-between text-xs font-bold text-muted uppercase tracking-tight">
                        <span>Learning Rate</span>
                        <span className="font-mono text-primary bg-primary/10 px-1.5 rounded">{lr.toFixed(3)}</span>
                    </label>
                    <input
                        type="range" min="0.01" max="0.2" step="0.005"
                        value={lr} onChange={e => { setLr(+e.target.value); reset(); }}
                        className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                </div>
                <div className="space-y-3">
                    <label className="flex items-center justify-between text-xs font-bold text-muted uppercase tracking-tight">
                        <span>SGD Noise</span>
                        <span className="font-mono text-pink-500 bg-pink-500/10 px-1.5 rounded">{noise.toFixed(2)}</span>
                    </label>
                    <input
                        type="range" min="0" max="0.5" step="0.01"
                        value={noise} onChange={e => setNoise(+e.target.value)}
                        className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                    onClick={() => setRunning(!running)}
                    className={`flex-1 flex items-center justify-center gap-2 px-8 py-3 rounded-md font-bold text-xs tracking-widest transition-all ${running
                            ? 'bg-red-500/10 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
                            : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
                        }`}
                >
                    <span className="material-symbols-outlined text-base">
                        {running ? 'pause_circle' : 'play_circle'}
                    </span>
                    {running ? 'PAUSE' : 'RUN SIMULATION'}
                </button>
                <button
                    onClick={reset}
                    className="px-6 py-3 rounded-md border border-border bg-surface text-muted font-bold text-xs tracking-widest hover:bg-surface/70 hover:text-foreground transition-all uppercase flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined text-base">restart_alt</span>
                    Reset
                </button>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
                <p className="text-xs text-muted leading-relaxed italic text-center">
                    Notice how <span className="text-foreground font-semibold">Adam</span> adjusts its step size for the curvature, while <span className="text-foreground font-semibold">GD</span> remains rigid. High noise reveals the variance of Stochastic Gradient Descent.
                </p>
            </div>
        </div>
    );
}

