"use client";

import React, { useState, useRef, useEffect } from "react";
import { DecoratorsConfig } from "@/lib/visual-types";

// ─── Data ──────────────────────────────────────────────────────────────────────
const DECORATORS = [
    { key: "log", label: "@log_calls", color: "#34d399", desc: "Prints function name + args on every call", wrapper: "calling greet('Alice')" },
    { key: "timing", label: "@timing", color: "#a78bfa", desc: "Measures and prints execution time", wrapper: "greet() took 0.002 ms" },
    { key: "auth", label: "@require_auth", color: "#fb923c", desc: "Blocks call if user is not authenticated", wrapper: "user logged in ✓ proceeding" },
];

type Phase = "idle" | "enter_shell" | "run_inner" | "exit_shell";

interface LogEntry { text: string; color: string }
interface Props { config?: DecoratorsConfig; }

// ─── Component ─────────────────────────────────────────────────────────────────
export default function DecoratorsPrimitive({ config }: Props) {
    const [decKey, setDecKey] = useState("log");
    const [phase, setPhase] = useState<Phase>("idle");
    const [log, setLog] = useState<LogEntry[]>([]);
    const t1 = useRef<ReturnType<typeof setTimeout> | null>(null);
    const t2 = useRef<ReturnType<typeof setTimeout> | null>(null);
    const t3 = useRef<ReturnType<typeof setTimeout> | null>(null);

    const dec = DECORATORS.find(d => d.key === decKey)!;

    const runDemo = () => {
        setLog([]);
        setPhase("enter_shell");
        setLog([{ text: `[${dec.label}] before: ${dec.wrapper}`, color: dec.color }]);
        t1.current = setTimeout(() => {
            setPhase("run_inner");
            setLog(l => [...l, { text: `[greet] → Hello, Alice!`, color: "#60a5fa" }]);
        }, 900);
        t2.current = setTimeout(() => {
            setPhase("exit_shell");
            setLog(l => [...l, { text: `[${dec.label}] after: cleanup / return value`, color: dec.color }]);
        }, 1800);
        t3.current = setTimeout(() => setPhase("idle"), 2800);
    };

    const reset = () => {
        [t1, t2, t3].forEach(t => { if (t.current) clearTimeout(t.current); });
        setPhase("idle"); setLog([]);
    };

    useEffect(() => () => { [t1, t2, t3].forEach(t => { if (t.current) clearTimeout(t.current); }); }, []);

    const phaseIdx: Record<Phase, number> = { idle: 0, enter_shell: 1, run_inner: 2, exit_shell: 3 };
    const isActive = (p: Phase) => phaseIdx[phase] >= phaseIdx[p] && phase !== "idle";

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6 select-none">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">deployed_code</span>
                        Decorators
                    </h3>
                    <p className="text-xs text-muted/60 max-w-lg">
                        A decorator wraps a function in an outer shell — adding behaviour before and after without touching the original code.
                    </p>
                </div>
                {/* Tabs */}
                <div className="flex gap-2 shrink-0 flex-wrap">
                    {DECORATORS.map(d => (
                        <button
                            key={d.key}
                            onClick={() => { setDecKey(d.key); reset(); }}
                            className="px-3 py-2 rounded-lg border text-[10px] font-black font-mono uppercase tracking-widest transition-all"
                            style={decKey === d.key
                                ? { color: d.color, background: d.color + "18", borderColor: d.color + "55" }
                                : { color: "rgba(255,255,255,0.25)", borderColor: "rgba(255,255,255,0.08)" }}
                        >
                            {d.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Nested diagram */}
            <div className="rounded-xl p-5 transition-all" style={{ border: `2px solid ${dec.color}${isActive("enter_shell") ? "cc" : "30"}`, background: dec.color + "08", boxShadow: isActive("enter_shell") ? `0 0 28px ${dec.color}22` : "none" }}>
                <div className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: dec.color + "aa" }}>
                    {dec.label} &nbsp;← outer shell
                </div>
                <div className="text-[10px] text-muted/50 mb-4">{dec.desc}</div>

                {/* Inner function */}
                <div className="rounded-lg p-4 transition-all" style={{ border: `2px solid ${isActive("run_inner") ? "#60a5fa" : "#60a5fa30"}`, background: "#60a5fa08", boxShadow: isActive("run_inner") ? "0 0 20px #60a5fa33" : "none" }}>
                    <div className="text-[9px] font-black uppercase tracking-widest text-sky-400/60 mb-2">def greet(name) &nbsp;← inner function</div>
                    <div className="font-mono text-sm transition-all" style={{ opacity: isActive("run_inner") ? 1 : 0.25 }}>
                        <span className="text-violet-400">return </span>
                        <span className="text-amber-400">&quot;Hello, Alice!&quot;</span>
                    </div>
                </div>
            </div>

            {/* Execution log */}
            <div className="bg-black/60 border border-border rounded-xl p-4 min-h-[72px]">
                <div className="text-[9px] font-black uppercase tracking-widest text-muted/30 mb-3">Execution Log</div>
                {log.length === 0
                    ? <div className="text-[10px] text-muted/30 italic">Press Call Function to run…</div>
                    : log.map((e, i) => (
                        <div key={i} className="text-[11px] font-mono mb-1" style={{ color: e.color }}>
                            › {e.text}
                        </div>
                    ))
                }
            </div>

            {/* Controls */}
            <div className="flex gap-3">
                <button
                    onClick={runDemo}
                    disabled={phase !== "idle"}
                    className="px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                    style={{ background: phase === "idle" ? dec.color + "cc" : "rgba(255,255,255,0.05)", color: phase === "idle" ? "#000" : "rgba(255,255,255,0.2)", cursor: phase === "idle" ? "pointer" : "not-allowed" }}
                >
                    ▶ Call Function
                </button>
                <button onClick={reset} className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-border rounded-lg text-[10px] font-bold uppercase">↺ Reset</button>
            </div>

            {/* Code */}
            <div className="bg-black/60 border border-border rounded-xl p-4 font-mono text-xs space-y-1">
                <div style={{ color: dec.color }}>@{decKey}_decorator</div>
                <div><span className="text-violet-400">def </span><span className="text-sky-400">greet</span><span className="text-muted/70">(name):</span></div>
                <div className="pl-4"><span className="text-violet-400">return </span><span className="text-amber-400">f&quot;Hello, {"{name}"}!&quot;</span></div>
                <div className="text-muted/30 text-[10px] pt-1"># same as: greet = {decKey}_decorator(greet)</div>
            </div>
        </div>
    );
}
