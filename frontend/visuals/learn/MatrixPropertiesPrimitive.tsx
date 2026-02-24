"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Constants & Types ───────────────────────────────────────────────────────
const CW = 480, CH = 340;
const SCALE = 42;

type PropertyMode = "transpose" | "inverse" | "rank";

// ─── Math Helpers ───────────────────────────────────────────────────────
const applyM = (m: number[], v: { x: number, y: number }) => ({
    x: m[0] * v.x + m[1] * v.y,
    y: m[2] * v.x + m[3] * v.y
});

const det = (m: number[]) => m[0] * m[3] - m[1] * m[2];

const getInverse = (m: number[]) => {
    const d = det(m);
    if (Math.abs(d) < 0.0001) return null;
    return [m[3] / d, -m[1] / d, -m[2] / d, m[0] / d];
};

const getTranspose = (m: number[]) => [m[0], m[2], m[1], m[3]];

// ─── Component ──────────────────────────────────────────────────────────────
export default function MatrixPropertiesPrimitive() {
    const [m, setM] = useState<number[]>([2, 1, 0, 3]); // [m00, m01, m10, m11]
    const [mode, setMode] = useState<PropertyMode>("transpose");
    const [animT, setAnimT] = useState(0);
    const [rankT, setRankT] = useState(1); // 0..1
    const [animIsRunning, setAnimIsRunning] = useState(false);

    const leftRef = useRef<HTMLCanvasElement>(null);
    const rightRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number | undefined>(undefined);

    const OX = CW / 2, OY = CH / 2;

    // ─── Drawing Logic ──────────────────────────────────────────────────────
    const drawArrow = (ctx: CanvasRenderingContext2D, from: { x: number, y: number }, to: { x: number, y: number }, color: string) => {
        const dx = to.x - from.x, dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 4) return;
        ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x - (dx / len) * 10, to.y - (dy / len) * 10); ctx.stroke();
        const angle = Math.atan2(dy, dx);
        ctx.beginPath(); ctx.moveTo(to.x, to.y);
        ctx.lineTo(to.x - 10 * Math.cos(angle - 0.4), to.y - 10 * Math.sin(angle - 0.4));
        ctx.lineTo(to.x - 10 * Math.cos(angle + 0.4), to.y - 10 * Math.sin(angle + 0.4));
        ctx.closePath(); ctx.fill();
    };

    const drawGrid = (ctx: CanvasRenderingContext2D, mat: number[], alpha: number, color: string) => {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.8;
        const range = 6;
        for (let x = -range; x <= range; x++) {
            const p0 = applyM(mat, { x, y: -range }), p1 = applyM(mat, { x, y: range });
            ctx.beginPath(); ctx.moveTo(OX + p0.x * SCALE, OY - p0.y * SCALE); ctx.lineTo(OX + p1.x * SCALE, OY - p1.y * SCALE); ctx.stroke();
        }
        for (let y = -range; y <= range; y++) {
            const p0 = applyM(mat, { x: -range, y }), p1 = applyM(mat, { x: range, y });
            ctx.beginPath(); ctx.moveTo(OX + p0.x * SCALE, OY - p0.y * SCALE); ctx.lineTo(OX + p1.x * SCALE, OY - p1.y * SCALE); ctx.stroke();
        }
        ctx.restore();
    };

    const drawBasis = (ctx: CanvasRenderingContext2D, mat: number[]) => {
        const iLand = applyM(mat, { x: 1, y: 0 });
        const jLand = applyM(mat, { x: 0, y: 1 });
        const origin = { x: OX, y: OY };
        drawArrow(ctx, origin, { x: OX + iLand.x * SCALE, y: OY - iLand.y * SCALE }, "hsl(var(--rose-400))");
        drawArrow(ctx, origin, { x: OX + jLand.x * SCALE, y: OY - jLand.y * SCALE }, "hsl(var(--emerald-400))");
    };

    const render = useCallback(() => {
        const lCtx = leftRef.current?.getContext("2d");
        const rCtx = rightRef.current?.getContext("2d");
        if (!lCtx || !rCtx) return;

        // Common background
        [lCtx, rCtx].forEach(c => {
            c.clearRect(0, 0, CW, CH);
            c.fillStyle = "hsl(var(--surface))";
            c.fillRect(0, 0, CW, CH);
            drawGrid(c, [1, 0, 0, 1], 0.1, "white");
        });

        // Left Canvas: Always M
        drawGrid(lCtx, m, 0.3, "white");
        drawBasis(lCtx, m);

        // Right Canvas: Depends on Mode
        if (mode === "transpose") {
            const mt = getTranspose(m);
            drawGrid(rCtx, mt, 0.3, "hsl(var(--primary))");
            drawBasis(rCtx, mt);
        } else if (mode === "inverse") {
            const inv = getInverse(m);
            if (!inv) {
                rCtx.fillStyle = "hsla(var(--rose-400), 0.1)";
                rCtx.fillRect(0, 0, CW, CH);
                rCtx.fillStyle = "hsl(var(--rose-400))";
                rCtx.font = "bold 14px var(--font-jetbrains)";
                rCtx.textAlign = "center";
                rCtx.fillText("M IS SINGULAR", CW / 2, CH / 2);
            } else {
                // Interpolate M -> I for "undoing"
                const identity = [1, 0, 0, 1];
                const currentMat = m.map((v, idx) => v + (identity[idx] - v) * animT);
                drawGrid(rCtx, currentMat, 0.3, "hsl(var(--emerald-400))");
                drawBasis(rCtx, currentMat);
            }
        } else if (mode === "rank") {
            // Collapse to rank1 then rank0
            let rMat;
            if (rankT >= 0.5) {
                const tt = (rankT - 0.5) * 2;
                const r1 = [m[0], 0, m[2], 0];
                rMat = r1.map((v, idx) => v + (m[idx] - r1[idx]) * tt);
            } else {
                const tt = rankT * 2;
                const r1 = [m[0], 0, m[2], 0];
                rMat = r1.map(v => v * tt);
            }
            drawGrid(rCtx, rMat, 0.3, "hsl(var(--primary))");
            drawBasis(rCtx, rMat);
        }

    }, [m, mode, animT, rankT]);

    useEffect(() => {
        render();
    }, [render]);

    // ─── Animation Loop ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!animIsRunning) return;
        let direction = 1;
        let t = 0;
        const animate = () => {
            t += 0.01 * direction;
            if (t >= 1) { t = 1; direction = -1; }
            if (t <= 0) { t = 0; direction = 1; }
            setAnimT(t);
            requestRef.current = requestAnimationFrame(animate);
        };
        requestRef.current = requestAnimationFrame(animate);
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, [animIsRunning]);

    const result = useMemo(() => {
        if (mode === "transpose") return getTranspose(m);
        if (mode === "inverse") return getInverse(m);
        return null;
    }, [m, mode]);

    const d = det(m);

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6 select-none">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">architecture</span>
                            Matrix Properties Lab
                        </h3>
                        <p className="text-xs text-muted/60 max-w-lg">
                            Exploring transposes, inverses, and the geometric meaning of rank collapse.
                        </p>
                    </div>
                    {/* Mode Tabs */}
                    <div className="flex gap-2 p-1 bg-black/20 border border-border rounded-xl w-fit">
                        {(["transpose", "inverse", "rank"] as PropertyMode[]).map(p => (
                            <button
                                key={p}
                                onClick={() => { setMode(p); setAnimIsRunning(false); setAnimT(0); }}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === p ? "bg-primary text-white" : "text-muted/60 hover:text-muted"
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Matrix Editor */}
                <div className="bg-black/40 border border-border rounded-xl p-4 flex flex-col items-center">
                    <div className="text-[9px] font-bold text-muted/40 uppercase tracking-widest mb-3">Input Matrix M</div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-thin text-muted/30">[</span>
                        <div className="grid grid-cols-2 gap-2">
                            {m.map((val, idx) => (
                                <input
                                    key={idx} type="number" step="0.5" value={val}
                                    onChange={e => {
                                        const nextM = [...m];
                                        nextM[idx] = parseFloat(e.target.value) || 0;
                                        setM(nextM);
                                    }}
                                    className="w-12 bg-surface2/50 border border-border rounded text-center text-xs font-mono focus:border-primary outline-none py-1"
                                />
                            ))}
                        </div>
                        <span className="text-2xl font-thin text-muted/30">]</span>
                    </div>
                </div>
            </div>

            {/* Visual Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-black/60 border border-border rounded-xl overflow-hidden relative">
                    <div className="absolute top-3 left-4 text-[9px] font-bold text-muted/40 uppercase tracking-widest">Original M</div>
                    <canvas ref={leftRef} width={CW} height={CH} className="w-full h-auto" />
                </div>
                <div className="bg-black/60 border border-border rounded-xl overflow-hidden relative">
                    <div className="absolute top-3 left-4 text-[9px] font-bold text-muted/40 uppercase tracking-widest">
                        {mode === "transpose" ? "Transpose Mᵀ" : mode === "inverse" ? "Inverse Undo M⁻¹" : "Rank Collapse"}
                    </div>
                    <canvas ref={rightRef} width={CW} height={CH} className="w-full h-auto" />
                </div>
            </div>

            {/* Footer Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black/40 border border-border rounded-xl p-5 space-y-4">
                    <div className="text-[10px] font-black text-muted uppercase tracking-widest border-b border-border pb-2">Properties</div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-muted/60">Determinant</span>
                            <span className={`font-mono font-bold ${Math.abs(d) < 0.001 ? "text-rose-400" : "text-white"}`}>{d.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-muted/60">Invertible?</span>
                            <span className={`font-bold ${Math.abs(d) < 0.001 ? "text-rose-400" : "text-emerald-400"}`}>{Math.abs(d) < 0.001 ? "NO" : "YES"}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-black/40 border border-border rounded-xl p-5 flex flex-col justify-center items-center text-center">
                    {mode === "rank" ? (
                        <div className="w-full space-y-4">
                            <div className="text-[10px] font-black text-muted uppercase tracking-widest border-b border-border pb-2 mb-2">Collapse Slider</div>
                            <input
                                type="range" min="0" max="1" step="0.01" value={rankT} onChange={e => setRankT(parseFloat(e.target.value))}
                                className="w-full accent-primary"
                            />
                            <div className="text-[10px] font-bold text-primary italic">
                                {rankT < 0.1 ? "Rank 0: All points collapse to origin" : rankT < 0.9 ? "Rank 1: Plane collapses to a single line" : "Rank 2: Full 2D space survives"}
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setAnimIsRunning(!animIsRunning)}
                            className={`w-full py-4 rounded-xl border transition-all flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest ${animIsRunning ? "border-primary bg-primary/10 text-primary" : "border-border bg-white/5 text-muted hover:text-white"
                                }`}
                        >
                            <span className="material-symbols-outlined">{animIsRunning ? "pause" : "play_arrow"}</span>
                            {animIsRunning ? "Stop Demo" : "Animate Operation"}
                        </button>
                    )}
                </div>

                <div className="bg-surface2/10 border border-border rounded-xl p-5 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-sm text-primary">psychology</span>
                        <span className="text-[10px] font-black text-muted uppercase">Intuition</span>
                    </div>
                    <p className="text-[10px] text-muted/80 leading-relaxed italic">
                        {mode === "transpose" ? "Rows become columns. For rotation matrices, the transpose is exactly the inverse." :
                            mode === "inverse" ? "The inverse applies the 'opposite' warp, returning the unit square to its original state." :
                                "Rank is the count of independent basis vectors. If one column is a multiple of another, rank drops to 1."}
                    </p>
                </div>
            </div>
        </div>
    );
}

