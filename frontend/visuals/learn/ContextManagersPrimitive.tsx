"use client";

import React, { useState, useRef, useEffect } from "react";
import { ContextManagersConfig } from "@/lib/visual-types";

// ─── Data ──────────────────────────────────────────────────────────────────────
const CONTEXTS = [
    { key: "file", label: "open(file)", icon: "📄", enterMsg: "__enter__: file opened, handle returned", workMsg: "Reading / writing file contents…", exitMsg: "__exit__: file.close() called automatically", errorMsg: "__exit__: file STILL closed even on exception!" },
    { key: "db", label: "db.connect()", icon: "🗄️", enterMsg: "__enter__: connection established", workMsg: "Executing SQL queries…", exitMsg: "__exit__: connection released", errorMsg: "__exit__: connection released even on crash!" },
    { key: "lock", label: "threading.Lock()", icon: "🔒", enterMsg: "__enter__: lock.acquire() — thread holds lock", workMsg: "Critical section executing…", exitMsg: "__exit__: lock.release() — other threads unblocked", errorMsg: "__exit__: lock released — no deadlock!" },
];

type Step = "idle" | "enter" | "work" | "exit";
interface LogEntry { text: string; color: string; icon: string }
interface Props { config?: ContextManagersConfig; }

const ENTER_COLOR = "#60a5fa";
const WORK_COLOR = "#34d399";
const EXIT_COLOR = "#f472b6";
const ERROR_COLOR = "#f87171";

// ─── Component ─────────────────────────────────────────────────────────────────
export default function ContextManagersPrimitive({ config }: Props) {
    const [ctxKey, setCtxKey] = useState("file");
    const [step, setStep] = useState<Step>("idle");
    const [hasError, setHasError] = useState(false);
    const [log, setLog] = useState<LogEntry[]>([]);
    const t1 = useRef<ReturnType<typeof setTimeout> | null>(null);
    const t2 = useRef<ReturnType<typeof setTimeout> | null>(null);
    const t3 = useRef<ReturnType<typeof setTimeout> | null>(null);

    const ctx = CONTEXTS.find(c => c.key === ctxKey)!;

    const run = (withError = false) => {
        setHasError(withError);
        setLog([]);
        setStep("enter");
        setLog([{ text: ctx.enterMsg, color: ENTER_COLOR, icon: "→" }]);
        t1.current = setTimeout(() => {
            setStep("work");
            setLog(l => [...l, {
                text: withError ? "💥 Exception raised mid-operation!" : ctx.workMsg,
                color: withError ? ERROR_COLOR : WORK_COLOR,
                icon: withError ? "!" : "▸",
            }]);
        }, 1000);
        t2.current = setTimeout(() => {
            setStep("exit");
            setLog(l => [...l, { text: withError ? ctx.errorMsg : ctx.exitMsg, color: EXIT_COLOR, icon: "←" }]);
        }, 2200);
        t3.current = setTimeout(() => setStep("idle"), 3400);
    };

    const reset = () => {
        [t1, t2, t3].forEach(t => { if (t.current) clearTimeout(t.current); });
        setStep("idle"); setLog([]); setHasError(false);
    };

    useEffect(() => () => { [t1, t2, t3].forEach(t => { if (t.current) clearTimeout(t.current); }); }, []);

    const STEP_ORDER = ["idle", "enter", "work", "exit"] as Step[];
    const stepIdx = STEP_ORDER.indexOf(step);
    const isAt = (s: Step) => stepIdx >= STEP_ORDER.indexOf(s) && step !== "idle";

    const PHASES = [
        { key: "enter" as Step, label: "① __enter__", color: ENTER_COLOR, sub: ctx.enterMsg },
        { key: "work" as Step, label: "② body", color: hasError && stepIdx >= 2 ? ERROR_COLOR : WORK_COLOR, sub: hasError && step === "work" ? "💥 Exception!" : ctx.workMsg },
        { key: "exit" as Step, label: "③ __exit__", color: EXIT_COLOR, sub: hasError ? ctx.errorMsg : ctx.exitMsg },
    ];

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6 select-none">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">lock_open</span>
                        Context Managers
                    </h3>
                    <p className="text-xs text-muted/60 max-w-lg">
                        The <code className="text-sky-400">with</code> statement guarantees <code className="text-pink-400">__exit__</code> is called — on success <em>and</em> on exceptions.
                        No resource leaks.
                    </p>
                </div>
                {/* Tabs */}
                <div className="flex gap-2 shrink-0 flex-wrap">
                    {CONTEXTS.map(c => (
                        <button
                            key={c.key}
                            onClick={() => { setCtxKey(c.key); reset(); }}
                            className="px-3 py-2 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all"
                            style={ctxKey === c.key
                                ? { color: ENTER_COLOR, background: ENTER_COLOR + "18", borderColor: ENTER_COLOR + "55" }
                                : { color: "rgba(255,255,255,0.25)", borderColor: "rgba(255,255,255,0.08)" }}
                        >
                            {c.icon} {c.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Code block */}
            <div className="bg-black/80 border border-border rounded-xl overflow-hidden font-mono text-sm">
                <div className="px-5 py-4 border-b border-border/50 space-y-1">
                    <div>
                        <span className="text-violet-400">with </span>
                        <span className="text-sky-400">{ctx.label} </span>
                        <span className="text-muted/50">as </span>
                        <span className="text-emerald-400">resource</span>
                        <span className="text-muted/50">:</span>
                    </div>
                    <div className="pl-6" style={{ opacity: isAt("work") ? 1 : 0.3, transition: "opacity 0.35s" }}>
                        <span className="text-emerald-400">do_work</span>
                        <span className="text-muted/50">(resource)</span>
                    </div>
                    <div className="text-[9px] text-muted/30 mt-1"># __exit__ runs here always — even on exceptions</div>
                </div>

                {/* Phase rows */}
                <div>
                    {PHASES.map(({ key, label, color, sub }, i) => {
                        const active = stepIdx > i;
                        const current = step === key;
                        return (
                            <div
                                key={key}
                                className="flex items-start gap-3 px-5 py-3 border-t border-border/30 transition-all"
                                style={{ background: current ? color + "12" : active ? color + "06" : "transparent" }}
                            >
                                <div
                                    className="mt-1 rounded-full w-2.5 h-2.5 shrink-0 transition-all"
                                    style={{ background: current ? color : active ? color + "66" : "#1e293b", boxShadow: current ? `0 0 8px ${color}` : "none" }}
                                />
                                <div>
                                    <div className="text-[10px] font-black" style={{ color: current ? color : active ? color + "aa" : "#374151" }}>{label}</div>
                                    {(current || active) && (
                                        <div className="text-[9px] text-muted/40 mt-0.5 leading-relaxed">{sub}</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Log */}
            {log.length > 0 && (
                <div className="bg-black/60 border border-border rounded-xl px-5 py-4 space-y-1">
                    {log.map((e, i) => (
                        <div key={i} className="text-[11px] font-mono flex gap-2" style={{ color: e.color }}>
                            <span>{e.icon}</span><span>{e.text}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Controls */}
            <div className="flex gap-3 flex-wrap">
                <button
                    onClick={() => run(false)}
                    disabled={step !== "idle"}
                    className="px-5 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                    style={{ background: step === "idle" ? ENTER_COLOR + "cc" : "rgba(255,255,255,0.05)", color: step === "idle" ? "#000" : "rgba(255,255,255,0.2)", cursor: step === "idle" ? "pointer" : "not-allowed" }}
                >
                    ▶ Normal Run
                </button>
                <button
                    onClick={() => run(true)}
                    disabled={step !== "idle"}
                    className="px-5 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                    style={{ background: step === "idle" ? ERROR_COLOR + "cc" : "rgba(255,255,255,0.05)", color: step === "idle" ? "#fff" : "rgba(255,255,255,0.2)", cursor: step === "idle" ? "pointer" : "not-allowed" }}
                >
                    💥 Run With Error
                </button>
                <button onClick={reset} className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-border rounded-lg text-[10px] font-bold uppercase">↺ Reset</button>
            </div>

            {/* Guarantee callout */}
            <div className="flex gap-3 bg-pink-400/5 border border-pink-400/15 rounded-xl p-4">
                <span className="material-symbols-outlined text-pink-400 text-sm mt-0.5">verified_user</span>
                <p className="text-[10px] text-muted/70 leading-relaxed">
                    <strong className="text-pink-400">The guarantee:</strong> <code>__exit__</code> is called no matter what — normal return, exception, or keyboard interrupt. This prevents resource leaks: open files, unclosed DB connections, unreleased locks.
                </p>
            </div>
        </div>
    );
}
