"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { RollingAverageConfig } from "@/adapters/visual-types";

// ─── Constants ─────────────────────────────────────────────────────────────────
const W = 560, H = 260;
const PAD = { top: 24, right: 20, bottom: 36, left: 40 };
const pW = W - PAD.left - PAD.right;
const pH = H - PAD.top - PAD.bottom;
const N = 80;

// ─── Generate data once ────────────────────────────────────────────────────────
let _seed = 42;
function seededRng() { _seed = (_seed * 9301 + 49297) % 233280; return _seed / 233280; }

const DATA = (() => {
    let val = 50;
    return Array.from({ length: N }, (_, i) => {
        val += (seededRng() - 0.48) * 8 + Math.sin(i / 10) * 2;
        val = Math.max(20, Math.min(80, val));
        return +val.toFixed(2);
    });
})();

const YMIN = Math.min(...DATA) - 3;
const YMAX = Math.max(...DATA) + 3;

function toX(i: number) { return PAD.left + (i / (N - 1)) * pW; }
function toY(v: number) { return PAD.top + pH - ((v - YMIN) / (YMAX - YMIN)) * pH; }

function rollingMean(data: number[], w: number): (number | null)[] {
    return data.map((_, i) => {
        if (i < w - 1) return null;
        const sl = data.slice(i - w + 1, i + 1);
        return +(sl.reduce((a, b) => a + b, 0) / sl.length).toFixed(2);
    });
}

const RAW_COLOR = "#3b82f6";
const SMOOTH_COLOR = "#f59e0b";
const GRID_COLOR = "#111827";

// ─── Props ─────────────────────────────────────────────────────────────────────
interface Props { config?: RollingAverageConfig; }

// ─── Component ─────────────────────────────────────────────────────────────────
export default function RollingAveragePrimitive({ config }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [win, setWin] = useState(7);
    const [animating, setAnim] = useState(false);
    const [scanPos, setScanPos] = useState<number | null>(null);

    const rolling = rollingMean(DATA, win);

    const draw = useCallback((pos: number | null) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, W, H);

        // Background
        ctx.fillStyle = "#0d0e1a"; ctx.fillRect(0, 0, W, H);

        // Grid lines
        ctx.strokeStyle = GRID_COLOR; ctx.lineWidth = 1;
        for (let i = 1; i <= 4; i++) {
            const y = PAD.top + (i / 5) * pH;
            ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + pW, y); ctx.stroke();
        }

        // Raw signal (dim)
        ctx.beginPath();
        DATA.forEach((v, i) => { const x = toX(i), y = toY(v); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
        ctx.strokeStyle = RAW_COLOR; ctx.lineWidth = 1; ctx.globalAlpha = 0.3; ctx.stroke(); ctx.globalAlpha = 1;

        // Window highlight box
        if (pos !== null && pos >= win - 1) {
            const x1 = toX(pos - win + 1), x2 = toX(pos);
            ctx.fillStyle = SMOOTH_COLOR + "14";
            ctx.fillRect(x1, PAD.top, x2 - x1, pH);
            ctx.strokeStyle = SMOOTH_COLOR + "55"; ctx.lineWidth = 1;
            ctx.strokeRect(x1, PAD.top, x2 - x1, pH);
        }

        // Rolling mean line up to pos
        const drawTo = pos ?? N - 1;
        ctx.beginPath();
        let started = false;
        rolling.forEach((v, i) => {
            if (v === null || i > drawTo) return;
            const x = toX(i), y = toY(v);
            if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = SMOOTH_COLOR; ctx.lineWidth = 2.5;
        ctx.shadowColor = SMOOTH_COLOR; ctx.shadowBlur = 6; ctx.stroke(); ctx.shadowBlur = 0;

        // Current point
        if (pos !== null && rolling[pos] !== null) {
            ctx.beginPath(); ctx.arc(toX(pos), toY(rolling[pos]!), 6, 0, Math.PI * 2);
            ctx.fillStyle = SMOOTH_COLOR; ctx.shadowColor = SMOOTH_COLOR; ctx.shadowBlur = 14; ctx.fill(); ctx.shadowBlur = 0;
        }

        // Axes
        ctx.strokeStyle = "#252535"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(PAD.left, PAD.top); ctx.lineTo(PAD.left, PAD.top + pH); ctx.lineTo(PAD.left + pW, PAD.top + pH); ctx.stroke();

        // Y labels
        ctx.fillStyle = "#374151"; ctx.font = "10px monospace"; ctx.textAlign = "right";
        [20, 35, 50, 65, 80].forEach(v => { ctx.fillText(String(v), PAD.left - 4, toY(v) + 4); });

        // Legend
        ctx.textAlign = "left"; ctx.globalAlpha = 0.5;
        ctx.fillStyle = RAW_COLOR; ctx.fillText("─ raw signal", PAD.left + 4, PAD.top + 14);
        ctx.globalAlpha = 1;
        ctx.fillStyle = SMOOTH_COLOR; ctx.fillText(`─ rolling mean (w=${win})`, PAD.left + 110, PAD.top + 14);
        if (pos !== null && rolling[pos]) {
            ctx.fillStyle = "#4a5568"; ctx.textAlign = "right";
            ctx.fillText(`μ = ${rolling[pos]}`, PAD.left + pW - 4, PAD.top + 14);
        }
    }, [rolling, win]);

    // Initial draw
    useEffect(() => { draw(null); }, [draw]);

    // Animate scan
    const animate = useCallback(() => {
        setAnim(true);
        let pos = win - 1;
        function step() {
            setScanPos(pos); draw(pos);
            if (pos < N - 1) { pos++; animRef.current = setTimeout(step, 28); }
            else { setAnim(false); setScanPos(null); draw(null); }
        }
        step();
    }, [draw, win]);

    // Cleanup
    useEffect(() => () => { if (animRef.current) clearTimeout(animRef.current); }, []);

    const handleWinChange = (v: number) => {
        if (animRef.current) clearTimeout(animRef.current);
        setAnim(false); setScanPos(null);
        setWin(v);
    };

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6 select-none">

            {/* Header */}
            <div className="space-y-1">
                <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">show_chart</span>
                    Rolling Average
                </h3>
                <p className="text-xs text-muted/60 max-w-lg">
                    A sliding window that computes the mean of the last <strong className="text-amber-400">w</strong> points,
                    smoothing noise while preserving the underlying trend.
                </p>
            </div>

            {/* Canvas */}
            <div className="border border-border rounded-xl overflow-hidden">
                <canvas ref={canvasRef} width={W} height={H} style={{ display: "block", maxWidth: "100%", height: "auto" }} />
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Slider */}
                <div className="flex-1 space-y-3">
                    <div className="flex justify-between text-[10px]">
                        <span className="text-muted/50 uppercase tracking-widest">Window Size</span>
                        <span className="font-black text-amber-400 font-mono">w = {win} periods</span>
                    </div>
                    <input
                        type="range" min={2} max={30} step={1} value={win}
                        onChange={e => handleWinChange(+e.target.value)}
                        className="w-full cursor-pointer"
                        style={{ accentColor: SMOOTH_COLOR }}
                    />
                    <div className="flex justify-between text-[9px] text-muted/30">
                        <span>w=2 (jittery, responsive)</span>
                        <span>w=30 (smooth, lagging)</span>
                    </div>
                </div>

                {/* Button */}
                <button
                    onClick={animate}
                    disabled={animating}
                    className="shrink-0 px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                    style={{
                        background: animating ? "rgba(255,255,255,0.05)" : SMOOTH_COLOR + "cc",
                        color: animating ? "rgba(255,255,255,0.2)" : "#000",
                        cursor: animating ? "not-allowed" : "pointer",
                    }}
                >
                    {animating ? "Scanning…" : "▶ Animate Window"}
                </button>
            </div>

            {/* Insight */}
            <div className="bg-amber-400/5 border border-amber-400/15 rounded-xl p-4 flex gap-3">
                <span className="material-symbols-outlined text-amber-400 text-sm mt-0.5">swap_horiz</span>
                <div className="text-[10px] text-muted/70 leading-relaxed space-y-1">
                    <p><strong className="text-amber-400">Small window</strong> → responsive but noisy. <strong className="text-amber-400">Large window</strong> → smooth but lags behind changes.</p>
                    <p className="font-mono text-muted/50">df[&apos;value&apos;].rolling(window={win}).mean()</p>
                </div>
            </div>
        </div>
    );
}

