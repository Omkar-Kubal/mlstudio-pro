"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { GradientChainRuleConfig } from "@/adapters/visual-types";

// ─── Constants ────────────────────────────────────────────────────────────────
const W = 720, H = 360;
const PAD = { top: 40, right: 40, bottom: 55, left: 70 };
const pW = W - PAD.left - PAD.right;
const pH = H - PAD.top - PAD.bottom;
const X_MIN = -3.5, X_MAX = 3.5;
const Y_MIN = -0.2, Y_MAX = 3.2;

// ─── Math ─────────────────────────────────────────────────────────────────────
// Composite: h(x) = f(g(x)) where g(x) = x²−1, f(u) = 0.8·sin(u)
const gFn = (x: number) => x * x - 1;
const gPrime = (x: number) => 2 * x;
const fFn = (u: number) => Math.sin(u) * 0.8;
const fPrime = (u: number) => Math.cos(u) * 0.8;
const hFn = (x: number) => fFn(gFn(x)) + 2;          // shifted up for visibility
const hPrime = (x: number) => fPrime(gFn(x)) * gPrime(x); // chain rule

// ─── Canvas helpers ───────────────────────────────────────────────────────────
const toCanvasX = (x: number) => PAD.left + ((x - X_MIN) / (X_MAX - X_MIN)) * pW;
const toCanvasY = (y: number) => PAD.top + pH - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * pH;
const fromCanvasX = (cx: number) => X_MIN + ((cx - PAD.left) / pW) * (X_MAX - X_MIN);

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
    config?: GradientChainRuleConfig;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function GradientChainRulePrimitive({ config }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [xVal, setXVal] = useState(1.5);
    const [dragging, setDragging] = useState(false);

    // Derived values
    const y = hFn(xVal);
    const slope = hPrime(xVal);
    const innerV = gFn(xVal);
    const dfdg = fPrime(innerV);
    const dgdx = gPrime(xVal);

    // ─── Draw ─────────────────────────────────────────────────────────────────
    const draw = useCallback(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "hsl(var(--surface))";
        ctx.fillRect(0, 0, W, H);

        // ── Grid ──────────────────────────────────────────────────────────────
        ctx.strokeStyle = "rgba(255,255,255,0.03)";
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const cy = PAD.top + (i / 5) * pH;
            ctx.beginPath(); ctx.moveTo(PAD.left, cy); ctx.lineTo(PAD.left + pW, cy); ctx.stroke();
        }

        const steps = 250;

        // ── Filled area under h(x) ────────────────────────────────────────────
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
            const xi = X_MIN + (i / steps) * (X_MAX - X_MIN);
            const px = toCanvasX(xi), py = toCanvasY(hFn(xi));
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.lineTo(toCanvasX(X_MAX), toCanvasY(Y_MIN));
        ctx.lineTo(toCanvasX(X_MIN), toCanvasY(Y_MIN));
        ctx.closePath();
        ctx.fillStyle = "hsla(var(--primary), 0.06)";
        ctx.fill();

        // ── Main curve h(x) ───────────────────────────────────────────────────
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
            const xi = X_MIN + (i / steps) * (X_MAX - X_MIN);
            const px = toCanvasX(xi), py = toCanvasY(hFn(xi));
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.strokeStyle = "hsl(var(--primary))";
        ctx.lineWidth = 2.5;
        ctx.shadowColor = "hsl(var(--primary))";
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // ── Tangent line ──────────────────────────────────────────────────────
        const cx0 = toCanvasX(xVal), cy0 = toCanvasY(y);
        const tanLen = 1.2;
        ctx.beginPath();
        ctx.moveTo(toCanvasX(xVal - tanLen), toCanvasY(y + slope * (-tanLen)));
        ctx.lineTo(toCanvasX(xVal + tanLen), toCanvasY(y + slope * tanLen));
        ctx.strokeStyle = "hsl(var(--amber-400, 251 191 36))";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // ── Gradient (downhill) arrow ─────────────────────────────────────────
        const downDir = -Math.sign(slope);
        const arrowMag = Math.min(Math.abs(slope) * 0.3, 0.9);
        const arrowEndX = toCanvasX(xVal + downDir * arrowMag);
        const arrowColor = slope > 0 ? "hsl(var(--emerald-400))" : "hsl(var(--rose-400))";

        if (Math.abs(slope) > 0.05) {
            ctx.beginPath();
            ctx.moveTo(cx0, cy0);
            ctx.lineTo(arrowEndX, cy0);
            ctx.strokeStyle = arrowColor;
            ctx.lineWidth = 2.5;
            ctx.stroke();
            // Arrowhead
            const hd = downDir > 0 ? 1 : -1;
            ctx.beginPath();
            ctx.moveTo(arrowEndX, cy0);
            ctx.lineTo(arrowEndX - hd * 9, cy0 - 5);
            ctx.lineTo(arrowEndX - hd * 9, cy0 + 5);
            ctx.closePath();
            ctx.fillStyle = arrowColor;
            ctx.fill();
        }

        // ── Ball ──────────────────────────────────────────────────────────────
        ctx.beginPath();
        ctx.arc(cx0, cy0, 9, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.shadowColor = "hsl(var(--primary))";
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "hsl(var(--primary))";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Drop line
        ctx.beginPath();
        ctx.moveTo(cx0, cy0);
        ctx.lineTo(cx0, toCanvasY(0));
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // ── Axes ──────────────────────────────────────────────────────────────
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(PAD.left, PAD.top);
        ctx.lineTo(PAD.left, PAD.top + pH);
        ctx.lineTo(PAD.left + pW, PAD.top + pH);
        ctx.stroke();

        // X-axis labels
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.font = "10px var(--font-jetbrains)";
        ctx.textAlign = "center";
        [-3, -2, -1, 0, 1, 2, 3].forEach(v => {
            ctx.fillText(String(v), toCanvasX(v), PAD.top + pH + 18);
        });
        ctx.fillText("x", PAD.left + pW / 2, H - 6);

        ctx.save();
        ctx.translate(14, PAD.top + pH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText("h(x)", 0, 0);
        ctx.restore();

        // Slope readout
        ctx.textAlign = "right";
        ctx.fillStyle = "rgba(251,191,36,0.8)";
        ctx.font = "bold 10px var(--font-jetbrains)";
        ctx.fillText(`slope = ${slope.toFixed(3)}`, W - PAD.right + 10, PAD.top + 18);
    }, [xVal, y, slope]);

    useEffect(() => { draw(); }, [draw]);

    // ─── Drag handlers ────────────────────────────────────────────────────────
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const cx = e.clientX - rect.left;
        if (Math.abs(cx - toCanvasX(xVal)) < 24) setDragging(true);
    }, [xVal]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!dragging) return;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const nx = Math.max(X_MIN + 0.1, Math.min(X_MAX - 0.1, fromCanvasX(e.clientX - rect.left)));
        setXVal(nx);
    }, [dragging]);

    // ─── Gradient direction label ─────────────────────────────────────────────
    const dirLabel = Math.abs(slope) < 0.05
        ? "≈ 0 — near a minimum!"
        : slope > 0
            ? "step LEFT to descend"
            : "step RIGHT to descend";

    const dirColor = Math.abs(slope) < 0.05
        ? "text-muted"
        : slope > 0
            ? "text-emerald-400"
            : "text-rose-400";

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6 select-none">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">functions</span>
                        Gradients &amp; Chain Rule
                    </h3>
                    <p className="text-xs text-muted/60 max-w-lg">
                        The gradient is a signpost pointing <em>uphill</em>. To descend, turn around.
                        Drag the parameter ball to see the slope and chain decomposition update in real-time.
                    </p>
                </div>

                <div className="flex gap-3 shrink-0">
                    <div className="bg-black/40 border border-border/40 rounded-xl px-4 py-3 min-w-[90px] text-center">
                        <span className="text-[9px] uppercase font-bold text-muted/40 block mb-1">x</span>
                        <span className="text-xl font-black text-foreground">{xVal.toFixed(2)}</span>
                    </div>
                    <div className="bg-black/40 border border-border/40 rounded-xl px-4 py-3 min-w-[90px] text-center">
                        <span className="text-[9px] uppercase font-bold text-muted/40 block mb-1">h(x)</span>
                        <span className="text-xl font-black text-primary">{y.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Canvas */}
                <div className="lg:col-span-8 bg-black/60 border border-border rounded-xl overflow-hidden relative">
                    <div className="absolute top-3 left-4 text-[9px] font-bold text-muted/40 uppercase tracking-widest pointer-events-none z-10">
                        h(x) = f(g(x)) = 0.8·sin(x²−1) + 2
                    </div>
                    <canvas
                        ref={canvasRef}
                        width={W} height={H}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={() => setDragging(false)}
                        onMouseLeave={() => setDragging(false)}
                        className={`w-full h-auto ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
                    />
                </div>

                {/* Info panel */}
                <div className="lg:col-span-4 space-y-4">

                    {/* Chain rule breakdown */}
                    <div className="bg-black/40 border border-border rounded-xl p-5 space-y-4">
                        <div className="text-[10px] font-black text-muted uppercase tracking-widest border-b border-border pb-2">
                            Chain Rule · dh/dx = df/dg · dg/dx
                        </div>

                        <div className="space-y-3">
                            {[
                                {
                                    label: "g(x) = x²−1",
                                    sublabel: "Inner function",
                                    value: innerV.toFixed(3),
                                    colorClass: "text-sky-400",
                                    borderClass: "border-sky-400/20 bg-sky-400/5"
                                },
                                {
                                    label: "df/dg = 0.8·cos(g)",
                                    sublabel: "Outer derivative",
                                    value: dfdg.toFixed(3),
                                    colorClass: "text-violet-400",
                                    borderClass: "border-violet-400/20 bg-violet-400/5"
                                },
                                {
                                    label: "dg/dx = 2x",
                                    sublabel: "Inner derivative",
                                    value: dgdx.toFixed(3),
                                    colorClass: "text-primary",
                                    borderClass: "border-primary/20 bg-primary/5"
                                },
                            ].map(({ label, sublabel, value, colorClass, borderClass }) => (
                                <div key={label} className={`border rounded-xl p-3 ${borderClass}`}>
                                    <div className="text-[9px] text-muted/50 uppercase">{sublabel}</div>
                                    <div className={`text-[10px] font-bold ${colorClass} mt-0.5`}>{label}</div>
                                    <div className={`text-2xl font-black ${colorClass} leading-none mt-1`}>{value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Result */}
                        <div className="pt-1 text-center space-y-1">
                            <div className="font-mono text-[11px] text-muted/60">
                                {dfdg.toFixed(3)} × {dgdx.toFixed(3)} =
                                <span className="text-amber-400 font-black ml-1 text-base">{slope.toFixed(3)}</span>
                            </div>
                            <div className={`text-[10px] font-bold ${dirColor}`}>{dirLabel}</div>
                        </div>
                    </div>

                    {/* Key insight */}
                    <div className="bg-primary/5 p-4 border border-primary/10 rounded-xl flex gap-3">
                        <span className="material-symbols-outlined text-primary text-sm mt-0.5">lightbulb</span>
                        <p className="text-[10px] text-muted leading-relaxed italic">
                            Backpropagation <em>is</em> the chain rule — gradients flow backwards through each layer by multiplying local derivatives together.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

