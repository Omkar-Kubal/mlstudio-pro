"use client";

import React, { useEffect, useRef } from "react";
import { ModelResultsConfig } from "@/lib/visual-types";

// ─── Canvas dims ───────────────────────────────────────────────────────────────
const W = 480, H = 260;
const PAD = { top: 28, right: 16, bottom: 40, left: 44 };
const pW = W - PAD.left - PAD.right;
const pH = H - PAD.top - PAD.bottom;

// ─── Seeded RNG ────────────────────────────────────────────────────────────────
let _s = 99;
function rng() { _s = (_s * 9301 + 49297) % 233280; return _s / 233280; }
function rngNorm(mu = 0, sd = 1) {
    let u = 0, v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    return mu + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// ─── Datasets ─────────────────────────────────────────────────────────────────
const GOOD = Array.from({ length: 50 }, (_, i) => {
    const actual = 10 + i * 1.2 + rngNorm(0, 3);
    const pred = 10 + i * 1.2 + rngNorm(0, 2.5);
    return { actual: +actual.toFixed(2), pred: +pred.toFixed(2) };
});

// reset seed so POOR is independent
_s = 7;
const POOR = Array.from({ length: 50 }, (_, i) => {
    const actual = 10 + i * 1.2 + rngNorm(0, 3);
    const bias = i * 0.3;
    const spread = 1 + i * 0.18;
    const pred = 10 + i * 0.6 + rngNorm(-bias * 0.3, spread);
    return { actual: +actual.toFixed(2), pred: +Math.max(0, pred).toFixed(2) };
});

function rmse(data: { actual: number; pred: number }[]) {
    return Math.sqrt(data.reduce((s, d) => s + (d.actual - d.pred) ** 2, 0) / data.length).toFixed(2);
}

// ─── Draw ──────────────────────────────────────────────────────────────────────
function drawScatter(
    ctx: CanvasRenderingContext2D,
    data: { actual: number; pred: number }[],
    isGood: boolean
) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0d0e1a"; ctx.fillRect(0, 0, W, H);

    const all = [...data.map(d => d.actual), ...data.map(d => d.pred)];
    const vMin = Math.min(...all) - 2;
    const vMax = Math.max(...all) + 2;
    const toX = (v: number) => PAD.left + ((v - vMin) / (vMax - vMin)) * pW;
    const toY = (v: number) => PAD.top + pH - ((v - vMin) / (vMax - vMin)) * pH;

    // Grid
    ctx.strokeStyle = "#111827"; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = PAD.top + (i / 4) * pH;
        ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + pW, y); ctx.stroke();
        const x = PAD.left + (i / 4) * pW;
        ctx.beginPath(); ctx.moveTo(x, PAD.top); ctx.lineTo(x, PAD.top + pH); ctx.stroke();
    }

    // Perfect diagonal
    ctx.beginPath();
    ctx.moveTo(toX(vMin), toY(vMin)); ctx.lineTo(toX(vMax), toY(vMax));
    ctx.strokeStyle = "#ffffff28"; ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]); ctx.stroke(); ctx.setLineDash([]);

    const dotColor = isGood ? "#34d399" : "#f87171";

    // Residual sticks
    data.forEach(({ actual, pred }) => {
        ctx.beginPath();
        ctx.moveTo(toX(actual), toY(pred));
        ctx.lineTo(toX(actual), toY(actual));
        ctx.strokeStyle = dotColor + "44"; ctx.lineWidth = 1; ctx.stroke();
    });

    // Dots
    data.forEach(({ actual, pred }) => {
        ctx.beginPath(); ctx.arc(toX(actual), toY(pred), 4, 0, Math.PI * 2);
        ctx.fillStyle = dotColor; ctx.globalAlpha = 0.75; ctx.fill(); ctx.globalAlpha = 1;
    });

    // Axes
    ctx.strokeStyle = "#252535"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(PAD.left, PAD.top); ctx.lineTo(PAD.left, PAD.top + pH);
    ctx.lineTo(PAD.left + pW, PAD.top + pH); ctx.stroke();

    // Labels
    ctx.fillStyle = "#4a5568"; ctx.font = "10px monospace"; ctx.textAlign = "center";
    ctx.fillText("Actual →", PAD.left + pW / 2, H - 6);
    ctx.save(); ctx.translate(13, PAD.top + pH / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillText("Predicted", 0, 0); ctx.restore();

    // Title badge
    ctx.fillStyle = dotColor; ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
    ctx.fillText(isGood ? "✓ GOOD FIT" : "✗ POOR FIT", PAD.left + pW / 2, PAD.top - 8);

    // Diagonal label
    ctx.fillStyle = "#ffffff22"; ctx.font = "9px monospace"; ctx.textAlign = "right";
    ctx.fillText("perfect: y = ŷ", PAD.left + pW - 4, PAD.top + 14);
}

// ─── Props ─────────────────────────────────────────────────────────────────────
interface Props { config?: ModelResultsConfig; }

// ─── Component ─────────────────────────────────────────────────────────────────
export default function ModelResultsPrimitive({ config }: Props) {
    const goodRef = useRef<HTMLCanvasElement>(null);
    const poorRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (goodRef.current) drawScatter(goodRef.current.getContext("2d")!, GOOD, true);
        if (poorRef.current) drawScatter(poorRef.current.getContext("2d")!, POOR, false);
    }, []);

    const goodRMSE = rmse(GOOD);
    const poorRMSE = rmse(POOR);

    const PANELS = [
        { ref: goodRef, isGood: true, rmse: goodRMSE, desc: "Points hug the diagonal. Residuals are small and random — no pattern.", label: "Good Model" },
        { ref: poorRef, isGood: false, rmse: poorRMSE, desc: "Funnel shape = heteroscedasticity. Errors grow with actual value — a missed structural pattern.", label: "Poor Model" },
    ];

    const CARDS = [
        { label: "What to look for — GOOD", color: "#34d399", points: ["Points scattered randomly around y = x", "No systematic funnel / curve / gaps", "Residuals have no structure"] },
        { label: "Red flags — POOR", color: "#f87171", points: ["Funnel = heteroscedasticity", "Curve = missing polynomial terms", "Cluster gap = missing feature segment"] },
    ];

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6 select-none">

            {/* Header */}
            <div className="space-y-1">
                <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">scatter_plot</span>
                    Visualizing Model Results
                </h3>
                <p className="text-xs text-muted/60 max-w-xl">
                    Actual-vs-Predicted scatter plots reveal whether a model makes structured errors. Points should hug the <em>y = ŷ</em> diagonal randomly with no pattern.
                </p>
            </div>

            {/* Dual canvas */}
            <div className="flex flex-wrap gap-4 justify-center">
                {PANELS.map(({ ref, isGood, rmse: r, desc, label }) => {
                    const color = isGood ? "#34d399" : "#f87171";
                    return (
                        <div key={label} className="rounded-xl overflow-hidden" style={{ border: `2px solid ${color}44` }}>
                            <canvas ref={ref} width={W} height={H} style={{ display: "block", maxWidth: "100%", height: "auto" }} />
                            <div className="px-4 py-3 bg-black/40 border-t" style={{ borderColor: `${color}22` }}>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-bold" style={{ color }}>{label}</span>
                                    <span className="text-[11px] text-muted/50">
                                        RMSE = <strong style={{ color }}>{r}</strong>
                                    </span>
                                </div>
                                <p className="text-[10px] text-muted/50 mt-1 leading-relaxed">{desc}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Diagnosis cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CARDS.map(({ label, color, points }) => (
                    <div key={label} className="rounded-xl p-4 space-y-2" style={{ background: color + "08", border: `1px solid ${color}30` }}>
                        <div className="text-[10px] font-black uppercase tracking-widest" style={{ color }}>{label}</div>
                        {points.map(p => (
                            <div key={p} className="text-[10px] text-muted/60 leading-relaxed">· {p}</div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
