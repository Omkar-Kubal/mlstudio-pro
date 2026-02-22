"use client";

import { useState, useMemo } from "react";

const THEME = {
    bg: "#08090d", surface: "#0d0e18", border: "#1a1b2c",
    text: "#e2e8f0", dim: "#4a5568",
    forest: "#34d399", // Green for forest
    tree: "#34d39933", // Faint green for individual trees
    data: "#60a5fa",   // Blue for data points
};

const POINTS = [
    { x: 5, y: 20 }, { x: 15, y: 15 }, { x: 25, y: 40 }, { x: 35, y: 45 },
    { x: 45, y: 80 }, { x: 55, y: 85 }, { x: 65, y: 60 }, { x: 75, y: 55 },
    { x: 85, y: 90 }, { x: 95, y: 95 }
];

// Seeded random for consistency
const seededRandom = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
};

export default function RandomForestPrimitive() {
    const [numTrees, setNumTrees] = useState(5);

    const trees = useMemo(() => {
        return Array.from({ length: 20 }, (_, treeIdx) => {
            // Each tree has random splits and noise
            return Array.from({ length: 11 }, (_, i) => {
                const x = i * 10;
                // Base logic + some "diversity" for each tree
                const base = x < 50 ? 25 : 75;
                const noise = (seededRandom(treeIdx * 13 + i) - 0.5) * 40;
                return { x, y: Math.max(0, Math.min(100, base + noise)) };
            });
        });
    }, []);

    const ensembleLine = useMemo(() => {
        const activeTrees = trees.slice(0, numTrees);
        return Array.from({ length: 11 }, (_, i) => {
            const x = i * 10;
            const sum = activeTrees.reduce((s, t) => s + t[i].y, 0);
            return { x, y: sum / numTrees };
        });
    }, [numTrees, trees]);

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT IV · REGRESSION · §49</div>
                <h1 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 4px" }}>Random Forest Regression</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, fontStyle: "italic" }}>
                    "One tree is a guess; a forest is a consensus. Averaging multiple trees reduces variance and improves stability."
                </p>
            </div>

            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", justifyContent: "center" }}>

                {/* Canvas Area */}
                <div style={{ position: "relative", width: 340, height: 320, background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", padding: 20 }}>
                    <svg width="300" height="280" viewBox="0 0 100 100" style={{ overflow: "visible" }}>
                        {/* Grid */}
                        <line x1="0" y1="100" x2="100" y2="100" stroke={THEME.border} strokeWidth="0.5" />
                        <line x1="0" y1="0" x2="0" y2="100" stroke={THEME.border} strokeWidth="0.5" />

                        {/* Individual Trees */}
                        {trees.slice(0, numTrees).map((t, idx) => (
                            <polyline
                                key={idx}
                                points={t.map(p => `${p.x},${100 - p.y}`).join(" ")}
                                fill="none"
                                stroke={THEME.tree}
                                strokeWidth="1"
                                strokeLinejoin="round"
                            />
                        ))}

                        {/* Ensemble (Average) Line */}
                        <polyline
                            points={ensembleLine.map(p => `${p.x},${100 - p.y}`).join(" ")}
                            fill="none"
                            stroke={THEME.forest}
                            strokeWidth="3"
                            strokeLinejoin="round"
                            style={{ transition: "all 0.3s" }}
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
                        <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "16px" }}>FOREST CONFIG</div>

                        <div style={{ marginBottom: "20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "8px" }}>
                                <span>n_estimators (Trees)</span>
                                <span style={{ color: THEME.forest, fontWeight: 700 }}>{numTrees}</span>
                            </div>
                            <input type="range" min={1} max={20} step={1} value={numTrees} onChange={e => setNumTrees(+e.target.value)} style={{ width: "100%", accentColor: THEME.forest }} />
                        </div>

                        <div style={{ fontSize: "11px", color: THEME.dim, lineHeight: "1.5" }}>
                            {numTrees < 5 ? "High variance. The ensemble follows individual tree noise too closely." :
                                numTrees < 15 ? "Stabilizing. The 'wisdom of the crowd' is averaging out mistakes." :
                                    "High stability. The forest has converged to a robust prediction."}
                        </div>
                    </div>

                    <div style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", padding: "16px" }}>
                        <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "12px" }}>BAGGING INTUITION</div>
                        <div style={{ fontSize: "12px", color: THEME.text }}>
                            Each tree is trained on a <span style={{ color: THEME.forest, fontWeight: 700 }}>bootstrap sample</span>. This diversity is what makes the final average so powerful.
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
