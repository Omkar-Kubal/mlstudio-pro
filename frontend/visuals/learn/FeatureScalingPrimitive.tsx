"use client";
import React, { useState, useEffect, useRef } from "react";

const W = 500, H = 300;
const PAD = { top: 30, right: 30, bottom: 44, left: 58 };
const pW = W - PAD.left - PAD.right, pH = H - PAD.top - PAD.bottom;

let _s = 77;
function rng() { _s = (_s * 9301 + 49297) % 233280; return _s / 233280; }
function rn(m = 0, s = 1) { let u = 0; while (!u) u = rng(); return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng()); }
_s = 77;
const raw = Array.from({ length: 60 }, () => ({ x: Math.max(18000, Math.min(195000, rn(75000, 35000))), y: Math.max(22, Math.min(58, rn(38, 8))) }));
const xs = raw.map(d => d.x), ys = raw.map(d => d.y);
const mnX = xs.reduce((s, v) => s + v, 0) / xs.length, sdX = Math.sqrt(xs.reduce((s, v) => s + (v - mnX) ** 2, 0) / xs.length);
const mnY = ys.reduce((s, v) => s + v, 0) / ys.length, sdY = Math.sqrt(ys.reduce((s, v) => s + (v - mnY) ** 2, 0) / ys.length);
const loX = Math.min(...xs), hiX = Math.max(...xs), loY = Math.min(...ys), hiY = Math.max(...ys);
const SS = xs.map((x, i) => ({ x: (x - mnX) / sdX, y: (ys[i] - mnY) / sdY }));
const MM = xs.map((x, i) => ({ x: (x - loX) / (hiX - loX), y: (ys[i] - loY) / (hiY - loY) }));

const MODES = [
    { key: "raw", label: "Raw", color: "#94a3b8", xL: "salary ($)", yL: "age (yrs)", desc: "Axes at very different scales — distance dominated by salary" },
    { key: "standard", label: "StandardScaler", color: "#60a5fa", xL: "salary (σ)", yL: "age (σ)", desc: "Mean=0, Std=1 per feature. Best for algorithms assuming normality." },
    { key: "minmax", label: "MinMaxScaler", color: "#f472b6", xL: "salary [0,1]", yL: "age [0,1]", desc: "Squeezes to [0,1]. Sensitive to outliers but preserves zero." },
] as const;
type MK = "raw" | "standard" | "minmax";

export default function FeatureScalingPrimitive() {
    const cvs = useRef<HTMLCanvasElement>(null);
    const [mode, setMode] = useState<MK>("raw");
    const m = MODES.find(x => x.key === mode)!;

    useEffect(() => {
        const canvas = cvs.current; if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        const pts = mode === "raw" ? raw.map(d => ({ x: d.x, y: d.y })) : mode === "standard" ? SS : MM;
        const px = pts.map(p => p.x), py = pts.map(p => p.y);
        const xmn = Math.min(...px), xmx = Math.max(...px), ymn = Math.min(...py), ymx = Math.max(...py);
        const xr = xmx - xmn || 1, yr = ymx - ymn || 1, xp = xr * 0.1, yp = yr * 0.1;
        const toX = (x: number) => PAD.left + ((x - xmn + xp) / (xr + 2 * xp)) * pW;
        const toY = (y: number) => PAD.top + pH - ((y - ymn + yp) / (yr + 2 * yp)) * pH;
        const cx2 = px.reduce((s, v) => s + v, 0) / px.length, cy2 = py.reduce((s, v) => s + v, 0) / py.length;
        const sdx = Math.sqrt(px.reduce((s, v) => s + (v - cx2) ** 2, 0) / px.length);
        const sdy = Math.sqrt(py.reduce((s, v) => s + (v - cy2) ** 2, 0) / py.length);

        ctx.clearRect(0, 0, W, H); ctx.fillStyle = "#0d0e18"; ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = "#111827"; ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            ctx.beginPath(); ctx.moveTo(PAD.left, PAD.top + i / 4 * pH); ctx.lineTo(PAD.left + pW, PAD.top + i / 4 * pH); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(PAD.left + i / 4 * pW, PAD.top); ctx.lineTo(PAD.left + i / 4 * pW, PAD.top + pH); ctx.stroke();
        }
        const erx = (sdx / (xr + 2 * xp)) * pW, ery = (sdy / (yr + 2 * yp)) * pH;
        ctx.beginPath(); ctx.ellipse(toX(cx2), toY(cy2), erx * 2, ery * 2, 0, 0, Math.PI * 2);
        ctx.strokeStyle = m.color + "33"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = m.color + "08"; ctx.fill();
        pts.forEach(({ x, y }) => {
            ctx.beginPath(); ctx.arc(toX(x), toY(y), 3.5, 0, Math.PI * 2);
            ctx.fillStyle = m.color; ctx.globalAlpha = 0.6; ctx.fill(); ctx.globalAlpha = 1;
        });
        ctx.beginPath(); ctx.arc(toX(cx2), toY(cy2), 6, 0, Math.PI * 2);
        ctx.fillStyle = m.color; ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.fill(); ctx.stroke();
        ctx.strokeStyle = "#252535"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(PAD.left, PAD.top); ctx.lineTo(PAD.left, PAD.top + pH); ctx.lineTo(PAD.left + pW, PAD.top + pH); ctx.stroke();
        ctx.fillStyle = "#374151"; ctx.font = "9px monospace";
        [0, .25, .5, .75, 1].forEach(t => {
            const v = xmn - xp + t * (xr + 2 * xp);
            ctx.textAlign = "center"; ctx.fillText(mode === "raw" ? `${Math.round(v / 1000)}k` : v.toFixed(1), PAD.left + t * pW, PAD.top + pH + 16);
            const vy = ymn - yp + (1 - t) * (yr + 2 * yp);
            ctx.textAlign = "right"; ctx.fillText(mode === "raw" ? Math.round(vy).toString() : vy.toFixed(1), PAD.left - 6, PAD.top + t * pH + 4);
        });
        ctx.fillStyle = "#374151"; ctx.font = "10px monospace"; ctx.textAlign = "center";
        ctx.fillText(m.xL + " →", PAD.left + pW / 2, H - 7);
        ctx.save(); ctx.translate(13, PAD.top + pH / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(m.yL, 0, 0); ctx.restore();
        if (sdx > 0 && sdy > 0) { ctx.fillStyle = m.color; ctx.font = "bold 10px monospace"; ctx.textAlign = "right"; ctx.fillText(`ellipse ratio ${(sdx / sdy).toFixed(1)}:1`, PAD.left + pW - 4, PAD.top + 16); }
    }, [mode]);

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-5 select-none">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">straighten</span>Feature Scaling
                    </h3>
                    <p className="text-xs text-muted/60">Scaling makes sure salary ($) and age (yrs) speak the same language to distance-based algorithms.</p>
                </div>
                <div className="flex gap-2 shrink-0 flex-wrap">
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
                {[{ label: "StandardScaler", color: "#60a5fa", pts: ["z = (x - μ) / σ", "Output: unbounded", "Use: Linear, SVM, PCA, KNN"] }, { label: "MinMaxScaler", color: "#f472b6", pts: ["x' = (x-min)/(max-min)", "Output: [0,1]", "Use: Neural nets, image pixels"] }].map(({ label, color, pts }) => (
                    <div key={label} className="rounded-xl p-4" style={{ border: `1px solid ${color}25`, background: color + "08" }}>
                        <div className="text-[10px] font-black mb-2" style={{ color }}>{label}</div>
                        {pts.map(p => <div key={p} className="text-[9px] text-muted/50 mb-1">· {p}</div>)}
                    </div>
                ))}
            </div>
        </div>
    );
}

