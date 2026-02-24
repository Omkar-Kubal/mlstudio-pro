"use client";

import React, { useState, useRef, useEffect } from "react";
import { GeneratorsConfig } from "@/adapters/visual-types";

const TOTAL = 20;
type Mode = "list" | "generator";
interface Props { config?: GeneratorsConfig; }

export default function GeneratorsPrimitive({ config }: Props) {
    const [mode, setMode] = useState<Mode>("list");
    const [genStep, setGenStep] = useState(0);
    const [listLoaded, setListLoaded] = useState(false);
    const [running, setRunning] = useState(false);
    const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const reset = () => {
        if (animRef.current) clearTimeout(animRef.current);
        setGenStep(0); setListLoaded(false); setRunning(false);
    };

    useEffect(() => { reset(); }, [mode]);
    useEffect(() => () => { if (animRef.current) clearTimeout(animRef.current); }, []);

    const runAutoGen = () => {
        setRunning(true);
        let s = 0;
        function step() {
            s++;
            setGenStep(s);
            if (s < TOTAL) {
                animRef.current = setTimeout(step, 180);
            } else {
                setRunning(false);
            }
        }
        step();
    };

    const LIST_COLOR = "#f87171";
    const GEN_COLOR = "#34d399";
    const curColor = mode === "list" ? LIST_COLOR : GEN_COLOR;

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6 select-none">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">list</span>
                        Generators vs Lists
                    </h3>
                    <p className="text-xs text-muted/60 max-w-lg">
                        A list front-loads all values into RAM. A generator computes one item on demand — enabling infinite sequences and tiny memory footprints.
                    </p>
                </div>
                {/* Mode tabs */}
                <div className="flex gap-2 shrink-0">
                    {(["list", "generator"] as Mode[]).map(m => {
                        const c = m === "list" ? LIST_COLOR : GEN_COLOR;
                        return (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className="px-4 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all"
                                style={mode === m
                                    ? { color: c, background: c + "18", borderColor: c + "55" }
                                    : { color: "rgba(255,255,255,0.25)", borderColor: "rgba(255,255,255,0.08)" }}
                            >
                                {m === "list" ? "[ ] List" : "(…) Generator"}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Cell grid */}
            <div className="bg-black/60 border border-border rounded-xl p-5 space-y-4">
                <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: curColor + "aa" }}>
                    {mode === "list"
                        ? `All ${TOTAL} items loaded into memory at once`
                        : `One item computed at a time on demand · step ${genStep}/${TOTAL}`
                    }
                </div>

                <div className="flex flex-wrap gap-2">
                    {Array.from({ length: TOTAL }, (_, i) => {
                        let visible = false, isCurrent = false;
                        if (mode === "list") {
                            visible = listLoaded;
                        } else {
                            visible = i < genStep;
                            isCurrent = i === genStep - 1;
                        }
                        return (
                            <div
                                key={i}
                                className="flex items-center justify-center rounded-lg transition-all"
                                style={{
                                    width: 44, height: 44,
                                    border: `1.5px solid ${isCurrent ? curColor : visible ? curColor + "44" : "rgba(255,255,255,0.06)"}`,
                                    background: isCurrent ? curColor + "28" : visible ? curColor + "0f" : "transparent",
                                    color: visible ? curColor : "rgba(255,255,255,0.12)",
                                    fontSize: 12, fontWeight: isCurrent ? "bold" : "normal",
                                    fontFamily: "var(--font-jetbrains, monospace)",
                                    boxShadow: isCurrent ? `0 0 14px ${curColor}55` : "none",
                                    opacity: mode === "list" ? (listLoaded ? 1 : 0) : 1,
                                    transform: mode === "list" ? (listLoaded ? "scale(1)" : "scale(0.4)") : "scale(1)",
                                    transitionDelay: mode === "list" ? `${i * 18}ms` : "0ms",
                                }}
                            >
                                {visible ? i * i : "·"}
                            </div>
                        );
                    })}
                </div>

                {/* RAM bar */}
                <div>
                    <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-muted/40">RAM usage</span>
                        <span style={{ color: curColor }} className="font-bold">
                            {mode === "list"
                                ? listLoaded ? "HIGH — all items pre-computed" : "—"
                                : "LOW — only 1 value in memory"
                            }
                        </span>
                    </div>
                    <div className="h-3 bg-black/60 rounded-full overflow-hidden border border-border">
                        <div
                            className="h-full rounded-full transition-all"
                            style={{
                                width: mode === "list" ? (listLoaded ? "92%" : "0%") : (genStep === 0 ? "3%" : "8%"),
                                background: `linear-gradient(90deg, ${curColor}, ${curColor}88)`,
                                transition: "width 0.6s ease",
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Controls */}
            {mode === "list" ? (
                <div className="flex gap-3 items-center">
                    <button
                        onClick={() => { setListLoaded(false); setTimeout(() => setListLoaded(true), 80); }}
                        className="px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                        style={{ background: LIST_COLOR + "cc", color: "#fff" }}
                    >
                        ▶ Load List
                    </button>
                    <button onClick={reset} className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-border rounded-lg text-[10px] font-bold uppercase">↺</button>
                    <div className="font-mono text-[10px] text-muted/40">[x*x for x in range({TOTAL})]</div>
                </div>
            ) : (
                <div className="flex gap-3 items-center flex-wrap">
                    <button
                        onClick={() => { setGenStep(0); setTimeout(runAutoGen, 30); }}
                        disabled={running}
                        className="px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                        style={{ background: running ? "rgba(255,255,255,0.05)" : GEN_COLOR + "cc", color: running ? "rgba(255,255,255,0.2)" : "#000", cursor: running ? "not-allowed" : "pointer" }}
                    >
                        {running ? "Yielding…" : genStep === 0 ? "▶ Start" : "▶ Restart"}
                    </button>
                    <button
                        onClick={() => { if (!running && genStep < TOTAL) setGenStep(s => s + 1); }}
                        disabled={running || genStep >= TOTAL}
                        className="px-4 py-3 rounded-lg border text-[10px] font-black uppercase tracking-widest font-mono transition-all"
                        style={{ borderColor: GEN_COLOR + "55", color: GEN_COLOR }}
                    >
                        next()
                    </button>
                    <button onClick={reset} className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-border rounded-lg text-[10px] font-bold uppercase">↺</button>
                    <div className="font-mono text-[10px] text-muted/40">(x*x for x in range({TOTAL}))</div>
                </div>
            )}

            {/* Insight */}
            <div className="rounded-xl p-4 border flex gap-3" style={{ background: curColor + "08", borderColor: curColor + "20" }}>
                <span className="material-symbols-outlined text-sm mt-0.5" style={{ color: curColor }}>bolt</span>
                <p className="text-[10px] text-muted/70 leading-relaxed">
                    <strong style={{ color: curColor }}>Use generators when</strong> data is too large for RAM, you only need items one at a time (streaming), or the sequence is potentially infinite.
                    Use lists when you need random access or multiple passes.
                </p>
            </div>
        </div>
    );
}

