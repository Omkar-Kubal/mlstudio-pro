"use client";

import React, { useState } from "react";
import { BroadcastingConfig } from "@/adapters/visual-types";

// ─── Types ─────────────────────────────────────────────────────────────────────
type Phase = "initial" | "broadcast" | "result";

interface Example {
    label: string;
    aShape: number[];
    bShape: number[];
    aVals: number[][];
    bVals: number[][];
    rule: string;
    desc: string;
}

// ─── Data ──────────────────────────────────────────────────────────────────────
const EXAMPLES: Example[] = [
    {
        label: "(3,1) + (1,3)",
        aShape: [3, 1],
        bShape: [1, 3],
        aVals: [[1], [2], [3]],
        bVals: [[10, 20, 30]],
        desc: "A stretches right → B stretches down → 3×3 result",
        rule: "Dimensions of size 1 are stretched to match the other",
    },
    {
        label: "(3,3) + (3,)",
        aShape: [3, 3],
        bShape: [3],
        aVals: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
        bVals: [[10, 20, 30]],
        desc: "B (1D) treated as (1,3) then broadcasts down each row",
        rule: "1D arrays are implicitly treated as a row vector (1,n)",
    },
    {
        label: "(4,1) + (1,)",
        aShape: [4, 1],
        bShape: [1],
        aVals: [[5], [10], [15], [20]],
        bVals: [[100]],
        desc: "Scalar-like B broadcasts to fill the entire 4×1 shape",
        rule: "Scalars (or size-1 arrays) broadcast to any shape",
    },
];

const CELL = 44;
const GAP = 4;

// ─── Cell component ────────────────────────────────────────────────────────────
function Cell({ val, colorHex, ghost = false, highlight = false }: {
    val: number | null; colorHex: string; ghost?: boolean; highlight?: boolean;
}) {
    return (
        <div style={{
            width: CELL, height: CELL,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `1px solid ${ghost ? "rgba(255,255,255,0.1)" : colorHex + "66"}`,
            borderRadius: 6,
            background: ghost ? "rgba(255,255,255,0.04)" : (highlight ? colorHex + "40" : colorHex + "18"),
            color: ghost ? "rgba(255,255,255,0.18)" : colorHex,
            fontSize: 13, fontWeight: 700,
            fontFamily: "var(--font-jetbrains, monospace)",
            transition: "all 0.35s ease",
            boxShadow: highlight ? `0 0 12px ${colorHex}44` : "none",
        }}>
            {val === null ? "·" : val}
        </div>
    );
}

// ─── Grid renderer ─────────────────────────────────────────────────────────────
function Grid({ rows }: { rows: Array<Array<{ val: number | null; colorHex: string; ghost?: boolean; highlight?: boolean }>> }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: GAP }}>
            {rows.map((row, r) => (
                <div key={r} style={{ display: "flex", gap: GAP }}>
                    {row.map((cell, c) => (
                        <Cell key={c} val={cell.val} colorHex={cell.colorHex} ghost={cell.ghost} highlight={cell.highlight} />
                    ))}
                </div>
            ))}
        </div>
    );
}

// ─── Props ─────────────────────────────────────────────────────────────────────
interface Props { config?: BroadcastingConfig; }

// ─── Component ─────────────────────────────────────────────────────────────────
export default function BroadcastingPrimitive({ config: _config }: Props) {
    const [exIdx, setExIdx] = useState(0);
    const [phase, setPhase] = useState<Phase>("initial");

    const ex = EXAMPLES[exIdx];

    // Color tokens
    const COLOR_A = "#60a5fa";  // blue
    const COLOR_B = "#f472b6";  // pink
    const COLOR_C = "#34d399";  // emerald

    // Compute result shape
    const rows = Math.max(ex.aVals.length, ex.bVals.length);
    const cols = Math.max(ex.aVals[0].length, ex.bVals[0].length);

    // Compute actual result values
    const result = Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
            const a = ex.aVals[r % ex.aVals.length][c % ex.aVals[0].length];
            const b = ex.bVals[r % ex.bVals.length][c % ex.bVals[0].length];
            return a + b;
        })
    );

    // Broadcast views
    const broadcastedA = Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => ({
            val: ex.aVals[r % ex.aVals.length][c % ex.aVals[0].length],
            colorHex: COLOR_A,
            ghost: c >= ex.aVals[0].length,
        }))
    );

    const broadcastedB = Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => ({
            val: ex.bVals[r % ex.bVals.length][c % ex.bVals[0].length],
            colorHex: COLOR_B,
            ghost: r >= ex.bVals.length,
        }))
    );

    const resultGrid = result.map(row =>
        row.map(v => ({ val: v, colorHex: COLOR_C, highlight: true }))
    );

    const reset = (idx: number) => { setExIdx(idx); setPhase("initial"); };

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6 select-none">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">broadcast_on_personal</span>
                        Array Broadcasting
                    </h3>
                    <p className="text-xs text-muted/60 max-w-lg">
                        Broadcasting is NumPy&apos;s way of &ldquo;cheating&rdquo; — it makes small arrays grow
                        <em className="text-muted/80"> ghost rows and columns</em>, with zero extra RAM.
                    </p>
                </div>

                {/* Example tabs */}
                <div className="flex gap-2 shrink-0 flex-wrap">
                    {EXAMPLES.map((e, i) => (
                        <button
                            key={i}
                            onClick={() => reset(i)}
                            className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all font-mono ${exIdx === i
                                    ? "bg-sky-400/20 border-sky-400/50 text-sky-400"
                                    : "border-border/40 text-muted/50 hover:text-muted hover:border-border"
                                }`}
                        >
                            {e.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main visualisation */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Arrays + result panel */}
                <div className="lg:col-span-8 bg-black/60 border border-border rounded-xl p-6">
                    <div className="flex flex-wrap gap-6 items-center justify-center">

                        {/* Array A */}
                        <div className="text-center space-y-2">
                            <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: COLOR_A }}>
                                Array A &nbsp; shape ({ex.aShape.join("×")})
                            </div>
                            <Grid rows={ex.aVals.map(row => row.map(v => ({ val: v, colorHex: COLOR_A })))} />
                        </div>

                        <div className="text-2xl text-muted/30 font-bold">+</div>

                        {/* Array B */}
                        <div className="text-center space-y-2">
                            <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: COLOR_B }}>
                                Array B &nbsp; shape ({ex.bShape.join("×")})
                            </div>
                            <Grid rows={ex.bVals.map(row => row.map(v => ({ val: v, colorHex: COLOR_B })))} />
                        </div>

                        <div className="text-2xl text-muted/30 font-bold">=</div>

                        {/* Result / Broadcast */}
                        <div className="text-center space-y-2">
                            <div
                                className="text-[9px] font-black uppercase tracking-widest transition-colors"
                                style={{ color: phase === "result" ? COLOR_C : "rgba(255,255,255,0.25)" }}
                            >
                                {phase === "initial" && `Result  shape (${rows}×${cols})`}
                                {phase === "broadcast" && "Broadcasting →"}
                                {phase === "result" && "Result ✓"}
                            </div>

                            {phase === "initial" && (
                                <div
                                    style={{
                                        width: cols * (CELL + GAP) - GAP,
                                        height: rows * (CELL + GAP) - GAP,
                                    }}
                                    className="border-2 border-dashed border-border/40 rounded-xl flex items-center justify-center"
                                >
                                    <span className="text-[10px] text-muted/30">click Broadcast ①</span>
                                </div>
                            )}

                            {phase === "broadcast" && (
                                <div className="space-y-3">
                                    <Grid rows={broadcastedA} />
                                    <div className="text-[9px] text-muted/40 text-center">A broadcast +</div>
                                    <Grid rows={broadcastedB} />
                                    <div className="text-[9px] text-muted/40 italic text-center">
                                        pale = virtual copy (no RAM)
                                    </div>
                                </div>
                            )}

                            {phase === "result" && <Grid rows={resultGrid} />}
                        </div>
                    </div>
                </div>

                {/* Info panel */}
                <div className="lg:col-span-4 space-y-4">

                    {/* Step buttons */}
                    <div className="bg-black/40 border border-border rounded-xl p-5 space-y-3">
                        <div className="text-[10px] font-black text-muted uppercase tracking-widest border-b border-border pb-2">Steps</div>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => setPhase("broadcast")}
                                disabled={phase !== "initial"}
                                className={`w-full py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${phase === "initial"
                                        ? "bg-pink-500/80 text-white hover:bg-pink-500"
                                        : "bg-white/5 text-muted/30 cursor-not-allowed"
                                    }`}
                            >
                                ① Broadcast
                            </button>
                            <button
                                onClick={() => setPhase("result")}
                                disabled={phase !== "broadcast"}
                                className={`w-full py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${phase === "broadcast"
                                        ? "bg-emerald-500/80 text-white hover:bg-emerald-500"
                                        : "bg-white/5 text-muted/30 cursor-not-allowed"
                                    }`}
                            >
                                ② Compute
                            </button>
                            <button
                                onClick={() => setPhase("initial")}
                                className="w-full py-2 bg-white/5 hover:bg-white/10 border border-border rounded-lg text-[10px] font-bold uppercase"
                            >
                                ↺ Reset
                            </button>
                        </div>
                    </div>

                    {/* Rule card */}
                    <div className="bg-sky-400/5 border border-sky-400/15 rounded-xl p-4 space-y-2">
                        <div className="text-[9px] font-black text-sky-400/60 uppercase tracking-widest">Broadcasting Rule</div>
                        <p className="text-[10px] text-muted/80 leading-relaxed">{ex.rule}</p>
                        <p className="text-[10px] text-muted/50 leading-relaxed italic">{ex.desc}</p>
                    </div>

                    {/* Key insight */}
                    <div className="bg-primary/5 p-4 border border-primary/10 rounded-xl flex gap-3">
                        <span className="material-symbols-outlined text-primary text-sm mt-0.5">memory</span>
                        <p className="text-[10px] text-muted leading-relaxed italic">
                            Ghost cells are <strong>never allocated</strong> in RAM. NumPy uses stride tricks to re-read the same bytes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

