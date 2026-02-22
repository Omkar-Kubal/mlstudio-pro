"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MemoryLayoutConfig } from "@/lib/visual-types";

// ─── Constants ─────────────────────────────────────────────────────────────────
const ROWS = 3, COLS = 4;
const CELL = 54;
const GAP = 5;

type Order = "C" | "F";

interface ScanStep { r: number; c: number; memPos: number }

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getOrder(mode: Order): ScanStep[] {
    if (mode === "C") {
        // Row-major: left→right, top→bottom
        return Array.from({ length: ROWS * COLS }, (_, i) => ({
            r: Math.floor(i / COLS), c: i % COLS, memPos: i,
        }));
    } else {
        // Column-major: top→bottom, left→right
        return Array.from({ length: ROWS * COLS }, (_, i) => ({
            r: i % ROWS, c: Math.floor(i / ROWS), memPos: i,
        }));
    }
}

function getValue(mode: Order, r: number, c: number) {
    return mode === "C" ? r * COLS + c : c * ROWS + r;
}

// ─── Props ─────────────────────────────────────────────────────────────────────
interface Props { config?: MemoryLayoutConfig; }

// ─── Component ─────────────────────────────────────────────────────────────────
export default function MemoryLayoutPrimitive({ config }: Props) {
    const [mode, setMode] = useState<Order>("C");
    const [step, setStep] = useState(-1);
    const [running, setRunning] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const order = getOrder(mode);
    const color = mode === "C" ? "#60a5fa" : "#f472b6";   // blue vs pink
    const SCAN = "#fbbf24";                               // amber scanner

    // Reset when mode changes
    useEffect(() => {
        setStep(-1); setRunning(false);
        if (timerRef.current) clearTimeout(timerRef.current);
    }, [mode]);

    // Stepping animation
    useEffect(() => {
        if (!running) return;
        if (step >= ROWS * COLS - 1) { setRunning(false); return; }
        timerRef.current = setTimeout(() => setStep(s => s + 1), 210);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [running, step]);

    const startScan = () => { setStep(0); setRunning(true); };
    const reset = () => { setStep(-1); setRunning(false); };

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6 select-none">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">memory</span>
                        Memory Layout
                    </h3>
                    <p className="text-xs text-muted/60 max-w-lg">
                        In memory, everything is a flat line. <em>How</em> you traverse a 2D array determines
                        cache efficiency — row-by-row or column-by-column.
                    </p>
                </div>

                {/* Order toggle */}
                <div className="flex gap-2 shrink-0">
                    {(["C", "F"] as Order[]).map(m => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className="px-4 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all"
                            style={mode === m
                                ? { color: m === "C" ? "#60a5fa" : "#f472b6", background: (m === "C" ? "#60a5fa" : "#f472b6") + "18", borderColor: (m === "C" ? "#60a5fa" : "#f472b6") + "60" }
                                : { color: "rgba(255,255,255,0.25)", borderColor: "rgba(255,255,255,0.08)" }
                            }
                        >
                            {m === "C" ? "C-order (row-major)" : "F-order (col-major)"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Visualisation */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* 2D grid */}
                <div className="lg:col-span-5 bg-black/60 border border-border rounded-xl p-6 space-y-3">
                    <div className="text-[9px] font-black uppercase tracking-widest text-muted/40">
                        2D Array ({ROWS} × {COLS})
                    </div>

                    <div className="flex flex-col gap-1">
                        {Array.from({ length: ROWS }, (_, r) => (
                            <div key={r} className="flex gap-1 items-center">
                                <div className="text-[9px] text-muted/25 font-mono w-5 text-right shrink-0">r{r}</div>
                                {Array.from({ length: COLS }, (_, c) => {
                                    const scanIdx = order.findIndex(o => o.r === r && o.c === c);
                                    const isActive = step === scanIdx;
                                    const isPast = step > scanIdx;
                                    const val = getValue(mode, r, c);
                                    return (
                                        <div
                                            key={c}
                                            style={{
                                                width: CELL, height: CELL,
                                                display: "flex", flexDirection: "column",
                                                alignItems: "center", justifyContent: "center",
                                                border: `1.5px solid ${isActive ? SCAN : isPast ? color + "70" : "rgba(255,255,255,0.07)"}`,
                                                borderRadius: 6,
                                                background: isActive ? SCAN + "28" : isPast ? color + "18" : "rgba(255,255,255,0.02)",
                                                color: isActive ? SCAN : isPast ? color : "rgba(255,255,255,0.2)",
                                                fontFamily: "var(--font-jetbrains, monospace)",
                                                transition: "all 0.14s ease",
                                                boxShadow: isActive ? `0 0 18px ${SCAN}55` : "none",
                                                fontSize: 14, fontWeight: isActive ? 700 : 400,
                                            }}
                                        >
                                            <div>{val}</div>
                                            {(isPast || isActive) && (
                                                <div style={{ fontSize: 8, opacity: 0.6 }}>[{scanIdx}]</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                        {/* Col labels */}
                        <div className="flex gap-1 pl-6 mt-1">
                            {Array.from({ length: COLS }, (_, c) => (
                                <div key={c} style={{ width: CELL }} className="text-center text-[9px] text-muted/25 font-mono">c{c}</div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Memory sequence */}
                <div className="lg:col-span-4 bg-black/60 border border-border rounded-xl p-6 space-y-3">
                    <div className="text-[9px] font-black uppercase tracking-widest text-muted/40">
                        Memory Sequence (flat)
                    </div>
                    <div className="flex flex-col gap-1.5">
                        {order.map((cell, i) => {
                            const val = getValue(mode, cell.r, cell.c);
                            const isActive = step === i;
                            const isPast = step > i;
                            return (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="text-[9px] text-muted/25 font-mono w-12 text-right shrink-0">
                                        mem[{i}]
                                    </div>
                                    <div
                                        style={{
                                            flex: 1, height: 32,
                                            display: "flex", alignItems: "center", justifyContent: "space-between",
                                            padding: "0 10px",
                                            border: `1px solid ${isActive ? SCAN : isPast ? color + "55" : "rgba(255,255,255,0.06)"}`,
                                            borderRadius: 4,
                                            background: isActive ? SCAN + "1a" : isPast ? color + "10" : "transparent",
                                            color: isActive ? SCAN : isPast ? color : "rgba(255,255,255,0.18)",
                                            fontFamily: "var(--font-jetbrains, monospace)",
                                            fontSize: 11,
                                            transition: "all 0.14s ease",
                                        }}
                                    >
                                        <span style={{ fontWeight: isActive ? 700 : 400 }}>val = {val}</span>
                                        <span style={{ fontSize: 9, opacity: 0.6 }}>arr[{cell.r}][{cell.c}]</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Info panel */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Controls */}
                    <div className="bg-black/40 border border-border rounded-xl p-5 space-y-3">
                        <div className="text-[10px] font-black text-muted uppercase tracking-widest border-b border-border pb-2">
                            Scan Memory
                        </div>
                        <button
                            onClick={startScan}
                            disabled={running}
                            className="w-full py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                            style={{
                                background: running ? "rgba(255,255,255,0.05)" : color + "28",
                                border: `1px solid ${running ? "rgba(255,255,255,0.08)" : color + "60"}`,
                                color: running ? "rgba(255,255,255,0.2)" : color,
                                cursor: running ? "not-allowed" : "pointer",
                            }}
                        >
                            {running ? "Scanning…" : "▶ Scan"}
                        </button>
                        <button
                            onClick={reset}
                            className="w-full py-2 bg-white/5 hover:bg-white/10 border border-border rounded-lg text-[10px] font-bold uppercase"
                        >
                            ↺ Reset
                        </button>
                        {step >= 0 && (
                            <div className="text-center text-[10px] font-mono" style={{ color: SCAN }}>
                                Step {Math.min(step + 1, ROWS * COLS)} / {ROWS * COLS}
                            </div>
                        )}
                    </div>

                    {/* Mode card */}
                    <div className="rounded-xl p-4 space-y-2" style={{ background: color + "08", border: `1px solid ${color}20` }}>
                        <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: color + "aa" }}>
                            {mode === "C" ? "C-order (row-major)" : "F-order (col-major)"}
                        </div>
                        <p className="text-[10px] text-muted/70 leading-relaxed">
                            {mode === "C"
                                ? "Last axis changes fastest. NumPy default. Row operations are cache-friendly."
                                : "First axis changes fastest. Used by Fortran, BLAS, LAPACK. Column ops are cache-friendly."}
                        </p>
                    </div>

                    {/* Insight */}
                    <div className="bg-primary/5 p-4 border border-primary/10 rounded-xl flex gap-3">
                        <span className="material-symbols-outlined text-primary text-sm mt-0.5">bolt</span>
                        <p className="text-[10px] text-muted leading-relaxed italic">
                            Accessing memory <strong>sequentially</strong> = cache hits = fast.
                            Skipping across rows/columns = cache misses = 10–100× slower.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
