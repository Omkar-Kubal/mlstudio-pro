"use client";

import { useState, useEffect, useRef } from "react";

const W = 320, H = 320;
const PAD = { top: 24, right: 20, bottom: 44, left: 54 };
const pW = W - PAD.left - PAD.right;
const pH = H - PAD.top - PAD.bottom;

function sigmoid(z: number) { return 1 / (1 + Math.exp(-z)); }
function randNorm(m = 0, s = 1) {
    let u = 0; while (!u) u = Math.random();
    return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
}

// Generate score + label pairs
const N = 200;
const SAMPLES = Array.from({ length: N }, (_, i) => {
    const cls = i < N / 2 ? 0 : 1;
    const score = sigmoid(randNorm(cls === 1 ? 1.5 : -1.5, 1.0));
    return { score: +score.toFixed(4), cls };
});

// Build ROC curve
function buildROC(samples: typeof SAMPLES) {
    const thresholds = [...new Set(samples.map(s => s.score))].sort((a, b) => b - a);
    const P = samples.filter(s => s.cls === 1).length;
    const N_neg = samples.filter(s => s.cls === 0).length;
    const pts = [{ fpr: 0, tpr: 0, t: 1.0 }];
    thresholds.forEach(t => {
        const tp = samples.filter(s => s.cls === 1 && s.score >= t).length;
        const fp = samples.filter(s => s.cls === 0 && s.score >= t).length;
        pts.push({ fpr: fp / N_neg, tpr: tp / P, t });
    });
    pts.push({ fpr: 1, tpr: 1, t: 0 });
    // AUC via trapezoid
    let auc = 0;
    for (let i = 1; i < pts.length; i++) {
        auc += (pts[i].fpr - pts[i - 1].fpr) * (pts[i].tpr + pts[i - 1].tpr) / 2;
    }
    return { pts, auc: +auc.toFixed(3) };
}

const { pts: ROC_PTS, auc: AUC } = buildROC(SAMPLES);

function toX(fpr: number) { return PAD.left + fpr * pW; }
function toY(tpr: number) { return PAD.top + pH - tpr * pH; }

const THEME = { bg: "#08090d", surface: "#0d0e18", border: "#1a1b2c", text: "#e2e8f0", dim: "#374151", grid: "#111827" };

export default function ROCAUCPrimitive() {
    const rocRef = useRef<HTMLCanvasElement>(null);
    const distRef = useRef<HTMLCanvasElement>(null);
    const [threshold, setThreshold] = useState(0.5);

    const P = SAMPLES.filter(s => s.cls === 1).length;
    const N_neg = SAMPLES.filter(s => s.cls === 0).length;
    const tp = SAMPLES.filter(s => s.cls === 1 && s.score >= threshold).length;
    const fp = SAMPLES.filter(s => s.cls === 0 && s.score >= threshold).length;
    const fn = P - tp;
    const tpr = P ? tp / P : 0;
    const fpr = N_neg ? fp / N_neg : 0;

    useEffect(() => { drawROC(); drawDist(); }, [threshold]);

    function drawROC() {
        const canvas = rocRef.current; if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, W, H); ctx.fillStyle = THEME.surface; ctx.fillRect(0, 0, W, H);

        // AUC fill
        ctx.beginPath();
        ctx.moveTo(toX(0), toY(0));
        ROC_PTS.forEach(p => ctx.lineTo(toX(p.fpr), toY(p.tpr)));
        ctx.lineTo(toX(1), toY(0)); ctx.closePath();
        ctx.fillStyle = "#a78bfa22"; ctx.fill();

        // Diagonal (random)
        ctx.beginPath(); ctx.moveTo(toX(0), toY(0)); ctx.lineTo(toX(1), toY(1));
        ctx.strokeStyle = "#ffffff22"; ctx.lineWidth = 1; ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);

        // Grid
        ctx.strokeStyle = THEME.grid; ctx.lineWidth = 1;
        [0.2, 0.4, 0.6, 0.8].forEach(v => {
            ctx.beginPath(); ctx.moveTo(toX(v), PAD.top); ctx.lineTo(toX(v), PAD.top + pH); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(PAD.left, toY(v)); ctx.lineTo(PAD.left + pW, toY(v)); ctx.stroke();
        });

        // ROC curve
        ctx.beginPath();
        ROC_PTS.forEach((p, i) => i === 0 ? ctx.moveTo(toX(p.fpr), toY(p.tpr)) : ctx.lineTo(toX(p.fpr), toY(p.tpr)));
        ctx.strokeStyle = "#a78bfa"; ctx.lineWidth = 2.5;
        ctx.shadowColor = "#a78bfa"; ctx.shadowBlur = 6; ctx.stroke(); ctx.shadowBlur = 0;

        // Current threshold point
        const ox = toX(fpr), oy = toY(tpr);
        ctx.beginPath(); ctx.arc(ox, oy, 8, 0, Math.PI * 2);
        ctx.fillStyle = "#fbbf24"; ctx.shadowColor = "#fbbf24"; ctx.shadowBlur = 16; ctx.fill(); ctx.shadowBlur = 0;
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();

        // Crosshairs
        ctx.beginPath(); ctx.moveTo(PAD.left, oy); ctx.lineTo(ox, oy);
        ctx.moveTo(ox, PAD.top + pH); ctx.lineTo(ox, oy);
        ctx.strokeStyle = "#fbbf2444"; ctx.lineWidth = 1; ctx.setLineDash([3, 2]); ctx.stroke(); ctx.setLineDash([]);

        // Axis labels + ticks
        ctx.strokeStyle = "#252535"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(PAD.left, PAD.top); ctx.lineTo(PAD.left, PAD.top + pH);
        ctx.lineTo(PAD.left + pW, PAD.top + pH); ctx.stroke();
        ctx.fillStyle = THEME.dim; ctx.font = "9px 'SF Mono',monospace"; ctx.textAlign = "center";
        [0, 0.5, 1].forEach(v => {
            ctx.fillText(v.toFixed(1), toX(v), PAD.top + pH + 14);
            ctx.textAlign = "right"; ctx.fillText(v.toFixed(1), PAD.left - 4, toY(v) + 4); ctx.textAlign = "center";
        });
        ctx.fillText("FPR (1 - Specificity) →", PAD.left + pW / 2, H - 6);
        ctx.save(); ctx.translate(13, PAD.top + pH / 2); ctx.rotate(-Math.PI / 2);
        ctx.fillText("TPR (Recall)", 0, 0); ctx.restore();

        ctx.fillStyle = "#a78bfa"; ctx.font = "bold 10px monospace"; ctx.textAlign = "right";
        ctx.fillText(`AUC = ${AUC}`, PAD.left + pW - 4, PAD.top + 14);
    }

    function drawDist() {
        const canvas = distRef.current; if (!canvas) return;
        const DW = canvas.width, DH = canvas.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, DW, DH); ctx.fillStyle = THEME.surface; ctx.fillRect(0, 0, DW, DH);

        const bins = 30, dPAD = { t: 12, b: 28, l: 30, r: 10 };
        const dW = DW - dPAD.l - dPAD.r, dH = DH - dPAD.t - dPAD.b;
        const counts0 = Array(bins).fill(0), counts1 = Array(bins).fill(0);
        SAMPLES.forEach(s => {
            const bi = Math.min(Math.floor(s.score * bins), bins - 1);
            s.cls === 0 ? counts0[bi]++ : counts1[bi]++;
        });
        const maxC = Math.max(...counts0, ...counts1, 1);
        const bW = dW / bins;

        counts0.forEach((c, i) => { ctx.fillStyle = "#f472b866"; ctx.fillRect(dPAD.l + i * bW, dPAD.t + dH - (c / maxC) * dH, bW - 1, (c / maxC) * dH); });
        counts1.forEach((c, i) => { ctx.fillStyle = "#60a5fa66"; ctx.fillRect(dPAD.l + i * bW, dPAD.t + dH - (c / maxC) * dH, bW - 1, (c / maxC) * dH); });

        // Threshold line
        const tx = dPAD.l + threshold * dW;
        ctx.beginPath(); ctx.moveTo(tx, dPAD.t); ctx.lineTo(tx, dPAD.t + dH);
        ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 2;
        ctx.shadowColor = "#fbbf24"; ctx.shadowBlur = 8; ctx.stroke(); ctx.shadowBlur = 0;

        ctx.strokeStyle = "#252535"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(dPAD.l, dPAD.t + dH); ctx.lineTo(dPAD.l + dW, dPAD.t + dH); ctx.stroke();
        ctx.fillStyle = THEME.dim; ctx.font = "9px monospace"; ctx.textAlign = "center";
        ctx.fillText("score →", dPAD.l + dW / 2, DH - 4);
        ctx.fillStyle = "#fbbf24"; ctx.font = "bold 9px monospace";
        ctx.fillText(`t=${threshold.toFixed(2)}`, tx, dPAD.t + 8);
    }

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px 20px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT VI · EVALUATION · §119</div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>ROC & AUC Metrics</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, margin: 0, fontStyle: "italic" }}>
                    "Decoding classifier performance across all possible decision thresholds."
                </p>
            </div>

            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center", marginBottom: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ border: `1px solid ${THEME.border}`, borderRadius: "8px", overflow: "hidden" }}>
                        <canvas ref={rocRef} width={W} height={H} style={{ display: "block" }} />
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: 320 }}>
                    {/* Distribution plot */}
                    <div style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", overflow: "hidden" }}>
                        <div style={{ padding: "10px 14px", borderBottom: `1px solid ${THEME.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px" }}>SCORE DISTRIBUTIONS</span>
                            <span style={{ fontSize: "12px", fontWeight: 900, color: "#a78bfa" }}>AUC {AUC}</span>
                        </div>
                        <div style={{ position: "relative" }}>
                            <canvas ref={distRef} width={W} height={140} style={{ display: "block" }} />
                        </div>
                    </div>
                    {/* Stats */}
                    <div style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", padding: "12px 14px" }}>
                        <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "10px" }}>AT THRESHOLD {threshold.toFixed(2)}</div>
                        {[
                            { label: "TPR / Recall", val: tpr, color: "#34d399" },
                            { label: "FPR (fall-out)", val: fpr, color: "#f87171" },
                            { label: "TP", val: tp, color: "#34d399", raw: true },
                            { label: "FP", val: fp, color: "#f87171", raw: true },
                            { label: "FN", val: fn, color: "#fbbf24", raw: true },
                        ].map(({ label, val, color, raw }) => (
                            <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "5px" }}>
                                <span style={{ color: THEME.dim }}>{label}</span>
                                <span style={{ color, fontWeight: 700 }}>{raw ? val : (val * 100).toFixed(1) + "%"}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ width: "100%", maxWidth: 650, margin: "0 auto 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: THEME.dim, marginBottom: "6px" }}>
                    <span>Decision Threshold</span>
                    <span style={{ color: "#fbbf24", fontWeight: 700 }}>{threshold.toFixed(2)}</span>
                </div>
                <input type="range" min={0} max={1} step={0.01} value={threshold}
                    onChange={e => setThreshold(+e.target.value)}
                    style={{ width: "100%", accentColor: "#fbbf24", cursor: "pointer" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: THEME.dim, marginTop: "4px" }}>
                    <span>0 (predict all positive)</span><span>1 (predict all negative)</span>
                </div>
            </div>

            <div style={{ marginTop: "14px", padding: "10px 18px", borderLeft: "3px solid #a78bfa", background: "#a78bfa0f", maxWidth: "100%", fontSize: "11px", color: THEME.dim, lineHeight: 1.8, borderRadius: "0 4px 4px 0" }}>
                <span style={{ color: "#a78bfa" }}>// AUC = {AUC}:</span> A perfect classifier has AUC=1.0 (upper-left corner). Random guessing = 0.5 (diagonal). The gold dot moves along the ROC curve as you slide the threshold — watch how distribution overlap determines the curve shape.
            </div>
        </div>
    );
}

