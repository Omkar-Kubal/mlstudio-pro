"use client";

import { useState } from "react";

const THEME = {
    bg: "#08090d", surface: "#0d0e18", border: "#1a1b2c",
    text: "#e2e8f0", dim: "#4a5568",
    accent: "#fbbf24", // Yellow for tree
    data: "#60a5fa",   // Blue for data points
};

const POINTS = [
    { x: 5, y: 20 }, { x: 15, y: 15 }, { x: 25, y: 40 }, { x: 35, y: 45 },
    { x: 45, y: 80 }, { x: 55, y: 85 }, { x: 65, y: 60 }, { x: 75, y: 55 },
    { x: 85, y: 90 }, { x: 95, y: 95 }
];

export default function DecisionTreePrimitive() {
    const [depth, setDepth] = useState(1);

    // Simple Decision Tree Logic (Manual for Demo)
    // Depth 1: 1 split at 50
    // Depth 2: splits at 25, 50, 75
    // Depth 3: splits at 12, 25, 37, 50, 62, 75, 87
    const getPrediction = (x: number, d: number) => {
        if (d === 1) {
            return x < 50 ? 25 : 75;
        } else if (d === 2) {
            if (x < 25) return 18;
            if (x < 50) return 42;
            if (x < 75) return 65;
            return 92;
        } else {
            if (x < 12) return 20; if (x < 25) return 15;
            if (x < 37) return 40; if (x < 50) return 45;
            if (x < 62) return 82; if (x < 75) return 60;
            if (x < 87) return 55; return 92;
        }
    };

    const currentLine = Array.from({ length: 101 }, (_, i) => ({ x: i, y: getPrediction(i, depth) }));

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT IV · REGRESSION · §48</div>
                <h1 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 4px" }}>Decision Tree Regression</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, fontStyle: "italic" }}>
                    "Trees don't find a trend line; they divide space into regions and predict a constant for each."
                </p>
            </div>

            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", justifyContent: "center" }}>

                {/* Canvas Area */}
                <div style={{ position: "relative", width: 340, height: 320, background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", padding: 20 }}>
                    <svg width="300" height="280" viewBox="0 0 100 100" style={{ overflow: "visible" }}>
                        {/* Grid */}
                        <line x1="0" y1="100" x2="100" y2="100" stroke={THEME.border} strokeWidth="0.5" />
                        <line x1="0" y1="0" x2="0" y2="100" stroke={THEME.border} strokeWidth="0.5" />

                        {/* Tree Prediction Line (Step function) */}
                        <polyline
                            points={currentLine.map(p => `${p.x},${100 - p.y}`).join(" ")}
                            fill="none"
                            stroke={THEME.accent}
                            strokeWidth="2.5"
                            strokeLinejoin="round"
                            style={{ transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}
                        />

                        {/* Data Points */}
                        {POINTS.map((p, i) => (
                            <circle key={i} cx={p.x} cy={100 - p.y} r="2.5" fill={THEME.data} opacity="0.6" />
                        ))}
                    </svg>
                    <div style={{ position: "absolute", bottom: 5, right: 10, fontSize: "9px", color: THEME.dim }}>X Feature</div>
                    <div style={{ position: "absolute", top: 10, left: 5, fontSize: "9px", color: THEME.dim, transform: "rotate(-90deg)" }}>Y Target</div>
                </div>

                {/* Controls */}
                <div style={{ flex: "1 1 240px", display: "flex", flexDirection: "column", gap: "12px" }}>

                    <div style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", padding: "16px" }}>
                        <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "16px" }}>TREE CONFIG</div>

                        <div style={{ marginBottom: "20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "8px" }}>
                                <span>Max Depth</span>
                                <span style={{ color: THEME.accent, fontWeight: 700 }}>{depth}</span>
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                                {[1, 2, 3].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setDepth(d)}
                                        style={{
                                            flex: 1, padding: "10px", border: `1px solid ${depth === d ? THEME.accent : THEME.border}`,
                                            background: depth === d ? THEME.accent + "22" : "transparent",
                                            color: depth === d ? THEME.accent : THEME.dim,
                                            borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 700,
                                            transition: "0.2s"
                                        }}>
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ fontSize: "11px", color: THEME.dim, lineHeight: "1.5" }}>
                            {depth === 1 ? "Simple split. High bias (underfitting)." :
                                depth === 2 ? "Four regions. Better balance of complexity." :
                                    "Complex fit. Risk of high variance (overfitting)."}
                        </div>
                    </div>

                    <div style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", padding: "16px" }}>
                        <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "12px" }}>KEY PROPERTY</div>
                        <div style={{ fontSize: "12px", color: THEME.text }}>
                            Notice how the prediction is always <span style={{ color: THEME.accent, fontWeight: 700 }}>flat</span> between splits. Trees don't interpolate; they constant-average.
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

