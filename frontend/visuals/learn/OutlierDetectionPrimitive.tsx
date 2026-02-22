"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

const W = 540, H = 280;
const PAD = { top: 32, right: 24, bottom: 48, left: 54 };
const pW = W - PAD.left - PAD.right;
const pH = H - PAD.top - PAD.bottom;

// ─── Seeded RNG ────────────────────────────────────────────────────────────────
let _s = 42;
function rng() { _s = (_s * 9301 + 49297) % 233280; return _s / 233280; }
function rngNorm(m = 0, s = 1) {
    let u = 0, v = 0;
    while (!u) u = rng();
    while (!v) v = rng();
    return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Dataset: mostly normal with injected outliers
_s = 42;
const BASE = Array.from({ length: 80 }, () => rngNorm(50, 8));
const OUTLIER_IDX = [5, 18, 34, 61, 72];
OUTLIER_IDX.forEach(i => { BASE[i] = 50 + (rng() > 0.5 ? 1 : -1) * (28 + rng() * 20); });
const DATA = BASE.map((v, i) => ({ v: +v.toFixed(2), isOutlier: OUTLIER_IDX.includes(i) }));

const allVals = DATA.map(d => d.v);
const mean = allVals.reduce((s, v) => s + v, 0) / allVals.length;
const std = Math.sqrt(allVals.reduce((s, v) => s + (v - mean) ** 2, 0) / allVals.length);
const sorted = [...allVals].sort((a, b) => a - b);
const q1 = sorted[Math.floor(sorted.length * 0.25)];
const q3 = sorted[Math.floor(sorted.length * 0.75)];
const iqr = q3 - q1;
const vMin = Math.min(...allVals) - 2;
const vMax = Math.max(...allVals) + 2;

const BINS = 30;
const binW = (vMax - vMin) / BINS;

const METHODS = [
    { key: "zscore", label: "Z-Score", color: "#60a5fa", desc: "Flag points more than Z standard deviations from the mean" },
    { key: "iqr", label: "IQR", color: "#f472b6", desc: "Flag points outside 1.5 × IQR beyond Q1/Q3 (robust to extremes)" },
] as const;
type MethodKey = "zscore" | "iqr";

export default function OutlierDetectionPrimitive() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [method, setMethod] = useState<MethodKey>("zscore");
    const [threshold, setThreshold] = useState(2.0);

    const m = METHODS.find(x => x.key === method)!;

    const getFlags = useCallback(() => {
        if (method === "zscore") return DATA.map(d => Math.abs((d.v - mean) / std) > threshold);
        const lo = q1 - threshold * iqr, hi = q3 + threshold * iqr;
        return DATA.map(d => d.v < lo || d.v > hi);
    }, [method, threshold]);

    const flags = getFlags();
    const flagCount = flags.filter(Boolean).length;

    const counts = Array(BINS).fill(0);
    const binFlags = Array(BINS).fill(false);
    DATA.forEach((d, i) => {
        const bi = Math.min(Math.floor((d.v - vMin) / binW), BINS - 1);
        counts[bi]++;
        if (flags[i]) binFlags[bi] = true;
    });
    const maxCount = Math.max(...counts);

    function toX(v: number) { return PAD.left + ((v - vMin) / (vMax - vMin)) * pW; }

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "#0d0e18"; ctx.fillRect(0, 0, W, H);
        const bpx = pW / BINS;

        // Danger zone shading
        const lo = method === "zscore" ? mean - threshold * std : q1 - threshold * iqr;
        const hi = method === "zscore" ? mean + threshold * std : q3 + threshold * iqr;
        [[vMin, lo], [hi, vMax]].forEach(([a, b]) => {
            if (b > a) {
                ctx.fillStyle = "#f8717118";
                ctx.fillRect(toX(Math.max(a, vMin)), PAD.top, toX(Math.min(b, vMax)) - toX(Math.max(a, vMin)), pH);
            }
        });

        // Bars
        counts.forEach((c, bi) => {
            if (c === 0) return;
            const bx = PAD.left + bi * bpx;
            const bh = (c / maxCount) * pH;
            ctx.fillStyle = binFlags[bi] ? "#f87171cc" : m.color + "66";
            ctx.fillRect(bx + 1, PAD.top + pH - bh, bpx - 2, bh);
            ctx.strokeStyle = binFlags[bi] ? "#f87171" : m.color + "88";
            ctx.lineWidth = 0.8; ctx.strokeRect(bx + 1, PAD.top + pH - bh, bpx - 2, bh);
        });

        // Threshold / fence lines
        if (method === "zscore") {
            [-1, 1].forEach(sign => {
                const xp = toX(mean + sign * threshold * std);
                ctx.beginPath(); ctx.moveTo(xp, PAD.top); ctx.lineTo(xp, PAD.top + pH);
                ctx.strokeStyle = "#f87171"; ctx.lineWidth = 1.5;
                ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);
                ctx.fillStyle = "#f87171"; ctx.font = "9px monospace";
                ctx.textAlign = sign > 0 ? "left" : "right";
                ctx.fillText(`${sign > 0 ? "+" : "-"}${threshold.toFixed(1)}σ`, xp + sign * 4, PAD.top + 14);
            });
            // Mean
            ctx.beginPath(); ctx.moveTo(toX(mean), PAD.top); ctx.lineTo(toX(mean), PAD.top + pH);
            ctx.strokeStyle = m.color + "88"; ctx.lineWidth = 1; ctx.stroke();
            ctx.fillStyle = m.color; ctx.font = "9px monospace"; ctx.textAlign = "center";
            ctx.fillText("μ", toX(mean), PAD.top + 10);
        } else {
            [q1, q3].forEach((q, i) => {
                ctx.beginPath(); ctx.moveTo(toX(q), PAD.top + pH * 0.3); ctx.lineTo(toX(q), PAD.top + pH);
                ctx.strokeStyle = m.color + "88"; ctx.lineWidth = 1;
                ctx.setLineDash([3, 2]); ctx.stroke(); ctx.setLineDash([]);
                ctx.fillStyle = m.color; ctx.font = "9px monospace"; ctx.textAlign = "center";
                ctx.fillText(i === 0 ? "Q1" : "Q3", toX(q), PAD.top + pH * 0.3 - 4);
            });
            [lo, hi].forEach((fence, i) => {
                if (fence < vMin || fence > vMax) return;
                ctx.beginPath(); ctx.moveTo(toX(fence), PAD.top); ctx.lineTo(toX(fence), PAD.top + pH);
                ctx.strokeStyle = "#f87171"; ctx.lineWidth = 1.5;
                ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);
                ctx.fillStyle = "#f87171"; ctx.font = "9px monospace";
                ctx.textAlign = i === 0 ? "right" : "left";
                ctx.fillText(i === 0 ? "lower fence" : "upper fence", toX(fence) + (i === 0 ? -3 : 3), PAD.top + 14);
            });
        }

        // Axes
        ctx.strokeStyle = "#252535"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(PAD.left, PAD.top); ctx.lineTo(PAD.left, PAD.top + pH);
        ctx.lineTo(PAD.left + pW, PAD.top + pH); ctx.stroke();
        ctx.fillStyle = "#374151"; ctx.font = "9px monospace"; ctx.textAlign = "center";
        [10, 20, 30, 40, 50, 60, 70, 80, 90].forEach(v => {
            if (v < vMin || v > vMax) return;
            ctx.fillText(String(v), toX(v), PAD.top + pH + 16);
        });
        ctx.fillText("value →", PAD.left + pW / 2, H - 6);

        ctx.fillStyle = "#f87171"; ctx.font = "bold 10px monospace"; ctx.textAlign = "right";
        ctx.fillText(`${flagCount} outliers flagged`, PAD.left + pW - 4, PAD.top + 16);
    }, [method, threshold, flags, flagCount, m, binFlags, counts]);

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-5 select-none">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">query_stats</span>
                        Outlier Detection
                    </h3>
                    <p className="text-xs text-muted/60 max-w-lg">
                        Z-score asks <em>&quot;How far from the crowd?&quot;</em>; IQR ignores extremes and measures the middle 50%.
                    </p>
                </div>
                <div className="flex gap-2 shrink-0">
                    {METHODS.map(mo => (
                        <button key={mo.key} onClick={() => setMethod(mo.key)}
                            className="px-4 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all"
                            style={method === mo.key
                                ? { color: mo.color, background: mo.color + "18", borderColor: mo.color + "55" }
                                : { color: "rgba(255,255,255,0.25)", borderColor: "rgba(255,255,255,0.08)" }}>
                            {mo.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${m.color}33` }}>
                <canvas ref={canvasRef} width={W} height={H} style={{ display: "block", maxWidth: "100%", height: "auto" }} />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-[11px]">
                    <span className="text-muted/50">{method === "zscore" ? "Z threshold (σ)" : "IQR multiplier"}</span>
                    <span style={{ color: m.color }}>{threshold.toFixed(1)} → <span className="text-red-400">{flagCount} flagged</span></span>
                </div>
                <input type="range" min={0.5} max={3.5} step={0.1} value={threshold}
                    onChange={e => setThreshold(+e.target.value)}
                    className="w-full cursor-pointer" style={{ accentColor: m.color }} />
                <div className="flex justify-between text-[10px] text-muted/30">
                    <span>Strict (flag more)</span><span>Lenient (flag fewer)</span>
                </div>
            </div>

            <div className="flex gap-4 text-[11px]">
                {[
                    { label: "mean", val: mean.toFixed(1), color: "#60a5fa" },
                    { label: "std", val: std.toFixed(1), color: "#60a5fa" },
                    { label: "Q1", val: q1.toFixed(1), color: "#f472b6" },
                    { label: "Q3", val: q3.toFixed(1), color: "#f472b6" },
                    { label: "IQR", val: iqr.toFixed(1), color: "#f472b6" },
                ].map(({ label, val, color }) => (
                    <div key={label} className="text-center">
                        <div className="text-[9px] text-muted/30 mb-0.5">{label}</div>
                        <div className="font-bold font-mono" style={{ color }}>{val}</div>
                    </div>
                ))}
            </div>

            <div className="rounded-r-lg border-l-4 px-4 py-3 text-[11px] leading-relaxed text-muted/60"
                style={{ borderColor: m.color, background: m.color + "0f" }}>
                <span style={{ color: m.color }}>{m.desc}</span> — Red bars are flagged outliers, red zones are rejection regions. Lower threshold = more aggressive flagging.
            </div>
        </div>
    );
}
