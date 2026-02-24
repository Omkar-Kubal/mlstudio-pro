"use client";

import { useState } from "react";

const THEME = {
    bg: "#07080c", surface: "#0c0d16", border: "#181826",
    text: "#e2e8f0", dim: "#4a5568",
    bias: "#f87171", fair: "#34d399", info: "#60a5fa", warning: "#fbbf24"
};

const SCENARIOS = [
    {
        id: "loan",
        title: "Loan Approval System",
        description: "An AI system trained on historical data to predict loan defaults.",
        protectedAttr: "Zip Code (Proxy for Income/Race)",
        biasSource: "Historical redlining in training data.",
        mitigation: "Adversarial debiasing, removing proxy variables."
    },
    {
        id: "hiring",
        title: "Resume Screening",
        description: "A tool to rank technical candidates based on successful past hires.",
        protectedAttr: "Gender-coded language",
        biasSource: "Previous successful hires were 90% male.",
        mitigation: "Blind screening, counterfactual fairness."
    },
    {
        id: "facial",
        title: "Facial Recognition",
        description: "Security system for identity verification.",
        protectedAttr: "Skin Tone / Ethnicity",
        biasSource: "Dataset primarily contained lighter skin tones.",
        mitigation: "Diverse data collection, error parity analysis."
    }
];

export default function AIEthicsPrimitive() {
    const [activeScenario, setActiveScenario] = useState(0);
    const [showMitigation, setShowMitigation] = useState(false);

    const scenario = SCENARIOS[activeScenario];

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px 20px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT VII · GOVERNANCE · §143</div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>AI Ethics & Fairness</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, margin: 0, fontStyle: "italic" }}>
                    "Building systems that are not just accurate, but equitable and transparent."
                </p>
            </div>

            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "20px" }}>
                {/* Scenario Selection */}
                <div style={{ flex: 1, minWidth: 260 }}>
                    <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "12px" }}>SELECT SCENARIO</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {SCENARIOS.map((s, idx) => (
                            <button key={s.id} onClick={() => { setActiveScenario(idx); setShowMitigation(false); }}
                                style={{ padding: "14px", background: activeScenario === idx ? THEME.bias + "11" : THEME.surface, border: `1px solid ${activeScenario === idx ? THEME.bias : THEME.border}`, borderRadius: "8px", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
                                <div style={{ fontSize: "14px", fontWeight: 700, color: activeScenario === idx ? THEME.bias : THEME.text }}>{s.title}</div>
                                <div style={{ fontSize: "10px", color: THEME.dim, marginTop: "4px" }}>{s.id}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Details Panel */}
                <div style={{ flex: 1.5, minWidth: 340 }}>
                    <div style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", padding: "20px", height: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                            <div>
                                <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "4px" }}>SCENARIO ANALYSIS</div>
                                <h3 style={{ fontSize: "20px", fontWeight: 800, margin: 0 }}>{scenario.title}</h3>
                            </div>
                            <div style={{ padding: "4px 10px", background: THEME.bias + "22", border: `1px solid ${THEME.bias}`, borderRadius: "4px", color: THEME.bias, fontSize: "9px", fontWeight: 800 }}>BIAS DETECTED</div>
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                            <div style={{ fontSize: "11px", color: THEME.text, opacity: 0.8, lineHeight: 1.5 }}>
                                {scenario.description}
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
                            <div style={{ padding: "12px", background: "#0a0b14", borderRadius: "8px", border: `1px solid ${THEME.border}` }}>
                                <div style={{ fontSize: "9px", color: THEME.dim, marginBottom: "6px" }}>SENSITIVE ATTR.</div>
                                <div style={{ fontSize: "11px", fontWeight: 700, color: THEME.warning }}>{scenario.protectedAttr}</div>
                            </div>
                            <div style={{ padding: "12px", background: "#0a0b14", borderRadius: "8px", border: `1px solid ${THEME.border}` }}>
                                <div style={{ fontSize: "9px", color: THEME.dim, marginBottom: "6px" }}>BIAS ORIGIN</div>
                                <div style={{ fontSize: "11px", fontWeight: 700, color: THEME.bias }}>{scenario.biasSource}</div>
                            </div>
                        </div>

                        {!showMitigation ? (
                            <button onClick={() => setShowMitigation(true)}
                                style={{ width: "100%", padding: "12px", background: "#fff", color: "#000", border: "none", borderRadius: "8px", fontWeight: 800, fontSize: "12px", cursor: "pointer", transition: "transform 0.2s" }}>
                                APPLY FAIRNESS MITIGATION
                            </button>
                        ) : (
                            <div style={{ padding: "16px", background: THEME.fair + "11", border: `2px solid ${THEME.fair}`, borderRadius: "8px", animation: "slideUp 0.3s ease-out" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                                    <span style={{ fontSize: "18px" }}>🛡️</span>
                                    <div style={{ fontSize: "12px", fontWeight: 800, color: THEME.fair }}>MITIGATION STRATEGY</div>
                                </div>
                                <div style={{ fontSize: "13px", lineHeight: 1.5, color: THEME.text }}>
                                    {scenario.mitigation}
                                </div>
                                <div style={{ marginTop: "12px", fontSize: "9px", color: THEME.dim, fontStyle: "italic" }}>
                                    Fairness involves trade-offs. Often, maximizing group fairness slightly reduces raw predictive accuracy.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ marginTop: "14px", padding: "10px 18px", borderLeft: `3px solid ${THEME.bias}`, background: THEME.bias + "0f", maxWidth: "100%", fontSize: "11px", color: THEME.dim, lineHeight: 1.8, borderRadius: "0 4px 4px 0" }}>
                <span style={{ color: THEME.bias }}>// Ethics:</span> Algorithmic fairness is not just a technical challenge, but a social one. We use metrics like Equalized Odds and Demographic Parity to measure bias, and techniques like Adversarial Debiasing to minimize it during training.
            </div>

            <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}

