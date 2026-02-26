"use client";

import { useState } from "react";

const THEME = {
    bg: "#08090d", surface: "#0d0e18", border: "#1a1b2c",
    text: "#e2e8f0", dim: "#4a5568",
    bagging: "#60a5fa", boosting: "#fbbf24", stacking: "#a78bfa",
};

export default function EnsembleMethodsPrimitive() {
    const [method, setMethod] = useState<"bagging" | "boosting" | "stacking">("bagging");

    const CONTENT = {
        bagging: {
            title: "Bagging (Bootstrap Aggregating)",
            philosophy: "Wisdom of the Crowd",
            process: "Train multiple models independently on random subsets of data (bootstrap), then average their votes.",
            key: "Reduces Variance (stabilizes model)",
            example: "Random Forest",
            icon: "🌳🌳🌳"
        },
        boosting: {
            title: "Boosting",
            philosophy: "Learn from Mistakes",
            process: "Train models sequentially. Each new model focuses on the errors (residuals) of the previous ones.",
            key: "Reduces Bias (strengthens model)",
            example: "XGBoost, Gradient Boosting",
            icon: "📈📈📈"
        },
        stacking: {
            title: "Stacking",
            philosophy: "The Meta-Expert",
            process: "Train different types of models, then use a final 'Meta-Model' to decide which expert to trust.",
            key: "Best Global Accuracy",
            example: "Voting Classifier",
            icon: "🏗️🏗️🏗️"
        }
    };

    const curr = CONTENT[method];

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px 20px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 820, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT IV · ENSEMBLES · §64</div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>Ensemble Methods</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, margin: 0, fontStyle: "italic" }}>
                    "One model is a guess; a forest is a consensus. Combine learners to conquer noise."
                </p>
            </div>

            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", justifyContent: "center" }}>
                {(Object.keys(CONTENT) as Array<keyof typeof CONTENT>).map((m) => (
                    <button key={m} onClick={() => setMethod(m)}
                        style={{ padding: "8px 18px", border: `1.5px solid ${method === m ? THEME[m] : THEME.border}`, borderRadius: "6px", background: method === m ? THEME[m] + "22" : "transparent", color: method === m ? THEME[m] : THEME.dim, fontSize: "12px", fontFamily: "inherit", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
                        {m.toUpperCase()}
                    </button>
                ))}
            </div>

            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>

                {/* Visual Diagram */}
                <div style={{ flex: "1 1 300px", padding: "30px", background: THEME.surface, borderRadius: "12px", border: `2px solid ${THEME[method]}44`, textAlign: "center", minHeight: 280, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 10, right: 16, fontSize: "40px", opacity: 0.1 }}>{curr.icon}</div>

                    {method === "bagging" && (
                        <div style={{ display: "flex", gap: 15 }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
                                    <div style={{ width: 40, height: 35, background: "#ffffff11", border: `1.2px solid ${THEME.bagging}88`, borderRadius: 4, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>data {i}</div>
                                    <div style={{ height: 20, width: 1, background: THEME.bagging }}></div>
                                    <div style={{ width: 40, height: 40, background: THEME.bagging, borderRadius: "50%", color: "#000", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>Ⓜ</div>
                                </div>
                            ))}
                            <div style={{ width: 1, height: "100%", background: THEME.dim, margin: "0 10px" }}></div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                <div style={{ width: 50, height: 50, borderRadius: "8px", border: `2px solid ${THEME.bagging}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>AVERAGE</div>
                                <div style={{ height: 20, width: 1, background: THEME.bagging }}></div>
                                <div style={{ fontSize: 16, color: THEME.bagging }}>PRED</div>
                            </div>
                        </div>
                    )}

                    {method === "boosting" && (
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{ display: "flex", alignItems: "center" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
                                        <div style={{ width: 45, height: 45, borderRadius: "50%", background: THEME.boosting, color: "#000", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>Ⓜ<sub>{i}</sub></div>
                                        <div style={{ fontSize: 8, color: THEME.dim }}>fixes err<sub>{i - 1}</sub></div>
                                    </div>
                                    {i < 3 && <div style={{ fontSize: 20, color: THEME.boosting, margin: "0 2px" }}>→</div>}
                                </div>
                            ))}
                            <div style={{ fontSize: 20, color: THEME.boosting, margin: "0 2px" }}>→</div>
                            <div style={{ fontSize: 16, color: THEME.boosting, fontWeight: 700 }}>FINAL</div>
                        </div>
                    )}

                    {method === "stacking" && (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                            <div style={{ display: "flex", gap: 20 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 4, background: "#f472b8", color: "#000", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>LR</div>
                                <div style={{ width: 40, height: 40, borderRadius: 4, background: "#60a5fa", color: "#000", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>SVM</div>
                                <div style={{ width: 40, height: 40, borderRadius: 4, background: "#34d399", color: "#000", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>RF</div>
                            </div>
                            <div style={{ display: "flex", gap: 30 }}>
                                {[1, 2, 3].map(i => <div key={i} style={{ height: 30, width: 1, background: THEME.stacking }}></div>)}
                            </div>
                            <div style={{ width: 80, height: 45, borderRadius: 6, border: `2px solid ${THEME.stacking}`, color: THEME.stacking, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, background: THEME.stacking + "11" }}>META-LEARNER</div>
                            <div style={{ height: 20, width: 1, background: THEME.stacking }}></div>
                            <div style={{ fontSize: 14, color: THEME.stacking }}>FINAL PRED</div>
                        </div>
                    )}
                </div>

                {/* Info panel */}
                <div style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ padding: "16px", background: THEME.surface, borderRadius: "8px", borderLeft: `4px solid ${THEME[method]}` }}>
                        <h2 style={{ fontSize: "18px", margin: "0 0 4px", color: THEME[method] }}>{curr.title}</h2>
                        <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "12px" }}>{curr.philosophy}</div>
                        <p style={{ fontSize: "12px", color: THEME.text, lineHeight: 1.6, margin: 0 }}>{curr.process}</p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <div style={{ padding: "12px", background: "#ffffff08", borderRadius: "6px" }}>
                            <div style={{ fontSize: "9px", color: THEME.dim, marginBottom: "4px" }}>PRIMARY GOAL</div>
                            <div style={{ fontSize: "11px", fontWeight: 700, color: THEME[method] }}>{curr.key}</div>
                        </div>
                        <div style={{ padding: "12px", background: "#ffffff08", borderRadius: "6px" }}>
                            <div style={{ fontSize: "9px", color: THEME.dim, marginBottom: "4px" }}>COMMON ALGORITHM</div>
                            <div style={{ fontSize: "11px", fontWeight: 700, color: "#e2e8f0" }}>{curr.example}</div>
                        </div>
                    </div>

                    <div style={{ marginTop: "4px", padding: "12px", background: THEME[method] + "11", borderRadius: "6px", border: `1px solid ${THEME[method]}33` }}>
                        <span style={{ fontSize: "10px", color: THEME.dim }}>// WHY IT WORKS:</span>
                        <p style={{ fontSize: "11px", color: THEME.dim, margin: "4px 0 0", lineHeight: 1.5 }}>
                            {method === "bagging" && "Individual models fail in different places. By averaging them, uncorrelated noise cancels out, leaving only the signal."}
                            {method === "boosting" && "It converts weak learners into a strong learner by iteratively focusing on the patterns the previous models missed."}
                            {method === "stacking" && "Different algorithms have different biases. Stacking learns which algorithm is better suited for certain regions of data."}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}

