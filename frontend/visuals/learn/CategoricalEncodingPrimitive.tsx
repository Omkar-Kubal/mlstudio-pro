"use client";

import React, { useState, useRef } from "react";

const CATEGORIES = ["Red", "Green", "Blue", "Purple", "Orange"] as const;
type Cat = typeof CATEGORIES[number];

const CAT_COLORS: Record<Cat, string> = {
    Red: "#f87171", Green: "#34d399", Blue: "#60a5fa", Purple: "#a78bfa", Orange: "#fb923c",
};
const LABEL_MAP = Object.fromEntries(CATEGORIES.map((c, i) => [c, i])) as Record<Cat, number>;
const RAW_COL: Cat[] = ["Red", "Blue", "Green", "Red", "Orange", "Blue", "Purple", "Green", "Red", "Blue"];

type Mode = "raw" | "label" | "onehot";

export default function CategoricalEncodingPrimitive() {
    const [mode, setMode] = useState<Mode>("raw");
    const [animStep, setAnimStep] = useState(0);
    const ivRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const LABEL_COLOR = "#fbbf24";
    const OHE_COLOR = "#60a5fa";

    const startAnim = (m: Mode) => {
        if (ivRef.current) clearInterval(ivRef.current);
        setMode(m); setAnimStep(0);
        let i = 0;
        ivRef.current = setInterval(() => {
            i++;
            setAnimStep(i);
            if (i >= RAW_COL.length && ivRef.current) { clearInterval(ivRef.current); }
        }, 90);
    };

    const TABS = [
        { key: "raw" as Mode, label: "Raw", color: "rgba(255,255,255,0.25)" },
        { key: "label" as Mode, label: "Label Encoding", color: LABEL_COLOR },
        { key: "onehot" as Mode, label: "One-Hot Encoding", color: OHE_COLOR },
    ];

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-5 select-none">
            <div className="space-y-1">
                <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">code_blocks</span>
                    Categorical Encoding
                </h3>
                <p className="text-xs text-muted/60 max-w-xl">
                    One-Hot turns a category into yes/no questions. Label encoding hopes the model doesn&apos;t think <code className="text-amber-400">3 &gt; 1</code>.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
                {TABS.map(({ key, label, color }) => (
                    <button key={key} onClick={() => startAnim(key)}
                        className="px-4 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all"
                        style={mode === key
                            ? { color, background: color + "18", borderColor: color + "44" }
                            : { color: "rgba(255,255,255,0.25)", borderColor: "rgba(255,255,255,0.08)" }}>
                        {label}
                    </button>
                ))}
            </div>

            <div className="flex gap-4 items-start flex-wrap">

                {/* Raw column */}
                <div className="bg-black/60 border border-border rounded-xl overflow-hidden">
                    <div className="px-4 py-2 text-[9px] text-muted/30 uppercase tracking-widest border-b border-border">color (raw)</div>
                    {RAW_COL.map((cat, i) => (
                        <div key={i} className="px-5 py-2 text-[12px] font-semibold font-mono"
                            style={{ borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none", color: CAT_COLORS[cat] }}>
                            {cat}
                        </div>
                    ))}
                </div>

                {mode !== "raw" && <div className="text-2xl text-muted/20 self-center">→</div>}

                {/* Label encoding */}
                {mode === "label" && (
                    <div className="bg-black/60 rounded-xl overflow-hidden" style={{ border: `1px solid ${LABEL_COLOR}33` }}>
                        <div className="px-4 py-2 text-[9px] uppercase tracking-widest border-b"
                            style={{ borderColor: LABEL_COLOR + "33", color: LABEL_COLOR }}>color_encoded</div>
                        {RAW_COL.map((cat, i) => (
                            <div key={i} className="px-5 py-2 font-mono text-[12px] font-bold transition-all"
                                style={{
                                    borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
                                    color: LABEL_COLOR, opacity: i < animStep ? 1 : 0,
                                    transform: i < animStep ? "translateX(0)" : "translateX(-10px)",
                                }}>
                                {LABEL_MAP[cat]}
                                <span className="text-[9px] text-muted/40 ml-2">({cat})</span>
                            </div>
                        ))}
                        <div className="px-4 py-2 text-[10px] border-t-2" style={{ borderColor: LABEL_COLOR, background: LABEL_COLOR + "15", color: LABEL_COLOR }}>
                            ⚠ Model may infer Purple(3) &gt; Blue(2) &gt; Red(0)
                        </div>
                    </div>
                )}

                {/* One-hot */}
                {mode === "onehot" && (
                    <div className="bg-black/60 rounded-xl overflow-hidden" style={{ border: `1px solid ${OHE_COLOR}33` }}>
                        <div className="flex">
                            {CATEGORIES.map(c => (
                                <div key={c} className="px-3 py-2 text-[9px] uppercase tracking-widest text-center border-r border-b border-border/50 min-w-[58px]"
                                    style={{ color: CAT_COLORS[c], background: CAT_COLORS[c] + "15" }}>
                                    is_{c}
                                </div>
                            ))}
                        </div>
                        {RAW_COL.map((cat, i) => (
                            <div key={i} className="flex transition-all" style={{ opacity: i < animStep ? 1 : 0, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                                {CATEGORIES.map(c => {
                                    const isOne = c === cat;
                                    return (
                                        <div key={c} className="px-3 py-2 text-center min-w-[58px] font-mono font-bold text-[13px] border-r border-border/30 transition-all"
                                            style={{ color: isOne ? CAT_COLORS[c] : "rgba(255,255,255,0.12)", background: isOne ? CAT_COLORS[c] + "15" : "transparent" }}>
                                            {isOne ? "1" : "0"}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                        <div className="px-4 py-2 text-[10px] border-t-2 text-sky-400" style={{ borderColor: OHE_COLOR, background: OHE_COLOR + "15" }}>
                            ✓ No ordinal assumption — {CATEGORIES.length} binary columns
                        </div>
                    </div>
                )}
            </div>

            {/* When-to-use cards */}
            {mode !== "raw" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                        { label: "Use Label Encoding when…", color: LABEL_COLOR, pts: ["Tree-based models (RF, XGBoost)", "Ordinal data (small, medium, large)", "High cardinality — OHE too wide"] },
                        { label: "Use One-Hot when…", color: OHE_COLOR, pts: ["Linear / logistic regression", "Neural networks", "Nominal data with no natural order"] },
                    ].map(({ label, color, pts }) => (
                        <div key={label} className="rounded-xl p-4" style={{ border: `1px solid ${color}25`, background: color + "08" }}>
                            <div className="text-[10px] font-black mb-2" style={{ color }}>{label}</div>
                            {pts.map(p => <div key={p} className="text-[9px] text-muted/50 mb-1">· {p}</div>)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
