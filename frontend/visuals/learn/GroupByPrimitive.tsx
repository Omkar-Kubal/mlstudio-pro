"use client";

import React, { useState, useRef, useEffect } from "react";
import { GroupByConfig } from "@/lib/visual-types";

// ─── Data ──────────────────────────────────────────────────────────────────────
const RAW_DATA = [
    { id: 1, category: "A", value: 12 },
    { id: 2, category: "B", value: 7 },
    { id: 3, category: "A", value: 5 },
    { id: 4, category: "C", value: 20 },
    { id: 5, category: "B", value: 14 },
    { id: 6, category: "C", value: 3 },
    { id: 7, category: "A", value: 9 },
    { id: 8, category: "B", value: 11 },
    { id: 9, category: "C", value: 8 },
];

const AGGS = [
    { key: "sum", label: ".sum()", fn: (a: number[]) => a.reduce((s, v) => s + v, 0) },
    { key: "mean", label: ".mean()", fn: (a: number[]) => +(a.reduce((s, v) => s + v, 0) / a.length).toFixed(1) },
    { key: "count", label: ".count()", fn: (a: number[]) => a.length },
    { key: "max", label: ".max()", fn: (a: number[]) => Math.max(...a) },
];

const CAT_COLOR: Record<string, string> = { A: "#f472b6", B: "#60a5fa", C: "#34d399" };
type Phase = "idle" | "split" | "apply" | "combine";

// ─── Props ─────────────────────────────────────────────────────────────────────
interface Props { config?: GroupByConfig; }

// ─── Component ─────────────────────────────────────────────────────────────────
export default function GroupByPrimitive({ config }: Props) {
    const [phase, setPhase] = useState<Phase>("idle");
    const [aggKey, setAggKey] = useState("sum");
    const t1 = useRef<ReturnType<typeof setTimeout> | null>(null);
    const t2 = useRef<ReturnType<typeof setTimeout> | null>(null);

    const agg = AGGS.find(a => a.key === aggKey)!;
    const groups: Record<string, number[]> = { A: [], B: [], C: [] };
    RAW_DATA.forEach(r => groups[r.category].push(r.value));
    const results: Record<string, number> = {};
    Object.entries(groups).forEach(([k, v]) => { results[k] = agg.fn(v); });

    const phaseIdx = ["idle", "split", "apply", "combine"].indexOf(phase);

    const run = () => {
        setPhase("split");
        t1.current = setTimeout(() => setPhase("apply"), 900);
        t2.current = setTimeout(() => setPhase("combine"), 1800);
    };
    const reset = () => {
        if (t1.current) clearTimeout(t1.current);
        if (t2.current) clearTimeout(t2.current);
        setPhase("idle");
    };

    // clean up on unmount
    useEffect(() => () => { if (t1.current) clearTimeout(t1.current); if (t2.current) clearTimeout(t2.current); }, []);

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6 select-none">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">category</span>
                        GroupBy: Split → Apply → Combine
                    </h3>
                    <p className="text-xs text-muted/60 max-w-lg">
                        GroupBy partitions a DataFrame by a key column, applies an aggregation to each group, then reassembles the results.
                    </p>
                </div>

                {/* Agg tabs */}
                <div className="flex gap-2 shrink-0 flex-wrap">
                    {AGGS.map(a => (
                        <button
                            key={a.key}
                            onClick={() => { setAggKey(a.key); reset(); }}
                            className={`px-3 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all font-mono ${aggKey === a.key
                                    ? "bg-amber-400/20 border-amber-400/50 text-amber-400"
                                    : "border-border/40 text-muted/50 hover:text-muted hover:border-border"
                                }`}
                        >
                            {a.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Phase progress bar */}
            <div className="flex rounded-lg overflow-hidden border border-border text-[9px] font-black uppercase tracking-widest">
                {["① Split", "② Apply", "③ Combine"].map((label, i) => (
                    <div
                        key={label}
                        className={`flex-1 py-2 text-center transition-all border-r border-border last:border-r-0 ${phaseIdx === i + 1 ? "bg-white/10 text-amber-400" :
                                phaseIdx > i + 1 ? "bg-white/5 text-muted/50" : "text-muted/25"
                            }`}
                    >
                        {label}
                    </div>
                ))}
            </div>

            {/* Visualisation */}
            <div className="flex flex-wrap gap-4 items-start justify-center">

                {/* Source table */}
                <div className="bg-black/60 border border-border rounded-xl overflow-hidden shrink-0">
                    <div className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-muted/40 border-b border-border">
                        Source DataFrame
                    </div>
                    <table className="text-xs font-mono">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="px-4 py-1.5 text-left text-muted/40 font-normal">category</th>
                                <th className="px-4 py-1.5 text-left text-muted/40 font-normal">value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {RAW_DATA.map((row, i) => (
                                <tr
                                    key={i}
                                    className="border-b border-border/30 last:border-0"
                                    style={{
                                        opacity: phase === "split" ? 0.3 : 1,
                                        transition: "opacity 0.5s ease",
                                    }}
                                >
                                    <td className="px-4 py-1.5 font-bold" style={{ color: CAT_COLOR[row.category] }}>{row.category}</td>
                                    <td className="px-4 py-1.5 text-muted/80">{row.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Arrow + split groups */}
                {phase !== "idle" && (
                    <>
                        <div className="text-xl text-muted/25 self-center">→</div>
                        <div className="flex gap-3 flex-wrap justify-center">
                            {Object.entries(groups).map(([cat, vals]) => (
                                <div
                                    key={cat}
                                    className="rounded-xl overflow-hidden"
                                    style={{
                                        border: `1px solid ${CAT_COLOR[cat]}44`,
                                        opacity: phaseIdx >= 1 ? 1 : 0,
                                        transform: phaseIdx >= 1 ? "translateY(0)" : "translateY(16px)",
                                        transition: "all 0.4s ease",
                                        minWidth: 88,
                                    }}
                                >
                                    <div
                                        className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-center border-b"
                                        style={{ color: CAT_COLOR[cat], background: CAT_COLOR[cat] + "20", borderColor: CAT_COLOR[cat] + "30" }}
                                    >
                                        Group {cat}
                                    </div>
                                    {vals.map((v, i) => (
                                        <div
                                            key={i}
                                            className="px-4 py-1.5 text-xs text-center font-mono border-b border-border/20 last:border-0"
                                            style={{ color: CAT_COLOR[cat] }}
                                        >
                                            {v}
                                        </div>
                                    ))}
                                    {/* Apply result */}
                                    {phaseIdx >= 2 && (
                                        <div
                                            className="px-3 py-2 text-xs text-center font-black border-t-2 transition-all"
                                            style={{ color: CAT_COLOR[cat], background: CAT_COLOR[cat] + "28", borderColor: CAT_COLOR[cat] }}
                                        >
                                            {agg.label} = {results[cat]}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Final result table */}
                {phase === "combine" && (
                    <>
                        <div className="text-xl text-muted/25 self-center">→</div>
                        <div className="bg-black/60 border border-amber-400/30 rounded-xl overflow-hidden shrink-0">
                            <div className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-amber-400 border-b border-amber-400/20">
                                Result
                            </div>
                            <table className="text-xs font-mono">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="px-4 py-1.5 text-left text-muted/40 font-normal">category</th>
                                        <th className="px-4 py-1.5 text-left text-amber-400 font-normal">value{agg.label}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(results).map(([cat, val]) => (
                                        <tr key={cat} className="border-b border-border/30 last:border-0">
                                            <td className="px-4 py-2 font-bold" style={{ color: CAT_COLOR[cat] }}>{cat}</td>
                                            <td className="px-4 py-2 font-bold text-amber-400">{val}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {/* Controls */}
            <div className="flex gap-3 items-center justify-center">
                <button
                    onClick={run}
                    disabled={phase !== "idle"}
                    className={`px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${phase === "idle"
                            ? "bg-amber-400/80 text-black hover:bg-amber-400"
                            : "bg-white/5 text-muted/30 cursor-not-allowed"
                        }`}
                >
                    ▶ Run GroupBy
                </button>
                <button
                    onClick={reset}
                    className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-border rounded-lg text-[10px] font-bold uppercase"
                >
                    ↺ Reset
                </button>
            </div>

            {/* Code snippet */}
            <div className="bg-amber-400/5 border border-amber-400/15 rounded-xl p-4 font-mono text-xs text-muted/70">
                <span className="text-amber-400">» </span>
                df.groupby(<span className="text-pink-400">&apos;category&apos;</span>)[<span className="text-pink-400">&apos;value&apos;</span>]{agg.label}()
                <span className="ml-4 text-muted/30">← try all four aggs above</span>
            </div>
        </div>
    );
}
