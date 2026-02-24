"use client";

import React, { useState } from "react";
import { FancyBooleanIndexingConfig } from "@/adapters/visual-types";

// ─── Data ──────────────────────────────────────────────────────────────────────
const GRID_DATA = [
    [3, 17, 2, 11, 25],
    [8, 4, 19, 6, 13],
    [22, 1, 14, 7, 28],
    [5, 16, 9, 20, 3],
];

interface Mode {
    key: string;
    label: string;
    code: string;
    color: string;
    rule: string;
    desc: string;
    insight: string;
    test?: (v: number) => boolean;
    selected?: [number, number][];
    sliceRow?: [number, number];
    sliceCol?: [number, number, number];
}

const MODES: Mode[] = [
    {
        key: "boolean",
        label: "Boolean",
        code: "arr[arr > 10]",
        color: "#34d399",
        rule: "Values > 10",
        desc: "A boolean mask of True/False is applied — only True cells survive",
        insight: "Boolean indexing always returns a flat 1D copy. Great for filtering by condition.",
        test: v => v > 10,
    },
    {
        key: "fancy",
        label: "Fancy",
        code: "arr[[0,2], [1,3]]",
        color: "#a78bfa",
        rule: "Rows [0,2] × Cols [1,3]",
        desc: "Pairs of row/col indices pick specific cells — like GPS coordinates",
        insight: "Fancy indexing returns a copy. The selected pairs are (0,1), (0,3), (2,1), (2,3).",
        selected: [[0, 1], [0, 3], [2, 1], [2, 3]],
    },
    {
        key: "slice",
        label: "Slice",
        code: "arr[1:3, ::2]",
        color: "#60a5fa",
        rule: "Rows 1–2, every 2nd col",
        desc: "Rows 1-2, every other column — a rectangular view into the array",
        insight: "Slicing returns a VIEW (no copy). Modifying it changes the original.",
        sliceRow: [1, 3],
        sliceCol: [0, 5, 2],
    },
];

function isSelected(mode: Mode, r: number, c: number): boolean {
    if (mode.key === "boolean") return !!mode.test?.(GRID_DATA[r][c]);
    if (mode.key === "fancy") return mode.selected?.some(([sr, sc]) => sr === r && sc === c) ?? false;
    if (mode.key === "slice") {
        const [rs, re] = mode.sliceRow!;
        const [cs, , step] = mode.sliceCol!;
        const ce = 5;
        return r >= rs && r < re && c >= cs && c < ce && (c - cs) % step === 0;
    }
    return false;
}

// ─── Props ─────────────────────────────────────────────────────────────────────
interface Props { config?: FancyBooleanIndexingConfig; }

// ─── Component ─────────────────────────────────────────────────────────────────
export default function FancyBooleanIndexingPrimitive({ config }: Props) {
    const [modeKey, setModeKey] = useState("boolean");
    const [filtered, setFiltered] = useState(false);

    const mode = MODES.find(m => m.key === modeKey)!;
    const selected: { r: number; c: number; v: number }[] = [];
    GRID_DATA.forEach((row, r) =>
        row.forEach((v, c) => { if (isSelected(mode, r, c)) selected.push({ r, c, v }); })
    );

    const changeMode = (k: string) => { setModeKey(k); setFiltered(false); };

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6 select-none">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">filter_alt</span>
                        Fancy &amp; Boolean Indexing
                    </h3>
                    <p className="text-xs text-muted/60 max-w-lg">
                        Boolean indexing is a <em>filter</em> — if a value doesn&apos;t pass the test it gets ghosted.
                        Fancy indexing picks cells by exact coordinate pairs.
                    </p>
                </div>

                {/* Mode tabs */}
                <div className="flex gap-2 shrink-0 flex-wrap">
                    {MODES.map(m => (
                        <button
                            key={m.key}
                            onClick={() => changeMode(m.key)}
                            className={`px-4 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all font-mono ${modeKey === m.key
                                    ? "border-current"
                                    : "border-border/40 text-muted/50 hover:text-muted hover:border-border"
                                }`}
                            style={modeKey === m.key ? { color: m.color, background: m.color + "18", borderColor: m.color + "60" } : {}}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Code display */}
            <div className="bg-black/60 border border-border/40 rounded-xl px-5 py-3 font-mono text-sm flex items-center gap-4">
                <span className="text-muted/40">numpy &gt;</span>
                <span style={{ color: mode.color }} className="font-bold">{mode.code}</span>
                <span className="ml-auto text-[10px] text-muted/30 italic hidden md:block">{mode.rule}</span>
            </div>

            {/* Visualisation */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Source grid */}
                <div className="lg:col-span-7 bg-black/60 border border-border rounded-xl p-6">
                    <div className="text-[9px] font-black uppercase tracking-widest text-muted/40 mb-4">
                        Source Array (4 × 5)
                    </div>
                    <div className="flex flex-col gap-1.5">
                        {GRID_DATA.map((row, r) => (
                            <div key={r} className="flex gap-1.5">
                                {/* Row index */}
                                <div className="w-5 flex items-center justify-center text-[9px] text-muted/25 font-mono">{r}</div>
                                {row.map((v, c) => {
                                    const sel = isSelected(mode, r, c);
                                    return (
                                        <div
                                            key={c}
                                            style={{
                                                width: 46, height: 46,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                border: `1px solid ${sel ? mode.color + "90" : "rgba(255,255,255,0.06)"}`,
                                                borderRadius: 6,
                                                background: sel ? mode.color + "22" : "rgba(255,255,255,0.02)",
                                                color: sel ? mode.color : "rgba(255,255,255,0.18)",
                                                fontSize: 13, fontWeight: sel ? 700 : 400,
                                                fontFamily: "var(--font-jetbrains, monospace)",
                                                transition: "all 0.3s ease",
                                                opacity: filtered && !sel ? 0.1 : 1,
                                                transform: filtered && !sel ? "scale(0.65)" : "scale(1)",
                                                boxShadow: sel ? `0 0 10px ${mode.color}33` : "none",
                                            }}
                                        >
                                            {v}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                        {/* Col index row */}
                        <div className="flex gap-1.5 mt-1 pl-7">
                            {[0, 1, 2, 3, 4].map(c => (
                                <div key={c} style={{ width: 46 }} className="text-center text-[9px] text-muted/25 font-mono">{c}</div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Controls + result */}
                <div className="lg:col-span-5 space-y-4">

                    {/* Filter button + arrow */}
                    <div className="bg-black/40 border border-border rounded-xl p-5 space-y-4">
                        <div className="text-[10px] font-black text-muted uppercase tracking-widest border-b border-border pb-2">
                            Apply Filter
                        </div>
                        <button
                            onClick={() => setFiltered(f => !f)}
                            className="w-full py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                            style={{
                                background: filtered ? mode.color + "30" : mode.color + "18",
                                border: `1px solid ${mode.color}60`,
                                color: mode.color,
                            }}
                        >
                            {filtered ? "✓ Filtered" : "▶ Filter"}
                        </button>

                        {/* Result boxes */}
                        <div className="space-y-2">
                            <div className="text-[9px] text-muted/40 uppercase tracking-widest">
                                Result — {selected.length} value{selected.length !== 1 ? "s" : ""}
                            </div>
                            <div className="flex flex-wrap gap-1.5 min-h-[52px]">
                                {selected.map(({ r, c, v }, i) => (
                                    <div
                                        key={`${r}-${c}`}
                                        style={{
                                            width: 40, height: 40,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            border: `1px solid ${mode.color}66`,
                                            borderRadius: 6,
                                            background: mode.color + "20",
                                            color: mode.color,
                                            fontSize: 12, fontWeight: 700,
                                            fontFamily: "var(--font-jetbrains, monospace)",
                                            opacity: filtered ? 1 : 0,
                                            transform: filtered ? "scale(1)" : "scale(0.3)",
                                            transition: `opacity 0.28s ${i * 35}ms ease, transform 0.28s ${i * 35}ms ease`,
                                        }}
                                    >
                                        {v}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mode description */}
                    <div className="rounded-xl p-4 space-y-2" style={{ background: mode.color + "08", border: `1px solid ${mode.color}20` }}>
                        <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: mode.color + "aa" }}>
                            How it works
                        </div>
                        <p className="text-[10px] text-muted/70 leading-relaxed">{mode.desc}</p>
                    </div>

                    {/* Key insight */}
                    <div className="bg-primary/5 p-4 border border-primary/10 rounded-xl flex gap-3">
                        <span className="material-symbols-outlined text-primary text-sm mt-0.5">lightbulb</span>
                        <p className="text-[10px] text-muted leading-relaxed italic">{mode.insight}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

