"use client";

import { useState } from "react";

const THEME = {
    bg: "#08090d", surface: "#0d0e18", border: "#1a1b2c",
    text: "#e2e8f0", dim: "#4a5568",
    lasso: "#f472b6", // Pink for Lasso (snaps)
    ridge: "#60a5fa", // Blue for Ridge (shrinks)
    zero: "#34495e",
};

const INITIAL_WEIGHTS = [1.2, 0.8, -1.5, 0.1, 0.05, 1.1, -0.4, 0.02];
const LABELS = ["Age", "Income", "Balance", "Edu", "Zip", "Score", "Term", "Szn"];

export default function RegularizationPrimitive() {
    const [lambda, setLambda] = useState(0);
    const [method, setMethod] = useState<"ridge" | "lasso">("ridge");

    const getWeight = (w: number, l: number, type: "ridge" | "lasso") => {
        if (type === "ridge") {
            // Ridge shrinks: w / (1 + lambda)
            return w / (1 + l * 2);
        } else {
            // Lasso: sign(w) * max(0, |w| - lambda)
            const val = Math.abs(w) - l;
            return val <= 0 ? 0 : (w > 0 ? val : -val);
        }
    };

    const activeWeights = INITIAL_WEIGHTS.map(w => getWeight(w, lambda, method));
    const zeroedCount = activeWeights.filter(w => w === 0).length;

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT IV · REGRESSION · §47</div>
                <h1 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 4px" }}>Ridge vs Lasso</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, fontStyle: "italic" }}>
                    "Lasso (L1) performs feature selection by zeroing weights. Ridge (L2) keeps all features by shrinking them."
                </p>
            </div>

            <div style={{ display: "flex", gap: "24px", flexDirection: "column" }}>

                {/* Controls */}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", background: THEME.surface, padding: "16px", borderRadius: "8px", border: `1px solid ${THEME.border}`, gap: "20px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button
                            onClick={() => setMethod("ridge")}
                            style={{ padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 700, background: method === "ridge" ? THEME.ridge : "#1a1b2c", color: method === "ridge" ? THEME.bg : THEME.text, transition: "0.3s" }}>
                            RIDGE (L2)
                        </button>
                        <button
                            onClick={() => setMethod("lasso")}
                            style={{ padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 700, background: method === "lasso" ? THEME.lasso : "#1a1b2c", color: method === "lasso" ? THEME.bg : THEME.text, transition: "0.3s" }}>
                            LASSO (L1)
                        </button>
                    </div>
                    <div style={{ flex: "1 1 300px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: THEME.dim, marginBottom: "4px" }}>
                            <span>λ (PENALTY): {lambda.toFixed(2)}</span>
                            <span>{method === "lasso" ? `${zeroedCount} features zeroed` : "Shrinkage active"}</span>
                        </div>
                        <input type="range" min={0} max={1.5} step={0.05} value={lambda} onChange={e => setLambda(+e.target.value)} style={{ width: "100%", accentColor: method === "ridge" ? THEME.ridge : THEME.lasso, cursor: "pointer" }} />
                    </div>
                </div>

                {/* Bar Chart */}
                <div style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", padding: "24px", minHeight: 260 }}>
                    <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "24px" }}>FEATURE COEFFICIENTS</div>
                    <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", height: 160, position: "relative" }}>
                        {/* Mean Line (Axis) */}
                        <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 1, background: THEME.border, zIndex: 0 }} />

                        {INITIAL_WEIGHTS.map((w, i) => {
                            const currentW = activeWeights[i];
                            const height = Math.abs(currentW) * 80;
                            const isZero = currentW === 0;
                            return (
                                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 40, zIndex: 1 }}>
                                    {w >= 0 && <div style={{ fontSize: "9px", color: isZero ? "#ff4444" : THEME.text, fontWeight: 700, marginBottom: "4px", minHeight: "12px" }}>{isZero ? "0" : currentW.toFixed(2)}</div>}
                                    <div style={{
                                        width: 16,
                                        height: isZero ? 2 : height,
                                        background: isZero ? "#ff4444" : (method === "ridge" ? THEME.ridge : THEME.lasso),
                                        borderRadius: "2px",
                                        transition: "height 0.3s, background 0.3s, opacity 0.3s",
                                        opacity: isZero ? 0.3 : 1,
                                        marginBottom: w < 0 ? 0 : 0,
                                        marginTop: w < 0 ? 0 : 0,
                                        transform: w < 0 ? `translateY(${height / 2}px)` : `translateY(${-height / 2}px)`
                                    }} />
                                    {w < 0 && <div style={{ fontSize: "9px", color: isZero ? "#ff4444" : THEME.text, fontWeight: 700, marginTop: "4px", minHeight: "12px" }}>{isZero ? "0" : currentW.toFixed(2)}</div>}
                                    <div style={{ fontSize: "9px", color: THEME.dim, transform: "rotate(-45deg)", marginTop: "20px", whiteSpace: "nowrap" }}>{LABELS[i]}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div style={{ padding: "12px", background: method === "lasso" ? THEME.lasso + "11" : THEME.ridge + "11", borderRadius: "8px", fontSize: "12px", color: THEME.dim, borderLeft: `3px solid ${method === "lasso" ? THEME.lasso : THEME.ridge}` }}>
                    {method === "lasso"
                        ? "Lasso hits zero exactly. It acts as a feature selector, eliminating irrelevant inputs like 'Zip' and 'Szn' early."
                        : "Ridge keeps all features but makes them smaller. It's more stable when features are highly correlated."}
                </div>
            </div>
        </div>
    );
}

