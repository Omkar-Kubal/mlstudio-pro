"use client";

import { useState } from "react";

const THEME = {
    bg: "#08090d", surface: "#0d0e18", border: "#1a1b2c",
    text: "#e2e8f0", dim: "#4a5568",
    tp: "#34d399", tn: "#60a5fa", fp: "#f87171", fn: "#fbbf24",
};

export default function ConfusionMatrixPrimitive() {
    const [tp, setTp] = useState(85);
    const [fp, setFp] = useState(15);
    const [fn, setFn] = useState(20);
    const [tn, setTn] = useState(80);

    const total = tp + fp + fn + tn;
    const accuracy = total ? (tp + tn) / total : 0;
    const precision = (tp + fp) ? tp / (tp + fp) : 0;
    const recall = (tp + fn) ? tp / (tp + fn) : 0;
    const f1 = (precision + recall) ? 2 * precision * recall / (precision + recall) : 0;
    const specificity = (tn + fp) ? tn / (tn + fp) : 0;

    const cells = [
        { label: "TP", sublabel: "True Positive", val: tp, setter: setTp, color: THEME.tp, desc: "Predicted +, Actually +" },
        { label: "FP", sublabel: "False Positive", val: fp, setter: setFp, color: THEME.fp, desc: "Predicted +, Actually − (Type I)" },
        { label: "FN", sublabel: "False Negative", val: fn, setter: setFn, color: THEME.fn, desc: "Predicted −, Actually + (Type II)" },
        { label: "TN", sublabel: "True Negative", val: tn, setter: setTn, color: THEME.tn, desc: "Predicted −, Actually −" },
    ];

    const metrics = [
        { label: "Accuracy", val: accuracy, formula: "(TP+TN) / total", color: "#e2e8f0", desc: "Overall correct rate" },
        { label: "Precision", val: precision, formula: "TP / (TP+FP)", color: THEME.tp, desc: "Of predicted +, how many right?" },
        { label: "Recall", val: recall, formula: "TP / (TP+FN)", color: THEME.fn, desc: "Of actual +, how many caught?" },
        { label: "F1 Score", val: f1, formula: "2×P×R / (P+R)", color: "#a78bfa", desc: "Harmonic mean of Precision + Recall" },
        { label: "Specificity", val: specificity, formula: "TN / (TN+FP)", color: THEME.tn, desc: "Of actual −, how many correct?" },
    ];

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px 20px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 850, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT IV · CLASSIFICATION · §62</div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>Confusion Matrix</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, margin: 0, fontStyle: "italic" }}>
                    "A confusion matrix is the Score Card that shows exactly what kind of mistakes your model makes."
                </p>
            </div>

            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start" }}>

                {/* Matrix */}
                <div style={{ flex: "1 1 auto" }}>
                    {/* Column headers */}
                    <div style={{ display: "flex", paddingLeft: 90, marginBottom: 4 }}>
                        {["Predicted +", "Predicted −"].map(h => (
                            <div key={h} style={{ width: 110, textAlign: "center", fontSize: "10px", color: THEME.dim, letterSpacing: "1px" }}>{h}</div>
                        ))}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {["Actual +", "Actual −"].map((rowLabel, ri) => (
                            <div key={ri} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <div style={{ width: 84, fontSize: "10px", color: THEME.dim, textAlign: "right", letterSpacing: "1px" }}>{rowLabel}</div>
                                {cells.filter((_, i) => Math.floor(i / 2) === ri).map(cell => {
                                    const maxV = Math.max(tp, fp, fn, tn, 1);
                                    return (
                                        <div key={cell.label} style={{ width: 110, padding: "14px 10px", border: `2px solid ${cell.color}`, borderRadius: "8px", background: cell.color + "18", textAlign: "center", boxShadow: `0 0 16px ${cell.color}22` }}>
                                            <div style={{ fontSize: "24px", fontWeight: 700, color: cell.color }}>{cell.val}</div>
                                            <div style={{ fontSize: "12px", fontWeight: 700, color: cell.color, marginTop: 2 }}>{cell.label}</div>
                                            <div style={{ fontSize: "9px", color: THEME.dim, marginTop: 2, lineHeight: 1.4 }}>{cell.sublabel}</div>
                                            <div style={{ height: 4, background: "#1e1e35", borderRadius: "2px", marginTop: 6, overflow: "hidden" }}>
                                                <div style={{ height: "100%", width: `${(cell.val / maxV) * 100}%`, background: cell.color, borderRadius: "2px", transition: "width 0.4s" }} />
                                            </div>
                                            <input type="range" min={0} max={150} step={1} value={cell.val}
                                                onChange={e => cell.setter(+e.target.value)}
                                                style={{ width: "100%", marginTop: 6, accentColor: cell.color, cursor: "pointer" }} />
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Metrics */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 220, flex: "1 1 220px" }}>
                    <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px" }}>DERIVED METRICS</div>
                    {metrics.map(({ label, val, formula, color, desc }) => (
                        <div key={label} style={{ background: THEME.surface, border: `1px solid ${color}33`, borderRadius: "6px", padding: "10px 12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                                <span style={{ fontSize: "11px", color, fontWeight: 700 }}>{label}</span>
                                <span style={{ fontSize: "13px", fontWeight: 700, color }}>{(val * 100).toFixed(1)}%</span>
                            </div>
                            <div style={{ height: 6, background: "#1e1e35", borderRadius: "3px", overflow: "hidden", marginBottom: 4 }}>
                                <div style={{ height: "100%", width: `${val * 100}%`, background: `linear-gradient(90deg,${color}66,${color})`, borderRadius: "3px", transition: "width 0.3s" }} />
                            </div>
                            <div style={{ fontSize: "9px", color: THEME.dim, fontFamily: "monospace" }}>{formula}</div>
                            <div style={{ fontSize: "9px", color: THEME.dim, marginTop: 2 }}>{desc}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ marginTop: "16px", padding: "10px 18px", borderLeft: "3px solid #a78bfa", background: "#a78bfa0f", maxWidth: 560, fontSize: "11px", color: THEME.dim, lineHeight: 1.8, borderRadius: "0 4px 4px 0", margin: "16px auto 0" }}>
                <span style={{ color: "#a78bfa" }}>// DRAG THE SLIDERS</span> to simulate different classifiers. Notice: when FP↑ precision↓. When FN↑ recall↓. In medical screening, recall matters most (catch every real case). In spam filtering, precision matters most (don't filter real emails).
            </div>
        </div>
    );
}
