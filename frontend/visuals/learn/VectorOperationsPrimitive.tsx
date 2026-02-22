"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";

// ─── Constants & Types ───────────────────────────────────────────────────────
const CW = 720, CH = 560;
const SCALE = 45; // pixels per unit

type Mode = "addition" | "dot" | "norm";

interface Vector {
    x: number;
    y: number;
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function VectorOperationsPrimitive() {
    const [vecA, setVecA] = useState<Vector>({ x: 3, y: 2 });
    const [vecB, setVecB] = useState<Vector>({ x: -1, y: 3 });
    const [mode, setMode] = useState<Mode>("addition");

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const draggingRef = useRef<"a" | "b" | null>(null);

    // ─── Coordinate Helpers ─────────────────────────────────────────────────
    const OX = CW / 2, OY = CH / 2;
    const vc = (v: Vector) => ({ x: OX + v.x * SCALE, y: OY - v.y * SCALE });
    const cv = (x: number, y: number) => ({ x: (x - OX) / SCALE, y: -(y - OY) / SCALE });

    const mag = (v: Vector) => Math.sqrt(v.x * v.x + v.y * v.y);
    const dot = (a: Vector, b: Vector) => a.x * b.x + a.y * b.y;
    const norm1 = (v: Vector) => Math.abs(v.x) + Math.abs(v.y);
    const normInf = (v: Vector) => Math.max(Math.abs(v.x), Math.abs(v.y));

    // ─── Drawing Logic ──────────────────────────────────────────────────────
    const drawArrow = (ctx: CanvasRenderingContext2D, from: { x: number, y: number }, to: { x: number, y: number }, color: string, width = 2.5, alpha = 1, dashed = false) => {
        const dx = to.x - from.x, dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 5) return;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = width;
        if (dashed) ctx.setLineDash([6, 4]);

        // Shaft
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x - (dx / len) * 12, to.y - (dy / len) * 12);
        ctx.stroke();

        // Arrowhead
        ctx.setLineDash([]);
        const angle = Math.atan2(dy, dx);
        const headLen = 12;
        ctx.beginPath();
        ctx.moveTo(to.x, to.y);
        ctx.lineTo(to.x - headLen * Math.cos(angle - 0.4), to.y - headLen * Math.sin(angle - 0.4));
        ctx.lineTo(to.x - headLen * Math.cos(angle + 0.4), to.y - headLen * Math.sin(angle + 0.4));
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };

    const draw = useCallback(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, CW, CH);
        ctx.fillStyle = "hsl(var(--surface))";
        ctx.fillRect(0, 0, CW, CH);

        // Grid
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        for (let x = OX % SCALE; x < CW; x += SCALE) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CH); ctx.stroke();
        }
        for (let y = OY % SCALE; y < CH; y += SCALE) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke();
        }

        // Axes
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, OY); ctx.lineTo(CW, OY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(OX, 0); ctx.lineTo(OX, CH); ctx.stroke();

        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.font = "10px var(--font-jetbrains)";
        ctx.textAlign = "center";
        for (let i = -7; i <= 7; i++) {
            if (i === 0) continue;
            ctx.fillText(i.toString(), OX + i * SCALE, OY + 15);
            ctx.fillText(i.toString(), OX - 15, OY - i * SCALE + 3);
        }

        const oPos = { x: OX, y: OY };
        const aPos = vc(vecA);
        const bPos = vc(vecB);

        if (mode === "addition") {
            const rPos = vc({ x: vecA.x + vecB.x, y: vecA.y + vecB.y });
            const bShiftedTip = { x: aPos.x + (bPos.x - OX), y: aPos.y + (bPos.y - OY) };

            // Resultant
            drawArrow(ctx, oPos, rPos, "hsl(var(--primary))", 3, 0.4, true);

            // Vector A
            drawArrow(ctx, oPos, aPos, "hsl(var(--emerald-400))", 3);

            // Vector B (shifted)
            drawArrow(ctx, aPos, bShiftedTip, "hsl(var(--rose-400))", 3);

            // Vector B (origin)
            drawArrow(ctx, oPos, bPos, "hsl(var(--rose-400))", 1.5, 0.2, true);

            // Solid Resultant
            drawArrow(ctx, oPos, rPos, "hsl(var(--primary))", 3);
        } else if (mode === "dot") {
            // Projection of A onto B
            const bLen = mag(vecB);
            const d = dot(vecA, vecB);
            const projScalar = bLen > 0 ? d / (bLen * bLen) : 0;
            const projVec = { x: projScalar * vecB.x, y: projScalar * vecB.y };
            const projPos = vc(projVec);

            ctx.save();
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
            ctx.beginPath(); ctx.moveTo(aPos.x, aPos.y); ctx.lineTo(projPos.x, projPos.y); ctx.stroke();
            ctx.restore();

            drawArrow(ctx, oPos, aPos, "hsl(var(--emerald-400))", 3);
            drawArrow(ctx, oPos, bPos, "hsl(var(--rose-400))", 3);

            // Highlight projection
            ctx.strokeStyle = "hsl(var(--primary))";
            ctx.lineWidth = 4;
            ctx.globalAlpha = 0.5;
            ctx.beginPath(); ctx.moveTo(OX, OY); ctx.lineTo(projPos.x, projPos.y); ctx.stroke();
            ctx.globalAlpha = 1;
        } else if (mode === "norm") {
            // Visualize norms
            const l2 = mag(vecA);
            const l1 = norm1(vecA);
            const linf = normInf(vecA);

            // L2 circle
            ctx.strokeStyle = "hsla(var(--emerald-400), 0.1)";
            ctx.beginPath(); ctx.arc(OX, OY, l2 * SCALE, 0, Math.PI * 2); ctx.stroke();

            // Components
            ctx.save();
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
            ctx.beginPath(); ctx.moveTo(OX, OY); ctx.lineTo(aPos.x, OY); ctx.lineTo(aPos.x, aPos.y); ctx.stroke();
            ctx.restore();

            drawArrow(ctx, oPos, aPos, "hsl(var(--emerald-400))", 3);
        }

        // Draggable Handles
        const drawHandle = (pos: { x: number, y: number }, color: string) => {
            ctx.fillStyle = color;
            ctx.beginPath(); ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.stroke();
        };

        drawHandle(aPos, "hsl(var(--emerald-400))");
        if (mode !== "norm") drawHandle(bPos, "hsl(var(--rose-400))");

    }, [vecA, vecB, mode]);

    useEffect(() => {
        draw();
    }, [draw]);

    // ─── Interaction ────────────────────────────────────────────────────────
    const handleMouseDown = (e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const aPos = vc(vecA);
        const bPos = vc(vecB);

        if (Math.hypot(x - aPos.x, y - aPos.y) < 20) draggingRef.current = "a";
        else if (mode !== "norm" && Math.hypot(x - bPos.x, y - bPos.y) < 20) draggingRef.current = "b";
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggingRef.current) return;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const v = cv(x, y);
        const snapped = { x: Math.round(v.x * 2) / 2, y: Math.round(v.y * 2) / 2 };

        if (draggingRef.current === "a") setVecA(snapped);
        else setVecB(snapped);
    };

    const handleMouseUp = () => { draggingRef.current = null; };

    // ─── Derived Stats ──────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const d = dot(vecA, vecB);
        const mA = mag(vecA);
        const mB = mag(vecB);
        const angle = mA > 0 && mB > 0
            ? Math.acos(Math.max(-1, Math.min(1, d / (mA * mB)))) * (180 / Math.PI)
            : 0;

        return {
            dot: d,
            mA,
            mB,
            angle,
            l1: norm1(vecA),
            linf: normInf(vecA),
            sum: { x: vecA.x + vecB.x, y: vecA.y + vecB.y }
        };
    }, [vecA, vecB]);

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6 select-none">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">near_me</span>
                            Vector Operations Lab
                        </h3>
                        <p className="text-xs text-muted/60 max-w-lg">
                            Visualizing the geometry of vector addition, inner products, and distance metrics.
                        </p>
                    </div>
                    {/* Mode Selector */}
                    <div className="flex gap-2 p-1 bg-black/20 border border-border rounded-xl w-fit">
                        {(["addition", "dot", "norm"] as Mode[]).map(m => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === m ? "bg-primary text-white shadow-lg" : "text-muted/60 hover:text-muted hover:bg-white/5"
                                    }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="bg-black/40 border border-emerald-500/20 rounded-xl px-4 py-3 flex flex-col items-center justify-center min-w-[100px]">
                        <span className="text-[9px] uppercase font-bold text-emerald-400/50 tracking-widest mb-1">Vector A</span>
                        <span className="text-xl font-black text-emerald-400">({vecA.x.toFixed(1)}, {vecA.y.toFixed(1)})</span>
                    </div>
                    {mode !== "norm" && (
                        <div className="bg-black/40 border border-rose-500/20 rounded-xl px-4 py-3 flex flex-col items-center justify-center min-w-[100px]">
                            <span className="text-[9px] uppercase font-bold text-rose-400/50 tracking-widest mb-1">Vector B</span>
                            <span className="text-xl font-black text-rose-400">({vecB.x.toFixed(1)}, {vecB.y.toFixed(1)})</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Canvas Area */}
                <div className="lg:col-span-8 bg-black/60 border border-border rounded-xl overflow-hidden relative group">
                    <div className="absolute top-3 left-4 flex gap-4 text-[9px] font-bold text-muted/40 uppercase tracking-widest z-10 pointer-events-none">
                        <span>Interactive Coordinate Plane</span>
                        <span className="text-primary italic">Drag handles to recompute transform</span>
                    </div>
                    <canvas
                        ref={canvasRef} width={CW} height={CH}
                        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
                        className="w-full h-auto cursor-crosshair"
                    />
                </div>

                {/* Info Panel */}
                <div className="lg:col-span-4 space-y-4">
                    {mode === "addition" && (
                        <div className="bg-black/40 border border-primary/20 rounded-xl p-5 space-y-4">
                            <div className="text-[10px] font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Addition (Tip-to-Tail)</div>
                            <div className="space-y-4">
                                <div className="bg-surface2/50 p-4 rounded-lg border border-border/40 text-center">
                                    <span className="text-[9px] font-bold text-muted uppercase block mb-1 opacity-60">Resultant R = A + B</span>
                                    <span className="text-3xl font-black text-primary">({stats.sum.x.toFixed(1)}, {stats.sum.y.toFixed(1)})</span>
                                </div>
                                <div className="text-[11px] text-muted leading-relaxed italic">
                                    Imagine A as a movement. Starting B from the tip of A shows the total displacement.
                                </div>
                            </div>
                        </div>
                    )}

                    {mode === "dot" && (
                        <div className="bg-black/40 border border-primary/20 rounded-xl p-5 space-y-4">
                            <div className="text-[10px] font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Alignment (Dot Product)</div>
                            <div className="space-y-4">
                                <div className="bg-surface2/50 p-4 rounded-lg border border-border/40 text-center">
                                    <span className="text-[9px] font-bold text-muted uppercase block mb-1 opacity-60">A · B (Inner Product)</span>
                                    <span className="text-3xl font-black text-primary">{stats.dot.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center bg-black/30 p-3 rounded-lg border border-border/40">
                                    <span className="text-[10px] font-bold text-muted uppercase">Angle θ</span>
                                    <span className="text-lg font-black text-emerald-400">{stats.angle.toFixed(1)}°</span>
                                </div>
                                <div className="text-[11px] text-muted leading-relaxed">
                                    {stats.angle > 85 && stats.angle < 95 ? (
                                        <span className="text-amber-400 font-bold uppercase tracking-tighter">Orthogonal!</span>
                                    ) : stats.dot > 0 ? (
                                        "Positive alignment: The vectors share a similar direction."
                                    ) : (
                                        "Opposing alignment: The vectors point away from each other."
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {mode === "norm" && (
                        <div className="bg-black/40 border border-primary/20 rounded-xl p-5 space-y-4">
                            <div className="text-[10px] font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Distance Metrics (Norms)</div>
                            <div className="space-y-3">
                                <div className="bg-surface2/50 p-3 rounded-lg border border-border/40 flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-muted uppercase">L1 (Manhattan)</span>
                                    <span className="text-lg font-black text-foreground">{stats.l1.toFixed(2)}</span>
                                </div>
                                <div className="bg-surface2/50 p-3 rounded-lg border border-border/40 flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-muted uppercase">L2 (Euclidean)</span>
                                    <span className="text-lg font-black text-emerald-400">{stats.mA.toFixed(2)}</span>
                                </div>
                                <div className="bg-surface2/50 p-3 rounded-lg border border-border/40 flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-muted uppercase">L∞ (Max)</span>
                                    <span className="text-lg font-black text-foreground">{stats.linf.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-surface p-4 border border-border rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-sm text-primary">psychology</span>
                            <span className="text-[10px] font-black text-muted uppercase tracking-widest">Aha Moment</span>
                        </div>
                        <p className="text-[10px] text-muted/80 leading-relaxed italic">
                            {mode === "addition" ? "Placing vectors tip-to-tail reveals that addition is simply cumulative displacement." :
                                mode === "dot" ? "The dot product is the product of magnitudes scaled by how much they align (cos θ)." :
                                    "Norms define 'how long' a vector is, depending on whether you walk strictly on a grid (L1) or in a straight line (L2)."}
                        </p>
                    </div>

                    <button
                        onClick={() => { setVecA({ x: 3, y: 2 }); setVecB({ x: -1, y: 3 }); }}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 border border-border rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
                    >
                        Reset Coordinates
                    </button>
                </div>
            </div>
        </div>
    );
}
