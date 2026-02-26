"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { NumpyArraysConfig } from "@/adapters/visual-types";

// ─── Data ──────────────────────────────────────────────────────────────────────
const VALUES = Array.from({ length: 12 }, (_, i) => i + 1);

const _COLORS = [
    "hsl(239 84% 67%)",  // indigo
    "hsl(262 83% 58%)",  // violet
    "hsl(270 76% 73%)",  // light violet
    "hsl(235 79% 69%)",  // periwinkle
    "hsl(213 94% 68%)",  // blue
    "hsl(199 89% 48%)",  // sky
    "hsl(160 84% 39%)",  // emerald
    "hsl(142 71% 45%)",  // green
    "hsl(48 96% 53%)",   // yellow
    "hsl(25 95% 53%)",   // orange
    "hsl(0 91% 71%)",    // red
    "hsl(330 81% 60%)",  // pink
];

const HEX_COLORS = [
    "#6366f1", "#8b5cf6", "#a78bfa", "#818cf8",
    "#60a5fa", "#38bdf8", "#34d399", "#4ade80",
    "#facc15", "#fb923c", "#f87171", "#f472b6",
];

const SHAPES = [
    { label: "1D [12]", dims: [12], desc: "A flat line — 12 numbers in sequence" },
    { label: "2D [3×4]", dims: [3, 4], desc: "Shaped into 3 rows × 4 columns" },
    { label: "2D [4×3]", dims: [4, 3], desc: "Shaped into 4 rows × 3 columns" },
    { label: "2D [2×6]", dims: [2, 6], desc: "Shaped into 2 rows × 6 columns" },
    { label: "3D [2×2×3]", dims: [2, 2, 3], desc: "Two 2×3 matrices — a mini cube!" },
];

// ─── Animated Cell ─────────────────────────────────────────────────────────────
function Cell({ val, colorIdx, delay, animate }: { val: number; colorIdx: number; delay: number; animate: boolean }) {
    const [visible, setVisible] = useState(!animate);

    useEffect(() => {
        if (!animate) { setVisible(true); return; }
        setVisible(false);
        const t = setTimeout(() => setVisible(true), delay);
        return () => clearTimeout(t);
    }, [animate, delay, val]);

    const hex = HEX_COLORS[colorIdx];

    return (
        <div
            style={{
                width: 44, height: 44,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${hex}55`,
                borderRadius: 6,
                background: hex + "18",
                color: hex,
                fontSize: 13, fontWeight: 700,
                fontFamily: "var(--font-jetbrains), monospace",
                opacity: visible ? 1 : 0,
                transform: visible ? "scale(1)" : "scale(0.35)",
                transition: "opacity 0.22s ease, transform 0.22s ease",
            }}
        >
            {val}
        </div>
    );
}

// ─── Shape Grid renderer ───────────────────────────────────────────────────────
function ShapeGrid({ dims, animate }: { dims: number[]; animate: boolean }) {
    if (dims.length === 1) {
        return (
            <div className="flex flex-wrap justify-center gap-1">
                {VALUES.map((v, i) => (
                    <Cell key={i} val={v} colorIdx={i} delay={i * 28} animate={animate} />
                ))}
            </div>
        );
    }

    if (dims.length === 2) {
        const [rows, cols] = dims;
        return (
            <div className="flex flex-col items-center gap-1">
                {Array.from({ length: rows }, (_, r) => (
                    <div key={r} className="flex gap-1">
                        {Array.from({ length: cols }, (_, c) => {
                            const idx = r * cols + c;
                            return <Cell key={c} val={VALUES[idx]} colorIdx={idx} delay={idx * 35} animate={animate} />;
                        })}
                    </div>
                ))}
            </div>
        );
    }

    if (dims.length === 3) {
        const [depth, rows, cols] = dims;
        return (
            <div className="flex gap-5 justify-center">
                {Array.from({ length: depth }, (_, d) => (
                    <div key={d} className="border border-border/40 rounded-xl p-3 bg-white/[0.03]">
                        <div className="text-[9px] text-muted/40 text-center mb-2 uppercase tracking-widest">
                            depth [{d}]
                        </div>
                        <div className="flex flex-col gap-1">
                            {Array.from({ length: rows }, (_, r) => (
                                <div key={r} className="flex gap-1">
                                    {Array.from({ length: cols }, (_, c) => {
                                        const idx = d * rows * cols + r * cols + c;
                                        return <Cell key={c} val={VALUES[idx]} colorIdx={idx} delay={idx * 35} animate={animate} />;
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return null;
}

// ─── Props ─────────────────────────────────────────────────────────────────────
interface Props {
    config?: NumpyArraysConfig;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function NumpyArraysPrimitive({ config: _config }: Props) {
    const [shapeIdx, setShapeIdx] = useState(0);
    const [animate, setAnimate] = useState(false);
    const memCanvasRef = useRef<HTMLCanvasElement>(null);

    const shape = SHAPES[shapeIdx];
    const ndim = shape.dims.length;
    const size = shape.dims.reduce((a, b) => a * b, 1);

    // ─── Draw flat memory bar ────────────────────────────────────────────────
    const drawMemory = useCallback(() => {
        const canvas = memCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "hsl(var(--surface))";
        ctx.fillRect(0, 0, W, H);

        const cellW = (W - 20) / 12;
        VALUES.forEach((v, i) => {
            const x = 10 + i * cellW;
            const hex = HEX_COLORS[i];
            ctx.fillStyle = hex + "25";
            ctx.fillRect(x, 6, cellW - 2, H - 14);
            ctx.strokeStyle = hex + "70";
            ctx.lineWidth = 1;
            ctx.strokeRect(x, 6, cellW - 2, H - 14);
            ctx.fillStyle = hex;
            ctx.font = "bold 10px var(--font-jetbrains, monospace)";
            ctx.textAlign = "center";
            ctx.fillText(String(v), x + (cellW - 2) / 2, H / 2 + 4);
        });

        // address labels below
        ctx.fillStyle = "rgba(255,255,255,0.18)";
        ctx.font = "8px monospace";
        ctx.textAlign = "center";
        VALUES.forEach((_, i) => {
            const x = 10 + i * cellW;
            ctx.fillText(`[${i}]`, x + (cellW - 2) / 2, H - 1);
        });
    }, []);

    useEffect(() => { drawMemory(); }, [drawMemory]);

    const changeShape = (idx: number) => {
        setAnimate(true);
        setShapeIdx(idx);
        setTimeout(() => setAnimate(false), 900);
    };

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6 select-none">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">grid_on</span>
                        NumPy Arrays &amp; Shapes
                    </h3>
                    <p className="text-xs text-muted/60 max-w-lg">
                        An array is just a <em>view</em> of a flat line of numbers in memory.
                        <code className="text-primary mx-1">reshape()</code> never copies data — it only changes the <em>interpretation</em>.
                    </p>
                </div>

                {/* Metadata badges */}
                <div className="flex gap-3 shrink-0">
                    {[
                        { label: "ndim", val: ndim },
                        { label: "shape", val: `(${shape.dims.join(", ")})` },
                        { label: "size", val: size },
                        { label: "dtype", val: "int64" },
                    ].map(({ label, val }) => (
                        <div key={label} className="bg-black/40 border border-border/40 rounded-xl px-3 py-2 text-center min-w-[60px]">
                            <div className="text-[9px] uppercase font-bold text-muted/40 mb-0.5">{label}</div>
                            <div className="text-sm font-black text-primary font-mono">{val}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Memory strip */}
            <div className="space-y-2">
                <div className="text-[9px] font-bold text-muted/40 uppercase tracking-widest">
                    Memory — always a flat contiguous block of 12 values
                </div>
                <canvas
                    ref={memCanvasRef}
                    width={680} height={48}
                    className="w-full rounded-lg border border-border/40"
                />
            </div>

            {/* reshape() arrow */}
            <div className="flex items-center justify-center gap-3 text-muted/30">
                <div className="h-px flex-1 bg-border/40" />
                <span className="text-xs font-mono text-primary/60">.reshape({shape.dims.join(", ")})</span>
                <div className="h-px flex-1 bg-border/40" />
            </div>

            {/* Shape selector tabs */}
            <div className="flex gap-2 flex-wrap justify-center">
                {SHAPES.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => changeShape(i)}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${shapeIdx === i
                                ? "bg-primary/20 border-primary/50 text-primary"
                                : "border-border/40 text-muted/50 hover:text-muted hover:border-border"
                            }`}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            {/* Visualization area + info */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-black/60 border border-border rounded-xl p-8 min-h-[200px] flex items-center justify-center relative">
                    <div className="absolute top-3 left-4 text-[9px] font-bold text-muted/30 uppercase tracking-widest">
                        {shape.desc}
                    </div>
                    <ShapeGrid dims={shape.dims} animate={animate} />
                </div>

                <div className="lg:col-span-4 space-y-4">
                    {/* Code snippet */}
                    <div className="bg-black/60 border border-border rounded-xl p-4 font-mono text-[11px] leading-7">
                        <div><span className="text-primary">import</span> <span className="text-foreground">numpy</span> <span className="text-primary">as</span> <span className="text-foreground">np</span></div>
                        <div className="text-muted/40 text-[10px] mt-1"># same memory, new view</div>
                        <div>
                            <span className="text-foreground">arr</span>
                            <span className="text-muted/60"> = </span>
                            <span className="text-foreground">np</span>
                            <span className="text-muted/60">.</span>
                            <span className="text-green-400">arange</span>
                            <span className="text-muted/60">(</span>
                            <span className="text-amber-400">1</span>
                            <span className="text-muted/60">, </span>
                            <span className="text-amber-400">13</span>
                            <span className="text-muted/60">)</span>
                        </div>
                        <div>
                            <span className="text-foreground">arr</span>
                            <span className="text-muted/60">.</span>
                            <span className="text-green-400">reshape</span>
                            <span className="text-muted/60">(</span>
                            <span className="text-amber-400">{shape.dims.join(", ")}</span>
                            <span className="text-muted/60">)</span>
                        </div>
                        <div className="mt-1 text-muted/40 text-[10px]">
                            # shape: ({shape.dims.join(", ")})
                        </div>
                        <div className="text-muted/40 text-[10px]">
                            # ndim: {ndim}  size: {size}
                        </div>
                    </div>

                    {/* Key insight */}
                    <div className="bg-primary/5 p-4 border border-primary/10 rounded-xl flex gap-3">
                        <span className="material-symbols-outlined text-primary text-sm mt-0.5">memory</span>
                        <p className="text-[10px] text-muted leading-relaxed italic">
                            <strong>Critical:</strong> reshape() returns a <em>view</em>, not a copy.
                            Changing a value in the reshaped array modifies the original — they share the same bytes.
                        </p>
                    </div>

                    {/* Memory layout note */}
                    <div className="bg-black/20 border border-border/40 rounded-xl p-4">
                        <div className="text-[9px] font-bold text-muted/40 uppercase mb-2">C-order (row-major)</div>
                        <p className="text-[10px] text-muted/70 leading-relaxed">
                            NumPy stores data in C-order by default: the <em>last axis changes fastest</em>.
                            Reading left→right in memory follows the last dimension first.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

