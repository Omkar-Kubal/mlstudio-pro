"use client";

import React, { useState, useEffect, useRef } from "react";
import { MatplotlibSeabornConfig } from "@/adapters/visual-types";

// ─── Canvas constants ──────────────────────────────────────────────────────────
const W = 500, H = 280;
const PAD = { top: 28, right: 16, bottom: 36, left: 44 };
const pW = W - PAD.left - PAD.right;
const pH = H - PAD.top - PAD.bottom;

// ─── Synthetic dataset (seeded) ────────────────────────────────────────────────
let _s = 17;
function rng() { _s = (_s * 9301 + 49297) % 233280; return _s / 233280; }

const CATS = ["A", "B", "C"] as const;
const CAT_COLOR_SNS: Record<string, string> = { A: "#f472b6", B: "#60a5fa", C: "#34d399" };

interface Point { x: number; y: number; g: string }
const DATA: Point[] = Array.from({ length: 55 }, (_, i) => {
    const x = i * 0.8 + rng() * 3;
    const y = 1.3 * x + 5 + (rng() - 0.5) * 10;
    return { x: +x.toFixed(2), y: +y.toFixed(2), g: CATS[Math.floor(rng() * 3)] };
});

const xMin = Math.min(...DATA.map(d => d.x)) - 1;
const xMax = Math.max(...DATA.map(d => d.x)) + 2;
const yMin = Math.min(...DATA.map(d => d.y)) - 3;
const yMax = Math.max(...DATA.map(d => d.y)) + 5;

function toX(x: number) { return PAD.left + ((x - xMin) / (xMax - xMin)) * pW; }
function toY(y: number) { return PAD.top + pH - ((y - yMin) / (yMax - yMin)) * pH; }

// ─── Linear regression ─────────────────────────────────────────────────────────
function linReg(pts: Point[]) {
    const n = pts.length;
    const sx = pts.reduce((a, d) => a + d.x, 0);
    const sy = pts.reduce((a, d) => a + d.y, 0);
    const sxy = pts.reduce((a, d) => a + d.x * d.y, 0);
    const sx2 = pts.reduce((a, d) => a + d.x * d.x, 0);
    const m = (n * sxy - sx * sy) / (n * sx2 - sx * sx);
    const b = (sy - m * sx) / n;
    return { m, b };
}

const { m, b } = linReg(DATA);

// ─── Draw helpers ──────────────────────────────────────────────────────────────
function drawMpl(ctx: CanvasRenderingContext2D, showReg: boolean, showGrid: boolean) {
    const cW = ctx.canvas.width, cH = ctx.canvas.height;
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, cW, cH);
    ctx.strokeStyle = "#000"; ctx.lineWidth = 1;
    ctx.strokeRect(PAD.left, PAD.top, pW, pH);

    if (showGrid) {
        ctx.strokeStyle = "#e5e5e5"; ctx.lineWidth = 0.5;
        for (let i = 1; i < 5; i++) {
            const y = PAD.top + (i / 5) * pH;
            ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + pW, y); ctx.stroke();
        }
    }

    DATA.forEach(d => {
        ctx.beginPath(); ctx.arc(toX(d.x), toY(d.y), 4, 0, Math.PI * 2);
        ctx.fillStyle = "#1f77b4"; ctx.globalAlpha = 0.65; ctx.fill(); ctx.globalAlpha = 1;
    });

    if (showReg) {
        ctx.beginPath();
        ctx.moveTo(toX(xMin), toY(m * xMin + b));
        ctx.lineTo(toX(xMax), toY(m * xMax + b));
        ctx.strokeStyle = "#ff7f0e"; ctx.lineWidth = 1.5; ctx.stroke();
    }

    ctx.fillStyle = "#000"; ctx.font = "11px Arial,sans-serif"; ctx.textAlign = "center";
    ctx.fillText("X", PAD.left + pW / 2, cH - 6);
    ctx.save(); ctx.translate(12, PAD.top + pH / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillText("Y", 0, 0); ctx.restore();
    ctx.font = "bold 11px Arial"; ctx.fillText("matplotlib  (raw)", PAD.left + pW / 2, PAD.top - 8);
    ctx.font = "8px monospace"; ctx.fillStyle = "#888"; ctx.textAlign = "right";
    ctx.fillText("plt.scatter() + plt.plot()", PAD.left + pW - 2, PAD.top + pH - 4);
}

function drawSns(ctx: CanvasRenderingContext2D, showReg: boolean, showGrid: boolean) {
    const cW = ctx.canvas.width, cH = ctx.canvas.height;
    ctx.fillStyle = "#1a1a2e"; ctx.fillRect(0, 0, cW, cH);
    ctx.fillStyle = "#0f1018"; ctx.fillRect(PAD.left, PAD.top, pW, pH);

    if (showGrid) {
        ctx.strokeStyle = "#1e2035"; ctx.lineWidth = 1;
        for (let i = 1; i < 5; i++) {
            const y = PAD.top + (i / 5) * pH;
            ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + pW, y); ctx.stroke();
        }
    }

    DATA.forEach(d => {
        ctx.beginPath(); ctx.arc(toX(d.x), toY(d.y), 5, 0, Math.PI * 2);
        ctx.fillStyle = CAT_COLOR_SNS[d.g]; ctx.globalAlpha = 0.8; ctx.fill(); ctx.globalAlpha = 1;
        ctx.strokeStyle = "#00000040"; ctx.lineWidth = 0.5; ctx.stroke();
    });

    if (showReg) {
        // CI band
        ctx.beginPath();
        const steps = 50;
        for (let i = 0; i <= steps; i++) {
            const x = xMin + (i / steps) * (xMax - xMin);
            ctx.lineTo(toX(x), toY(m * x + b + 4 + (x - xMin) * 0.25));
        }
        for (let i = steps; i >= 0; i--) {
            const x = xMin + (i / steps) * (xMax - xMin);
            ctx.lineTo(toX(x), toY(m * x + b - 4 - (x - xMin) * 0.25));
        }
        ctx.closePath(); ctx.fillStyle = "#ffffff18"; ctx.fill();
        // Regression line
        ctx.beginPath();
        ctx.moveTo(toX(xMin), toY(m * xMin + b));
        ctx.lineTo(toX(xMax), toY(m * xMax + b));
        ctx.strokeStyle = "#ffffffcc"; ctx.lineWidth = 2; ctx.stroke();
    }

    // Legend
    CATS.forEach((k, i) => {
        const lx = PAD.left + pW - 70 + i * 24, ly = PAD.top + 12;
        ctx.beginPath(); ctx.arc(lx, ly, 4, 0, Math.PI * 2);
        ctx.fillStyle = CAT_COLOR_SNS[k]; ctx.fill();
        ctx.fillStyle = "#e2e8f0"; ctx.font = "9px monospace"; ctx.textAlign = "left";
        ctx.fillText(k, lx + 7, ly + 4);
    });

    ctx.fillStyle = "#94a3b8"; ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
    ctx.fillText("seaborn  (styled)", PAD.left + pW / 2, PAD.top - 8);
    ctx.font = "8px monospace"; ctx.fillStyle = "#374151"; ctx.textAlign = "right";
    ctx.fillText("sns.lmplot(x,y,hue='group')", PAD.left + pW - 2, PAD.top + pH - 4);
}

// ─── Props ─────────────────────────────────────────────────────────────────────
interface Props { config?: MatplotlibSeabornConfig; }

// ─── Component ─────────────────────────────────────────────────────────────────
export default function MatplotlibSeabornPrimitive({ config: _config }: Props) {
    const mplRef = useRef<HTMLCanvasElement>(null);
    const snsRef = useRef<HTMLCanvasElement>(null);
    const [showReg, setShowReg] = useState(true);
    const [showGrid, setShowGrid] = useState(true);

    useEffect(() => {
        if (mplRef.current) drawMpl(mplRef.current.getContext("2d")!, showReg, showGrid);
        if (snsRef.current) drawSns(snsRef.current.getContext("2d")!, showReg, showGrid);
    }, [showReg, showGrid]);

    const COMPARISON = [
        {
            lib: "Matplotlib",
            color: "#ef4444",
            points: [
                "Fine-grained pixel-level control",
                "Verbose — 5–10 lines for a basic plot",
                "No statistical defaults built in",
                "Best for: custom figures, subplots, publications",
            ],
        },
        {
            lib: "Seaborn",
            color: "#60a5fa",
            points: [
                "Statistical defaults: CI bands, hue mapping",
                "Concise — often just 1–2 lines",
                "Prettier themes out of the box",
                "Best for: EDA & statistical visualization",
            ],
        },
    ];

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6 select-none">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">bar_chart</span>
                        Matplotlib vs Seaborn
                    </h3>
                    <p className="text-xs text-muted/60 max-w-lg">
                        Matplotlib is a low-level paintbrush. Seaborn is a high-level camera with built-in statistics.
                    </p>
                </div>

                {/* Toggles */}
                <div className="flex gap-4 shrink-0 items-center">
                    {[
                        { label: "Regression line", val: showReg, set: setShowReg },
                        { label: "Grid", val: showGrid, set: setShowGrid },
                    ].map(({ label, val, set }) => (
                        <label key={label} className="flex items-center gap-2 text-[10px] text-muted/60 cursor-pointer select-none">
                            <input
                                type="checkbox" checked={val}
                                onChange={e => set(e.target.checked)}
                                className="accent-sky-400"
                            />
                            {label}
                        </label>
                    ))}
                </div>
            </div>

            {/* Side-by-side canvases */}
            <div className="flex flex-wrap gap-4 justify-center">
                <div className="border-2 border-gray-600/40 rounded-xl overflow-hidden">
                    <canvas ref={mplRef} width={W} height={H} style={{ display: "block", maxWidth: "100%", height: "auto" }} />
                </div>
                <div className="border-2 border-sky-900/60 rounded-xl overflow-hidden">
                    <canvas ref={snsRef} width={W} height={H} style={{ display: "block", maxWidth: "100%", height: "auto" }} />
                </div>
            </div>

            {/* Comparison cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {COMPARISON.map(({ lib, color, points }) => (
                    <div
                        key={lib}
                        className="rounded-xl p-4 space-y-2"
                        style={{ background: color + "08", border: `1px solid ${color}30` }}
                    >
                        <div className="text-[10px] font-black uppercase tracking-widest" style={{ color }}>
                            {lib}
                        </div>
                        {points.map(p => (
                            <div key={p} className="text-[10px] text-muted/60 leading-relaxed">· {p}</div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

