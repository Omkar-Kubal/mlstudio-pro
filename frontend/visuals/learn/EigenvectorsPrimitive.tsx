"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── Constants & Types ───────────────────────────────────────────────────────
const CW = 720, CH = 460;
const SCALE = 70;

// ─── Component ──────────────────────────────────────────────────────────────
export default function EigenvectorsPrimitive() {
    const [a, setA] = useState(2);
    const [b, setB] = useState(1);
    const [c, setC] = useState(0);
    const [d, setD] = useState(1);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const OX = CW / 2, OY = CH / 2;

    const stats = useMemo(() => {
        const trace = a + d;
        const det = a * d - b * c;
        const discriminant = trace * trace - 4 * det;

        let lambda1: number | null = null;
        let lambda2: number | null = null;

        if (discriminant >= 0) {
            lambda1 = (trace + Math.sqrt(discriminant)) / 2;
            lambda2 = (trace - Math.sqrt(discriminant)) / 2;
        }

        return { trace, det, discriminant, lambda1, lambda2 };
    }, [a, b, c, d]);

    const applyM = useCallback((v: { x: number, y: number }) => {
        return {
            x: a * v.x + b * v.y,
            y: c * v.x + d * v.y,
        };
    }, [a, b, c, d]);

    // ─── Drawing Logic ──────────────────────────────────────────────────────
    const drawGrid = (ctx: CanvasRenderingContext2D) => {
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;

        for (let x = -6; x <= 6; x++) {
            ctx.beginPath();
            ctx.moveTo(OX + x * SCALE, 0);
            ctx.lineTo(OX + x * SCALE, CH);
            ctx.stroke();
        }

        for (let y = -6; y <= 6; y++) {
            ctx.beginPath();
            ctx.moveTo(0, OY - y * SCALE);
            ctx.lineTo(CW, OY - y * SCALE);
            ctx.stroke();
        }
        ctx.restore();
    };

    const drawTransformedGrid = (ctx: CanvasRenderingContext2D) => {
        ctx.save();
        ctx.strokeStyle = "hsla(var(--primary), 0.2)";
        ctx.lineWidth = 1.5;

        const range = 6;
        for (let x = -range; x <= range; x++) {
            const p1 = applyM({ x, y: -range });
            const p2 = applyM({ x, y: range });
            ctx.beginPath();
            ctx.moveTo(OX + p1.x * SCALE, OY - p1.y * SCALE);
            ctx.lineTo(OX + p2.x * SCALE, OY - p2.y * SCALE);
            ctx.stroke();
        }
        for (let y = -range; y <= range; y++) {
            const p1 = applyM({ x: -range, y });
            const p2 = applyM({ x: range, y });
            ctx.beginPath();
            ctx.moveTo(OX + p1.x * SCALE, OY - p1.y * SCALE);
            ctx.lineTo(OX + p2.x * SCALE, OY - p2.y * SCALE);
            ctx.stroke();
        }
        ctx.restore();
    };

    const drawEigenDirections = (ctx: CanvasRenderingContext2D) => {
        if (stats.discriminant < 0) return;

        const eigenvalues = [stats.lambda1, stats.lambda2];
        const colors = ["hsl(var(--rose-400))", "hsl(var(--emerald-400))"];

        ctx.save();
        eigenvalues.forEach((lambda, i) => {
            if (lambda === null) return;

            let v;
            if (Math.abs(b) > 0.0001) {
                v = { x: lambda - d, y: b };
            } else if (Math.abs(c) > 0.0001) {
                v = { x: c, y: lambda - a };
            } else {
                v = i === 0 ? { x: 1, y: 0 } : { x: 0, y: 1 };
            }

            const norm = Math.sqrt(v.x * v.x + v.y * v.y);
            if (norm < 0.0001) return;

            const unit = { x: v.x / norm, y: v.y / norm };
            const color = colors[i];

            // draw infinite-like line for eigenvector direction
            ctx.strokeStyle = color;
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 2;
            ctx.beginPath();
            const L = 10; // length multiplier
            ctx.moveTo(OX - unit.x * SCALE * L, OY + unit.y * SCALE * L);
            ctx.lineTo(OX + unit.x * SCALE * L, OY - unit.y * SCALE * L);
            ctx.stroke();

            // draw the unit vector and its transformation
            ctx.setLineDash([]);
            ctx.lineWidth = 4;

            const drawArrow = (from: { x: number, y: number }, to: { x: number, y: number }, col: string) => {
                const dx = to.x - from.x, dy = to.y - from.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                ctx.strokeStyle = col; ctx.fillStyle = col;
                ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x - (dx / len) * 10, to.y - (dy / len) * 10); ctx.stroke();
                const angle = Math.atan2(dy, dx);
                ctx.beginPath(); ctx.moveTo(to.x, to.y);
                ctx.lineTo(to.x - 10 * Math.cos(angle - 0.4), to.y - 10 * Math.sin(angle - 0.4));
                ctx.lineTo(to.x - 10 * Math.cos(angle + 0.4), to.y - 10 * Math.sin(angle + 0.4));
                ctx.closePath(); ctx.fill();
            };

            const origin = { x: OX, y: OY };
            const uPx = { x: OX + unit.x * SCALE, y: OY - unit.y * SCALE };
            const stretched = applyM(unit);
            const sPx = { x: OX + stretched.x * SCALE, y: OY - stretched.y * SCALE };

            // Basis unit vector
            drawArrow(origin, uPx, "white");
            // Transformed vector (should be along the same line)
            drawArrow(origin, sPx, color);

            ctx.font = "bold 12px var(--font-jetbrains)";
            ctx.fillStyle = color;
            ctx.fillText(`v${i + 1}`, uPx.x + 8, uPx.y - 8);
        });
        ctx.restore();
    };

    const render = useCallback(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, CW, CH);
        ctx.fillStyle = "hsl(var(--surface))";
        ctx.fillRect(0, 0, CW, CH);

        drawGrid(ctx);
        drawTransformedGrid(ctx);
        drawEigenDirections(ctx);

        // Origin
        ctx.fillStyle = "white";
        ctx.beginPath(); ctx.arc(OX, OY, 4, 0, Math.PI * 2); ctx.fill();
    }, [a, b, c, d, stats, drawEigenDirections]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        render();
    }, [render]);

    const geometricMeaning = () => {
        if (stats.discriminant < 0)
            return "Rotation-like behavior (no real invariant directions).";

        if (stats.det < 0)
            return "Orientation flip (reflection component present).";

        if (Math.abs((stats.lambda1 ?? 0) - (stats.lambda2 ?? 0)) < 0.0001)
            return "Repeated eigenvalue — possible shear or defective matrix.";

        return "Two invariant directions — pure stretch along eigenvectors.";
    };

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6 select-none">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">psychology</span>
                            Eigenvalues & Eigenvectors
                        </h3>
                        <p className="text-xs text-muted/60 max-w-lg">
                            Invariant directions of a linear transformation. When a matrix acts on them, they stay on their own span — only scaling by λ.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-black/40 border border-border rounded-xl px-4 py-3 min-w-[200px]">
                            <span className="text-[9px] uppercase font-bold text-muted/40 block mb-1">Characteristic Eq Roots (λ)</span>
                            <span className="text-xl font-black text-primary">
                                {stats.discriminant < 0 ? (
                                    <span className="text-rose-400">Complex Pair</span>
                                ) : (
                                    <>λ₁: {stats.lambda1?.toFixed(2)} | λ₂: {stats.lambda2?.toFixed(2)}</>
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Matrix Controls */}
                <div className="grid grid-cols-2 gap-3 bg-black/40 border border-border rounded-xl p-4 min-w-[240px]">
                    {[
                        { label: "a", value: a, setter: setA },
                        { label: "b", value: b, setter: setB },
                        { label: "c", value: c, setter: setC },
                        { label: "d", value: d, setter: setD }
                    ].map((item, idx) => (
                        <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-muted/60 uppercase">
                                <span>{item.label}</span>
                                <span>{item.value.toFixed(1)}</span>
                            </div>
                            <input
                                type="range" min="-3" max="3" step="0.1" value={item.value}
                                onChange={e => item.setter(parseFloat(e.target.value))}
                                className="w-full accent-primary"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Canvas Area */}
                <div className="lg:col-span-8 bg-black/60 border border-border rounded-xl overflow-hidden relative group">
                    <div className="absolute top-3 left-4 flex gap-4 text-[9px] font-bold text-muted/40 uppercase tracking-widest z-10">
                        <span>Invariant Direction Lab</span>
                        <span className="text-primary italic">{geometricMeaning()}</span>
                    </div>
                    <canvas
                        ref={canvasRef} width={CW} height={CH}
                        className="w-full h-auto cursor-crosshair"
                    />
                </div>

                {/* Right Info Panel */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-black/40 border border-border rounded-xl p-5 space-y-4">
                        <div className="text-[10px] font-black text-muted uppercase tracking-widest border-b border-border pb-2">Matrix Properties</div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center bg-surface2/30 p-2 rounded border border-border/40 text-xs">
                                <span className="text-muted/60 font-bold uppercase">Determinant (λ₁·λ₂)</span>
                                <span className="font-mono font-bold text-white">{stats.det.toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between items-center bg-surface2/30 p-2 rounded border border-border/40 text-xs">
                                <span className="text-muted/60 font-bold uppercase">Trace (λ₁+λ₂)</span>
                                <span className="font-mono font-bold text-white">{stats.trace.toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between items-center bg-surface2/30 p-2 rounded border border-border/40 text-xs">
                                <span className="text-muted/60 font-bold uppercase">Discriminant</span>
                                <span className={`font-mono font-bold ${stats.discriminant < 0 ? "text-rose-400" : "text-emerald-400"}`}>{stats.discriminant.toFixed(3)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/5 p-4 border border-primary/10 rounded-xl flex gap-3">
                        <span className="material-symbols-outlined text-primary text-sm">lightbulb</span>
                        <p className="text-[10px] text-muted leading-relaxed italic">
                            For eigenvectors, Av = {"\u03BB"}v. This means the transformed vector is perfectly collinear with the original.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <button
                            onClick={() => { setA(2); setB(1); setC(1); setD(2); }}
                            className="w-full py-2 bg-white/5 hover:bg-white/10 border border-border rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
                        >
                            Symmetric Matrix
                        </button>
                        <button
                            onClick={() => { setA(0); setB(-1); setC(1); setD(0); }}
                            className="w-full py-2 bg-white/5 hover:bg-white/10 border border-border rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
                        >
                            Pure Rotation
                        </button>
                        <button
                            onClick={() => { setA(1); setB(1); setC(0); setD(1); }}
                            className="w-full py-2 bg-white/5 hover:bg-white/10 border border-border rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
                        >
                            Shear Transform
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

