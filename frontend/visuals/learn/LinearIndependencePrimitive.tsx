"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

// ─── Constants & Types ───────────────────────────────────────────────────────
const CW = 720, CH = 460;
const SCALE = 60;

// ─── Component ──────────────────────────────────────────────────────────────
export default function LinearIndependencePrimitive() {
    const [v1, _setV1] = useState({ x: 2, y: 1 });
    const [v2Angle, setV2Angle] = useState(45);
    const [v2Mag, setV2Mag] = useState(2);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const OX = CW / 2, OY = CH / 2;

    const v2 = {
        x: v2Mag * Math.cos((v2Angle * Math.PI) / 180),
        y: v2Mag * Math.sin((v2Angle * Math.PI) / 180),
    };

    const determinant = v1.x * v2.y - v1.y * v2.x;
    const isIndependent = Math.abs(determinant) > 0.05;

    // ─── Drawing Logic ──────────────────────────────────────────────────────
    const drawGrid = (ctx: CanvasRenderingContext2D) => {
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;

        for (let x = -10; x <= 10; x++) {
            ctx.beginPath();
            ctx.moveTo(OX + x * SCALE, 0);
            ctx.lineTo(OX + x * SCALE, CH);
            ctx.stroke();
        }

        for (let y = -10; y <= 10; y++) {
            ctx.beginPath();
            ctx.moveTo(0, OY - y * SCALE);
            ctx.lineTo(CW, OY - y * SCALE);
            ctx.stroke();
        }

        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, OY); ctx.lineTo(CW, OY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(OX, 0); ctx.lineTo(OX, CH); ctx.stroke();
        ctx.restore();
    };

    const drawVector = (ctx: CanvasRenderingContext2D, v: { x: number, y: number }, color: string, label: string) => {
        const endX = OX + v.x * SCALE;
        const endY = OY - v.y * SCALE;

        ctx.save();
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 4;

        ctx.beginPath();
        ctx.moveTo(OX, OY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        const angle = Math.atan2(OY - endY, endX - OX);
        const headLength = 12;

        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - headLength * Math.cos(angle - 0.4),
            endY + headLength * Math.sin(angle - 0.4)
        );
        ctx.lineTo(
            endX - headLength * Math.cos(angle + 0.4),
            endY + headLength * Math.sin(angle + 0.4)
        );
        ctx.closePath();
        ctx.fill();

        ctx.font = "bold 14px var(--font-jetbrains)";
        ctx.fillText(label, endX + 8, endY - 8);
        ctx.restore();
    };

    const drawSpan = (ctx: CanvasRenderingContext2D) => {
        ctx.save();
        if (isIndependent) {
            ctx.globalAlpha = 0.2;
            ctx.fillStyle = "hsl(var(--primary))";

            // Draw a large parallelogram representing the span coverage
            const range = 5;
            const p1 = { x: v1.x * range, y: v1.y * range };
            const p2 = { x: v2.x * range, y: v2.y * range };

            ctx.beginPath();
            ctx.moveTo(OX - p1.x * SCALE - p2.x * SCALE, OY + p1.y * SCALE + p2.y * SCALE);
            ctx.lineTo(OX + p1.x * SCALE - p2.x * SCALE, OY - p1.y * SCALE + p2.y * SCALE);
            ctx.lineTo(OX + p1.x * SCALE + p2.x * SCALE, OY - p1.y * SCALE - p2.y * SCALE);
            ctx.lineTo(OX - p1.x * SCALE + p2.x * SCALE, OY + p1.y * SCALE - p2.y * SCALE);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.strokeStyle = "hsla(var(--rose-400), 0.4)";
            ctx.lineWidth = 5;
            const angle = Math.atan2(v1.y, v1.x);
            const range = 10;
            ctx.beginPath();
            ctx.moveTo(OX - range * SCALE * Math.cos(angle), OY + range * SCALE * Math.sin(angle));
            ctx.lineTo(OX + range * SCALE * Math.cos(angle), OY - range * SCALE * Math.sin(angle));
            ctx.stroke();
        }
        ctx.restore();
    };

    const draw = useCallback(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, CW, CH);
        ctx.fillStyle = "hsl(var(--surface))";
        ctx.fillRect(0, 0, CW, CH);

        drawGrid(ctx);
        drawSpan(ctx);
        drawVector(ctx, v1, "hsl(var(--rose-400))", "v1");
        drawVector(ctx, v2, "hsl(var(--emerald-400))", "v2");

        // Det Parallel
        if (isIndependent) {
            ctx.save();
            ctx.strokeStyle = "white";
            ctx.setLineDash([5, 5]);
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            const p1 = { x: OX + v1.x * SCALE, y: OY - v1.y * SCALE };
            const p2 = { x: OX + v2.x * SCALE, y: OY - v2.y * SCALE };
            const psum = { x: OX + (v1.x + v2.x) * SCALE, y: OY - (v1.y + v2.y) * SCALE };
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(psum.x, psum.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.restore();
        }

        // Origin
        ctx.fillStyle = "white";
        ctx.beginPath(); ctx.arc(OX, OY, 4, 0, Math.PI * 2); ctx.fill();
    }, [v1, v2, isIndependent]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        draw();
    }, [draw]);

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6 select-none">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">square_foot</span>
                            Linear Independence & Basis
                        </h3>
                        <p className="text-xs text-muted/60 max-w-lg">
                            An objective look at how vectors create space. When two vectors point along different lines, they span a 2D plane ($R^2$).
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-black/40 border border-border rounded-xl px-4 py-3 min-w-[120px]">
                            <span className="text-[9px] uppercase font-bold text-muted/40 block mb-1">Determinant Area</span>
                            <span className={`text-xl font-black ${isIndependent ? "text-primary" : "text-rose-400"}`}>
                                {Math.abs(determinant).toFixed(3)}
                            </span>
                        </div>
                        <div className="bg-black/40 border border-border rounded-xl px-4 py-3 flex items-center gap-3">
                            <span className={`w-3 h-3 rounded-full ${isIndependent ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" : "bg-rose-400"}`}></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted">
                                {isIndependent ? "Linearly Independent" : "Linearly Dependent"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-black/40 border border-border rounded-xl px-4 py-3">
                        <span className="text-[9px] uppercase font-bold text-muted/40 block mb-3">Rotate v2</span>
                        <input
                            type="range" min="0" max="360" step="1" value={v2Angle}
                            onChange={e => setV2Angle(parseFloat(e.target.value))}
                            className="w-full accent-primary"
                        />
                    </div>
                    <div className="bg-black/40 border border-border rounded-xl px-4 py-3">
                        <span className="text-[9px] uppercase font-bold text-muted/40 block mb-3">Scale v2</span>
                        <input
                            type="range" min="0" max="4" step="0.1" value={v2Mag}
                            onChange={e => setV2Mag(parseFloat(e.target.value))}
                            className="w-full accent-primary"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Canvas Area */}
                <div className="lg:col-span-8 bg-black/60 border border-border rounded-xl overflow-hidden relative group">
                    <div className="absolute top-3 left-4 flex gap-4 text-[9px] font-bold text-muted/40 uppercase tracking-widest z-10">
                        <span>Span Visualization</span>
                        {isIndependent ? (
                            <span className="text-emerald-400 italic">Basis of R²</span>
                        ) : (
                            <span className="text-rose-400 italic">Span Collapsed</span>
                        )}
                    </div>
                    <canvas
                        ref={canvasRef} width={CW} height={CH}
                        className="w-full h-auto cursor-crosshair"
                    />
                </div>

                {/* Right Info Panel */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-black/40 border border-border rounded-xl p-5 space-y-4">
                        <div className="text-[10px] font-black text-muted uppercase tracking-widest border-b border-border pb-2">Technical Insight</div>
                        <p className="text-[11px] text-muted leading-relaxed">
                            {isIndependent ? (
                                "Since v1 and v2 are not multiples of each other, any point in the 2D plane can be reached by combining some amount of v1 and v2. They form a basis."
                            ) : (
                                "Because v2 lies on the same line as v1, they are 'redundant'. Together they can only reach points on this single line. The span is 1D."
                            )}
                        </p>
                        <div className="bg-surface2/30 p-3 rounded border border-border/40 text-[10px] font-mono">
                            <div className="flex justify-between">
                                <span>v1 coordinates:</span>
                                <span className="text-rose-400">({v1.x.toFixed(1)}, {v1.y.toFixed(1)})</span>
                            </div>
                            <div className="flex justify-between">
                                <span>v2 coordinates:</span>
                                <span className="text-emerald-400">({v2.x.toFixed(1)}, {v2.y.toFixed(1)})</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/5 p-4 border border-primary/10 rounded-xl flex gap-3">
                        <span className="material-symbols-outlined text-primary text-sm">psychology</span>
                        <p className="text-[10px] text-muted leading-relaxed italic">
                            The area of the dashed parallelogram is identical to the determinant of the matrix [v1 v2]. Zero area means zero independence.
                        </p>
                    </div>

                    <button
                        onClick={() => { setV2Angle(45); setV2Mag(2); }}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 border border-border rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
                    >
                        Identity Reset
                    </button>
                </div>
            </div>
        </div>
    );
}

