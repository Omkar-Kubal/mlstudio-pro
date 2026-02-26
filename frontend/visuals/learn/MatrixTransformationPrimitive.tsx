"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";

// ─── Constants & Types ───────────────────────────────────────────────────────
const CW = 740, CH = 520;
const SCALE = 50;
const GRID_RANGE = 7;

type ViewMode = "both" | "before" | "after" | "morph";

const PRESETS = [
    { name: "Identity", vals: [1, 0, 0, 1] },
    { name: "Scale ×2", vals: [2, 0, 0, 2] },
    { name: "Rotate 90°", vals: [0, -1, 1, 0] },
    { name: "Rotate 45°", vals: [0.707, -0.707, 0.707, 0.707] },
    { name: "Shear X", vals: [1, 1, 0, 1] },
    { name: "Reflect X", vals: [-1, 0, 0, 1] },
    { name: "Collapse", vals: [1, 0, 0, 0] },
];

// ─── Component ──────────────────────────────────────────────────────────────
export default function MatrixTransformationPrimitive() {
    const [m, setM] = useState<number[]>([2, 0, 0, 2]); // [m00, m01, m10, m11]
    const [view, setView] = useState<ViewMode>("both");
    const [morphT, setMorphT] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number | undefined>(undefined);

    // ─── Math Helpers ───────────────────────────────────────────────────────
    const applyM = (mat: number[], v: { x: number, y: number }) => ({
        x: mat[0] * v.x + mat[1] * v.y,
        y: mat[2] * v.x + mat[3] * v.y
    });

    const OX = CW / 2, OY = CH / 2;
    const tc = (v: { x: number, y: number }) => ({ x: OX + v.x * SCALE, y: OY - v.y * SCALE });

    const stats = useMemo(() => {
        const det = m[0] * m[3] - m[1] * m[2];
        const trace = m[0] + m[3];
        const rank = Math.abs(det) > 0.001 ? 2 : (Math.abs(m[0]) + Math.abs(m[1]) + Math.abs(m[2]) + Math.abs(m[3]) > 0.001 ? 1 : 0);
        return { det, trace, rank, inv: rank === 2 };
    }, [m]);

    // ─── Drawing logic ──────────────────────────────────────────────────────
    const drawGrid = (ctx: CanvasRenderingContext2D, mat: number[], alpha: number, color: string) => {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;

        for (let x = -GRID_RANGE; x <= GRID_RANGE; x++) {
            const p0 = applyM(mat, { x, y: -GRID_RANGE });
            const p1 = applyM(mat, { x, y: GRID_RANGE });
            const c0 = tc(p0), c1 = tc(p1);
            ctx.beginPath(); ctx.moveTo(c0.x, c0.y); ctx.lineTo(c1.x, c1.y); ctx.stroke();
        }
        for (let y = -GRID_RANGE; y <= GRID_RANGE; y++) {
            const p0 = applyM(mat, { x: -GRID_RANGE, y });
            const p1 = applyM(mat, { x: GRID_RANGE, y });
            const c0 = tc(p0), c1 = tc(p1);
            ctx.beginPath(); ctx.moveTo(c0.x, c0.y); ctx.lineTo(c1.x, c1.y); ctx.stroke();
        }
        ctx.restore();
    };

    const drawBasis = (ctx: CanvasRenderingContext2D, mat: number[]) => {
        const iLand = applyM(mat, { x: 1, y: 0 });
        const jLand = applyM(mat, { x: 0, y: 1 });
        const origin = tc({ x: 0, y: 0 });

        const drawArrow = (from: { x: number, y: number }, to: { x: number, y: number }, color: string) => {
            const dx = to.x - from.x, dy = to.y - from.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len < 5) return;
            ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x - (dx / len) * 12, to.y - (dy / len) * 12); ctx.stroke();
            const angle = Math.atan2(dy, dx);
            ctx.beginPath(); ctx.moveTo(to.x, to.y);
            ctx.lineTo(to.x - 12 * Math.cos(angle - 0.4), to.y - 12 * Math.sin(angle - 0.4));
            ctx.lineTo(to.x - 12 * Math.cos(angle + 0.4), to.y - 12 * Math.sin(angle + 0.4));
            ctx.closePath(); ctx.fill();
        };

        drawArrow(origin, tc(iLand), "hsl(var(--rose-400))");
        drawArrow(origin, tc(jLand), "hsl(var(--emerald-400))");

        ctx.font = "bold 12px var(--font-jetbrains)";
        ctx.fillStyle = "hsl(var(--rose-400))";
        ctx.fillText("î'", tc(iLand).x + 10, tc(iLand).y + 5);
        ctx.fillStyle = "hsl(var(--emerald-400))";
        ctx.fillText("ĵ'", tc(jLand).x - 5, tc(jLand).y - 10);
    };

    useEffect(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, CW, CH);
        ctx.fillStyle = "hsl(var(--surface))";
        ctx.fillRect(0, 0, CW, CH);

        const identity = [1, 0, 0, 1];

        if (view === "before") {
            drawGrid(ctx, identity, 0.2, "white");
            drawBasis(ctx, identity);
        } else if (view === "after") {
            drawGrid(ctx, m, 0.3, "hsl(var(--primary))");
            drawBasis(ctx, m);
        } else if (view === "morph") {
            const mt = [
                identity[0] + (m[0] - identity[0]) * morphT,
                identity[1] + (m[1] - identity[1]) * morphT,
                identity[2] + (m[2] - identity[2]) * morphT,
                identity[3] + (m[3] - identity[3]) * morphT,
            ];
            drawGrid(ctx, mt, 0.3, "hsl(var(--primary))");
            drawBasis(ctx, mt);
        } else {
            drawGrid(ctx, identity, 0.1, "white");
            drawGrid(ctx, m, 0.3, "hsl(var(--primary))");
            drawBasis(ctx, m);
        }

        // Origin Dot
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.beginPath(); ctx.arc(OX, OY, 4, 0, Math.PI * 2); ctx.fill();

    }, [m, view, morphT]); // eslint-disable-line react-hooks/exhaustive-deps

    // ─── Animation Loop ─────────────────────────────────────────────────────
    useEffect(() => {
        if (view !== "morph") return;
        let direction = 1;
        let currentT = 0;

        const animate = () => {
            currentT += 0.01 * direction;
            if (currentT >= 1) { currentT = 1; direction = -1; }
            if (currentT <= 0) { currentT = 0; direction = 1; }
            setMorphT(currentT);
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, [view]);

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6 select-none">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">grid_view</span>
                            Matrix Grid Warp
                        </h3>
                        <p className="text-xs text-muted/60 max-w-lg">
                            Watch how a 2×2 matrix defines the destination of base vectors {"\u03CC"} and {"\u03CD"}.
                        </p>
                    </div>

                    <div className="flex gap-2 p-1 bg-black/20 border border-border rounded-xl w-fit">
                        {(["both", "before", "after", "morph"] as ViewMode[]).map(v => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === v ? "bg-primary text-white" : "text-muted/60 hover:text-muted"
                                    }`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Matrix Input */}
                <div className="flex items-center gap-2">
                    <div className="text-[40px] font-thin text-muted/30 select-none">[</div>
                    <div className="grid grid-cols-2 gap-2">
                        {m.map((val, idx) => (
                            <input
                                key={idx}
                                type="number"
                                step="0.5"
                                value={val}
                                onChange={(e) => {
                                    const nextM = [...m];
                                    nextM[idx] = parseFloat(e.target.value) || 0;
                                    setM(nextM);
                                }}
                                className={`w-16 bg-black/40 border border-border rounded px-2 py-1 text-center font-mono text-sm focus:border-primary outline-none ${idx % 2 === 0 ? "text-rose-400" : "text-emerald-400"}`}
                            />
                        ))}
                    </div>
                    <div className="text-[40px] font-thin text-muted/30 select-none">]</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Canvas Area */}
                <div className="lg:col-span-8 bg-black/60 border border-border rounded-xl overflow-hidden relative">
                    <div className="absolute top-3 left-4 flex gap-4 text-[9px] font-bold text-muted/40 uppercase tracking-widest z-10">
                        <span>LInear Transformation Lab</span>
                        <span className={stats.det < 0 ? "text-rose-500" : "text-emerald-500"}>Determinant: {stats.det.toFixed(2)}</span>
                    </div>
                    <canvas ref={canvasRef} width={CW} height={CH} className="w-full h-auto cursor-crosshair" />
                </div>

                {/* Right Panel */}
                <div className="lg:col-span-4 space-y-4">
                    {/* Presets */}
                    <div className="bg-black/40 border border-border rounded-xl p-5 space-y-4">
                        <div className="text-[10px] font-black text-muted uppercase tracking-widest border-b border-border pb-2">Preset Transforms</div>
                        <div className="grid grid-cols-2 gap-2">
                            {PRESETS.map((p, i) => (
                                <button
                                    key={i}
                                    onClick={() => setM(p.vals)}
                                    className="p-2 bg-surface2/50 border border-border rounded text-[10px] font-bold text-muted/80 hover:border-primary hover:text-white transition-all text-left"
                                >
                                    <div className="text-[9px] uppercase tracking-tighter text-primary/80">{p.name}</div>
                                    <div className="font-mono text-[8px] opacity-40">[{p.vals.join(" ")}]</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-black/40 border border-border rounded-xl p-5 space-y-3">
                        <div className="text-[10px] font-black text-muted uppercase tracking-widest border-b border-border pb-2">Matrix Properties</div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center bg-surface2/30 p-2 rounded border border-border/40">
                                <span className="text-[9px] text-muted uppercase font-bold">Determinant</span>
                                <span className={`text-[11px] font-mono font-bold ${stats.det < 0 ? "text-rose-500" : "text-emerald-500"}`}>{stats.det.toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between items-center bg-surface2/30 p-2 rounded border border-border/40">
                                <span className="text-[9px] text-muted uppercase font-bold">Trace</span>
                                <span className="text-[11px] font-mono font-bold text-primary">{stats.trace.toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between items-center bg-surface2/30 p-2 rounded border border-border/40">
                                <span className="text-[9px] text-muted uppercase font-bold">Rank</span>
                                <span className="text-[11px] font-mono font-bold text-white">{stats.rank}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/5 p-4 border border-primary/10 rounded-xl flex gap-3">
                        <span className="material-symbols-outlined text-primary text-sm">lightbulb</span>
                        <p className="text-[10px] text-muted leading-relaxed italic">
                            {Math.abs(stats.det) < 0.001 ? (
                                <span><strong>Rank Collapse!</strong> Matrix is singular. Area collapses to zero.</span>
                            ) : stats.det < 0 ? (
                                <span><strong>Flipped Orientation!</strong> Negative det means handedness is reversed.</span>
                            ) : (
                                <span>Each column tells us where the basis vectors land. Everything else stretches in between.</span>
                            )}
                        </p>
                    </div>

                    <button
                        onClick={() => setM([1, 0, 0, 1])}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 border border-border rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
                    >
                        Identity Reset
                    </button>
                </div>
            </div>
        </div>
    );
}

