"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Constants & Types ───────────────────────────────────────────────────────
const W = 720, H = 400;
const PAD = { top: 40, right: 40, bottom: 60, left: 70 };
const pW = W - PAD.left - PAD.right;
const pH = H - PAD.top - PAD.bottom;
const X_MIN = -4, X_MAX = 8;

interface SurfaceDef {
    label: string;
    color: string;
    fn: (x: number) => number;
    desc: string;
    start: number;
}

const SURFACES: Record<string, SurfaceDef> = {
    convex: {
        label: "Convex",
        color: "hsl(var(--emerald-400))",
        fn: (x) => 0.8 * (x - 2) ** 2 + 1,
        desc: "One global minimum — gradient descent will always find the optimal solution.",
        start: -2.0
    },
    nonconvex: {
        label: "Non-Convex",
        color: "hsl(var(--rose-400))",
        fn: (x) => 0.3 * Math.sin(3 * x) * Math.exp(-0.15 * x) + 0.25 * (x - 1) ** 2 + 1.2,
        desc: "Multiple local minima — dangerous terrain where training can get stuck.",
        start: -2.5
    },
    saddle: {
        label: "Saddle Point",
        color: "hsl(var(--primary))",
        fn: (x) => 0.05 * x ** 3 - 0.4 * x + 2.5,
        desc: "Flat regions (plateaus) can slow convergence to a crawl.",
        start: -0.5
    },
};

import { ObjectiveFunctionConfig } from "@/adapters/visual-types";

// ─── Helpers ────────────────────────────────────────────────────────────────
const toCanvasX = (x: number) => PAD.left + ((x - X_MIN) / (X_MAX - X_MIN)) * pW;
const toCanvasY = (y: number, yMin: number, yMax: number) => PAD.top + pH - ((y - yMin) / (yMax - yMin)) * pH;
const fromCanvasX = (cx: number) => X_MIN + ((cx - PAD.left) / pW) * (X_MAX - X_MIN);
const getGradient = (fn: (x: number) => number, x: number, eps = 1e-4) => (fn(x + eps) - fn(x - eps)) / (2 * eps);

interface Props {
    config?: ObjectiveFunctionConfig;
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function ObjectiveFunctionPrimitive({ config }: Props) {
    const [mode, setMode] = useState<keyof typeof SURFACES>("convex");
    const [ballX, setBallX] = useState(SURFACES.convex.start);
    const [lr, setLr] = useState(0.12);
    const [running, setRunning] = useState(false);
    const [trail, setTrail] = useState<number[]>([]);
    const [dragging, setDragging] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ballRef = useRef(ballX);
    const trailRef = useRef<number[]>([]);
    const animRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const surf = SURFACES[mode];
    const fn = surf.fn;

    // Computed range for scaling
    const { yMin, yMax } = useMemo(() => {
        const samples = 200;
        const ys = Array.from({ length: samples }, (_, i) => fn(X_MIN + (i / samples) * (X_MAX - X_MIN)));
        return { yMin: Math.min(...ys) - 0.5, yMax: Math.max(...ys) + 1.0 };
    }, [fn]);

    const tCY = useCallback((y: number) => toCanvasY(y, yMin, yMax), [yMin, yMax]);

    // Update refs for animation consistency
    useEffect(() => { ballRef.current = ballX; }, [ballX]);

    // Reset loop
    const reset = useCallback(() => {
        setRunning(false);
        if (animRef.current) clearTimeout(animRef.current);
        const start = surf.start;
        setBallX(start);
        ballRef.current = start;
        setTrail([start]);
        trailRef.current = [start];
    }, [surf]);

    useEffect(() => { reset(); }, [reset]);

    // Gradient Descent Step
    useEffect(() => {
        if (!running) {
            if (animRef.current) clearTimeout(animRef.current);
            return;
        }

        const step = () => {
            const x = ballRef.current;
            const g = getGradient(fn, x);
            const nextX = x - lr * g;

            const clamped = Math.max(X_MIN + 0.1, Math.min(X_MAX - 0.1, nextX));
            ballRef.current = clamped;
            setBallX(clamped);

            trailRef.current = [...trailRef.current.slice(-40), clamped];
            setTrail([...trailRef.current]);

            if (Math.abs(g) < 0.001) {
                setRunning(false);
                return;
            }
            animRef.current = setTimeout(step, 40);
        };

        animRef.current = setTimeout(step, 40);
        return () => { if (animRef.current) clearTimeout(animRef.current); };
    }, [running, lr, fn]);

    // ─── Drawing Logic ──────────────────────────────────────────────────────
    const draw = useCallback(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "hsl(var(--surface))";
        ctx.fillRect(0, 0, W, H);

        // Grid
        ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = PAD.top + (i / 5) * pH;
            ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + pW, y); ctx.stroke();
        }

        // 1. Shaded area below curve
        ctx.beginPath();
        const steps = 200;
        for (let i = 0; i <= steps; i++) {
            const x = X_MIN + (i / steps) * (X_MAX - X_MIN);
            const cx = toCanvasX(x), cy = tCY(fn(x));
            if (i === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
        }
        ctx.lineTo(toCanvasX(X_MAX), tCY(yMin));
        ctx.lineTo(toCanvasX(X_MIN), tCY(yMin));
        ctx.closePath();
        const fillGrad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + pH);
        fillGrad.addColorStop(0, surf.color + "1a");
        fillGrad.addColorStop(1, "transparent");
        ctx.fillStyle = fillGrad;
        ctx.fill();

        // 2. Trail
        if (trail.length > 1) {
            trail.forEach((tx, i) => {
                const alpha = (i / trail.length) * 0.5;
                ctx.fillStyle = surf.color;
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(toCanvasX(tx), tCY(fn(tx)), 3, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
        }

        // 3. Loss Landscape Curve
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
            const x = X_MIN + (i / steps) * (X_MAX - X_MIN);
            const cx = toCanvasX(x), cy = tCY(fn(x));
            if (i === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
        }
        ctx.strokeStyle = surf.color;
        ctx.lineWidth = 3;
        ctx.stroke();

        // 4. Tangent & Gradient Indicator
        const bx = ballX, by = fn(bx);
        const g = getGradient(fn, bx);

        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        const tanLen = 1.0;
        ctx.beginPath();
        ctx.moveTo(toCanvasX(bx - tanLen), tCY(by - g * tanLen));
        ctx.lineTo(toCanvasX(bx + tanLen), tCY(by + g * tanLen));
        ctx.stroke();
        ctx.restore();

        // Gradient Arrow
        const arrowDir = -Math.sign(g);
        const arrowLen = Math.min(Math.abs(g) * 0.5, 1.2);
        const aX1 = toCanvasX(bx), aY1 = tCY(by);
        const aX2 = toCanvasX(bx + arrowDir * arrowLen);

        if (Math.abs(g) > 0.05) {
            ctx.strokeStyle = arrowDir > 0 ? "hsl(var(--emerald-400))" : "hsl(var(--rose-400))";
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(aX1, aY1); ctx.lineTo(aX2, aY1); ctx.stroke();
            // Head
            ctx.fillStyle = arrowDir > 0 ? "hsl(var(--emerald-400))" : "hsl(var(--rose-400))";
            ctx.beginPath();
            ctx.moveTo(aX2, aY1);
            ctx.lineTo(aX2 - arrowDir * 8, aY1 - 4);
            ctx.lineTo(aX2 - arrowDir * 8, aY1 + 4);
            ctx.closePath(); ctx.fill();
        }

        // 5. Parameter Ball
        ctx.fillStyle = "white";
        ctx.shadowBlur = 10; ctx.shadowColor = surf.color;
        ctx.beginPath(); ctx.arc(toCanvasX(bx), tCY(by), 8, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = surf.color; ctx.lineWidth = 2; ctx.stroke();

        // Labels
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.font = "10px var(--font-jetbrains)";
        ctx.textAlign = "center";
        ctx.fillText("\u03B8", toCanvasX(bx), tCY(by) - 15);

        ctx.textAlign = "right";
        ctx.fillText(`\u2207L = ${g.toFixed(3)}`, W - 20, 25);

    }, [ballX, trail, mode, tCY, surf, fn, yMin, yMax]);

    useEffect(() => { draw(); }, [draw]);

    // Interaction handling
    const handleMouseDown = (e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const cx = e.clientX - rect.left;
        const ballCX = toCanvasX(ballX);
        if (Math.abs(cx - ballCX) < 30) {
            setDragging(true);
            setRunning(false);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!dragging) return;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const cx = e.clientX - rect.left;
        const nx = Math.max(X_MIN + 0.1, Math.min(X_MAX - 0.1, fromCanvasX(cx)));
        setBallX(nx);
        ballRef.current = nx;
        setTrail([nx]);
        trailRef.current = [nx];
    };

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6 select-none">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">landscape</span>
                            Objective Function Explorer
                        </h3>
                        <p className="text-xs text-muted/60 max-w-lg">
                            Visualizing the "Scoreboard" of optimization. The goal is to traverse the landscape to find the lowest possible loss.
                        </p>
                    </div>

                    <div className="flex gap-2 p-1 bg-black/20 border border-border rounded-xl w-fit">
                        {Object.keys(SURFACES).map((k) => (
                            <button
                                key={k}
                                onClick={() => setMode(k)}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === k ? "bg-primary text-white shadow-lg" : "text-muted/60 hover:text-muted"
                                    }`}
                            >
                                {SURFACES[k].label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="bg-black/40 border border-border/40 rounded-xl px-4 py-3 min-w-[100px] text-center">
                        <span className="text-[9px] uppercase font-bold text-muted/40 block mb-1">Parameter (\u03B8)</span>
                        <span className="text-xl font-black text-foreground">{ballX.toFixed(2)}</span>
                    </div>
                    <div className="bg-black/40 border border-border/40 rounded-xl px-4 py-3 min-w-[100px] text-center">
                        <span className="text-[9px] uppercase font-bold text-muted/40 block mb-1">Loss L(\u03B8)</span>
                        <span className="text-xl font-black text-primary">{fn(ballX).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Canvas Area */}
                <div className="lg:col-span-8 bg-black/60 border border-border rounded-xl overflow-hidden relative group">
                    <div className="absolute top-3 left-4 flex gap-4 text-[9px] font-bold text-muted/40 uppercase tracking-widest z-10 pointer-events-none">
                        <span>Gradient Descent Simulator</span>
                        <span style={{ color: surf.color }}>{surf.desc}</span>
                    </div>
                    <canvas
                        ref={canvasRef} width={W} height={H}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={() => setDragging(false)}
                        onMouseLeave={() => setDragging(false)}
                        className={`w-full h-auto ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
                    />
                </div>

                {/* Controls Area */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-black/40 border border-border rounded-xl p-5 space-y-6">
                        <div className="text-[10px] font-black text-muted uppercase tracking-widest border-b border-border pb-2">Hyperparameters</div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold text-muted/60 uppercase">
                                    <span>Learning Rate (Step Size)</span>
                                    <span className="text-primary">{lr.toFixed(2)}</span>
                                </div>
                                <input
                                    type="range" min="0.01" max="0.4" step="0.01" value={lr}
                                    onChange={e => setLr(parseFloat(e.target.value))}
                                    className="w-full accent-primary"
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex gap-2">
                            <button
                                onClick={() => setRunning(!running)}
                                className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${running ? "bg-rose-500 text-white" : "bg-primary text-white"
                                    }`}
                            >
                                {running ? "Pause" : "Descend"}
                            </button>
                            <button
                                onClick={reset}
                                className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-border rounded-lg text-[10px] font-bold uppercase"
                            >
                                ↺
                            </button>
                        </div>
                    </div>

                    <div className="bg-primary/5 p-4 border border-primary/10 rounded-xl flex gap-3">
                        <span className="material-symbols-outlined text-primary text-sm">directions_run</span>
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted leading-relaxed italic">
                                <strong>Interactive:</strong> Drag the parameter ball to any starting point, then hit "Descend" to watch optimization in action.
                            </p>
                        </div>
                    </div>

                    <div className="bg-black/20 p-4 border border-border rounded-xl">
                        <div className="text-[9px] font-bold text-muted/40 uppercase mb-2">Math Legend</div>
                        <p className="text-[10px] text-muted/80 leading-relaxed font-mono">
                            \u03B8\u2190 \u03B8 - \u03B7 \u2207L(\u03B8)<br />
                            <span className="text-xs text-primary/60">\u03B7: learning rate</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

