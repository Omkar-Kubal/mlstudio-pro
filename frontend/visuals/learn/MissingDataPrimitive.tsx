"use client";
import React, { useState, useEffect, useRef } from "react";

const W = 520, H = 300, PAD = { top: 28, right: 24, bottom: 44, left: 48 };
const pW = W - PAD.left - PAD.right, pH = H - PAD.top - PAD.bottom;
let _s = 12;
function rng() { _s = (_s * 9301 + 49297) % 233280; return _s / 233280; }
function rn(m = 0, s = 1) { let u = 0; while (!u) u = rng(); let v = 0; while (!v) v = rng(); return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
_s = 12;
const SEED = Array.from({ length: 60 }, (_, i) => { const x = 2 + i * 0.55 + rn(0, 1.2), y = 1.3 * x + 4 + rn(0, 2.5), missing = rng() < 0.22 && i > 5 && i < 55; return { x: +x.toFixed(2), y: +y.toFixed(2), missing }; });
const xMin = Math.min(...SEED.map(d => d.x)) - 1, xMax = Math.max(...SEED.map(d => d.x)) + 1;
const yMin = Math.min(...SEED.map(d => d.y)) - 2, yMax = Math.max(...SEED.map(d => d.y)) + 2;
function toX(x: number) { return PAD.left + ((x - xMin) / (xMax - xMin)) * pW; }
function toY(y: number) { return PAD.top + pH - ((y - yMin) / (yMax - yMin)) * pH; }
function knn(pt: { x: number }, obs: { x: number; y: number }[], k = 4) {
    return obs.sort((a, b) => Math.abs(a.x - pt.x) - Math.abs(b.x - pt.x)).slice(0, k).reduce((s, n) => s + n.y, 0) / k;
}
const STRATS = [
    { key: "original", label: "Original", color: "#94a3b8", desc: "22% of Y values are missing (grey = missing)" },
    { key: "drop", label: "Drop Rows", color: "#f87171", desc: "Delete rows with missing Y — loses ~22% of data" },
    { key: "mean", label: "Mean Impute", color: "#fbbf24", desc: "Replace with column mean — kills variance, creates spike" },
    { key: "knn", label: "KNN Impute", color: "#34d399", desc: "Use k=4 nearest X-neighbours — preserves local structure" },
] as const;
type SK = "original" | "drop" | "mean" | "knn";

export default function MissingDataPrimitive() {
    const cvs = useRef<HTMLCanvasElement>(null);
    const [strat, setStrat] = useState<SK>("original");
    const [step, setStep] = useState(SEED.length);
    const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const observed = SEED.filter(d => !d.missing);
    const meanY = observed.reduce((s, d) => s + d.y, 0) / observed.length;
    const s = STRATS.find(x => x.key === strat)!;

    const getPts = () => {
        if (strat === "original") return SEED.map(d => ({ ...d, imputed: false }));
        if (strat === "drop") return SEED.filter(d => !d.missing).map(d => ({ ...d, imputed: false }));
        if (strat === "mean") return SEED.map(d => d.missing ? { ...d, y: +meanY.toFixed(2), imputed: true } : { ...d, imputed: false });
        return SEED.map(d => d.missing ? { ...d, y: +knn(d, observed.map(o => ({ ...o }))).toFixed(2), imputed: true } : { ...d, imputed: false });
    };

    useEffect(() => {
        setStep(0); if (animRef.current) clearInterval(animRef.current);
        const pts = getPts(); let i = 0;
        animRef.current = setInterval(() => { i = Math.min(i + 3, pts.length); setStep(i); if (i >= pts.length && animRef.current) clearInterval(animRef.current); }, 20);
        return () => { if (animRef.current) clearInterval(animRef.current); };
    }, [strat]);

    useEffect(() => {
        const canvas = cvs.current; if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        const pts = getPts().slice(0, step);
        ctx.clearRect(0, 0, W, H); ctx.fillStyle = "#0d0e18"; ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = "#111827"; ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) { const y = PAD.top + i / 4 * pH; ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + pW, y); ctx.stroke(); }
        if (strat === "mean") {
            ctx.beginPath(); ctx.moveTo(PAD.left, toY(meanY)); ctx.lineTo(PAD.left + pW, toY(meanY));
            ctx.strokeStyle = "#fbbf2444"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);
            ctx.fillStyle = "#fbbf24"; ctx.font = "10px monospace"; ctx.textAlign = "left"; ctx.fillText(`mean=${meanY.toFixed(1)}`, PAD.left + 4, toY(meanY) - 5);
        }
        pts.forEach(pt => {
            if (strat === "original" && pt.missing) {
                ctx.beginPath(); ctx.arc(toX(pt.x), toY(pt.y), 5, 0, Math.PI * 2);
                ctx.strokeStyle = "#374151"; ctx.lineWidth = 1.5; ctx.setLineDash([3, 2]); ctx.stroke(); ctx.setLineDash([]); return;
            }
            ctx.beginPath(); ctx.arc(toX(pt.x), toY(pt.y), pt.imputed ? 6 : 4, 0, Math.PI * 2);
            ctx.fillStyle = pt.imputed ? s.color : "#60a5fa"; ctx.globalAlpha = pt.imputed ? 1 : 0.6;
            if (pt.imputed) { ctx.shadowColor = s.color; ctx.shadowBlur = 10; } ctx.fill(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
        });
        ctx.strokeStyle = "#252535"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(PAD.left, PAD.top); ctx.lineTo(PAD.left, PAD.top + pH); ctx.lineTo(PAD.left + pW, PAD.top + pH); ctx.stroke();
        ctx.fillStyle = "#374151"; ctx.font = "10px monospace"; ctx.textAlign = "center"; ctx.fillText("X feature →", PAD.left + pW / 2, H - 8);
        ctx.save(); ctx.translate(13, PAD.top + pH / 2); ctx.rotate(-Math.PI / 2); ctx.fillText("Y (target)", 0, 0); ctx.restore();
        const shown = pts.filter(p => !(strat === "original" && p.missing));
        const n = shown.length;
        if (n > 0) {
            const mn = shown.reduce((a, b) => a + b.y, 0) / n, vr = Math.sqrt(shown.reduce((a, b) => a + (b.y - mn) ** 2, 0) / n);
            ctx.fillStyle = s.color; ctx.font = "bold 10px monospace"; ctx.textAlign = "right"; ctx.fillText(`n=${n}  σ=${vr.toFixed(2)}`, PAD.left + pW - 4, PAD.top + 16);
        }
    }, [step, strat]);

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-5 select-none">
            <div className="space-y-1">
                <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">hide_source</span>Missing Data Strategies
                </h3>
                <p className="text-xs text-muted/60">Mean imputation kills variance; KNN respects relationships. Larger glowing dots = imputed values.</p>
            </div>
            <div className="flex gap-2 flex-wrap">
                {STRATS.map(st => (
                    <button key={st.key} onClick={() => setStrat(st.key)}
                        className="px-4 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all"
                        style={strat === st.key ? { color: st.color, background: st.color + "18", borderColor: st.color + "55" } : { color: "rgba(255,255,255,0.25)", borderColor: "rgba(255,255,255,0.08)" }}>
                        {st.label}
                    </button>
                ))}
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${s.color}33`, boxShadow: `0 0 28px ${s.color}18` }}>
                <canvas ref={cvs} width={W} height={H} style={{ display: "block", maxWidth: "100%", height: "auto" }} />
            </div>
            <div className="text-center text-[11px] rounded-lg px-4 py-3" style={{ border: `1px solid ${s.color}22`, color: s.color }}>{s.desc}</div>
            <div className="grid grid-cols-3 gap-3">
                {STRATS.slice(1).map(st => (
                    <div key={st.key} className="rounded-xl p-3 text-center" style={{ border: `1px solid ${st.color}25`, background: st.color + "08" }}>
                        <div className="text-[10px] font-black mb-2" style={{ color: st.color }}>{st.label}</div>
                        <div className="text-[9px] text-muted/50 leading-relaxed">
                            {st.key === "drop" ? "Loses data. Safe if MCAR." : st.key === "mean" ? "Underestimates σ. Creates spikes." : "Preserves variance. Slower."}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

