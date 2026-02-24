"use client";
import React, { useState, useEffect, useRef } from "react";

const W = 500, H = 260, PAD = { top: 28, right: 24, bottom: 44, left: 54 };
const pW = W - PAD.left - PAD.right, pH = H - PAD.top - PAD.bottom;
let _s = 33;
function rng() { _s = (_s * 9301 + 49297) % 233280; return _s / 233280; }
function rn(m = 0, s = 1) { let u = 0; while (!u) u = rng(); return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng()); }
_s = 33;
const N = 70;
const xVals = Array.from({ length: N }, (_, i) => i * 1.2 + rn(0, 0.5));
const goodRes = xVals.map(() => rn(0, 2.5));
const poorRes = xVals.map((x) => rn(0, 0.5 + x * 0.18) + Math.sin(x * 0.3) * 3);
const xMax = Math.max(...xVals) + 1;
const MODES = [
    { key: "good", label: "✓ Clean Data", color: "#34d399", residuals: goodRes, desc: "Random scatter — no pattern. Model has captured all signal." },
    { key: "poor", label: "✗ Problematic", color: "#f87171", residuals: poorRes, desc: "Funnel + curve pattern — heteroscedasticity and missed non-linearity." },
] as const;
type MK = "good" | "poor";

export default function ResidualAnalysisPrimitive() {
    const cvs = useRef<HTMLCanvasElement>(null);
    const [mode, setMode] = useState<MK>("good");
    const m = MODES.find(x => x.key === mode)!;
    const resids = m.residuals;
    const sd = Math.sqrt(resids.reduce((s, r) => s + r * r, 0) / resids.length);

    function toX(x: number) { return PAD.left + (x / xMax) * pW; }
    function toY(r: number) { return PAD.top + pH / 2 - (r / Math.max(Math.abs(Math.min(...resids)), Math.max(...resids))) * (pH / 2 - 8); }

    useEffect(() => {
        const canvas = cvs.current; if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, W, H); ctx.fillStyle = "#0d0e18"; ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = "#111827"; ctx.lineWidth = 1;
        [-2, -1, 0, 1, 2].forEach(i => { const y = PAD.top + pH / 2 - i / 2.5 * (pH / 2 - 8); ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + pW, y); ctx.stroke(); });
        // Zero line
        ctx.beginPath(); ctx.moveTo(PAD.left, toY(0)); ctx.lineTo(PAD.left + pW, toY(0));
        ctx.strokeStyle = "#334155"; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = "#374151"; ctx.font = "9px monospace"; ctx.textAlign = "left"; ctx.fillText("0", PAD.left - 18, toY(0) + 4);
        // ±2σ bands
        [-1, 1].forEach(sign => {
            const y = toY(sign * 2 * sd);
            ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + pW, y);
            ctx.strokeStyle = m.color + "33"; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
            ctx.fillStyle = m.color + "66"; ctx.font = "9px monospace"; ctx.textAlign = "right"; ctx.fillText(`${sign > 0 ? "+" : ""}${(sign * 2 * sd).toFixed(1)}`, PAD.left - 4, y + 4);
        });
        // Stems + dots
        xVals.forEach((x, i) => {
            const r = resids[i], cx = toX(x), cy = toY(r), outlier = Math.abs(r) > 2 * sd;
            ctx.beginPath(); ctx.moveTo(cx, toY(0)); ctx.lineTo(cx, cy); ctx.strokeStyle = m.color + "22"; ctx.lineWidth = 0.8; ctx.stroke();
            ctx.beginPath(); ctx.arc(cx, cy, outlier ? 5 : 3.5, 0, Math.PI * 2);
            ctx.fillStyle = m.color; ctx.globalAlpha = 0.8; if (outlier) { ctx.shadowColor = m.color; ctx.shadowBlur = 8; } ctx.fill(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
        });
        // Poor pattern overlay
        if (mode === "poor") {
            ctx.beginPath(); for (let i = 0; i <= 100; i++) { const x = i / 100 * xMax, tr = Math.sin(x * 0.3) * 3; i === 0 ? ctx.moveTo(toX(x), toY(tr)) : ctx.lineTo(toX(x), toY(tr)); }
            ctx.strokeStyle = "#f8717166"; ctx.lineWidth = 2; ctx.setLineDash([5, 3]); ctx.stroke(); ctx.setLineDash([]);
            ctx.fillStyle = "#f87171"; ctx.font = "10px monospace"; ctx.textAlign = "left"; ctx.fillText("↑ non-random pattern = missed signal", PAD.left + 4, PAD.top + 14);
        }
        // Axes
        ctx.strokeStyle = "#252535"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(PAD.left, PAD.top); ctx.lineTo(PAD.left, PAD.top + pH); ctx.lineTo(PAD.left + pW, PAD.top + pH); ctx.stroke();
        ctx.fillStyle = "#374151"; ctx.font = "10px monospace"; ctx.textAlign = "center"; ctx.fillText("Fitted values →", PAD.left + pW / 2, H - 8);
        ctx.save(); ctx.translate(13, PAD.top + pH / 2); ctx.rotate(-Math.PI / 2); ctx.fillText("Residuals", 0, 0); ctx.restore();
        const rmse = Math.sqrt(resids.reduce((s, r) => s + r * r, 0) / resids.length).toFixed(2);
        ctx.fillStyle = m.color; ctx.font = "bold 10px monospace"; ctx.textAlign = "right"; ctx.fillText(`RMSE = ${rmse}`, PAD.left + pW - 4, PAD.top + 16);
    }, [mode]);

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-5 select-none">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">analytics</span>Residual Analysis
                    </h3>
                    <p className="text-xs text-muted/60">Residuals are Errors. If they have a pattern, your model missed a pattern in the data.</p>
                </div>
                <div className="flex gap-2 shrink-0">
                    {MODES.map(mo => (
                        <button key={mo.key} onClick={() => setMode(mo.key)}
                            className="px-4 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all"
                            style={mode === mo.key ? { color: mo.color, background: mo.color + "18", borderColor: mo.color + "55" } : { color: "rgba(255,255,255,0.25)", borderColor: "rgba(255,255,255,0.08)" }}>
                            {mo.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${m.color}33`, boxShadow: `0 0 28px ${m.color}18` }}>
                <canvas ref={cvs} width={W} height={H} style={{ display: "block", maxWidth: "100%", height: "auto" }} />
            </div>
            <div className="text-center text-[11px] rounded-lg px-4 py-3" style={{ border: `1px solid ${m.color}22`, color: m.color }}>{m.desc}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                    { label: "Good residual plot", color: "#34d399", pts: ["Random scatter around zero", "Constant variance (homoscedastic)", "No curved trends or clusters"] },
                    { label: "Bad residual plot", color: "#f87171", pts: ["Funnel → heteroscedasticity", "Curve → missing polynomial terms", "Clusters → missing categorical feature"] },
                ].map(({ label, color, pts }) => (
                    <div key={label} className="rounded-xl p-4" style={{ border: `1px solid ${color}25`, background: color + "08" }}>
                        <div className="text-[10px] font-black mb-2" style={{ color }}>{label}</div>
                        {pts.map(p => <div key={p} className="text-[9px] text-muted/50 mb-1">· {p}</div>)}
                    </div>
                ))}
            </div>
        </div>
    );
}

