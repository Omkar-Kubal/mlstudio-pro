"use client";
import React, { useState, useEffect, useRef } from "react";

const W = 520, H = 260;
export default function DuplicateDataPrimitive() {
    const cvs = useRef<HTMLCanvasElement>(null);
    const [dupRatio, setDupRatio] = useState(0);
    const [showLeak, setShowLeak] = useState(false);
    const BASE_A = 40, BASE_B = 40;
    const extraA = Math.round(BASE_A * dupRatio);
    const totalA = BASE_A + extraA, totalB = BASE_B, total = totalA + totalB;
    const pctA = ((totalA / total) * 100).toFixed(1), pctB = ((totalB / total) * 100).toFixed(1);
    const CLASS_A = "#60a5fa", CLASS_B = "#f472b6", DUP = "#fbbf24", LEAK = "#f87171", TRAIN = "#34d399", TEST = "#a78bfa";

    useEffect(() => {
        const canvas = cvs.current; if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, W, H); ctx.fillStyle = "#0d0e18"; ctx.fillRect(0, 0, W, H);
        const bW = 80, maxH = 160, PL = 60, PT = 30;
        ctx.strokeStyle = "#111827"; ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = PT + i / 4 * maxH; ctx.beginPath(); ctx.moveTo(PL - 10, y); ctx.lineTo(PL + 300, y); ctx.stroke();
            ctx.fillStyle = "#374151"; ctx.font = "9px monospace"; ctx.textAlign = "right"; ctx.fillText(Math.round((1 - i / 4) * Math.max(totalA, totalB)).toString(), PL - 14, y + 4);
        }
        const aH = (totalA / Math.max(totalA, totalB)) * maxH, baseAH = (BASE_A / Math.max(totalA, BASE_B)) * maxH;
        const x1 = PL + 20;
        const gA = ctx.createLinearGradient(x1, PT + maxH - baseAH, x1, PT + maxH); gA.addColorStop(0, CLASS_A); gA.addColorStop(1, CLASS_A + "88");
        ctx.fillStyle = gA; ctx.fillRect(x1, PT + maxH - baseAH, bW, baseAH);
        if (extraA > 0) {
            const dH = aH - baseAH; ctx.fillStyle = DUP + "cc"; ctx.fillRect(x1, PT + maxH - aH, bW, dH);
            ctx.strokeStyle = DUP; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.strokeRect(x1, PT + maxH - aH, bW, dH); ctx.setLineDash([]);
            ctx.fillStyle = DUP; ctx.font = "bold 10px monospace"; ctx.textAlign = "center"; ctx.fillText(`+${extraA} dupes`, x1 + bW / 2, PT + maxH - aH - 6);
        }
        const bH = (totalB / Math.max(totalA, totalB)) * maxH, x2 = PL + 160;
        const gB = ctx.createLinearGradient(x2, PT + maxH - bH, x2, PT + maxH); gB.addColorStop(0, CLASS_B); gB.addColorStop(1, CLASS_B + "88");
        ctx.fillStyle = gB; ctx.fillRect(x2, PT + maxH - bH, bW, bH);
        ctx.fillStyle = "#e2e8f0"; ctx.font = "11px monospace"; ctx.textAlign = "center";
        ctx.fillText(`Class A  ${pctA}%`, x1 + bW / 2, PT + maxH + 18); ctx.fillText(`Class B  ${pctB}%`, x2 + bW / 2, PT + maxH + 18);
        ctx.fillStyle = CLASS_A; ctx.fillText(`n=${totalA}`, x1 + bW / 2, PT + maxH - aH - (extraA > 0 ? 22 : 6));
        ctx.fillStyle = CLASS_B; ctx.fillText(`n=${totalB}`, x2 + bW / 2, PT + maxH - bH - 6);
        if (showLeak) {
            const lx = PL + 290, ly = PT + 10, lw = 160, lh = maxH;
            ctx.fillStyle = TRAIN + "22"; ctx.fillRect(lx, ly, lw * .7, lh); ctx.strokeStyle = TRAIN; ctx.lineWidth = 1.5; ctx.strokeRect(lx, ly, lw * .7, lh);
            ctx.fillStyle = TRAIN; ctx.font = "10px monospace"; ctx.textAlign = "center"; ctx.fillText("TRAIN", lx + lw * .35, ly + lh / 2);
            ctx.fillStyle = TEST + "22"; ctx.fillRect(lx + lw * .7 + 4, ly, lw * .3 - 4, lh); ctx.strokeStyle = TEST; ctx.lineWidth = 1.5; ctx.strokeRect(lx + lw * .7 + 4, ly, lw * .3 - 4, lh);
            ctx.fillStyle = TEST; ctx.fillText("TEST", lx + lw * .85, ly + lh / 2);
            if (dupRatio > 0) {
                const mX = lx + lw * .7 + 2;
                ctx.beginPath(); ctx.moveTo(lx + lw * .5, ly + lh * .4); ctx.bezierCurveTo(mX + 10, ly + lh * .3, mX + 10, ly + lh * .6, lx + lw * .8, ly + lh * .6);
                ctx.strokeStyle = LEAK; ctx.lineWidth = 2; ctx.shadowColor = LEAK; ctx.shadowBlur = 8; ctx.stroke(); ctx.shadowBlur = 0;
                ctx.fillStyle = LEAK; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
                ctx.fillText("⚠ LEAK", mX + 15, ly + lh * .22); ctx.fillText("dupe in", mX + 15, ly + lh * .22 + 12); ctx.fillText("train", mX + 15, ly + lh * .22 + 24);
            }
        }
    }, [dupRatio, showLeak, totalA, extraA]);

    const iColor = dupRatio > 0.5 ? "#f87171" : "rgba(255,255,255,0.3)";
    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-5 select-none">
            <div className="space-y-1">
                <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">content_copy</span>Duplicate Data
                </h3>
                <p className="text-xs text-muted/60">Duplicates are Echoes — they make the model hear whatever was shouted twice, skewing class balance and inflating test scores.</p>
            </div>
            <div className="rounded-xl overflow-hidden border border-border">
                <canvas ref={cvs} width={W} height={H} style={{ display: "block", maxWidth: "100%", height: "auto" }} />
            </div>
            <div className="space-y-2">
                <div className="flex justify-between text-[11px]">
                    <span className="text-muted/50">Duplicate Ratio (Class A)</span>
                    <span style={{ color: dupRatio > 0 ? "#fbbf24" : "rgba(255,255,255,0.3)" }}>{Math.round(dupRatio * 100)}% extra copies</span>
                </div>
                <input type="range" min={0} max={2} step={0.05} value={dupRatio} onChange={e => setDupRatio(+e.target.value)} className="w-full cursor-pointer" style={{ accentColor: "#fbbf24" }} />
                <div className="flex justify-between text-[10px] text-muted/30"><span>Balanced</span><span>3× imbalanced</span></div>
            </div>
            <label className="flex items-center gap-2 text-[11px] cursor-pointer" style={{ color: showLeak ? "#f87171" : "rgba(255,255,255,0.3)" }}>
                <input type="checkbox" checked={showLeak} onChange={e => setShowLeak(e.target.checked)} style={{ accentColor: "#f87171" }} />
                Show train/test leakage risk
            </label>
            <div className="flex gap-4 text-[11px]">
                {[{ label: "Class A", val: `${totalA} (${pctA}%)`, color: "#60a5fa" }, { label: "Class B", val: `${totalB} (${pctB}%)`, color: "#f472b6" }, { label: "Imbalance", val: `${(totalA / totalB).toFixed(2)}:1`, color: iColor }].map(({ label, val, color }) => (
                    <div key={label} className="text-center"><div className="text-[9px] text-muted/30 mb-0.5">{label}</div><div className="font-bold" style={{ color }}>{val}</div></div>
                ))}
            </div>
            <div className="rounded-r-lg border-l-4 px-4 py-3 text-[11px] leading-relaxed" style={{ borderColor: "#fbbf24", background: "#fbbf240f", color: "rgba(255,255,255,0.5)" }}>
                <span className="text-amber-400">KEY RISKS: </span>(1) Class imbalance makes accuracy misleading. (2) Duplicates spanning train/test split artificially inflate test score. Always deduplicate <em>before</em> splitting!
            </div>
        </div>
    );
}
