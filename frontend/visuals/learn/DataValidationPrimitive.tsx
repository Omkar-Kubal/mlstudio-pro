"use client";

import React, { useState, useRef } from "react";

const SCHEMA_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_STATUSES = ["active", "inactive", "pending"];

const RAW_ROWS = [
    { age: 34, salary: 72000, email: "alice@corp.com", status: "active" },
    { age: -5, salary: 50000, email: "bob@firm.io", status: "inactive" },
    { age: 28, salary: null, email: "carol@web.net", status: "pending" },
    { age: 200, salary: 91000, email: "dave@@broken", status: "active" },
    { age: 45, salary: 83000, email: "eve@good.com", status: "retired" },
    { age: 31, salary: 67500, email: "frank@ok.org", status: "active" },
    { age: 52, salary: 105000, email: "grace@nice.co", status: "inactive" },
    { age: "abc", salary: 44000, email: "heidi@place.net", status: "active" },
] as const;

type RawRow = typeof RAW_ROWS[number];

function validateRow(row: RawRow): string[] {
    const e: string[] = [];
    if (typeof row.age !== "number" || isNaN(row.age as number)) e.push("age: not a number");
    else if ((row.age as number) < 0 || (row.age as number) > 120) e.push(`age: ${row.age} out of range [0,120]`);
    if (row.salary === null || row.salary === undefined) e.push("salary: missing");
    else if ((row.salary as number) < 0) e.push("salary: negative");
    if (!SCHEMA_EMAIL.test(String(row.email || ""))) e.push("email: invalid format");
    if (!VALID_STATUSES.includes(String(row.status))) e.push(`status: '${row.status}' not in enum`);
    return e;
}

const VALIDATED = RAW_ROWS.map(row => ({ row, _errors: validateRow(row) }));

export default function DataValidationPrimitive() {
    const [scanIdx, setScanIdx] = useState(-1);
    const [rejected, setRejected] = useState<number[]>([]);
    const [accepted, setAccepted] = useState<number[]>([]);
    const [running, setRunning] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const reset = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setScanIdx(-1); setRejected([]); setAccepted([]); setRunning(false);
    };

    const runScan = () => {
        reset();
        setRunning(true);
        let i = 0;
        function step() {
            setScanIdx(i);
            const { _errors } = VALIDATED[i];
            if (_errors.length > 0) setRejected(r => [...r, i]);
            else setAccepted(a => [...a, i]);
            i++;
            if (i < VALIDATED.length) {
                timerRef.current = setTimeout(step, 480);
            } else {
                setRunning(false); setScanIdx(-1);
            }
        }
        timerRef.current = setTimeout(step, 200);
    };

    const PASS_COLOR = "#34d399";
    const FAIL_COLOR = "#f87171";
    const SCAN_COLOR = "#fbbf24";

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-5 select-none">
            <div className="space-y-1">
                <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">fact_check</span>
                    Data Validation
                </h3>
                <p className="text-xs text-muted/60">
                    Validation is the Bouncer — if your data doesn&apos;t fit the schema, it&apos;s not getting in.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 items-start">

                {/* Input table */}
                <div className="flex-1 min-w-0">
                    <div className="text-[9px] text-muted/30 uppercase tracking-widest mb-2">RAW INPUT ({RAW_ROWS.length} rows)</div>
                    <div className="bg-black/60 border border-border rounded-xl overflow-hidden">
                        {VALIDATED.map(({ row, _errors }, i) => {
                            const isScanning = scanIdx === i;
                            const isRejected = rejected.includes(i);
                            const isAccepted = accepted.includes(i);
                            const rowColor = isScanning ? SCAN_COLOR : isRejected ? FAIL_COLOR : isAccepted ? PASS_COLOR : "rgba(255,255,255,0.15)";
                            const icon = isScanning ? "▶" : isRejected ? "✕" : isAccepted ? "✓" : "·";
                            return (
                                <div key={i} className="flex items-center gap-3 px-3 py-2 transition-all"
                                    style={{
                                        borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
                                        background: isScanning ? SCAN_COLOR + "12" : isRejected ? FAIL_COLOR + "08" : isAccepted ? PASS_COLOR + "08" : "transparent",
                                        boxShadow: isScanning ? `0 0 20px ${SCAN_COLOR}33` : "none",
                                    }}>
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] shrink-0 font-bold transition-all"
                                        style={{ background: rowColor + "cc", color: "#000", boxShadow: isScanning ? `0 0 8px ${SCAN_COLOR}` : "none" }}>
                                        {icon}
                                    </div>
                                    <div className="text-[10px] font-mono flex gap-3 flex-wrap">
                                        {Object.entries(row).map(([k, v]) => (
                                            <span key={k}>
                                                <span className="text-violet-400">{k}</span>
                                                <span className="text-muted/30">:</span>
                                                <span style={{ color: v === null ? FAIL_COLOR : rowColor }}>
                                                    {String(v ?? "null")}
                                                </span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Scanner + Error panel */}
                <div className="flex flex-col gap-4 lg:w-56">
                    {/* Scanner gauge */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-14 h-14 rounded-xl border-2 flex items-center justify-center text-2xl transition-all"
                            style={{ borderColor: running ? SCAN_COLOR : "rgba(255,255,255,0.08)", background: running ? SCAN_COLOR + "22" : "#0d0e18", boxShadow: running ? `0 0 24px ${SCAN_COLOR}44` : "none" }}>
                            🔍
                        </div>
                        <div className="text-[9px] uppercase tracking-widest transition-all" style={{ color: running ? SCAN_COLOR : "rgba(255,255,255,0.2)" }}>
                            {running ? "SCANNING…" : "VALIDATOR"}
                        </div>
                        <div className="flex gap-2">
                            <div className="text-center px-3 py-2 rounded-lg" style={{ border: `1px solid ${PASS_COLOR}33`, background: PASS_COLOR + "08" }}>
                                <div className="text-xl font-bold" style={{ color: PASS_COLOR }}>{accepted.length}</div>
                                <div className="text-[9px] text-muted/30">PASSED</div>
                            </div>
                            <div className="text-center px-3 py-2 rounded-lg" style={{ border: `1px solid ${FAIL_COLOR}33`, background: FAIL_COLOR + "08" }}>
                                <div className="text-xl font-bold" style={{ color: FAIL_COLOR }}>{rejected.length}</div>
                                <div className="text-[9px] text-muted/30">REJECTED</div>
                            </div>
                        </div>
                    </div>

                    {/* Error log */}
                    <div>
                        <div className="text-[9px] text-muted/30 uppercase tracking-widest mb-2">Validation Errors</div>
                        <div className="bg-black/60 border border-border rounded-xl p-3 min-h-[100px] space-y-2">
                            {rejected.length === 0
                                ? <div className="text-[10px] text-muted/30 italic">No errors yet…</div>
                                : rejected.map(i => {
                                    const entry = VALIDATED[i];
                                    if (!entry) return null;
                                    return (
                                        <div key={i} className="p-2 rounded-lg" style={{ border: `1px solid ${FAIL_COLOR}22`, background: FAIL_COLOR + "08" }}>
                                            <div className="text-[10px] font-bold mb-1" style={{ color: FAIL_COLOR }}>Row {i + 1}</div>
                                            {entry._errors.map((e, ei) => (
                                                <div key={ei} className="text-[9px] text-muted/50">· {e}</div>
                                            ))}
                                        </div>
                                    );
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3">
                <button onClick={runScan} disabled={running}
                    className="px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                    style={{ background: running ? "rgba(255,255,255,0.05)" : SCAN_COLOR, color: running ? "rgba(255,255,255,0.2)" : "#000", cursor: running ? "not-allowed" : "pointer" }}>
                    {running ? "SCANNING…" : "▶ SCAN DATA"}
                </button>
                <button onClick={reset} className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-border rounded-lg text-[10px] font-bold uppercase">↺ Reset</button>
            </div>

            {/* Schema */}
            <div className="text-[10px] font-mono text-muted/40 border border-border/50 rounded-lg px-4 py-2">
                <span className="text-amber-400/70">SCHEMA:</span> age(int, 0–120) · salary(float, ≥0) · email(valid format) · status(enum: active|inactive|pending)
            </div>
        </div>
    );
}

