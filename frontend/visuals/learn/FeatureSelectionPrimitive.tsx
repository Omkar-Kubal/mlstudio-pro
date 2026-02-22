"use client";

import { useState, useRef } from "react";

const THEME = {
    bg: "#08090d", surface: "#0d0e18", border: "#1a1b2c",
    text: "#e2e8f0", dim: "#4a5568",
    strong: "#34d399", weak: "#f87171", neutral: "#60a5fa",
    score: "#fbbf24",
};

const FEATURES = [
    { name: "income", importance: 0.31, keep: true },
    { name: "credit_score", importance: 0.24, keep: true },
    { name: "age", importance: 0.18, keep: true },
    { name: "loan_term", importance: 0.12, keep: true },
    { name: "zip_code", importance: 0.07, keep: false },
    { name: "hair_color", importance: 0.03, keep: false },
    { name: "shoe_size", importance: 0.02, keep: false },
    { name: "lucky_number", importance: 0.01, keep: false },
    { name: "birth_month", importance: 0.01, keep: false },
    { name: "middle_name", importance: 0.01, keep: false },
];

const ACC_CURVE = [0.61, 0.73, 0.81, 0.86, 0.87, 0.87, 0.87, 0.86, 0.86, 0.86];

export default function FeatureSelectionPrimitive() {
    const [threshold, setThreshold] = useState(0.05);
    const [pruned, setPruned] = useState(false);
    const [animating, setAnimating] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const kept = FEATURES.filter(f => f.importance >= threshold);
    const removed = FEATURES.filter(f => f.importance < threshold);
    const modelScore = ACC_CURVE[kept.length - 1] ?? 0.61;

    const runPrune = () => {
        setAnimating(true);
        setTimeout(() => { setPruned(true); setAnimating(false); }, 600);
    };

    const reset = () => { setPruned(false); setAnimating(false); if (timerRef.current) clearTimeout(timerRef.current); };

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 20px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}` }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT III · FEATURE ENGINEERING · §42</div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>Feature Selection</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, margin: 0, fontStyle: "italic" }}>
                    "Feature selection is Marie Kondo for your variables — only keep the ones that spark signal."
                </p>
            </div>

            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start", width: "100%", maxWidth: 780 }}>

                {/* Feature importance bars */}
                <div style={{ flex: "1 1 320px", background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", padding: "16px" }}>
                    <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "12px" }}>FEATURE IMPORTANCE</div>
                    {FEATURES.map((f, i) => {
                        const isKept = f.importance >= threshold;
                        const opacity = pruned && !isKept ? 0.15 : 1;
                        const scale = pruned && !isKept ? 0.95 : 1;
                        return (
                            <div key={f.name} style={{ marginBottom: "7px", opacity, transform: `scale(${scale})`, transition: `all 0.4s ${i * 30}ms`, transformOrigin: "left" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", marginBottom: "3px" }}>
                                    <span style={{ color: isKept ? THEME.strong : THEME.weak, fontWeight: isKept ? 700 : 400 }}>{f.name}</span>
                                    <span style={{ color: THEME.score }}>{(f.importance * 100).toFixed(0)}%</span>
                                </div>
                                <div style={{ height: 10, background: "#1e1e35", borderRadius: "4px", overflow: "hidden" }}>
                                    <div style={{ height: "100%", width: `${f.importance * 300}%`, background: isKept ? THEME.strong : THEME.weak, borderRadius: "4px", transition: "width 0.4s, background 0.3s", maxWidth: "100%" }} />
                                </div>
                            </div>
                        );
                    })}

                    {/* Threshold line indicator */}
                    <div style={{ marginTop: "10px", fontSize: "10px", color: THEME.score, display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: 20, height: 2, background: THEME.score }} />
                        Threshold: {(threshold * 100).toFixed(0)}% — keeping {kept.length} of {FEATURES.length} features
                    </div>
                </div>

                {/* Right panel: controls + accuracy */}
                <div style={{ flex: "1 1 240px", display: "flex", flexDirection: "column", gap: "12px" }}>

                    {/* Threshold slider */}
                    <div style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", padding: "14px" }}>
                        <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "10px" }}>THRESHOLD</div>
                        <input type="range" min={0.01} max={0.30} step={0.01} value={threshold}
                            onChange={e => { setThreshold(+e.target.value); reset(); }}
                            style={{ width: "100%", accentColor: THEME.score, cursor: "pointer" }} />
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: THEME.dim, marginTop: "4px" }}>
                            <span>Keep all</span><span>Keep few</span>
                        </div>
                    </div>

                    {/* Model accuracy gauge */}
                    <div style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", padding: "14px" }}>
                        <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "10px" }}>MODEL ACCURACY</div>
                        <div style={{ fontSize: "36px", fontWeight: 700, color: THEME.strong, textAlign: "center" }}>
                            {(modelScore * 100).toFixed(0)}%
                        </div>
                        <div style={{ height: 10, background: "#1e1e35", borderRadius: "4px", overflow: "hidden", marginTop: "8px" }}>
                            <div style={{ height: "100%", width: `${modelScore * 100}%`, background: `linear-gradient(90deg, ${THEME.neutral}, ${THEME.strong})`, borderRadius: "4px", transition: "width 0.5s" }} />
                        </div>
                        <div style={{ fontSize: "9px", color: THEME.dim, marginTop: "6px", textAlign: "center" }}>
                            {kept.length} features · {removed.length} removed
                        </div>
                    </div>

                    <button
                        onClick={animating ? undefined : (pruned ? reset : runPrune)}
                        style={{
                            padding: "12px",
                            background: pruned ? "transparent" : THEME.strong + "22",
                            border: `1px solid ${pruned ? THEME.dim : THEME.strong}`,
                            color: pruned ? THEME.dim : THEME.strong,
                            borderRadius: "8px",
                            fontSize: "11px",
                            fontWeight: 700,
                            cursor: animating ? "default" : "pointer",
                            transition: "all 0.2s",
                            opacity: animating ? 0.5 : 1
                        }}
                    >
                        {animating ? "PRUNING..." : (pruned ? "RESET DATASET" : "APPLY SELECTION")}
                    </button>
                </div>
            </div>
        </div>
    );
}
