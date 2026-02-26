"use client";
import React, { useState, useEffect, useRef } from "react";

const W = 540, H = 300, PAD = { top: 28, right: 24, bottom: 44, left: 50 };
const pW = W - PAD.left - PAD.right, pH = H - PAD.top - PAD.bottom;
const X_MIN = -2, X_MAX = 4.5;
const trueF = (x: number) => 0.4 * x ** 3 - 2 * x ** 2 + x + 4;

let _s = 55;
function rng() { _s = (_s * 9301 + 49297) % 233280; return _s / 233280; }
function rn(m = 0, s = 1) { let u = 0; while (!u) u = rng(); return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng()); }
_s = 55;
const DATA = Array.from({ length: 22 }, (_, i) => { const x = X_MIN + (i / 21) * (X_MAX - X_MIN) + rn(0, 0.12); return { x: +x.toFixed(3), y: +(trueF(x) + rn(0, 1.8)).toFixed(3) }; });

function polyFit(data: { x: number; y: number }[], deg: number) {
    const _n = data.length, d = deg + 1;
    const Xm = data.map(p => Array.from({ length: d }, (_, k) => Math.pow(p.x, k)));
    const y = data.map(p => p.y);
    const XTX = Array.from({ length: d }, (_, i) => Array.from({ length: d }, (_, j) => Xm.reduce((s, r) => s + r[i] * r[j], 0)));
    const XTy = Array.from({ length: d }, (_, i) => Xm.reduce((s, r, ri) => s + r[i] * y[ri], 0));
    const aug = XTX.map((row, i) => [...row, XTy[i]]);
    for (let c = 0; c < d; c++) {
        let mx = c;
        for (let r = c + 1; r < d; r++)if (Math.abs(aug[r][c]) > Math.abs(aug[mx][c])) mx = r;
        [aug[c], aug[mx]] = [aug[mx], aug[c]];
        if (Math.abs(aug[c][c]) < 1e-12) continue;
        for (let r = c + 1; r < d; r++) { const f = aug[r][c] / aug[c][c]; for (let k = c; k <= d; k++)aug[r][k] -= f * aug[c][k]; }
    }
    const co = Array(d).fill(0);
    for (let i = d - 1; i >= 0; i--) { if (Math.abs(aug[i][i]) < 1e-12) continue; co[i] = (aug[i][d] - aug[i].slice(i + 1, d).reduce((s, v, k) => s + v * co[i + 1 + k], 0)) / aug[i][i]; }
    return co;
}
function evalPoly(co: number[], x: number) { return co.reduce((s, c, i) => s + c * Math.pow(x, i), 0); }

const yVals = DATA.map(d => d.y);
const Y_MIN = Math.min(...yVals, ...Array.from({ length: 50 }, (_, i) => trueF(X_MIN + i / 49 * (X_MAX - X_MIN)))) - 1.5;
const Y_MAX = Math.max(...yVals, ...Array.from({ length: 50 }, (_, i) => trueF(X_MIN + i / 49 * (X_MAX - X_MIN)))) + 1.5;
function toX(x: number) { return PAD.left + ((x - X_MIN) / (X_MAX - X_MIN)) * pW; }
function toY(y: number) { return PAD.top + pH - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * pH; }
const DEG_COLORS: Record<number, string> = { 1: "#60a5fa", 2: "#34d399", 3: "#a78bfa", 5: "#fbbf24", 9: "#f87171" };

export default function PolynomialFeaturesPrimitive() {
    const cvs = useRef<HTMLCanvasElement>(null);
    const [degree, setDegree] = useState(1);
    const co = polyFit(DATA, degree);
    const yMean = yVals.reduce((s, v) => s + v, 0) / yVals.length;
    const ssTot = yVals.reduce((s, v) => s + (v - yMean) ** 2, 0);
    const ssRes = DATA.reduce((s, d) => s + (d.y - evalPoly(co, d.x)) ** 2, 0);
    const r2 = Math.max(0, 1 - ssRes / ssTot);
    const color = DEG_COLORS[degree] || (degree <= 3 ? "#34d399" : degree <= 6 ? "#fbbf24" : "#f87171");
    const overfit = degree >= 7, underfit = degree <= 1;

    useEffect(() => {
        const canvas = cvs.current; if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, W, H); ctx.fillStyle = "#0d0e18"; ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = "#111827"; ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) { const y = PAD.top + i / 4 * pH; ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + pW, y); ctx.stroke(); }
        // True signal
        ctx.beginPath();
        for (let i = 0; i <= 120; i++) { const x = X_MIN + i / 120 * (X_MAX - X_MIN), cx = toX(x), cy = toY(trueF(x)); if (cy < PAD.top - 5 || cy > PAD.top + pH + 5) { ctx.moveTo(cx, cy); continue; } if (i === 0) { ctx.moveTo(cx, cy); } else { ctx.lineTo(cx, cy); } }
        ctx.strokeStyle = "#ffffff22"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);
        // Fitted
        ctx.beginPath(); let started = false;
        for (let i = 0; i <= 120; i++) { const x = X_MIN + i / 120 * (X_MAX - X_MIN), y = evalPoly(co, x), cx = toX(x), cy = toY(y); if (cy < PAD.top - 30 || cy > PAD.top + pH + 30) { started = false; continue; } if (!started) { ctx.moveTo(cx, cy); started = true; } else ctx.lineTo(cx, cy); }
        ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.shadowColor = color; ctx.shadowBlur = 8; ctx.stroke(); ctx.shadowBlur = 0;
        // Residuals
        DATA.forEach(d => { const py = evalPoly(co, d.x); ctx.beginPath(); ctx.moveTo(toX(d.x), toY(d.y)); ctx.lineTo(toX(d.x), Math.max(PAD.top, Math.min(PAD.top + pH, toY(py)))); ctx.strokeStyle = color + "33"; ctx.lineWidth = 1; ctx.stroke(); });
        // Points
        DATA.forEach(d => { ctx.beginPath(); ctx.arc(toX(d.x), toY(d.y), 4, 0, Math.PI * 2); ctx.fillStyle = "#e2e8f0"; ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1; });
        // Axes
        ctx.strokeStyle = "#252535"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(PAD.left, PAD.top); ctx.lineTo(PAD.left, PAD.top + pH); ctx.lineTo(PAD.left + pW, PAD.top + pH); ctx.stroke();
        ctx.fillStyle = "#374151"; ctx.font = "10px monospace"; ctx.textAlign = "center"; ctx.fillText("x →", PAD.left + pW / 2, H - 6);
        ctx.fillStyle = color; ctx.font = "bold 10px monospace"; ctx.textAlign = "right";
        ctx.fillText(`degree ${degree}  R² = ${r2.toFixed(3)}`, PAD.left + pW - 4, PAD.top + 16);
        const sc = overfit ? "#f87171" : underfit ? "#fbbf24" : "#34d399";
        ctx.fillStyle = sc; ctx.fillText(overfit ? "⚠ OVERFITTING" : underfit ? "⚠ UNDERFITTING" : "✓ GOOD FIT", PAD.left + pW - 4, PAD.top + 32);
        ctx.fillStyle = "#ffffff44"; ctx.font = "9px monospace"; ctx.textAlign = "left"; ctx.fillText("── true signal", PAD.left + 4, PAD.top + 14);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [degree]);

    const statusColor = overfit ? "#f87171" : underfit ? "#fbbf24" : "#34d399";
    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-5 select-none">
            <div className="space-y-1">
                <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">functions</span>Polynomial Features
                </h3>
                <p className="text-xs text-muted/60">Polynomial features are Lenses — they let a linear model see curves by adding x², x³… as new features.</p>
            </div>
            <div className="rounded-xl overflow-hidden transition-all" style={{ border: `1px solid ${color}33`, boxShadow: `0 0 28px ${color}18` }}>
                <canvas ref={cvs} width={W} height={H} style={{ display: "block", maxWidth: "100%", height: "auto" }} />
            </div>
            <div className="space-y-2">
                <div className="flex justify-between text-[11px]">
                    <span className="text-muted/50">Polynomial Degree</span>
                    <span style={{ color }}>{degree === 1 ? "Linear (straight line)" : degree <= 3 ? `Degree ${degree}` : degree <= 6 ? `Degree ${degree} — getting complex` : `Degree ${degree} — wildly overfit`}</span>
                </div>
                <input type="range" min={1} max={12} step={1} value={degree} onChange={e => setDegree(+e.target.value)} className="w-full cursor-pointer" style={{ accentColor: color }} />
                <div className="flex justify-between text-[10px] text-muted/30"><span>1 (underfit)</span><span>12 (overfit)</span></div>
            </div>
            <div className="rounded-r-lg border-l-4 px-4 py-3 text-[11px] leading-relaxed" style={{ borderColor: statusColor, background: statusColor + "0f", color: "rgba(255,255,255,0.55)" }}>
                {underfit && <><span style={{ color: "#fbbf24" }}>UNDERFITTING: </span>The line can&apos;t bend — high bias, misses the curve.</>}
                {!underfit && !overfit && <><span style={{ color: "#34d399" }}>GOOD FIT: </span>The curve follows the true signal without chasing noise.</>}
                {overfit && <><span style={{ color: "#f87171" }}>OVERFITTING: </span>Wiggles to hit every training point — memorises noise, high variance.</>}
            </div>
        </div>
    );
}

