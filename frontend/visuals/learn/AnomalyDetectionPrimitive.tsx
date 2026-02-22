"use client";

import { useState, useMemo } from "react";

const THEME = {
    bg: "#07080c", surface: "#0c0d16", border: "#181826",
    text: "#e2e8f0", dim: "#4a5568",
    inliner: "#34d399", outlier: "#f87171", threshold: "#fbbf24"
};

const N = 60;
const H = 340, W = 700;
const PAD = 40;

export default function AnomalyDetectionPrimitive() {
    const [threshold, setThreshold] = useState(2.0);
    const [contamination, setContamination] = useState(0.1);

    const data = useMemo(() => {
        const d = [];
        let seed = 123;
        const random = () => {
            let x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };

        // Generate normal distribution
        for (let i = 0; i < N; i++) {
            const x = (random() + random() + random() + random() - 2) * 50 + W / 2;
            const y = (random() + random() + random() + random() - 2) * 40 + H / 2;
            d.push({ x, y, id: i, type: 'normal' });
        }
        // Generate anomalies
        const numAnom = Math.floor(N * contamination);
        for (let i = 0; i < numAnom; i++) {
            const angle = random() * Math.PI * 2;
            const dist = 100 + random() * 100;
            d.push({
                x: W / 2 + Math.cos(angle) * dist,
                y: H / 2 + Math.sin(angle) * dist,
                id: N + i,
                type: 'anomaly'
            });
        }
        return d;
    }, [contamination]);

    // Calculate distances from center (simplified Mahalanobis)
    const stats = useMemo(() => {
        const scores = data.map(p => {
            const dx = (p.x - W / 2);
            const dy = (p.y - H / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);
            // Normalized score (z-score style)
            return { ...p, score: dist / 35 };
        });
        return scores;
    }, [data]);

    const flagged = stats.filter(p => p.score > threshold);

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px 20px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT VII · ANOMALY · §141</div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>Statistical Outlier Detection</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, margin: 0, fontStyle: "italic" }}>
                    "Isolating the rare, the different, and the potentially fraudulent."
                </p>
            </div>

            <div style={{ display: "flex", gap: "14px", marginBottom: "20px" }}>
                <div style={{ flex: 1, background: THEME.surface, padding: "12px", borderRadius: "8px", border: `1px solid ${THEME.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ fontSize: "10px", color: THEME.threshold }}>SENSITIVITY (Z-SCORE)</span>
                        <span style={{ fontSize: "12px", fontWeight: 700 }}>{threshold.toFixed(2)}σ</span>
                    </div>
                    <input type="range" min="0.5" max="4.5" step="0.1" value={threshold} onChange={e => setThreshold(parseFloat(e.target.value))}
                        style={{ width: "100%", accentColor: THEME.threshold, cursor: "pointer" }} />
                </div>
                <div style={{ flex: 1, background: THEME.surface, padding: "12px", borderRadius: "8px", border: `1px solid ${THEME.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ fontSize: "10px", color: THEME.dim }}>CONTAMINATION RATE</span>
                        <span style={{ fontSize: "12px", fontWeight: 700 }}>{(contamination * 100).toFixed(0)}%</span>
                    </div>
                    <input type="range" min="0" max="0.3" step="0.05" value={contamination} onChange={e => setContamination(parseFloat(e.target.value))}
                        style={{ width: "100%", accentColor: THEME.dim, cursor: "pointer" }} />
                </div>
            </div>

            <div style={{ position: "relative", background: THEME.surface, borderRadius: "8px", border: `1px solid ${THEME.border}`, overflow: "hidden", marginBottom: "20px" }}>
                <svg width={W} height={H} style={{ display: "block", margin: "0 auto" }}>
                    {/* Threshold rings */}
                    {[1, 2, 3].map(radius => (
                        <circle
                            key={radius}
                            cx={W / 2}
                            cy={H / 2}
                            r={radius * 35 * threshold / 2}
                            fill="none"
                            stroke={radius * threshold / 2 > threshold ? THEME.outlier : THEME.inliner}
                            strokeWidth="1"
                            strokeDasharray="4,4"
                            opacity={radius * threshold / 2 === threshold ? 0.8 : 0.2}
                        />
                    ))}

                    {/* Main threshold boundary */}
                    <circle cx={W / 2} cy={H / 2} r={threshold * 35} fill={THEME.threshold + "05"} stroke={THEME.threshold} strokeWidth="2" opacity="0.3" />

                    {/* Data points */}
                    {stats.map(p => {
                        const isOutlier = p.score > threshold;
                        return (
                            <g key={p.id}>
                                {isOutlier && (
                                    <circle cx={p.x} cy={p.y} r="12" fill={THEME.outlier + "22"}>
                                        <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
                                        <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
                                    </circle>
                                )}
                                <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r={isOutlier ? 4 : 3}
                                    fill={isOutlier ? THEME.outlier : THEME.inliner}
                                    stroke={isOutlier ? "#fff" : "none"}
                                    strokeWidth="1"
                                    style={{ transition: "all 0.3s" }}
                                />
                            </g>
                        );
                    })}

                    <text x={20} y={30} fill={THEME.dim} fontSize="10">Normal Cluster</text>
                    <text x={W - 140} y={30} fill={THEME.outlier} fontSize="10" fontWeight="bold">Outlier Zone</text>
                </svg>

                {/* Legend */}
                <div style={{ position: "absolute", bottom: 12, left: 12, padding: "8px", background: THEME.bg + "aa", borderRadius: "4px", fontSize: "9px", color: THEME.dim, border: `1px solid ${THEME.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <div style={{ width: 8, height: 8, background: THEME.inliner, borderRadius: "50%" }} /> Normal Data
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: 8, height: 8, background: THEME.outlier, borderRadius: "50%" }} /> Anomaly Detected
                    </div>
                </div>

                {/* Status */}
                <div style={{ position: "absolute", top: 12, right: 12, textAlign: "right" }}>
                    <div style={{ fontSize: "18px", fontWeight: 900, color: flagged.length > 0 ? THEME.outlier : THEME.inliner }}>
                        {flagged.length} {flagged.length === 1 ? 'ANOMALY' : 'ANOMALIES'}
                    </div>
                    <div style={{ fontSize: "9px", color: THEME.dim, letterSpacing: "1px" }}>DETECTION QUEUE</div>
                </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <div style={{ flex: 1, background: THEME.surface, border: `1px solid ${THEME.border}`, padding: "14px", borderRadius: "8px" }}>
                    <h4 style={{ fontSize: "12px", color: THEME.threshold, margin: "0 0 8px" }}>Isolation Forest</h4>
                    <p style={{ fontSize: "10px", color: THEME.dim, lineHeight: "1.5", margin: 0 }}>
                        Instead of manual thresholds, Isolation Forests "isolate" anomalies by randomly partitioning data. Outliers take fewer splits to isolate.
                    </p>
                </div>
                <div style={{ flex: 1, background: THEME.surface, border: `1px solid ${THEME.border}`, padding: "14px", borderRadius: "8px" }}>
                    <h4 style={{ fontSize: "12px", color: THEME.outlier, margin: "0 0 8px" }}>True vs False Positives</h4>
                    <p style={{ fontSize: "10px", color: THEME.dim, lineHeight: "1.5", margin: 0 }}>
                        A low threshold (high sensitivity) catches all cases but increases False Positives. A high threshold misses some cases but stays precise.
                    </p>
                </div>
            </div>

            <div style={{ marginTop: "14px", padding: "10px 18px", borderLeft: `3px solid ${THEME.threshold}`, background: THEME.threshold + "0f", maxWidth: "100%", fontSize: "11px", color: THEME.dim, lineHeight: 1.8, borderRadius: "0 4px 4px 0" }}>
                <span style={{ color: THEME.threshold }}>// Anomaly Threshold:</span> By calculating the distance of each point from the centroid of a "normal" cluster, we can apply a statistical threshold (usually measured in standard deviations, or σ) to flag data that doesn't belong.
            </div>
        </div>
    );
}
