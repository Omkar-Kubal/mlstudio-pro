"use client";

import { useState } from "react";

const THEME = {
    bg: "#08090d", surface: "#0d0e18", border: "#1a1b2c",
    text: "#e2e8f0", dim: "#4a5568",
    accent: "#60a5fa", // Blue for knowledge
    raw: "#94a3b8",   // Grey for raw facts
    strong: "#34d399", // Green for improvement
};

const RAW_FEATURES = [
    { name: "total_sqft", val: "2,400", desc: "Total area" },
    { name: "lot_size", val: "10,500", desc: "Land area" },
    { name: "year_built", val: "1994", desc: "Construction" },
    { name: "bathrooms", val: "2.5", desc: "Count" },
];

const DOMAIN_FEATURES = [
    {
        name: "price_per_sqft",
        type: "Ratio",
        formula: "Price / Sqft",
        benefit: "Market value density"
    },
    {
        name: "house_to_lot_ratio",
        type: "Efficiency",
        formula: "Sqft / LotSize",
        benefit: "Land utilisation"
    },
    {
        name: "property_age",
        type: "Temporal",
        formula: "2024 - YearBuilt",
        benefit: "Depreciation proxy"
    },
];

export default function DomainFeaturesPrimitive() {
    const [mode, setMode] = useState<"raw" | "engineered">("raw");

    const accuracy = mode === "raw" ? 0.72 : 0.89;

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT III · FEATURE ENGINEERING · §43</div>
                <h1 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 4px" }}>Domain-Driven Features</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, fontStyle: "italic" }}>
                    "Raw data is facts. Domain features are insights."
                </p>
            </div>

            <div style={{ display: "flex", gap: "20px", flexDirection: "column" }}>

                {/* Toggle Switch */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                    <div style={{ display: "flex", background: THEME.surface, padding: "4px", borderRadius: "12px", border: `1px solid ${THEME.border}` }}>
                        <button
                            onClick={() => setMode("raw")}
                            style={{
                                padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 700,
                                background: mode === "raw" ? THEME.accent : "transparent",
                                color: mode === "raw" ? THEME.bg : THEME.dim,
                                transition: "all 0.3s"
                            }}>
                            RAW DATA
                        </button>
                        <button
                            onClick={() => setMode("engineered")}
                            style={{
                                padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 700,
                                background: mode === "engineered" ? THEME.strong : "transparent",
                                color: mode === "engineered" ? THEME.bg : THEME.dim,
                                transition: "all 0.3s"
                            }}>
                            DOMAIN INSIGHTS
                        </button>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>

                    {/* Feature List */}
                    <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px" }}>ACTIVE FEATURES</div>

                        {RAW_FEATURES.map(f => (
                            <div key={f.name} style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, padding: "12px", borderRadius: "8px", opacity: mode === "engineered" ? 0.4 : 1, transition: "opacity 0.5s" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                    <span style={{ fontSize: "12px", fontWeight: 600 }}>{f.name}</span>
                                    <span style={{ fontSize: "11px", color: THEME.accent }}>{f.val}</span>
                                </div>
                                <div style={{ fontSize: "10px", color: THEME.dim }}>{f.desc}</div>
                            </div>
                        ))}

                        {mode === "engineered" && DOMAIN_FEATURES.map((f, i) => (
                            <div key={f.name} style={{
                                background: THEME.strong + "11",
                                border: `1px solid ${THEME.strong}44`,
                                padding: "12px",
                                borderRadius: "8px",
                                animation: `fadeIn 0.5s ease-out ${i * 0.1}s both`
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                    <span style={{ fontSize: "12px", fontWeight: 700, color: THEME.strong }}>{f.name}</span>
                                    <span style={{ fontSize: "9px", background: THEME.strong, color: THEME.bg, padding: "1px 4px", borderRadius: "4px" }}>{f.type}</span>
                                </div>
                                <div style={{ fontSize: "11px", color: THEME.text, marginBottom: "2px" }}>Formula: <span style={{ color: THEME.strong }}>{f.formula}</span></div>
                                <div style={{ fontSize: "10px", color: THEME.dim }}>{f.benefit}</div>
                            </div>
                        ))}
                    </div>

                    {/* Impact Panel */}
                    <div style={{ flex: "1 1 200px", background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "20px" }}>MODEL PERFORMANCE</div>
                        <div style={{ position: "relative", width: 120, height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="120" height="120" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#1e1e35" strokeWidth="8" />
                                <circle cx="50" cy="50" r="45" fill="none" stroke={mode === "raw" ? THEME.accent : THEME.strong} strokeWidth="8"
                                    strokeDasharray={`${accuracy * 282} 282`}
                                    strokeDashoffset="0"
                                    transform="rotate(-90 50 50)"
                                    style={{ transition: "all 1s ease-in-out" }}
                                />
                            </svg>
                            <div style={{ position: "absolute", textAlign: "center" }}>
                                <div style={{ fontSize: "24px", fontWeight: 800, color: mode === "raw" ? THEME.accent : THEME.strong }}>{(accuracy * 100).toFixed(0)}%</div>
                                <div style={{ fontSize: "10px", color: THEME.dim }}>Accuracy</div>
                            </div>
                        </div>

                        <div style={{ marginTop: "20px", fontSize: "11px", textAlign: "center", color: THEME.dim }}>
                            {mode === "raw"
                                ? "The model struggles to find patterns in sparse, unscaled raw data."
                                : "Engineered features capture non-linear relationships, boosting precision by 17%."}
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}
