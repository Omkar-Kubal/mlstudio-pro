"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Constants ───────────────────────────────────────────────────────────────
const W = 600, H = 320;
const MEAN = 0;

function normalPDF(x: number, std: number) {
    return (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * (x / std) ** 2);
}

const BANDS = [
    { sigma: 1, color: "hsl(var(--primary))", label: "68.2%", alpha: 0.25 },
    { sigma: 2, color: "hsl(var(--secondary))", label: "95.4%", alpha: 0.15 },
    { sigma: 3, color: "hsl(var(--accent))", label: "99.7%", alpha: 0.1 },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function DispersionPrimitive() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [sigma, setSigma] = useState(1.0);
    const [showBands, setShowBands] = useState(true);
    const animRef = useRef<number | null>(null);
    const currentSigmaRef = useRef(1.0);

    const [reducedMotion, setReducedMotion] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
    }, []);

    const render = useCallback((std: number, bands: boolean) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, W, H);

        const PAD = { top: 30, right: 40, bottom: 50, left: 40 };
        const pW = W - PAD.left - PAD.right;
        const pH = H - PAD.top - PAD.bottom;

        const xRange = 4; // show ±4σ
        const xMin = -xRange * Math.max(std, 0.5);
        const xMax = xRange * Math.max(std, 0.5);
        const maxPDF = 1 / (0.3 * Math.sqrt(2 * Math.PI)); // Max height at min sigma=0.3

        function cx(x: number) { return PAD.left + ((x - xMin) / (xMax - xMin)) * pW; }
        function cy(pdf: number) { return PAD.top + pH - (pdf / maxPDF) * pH; }

        // Gridlines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = PAD.top + (i / 4) * pH;
            ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + pW, y); ctx.stroke();
        }

        // Draw Bands
        if (bands) {
            BANDS.forEach(({ sigma: s, color, alpha }) => {
                const x1 = -s * std, x2 = s * std;
                ctx.beginPath();
                for (let i = 0; i <= 150; i++) {
                    const x = x1 + (i / 150) * (x2 - x1);
                    const pdf = normalPDF(x, std);
                    i === 0 ? ctx.moveTo(cx(x), cy(pdf)) : ctx.lineTo(cx(x), cy(pdf));
                }
                ctx.lineTo(cx(x2), cy(0));
                ctx.lineTo(cx(x1), cy(0));
                ctx.closePath();
                ctx.fillStyle = color;
                ctx.globalAlpha = alpha;
                ctx.fill();
                ctx.globalAlpha = 1;

                // Dashed drop lines at band edges
                [x1, x2].forEach(xv => {
                    ctx.beginPath();
                    ctx.setLineDash([3, 4]);
                    ctx.strokeStyle = color;
                    ctx.globalAlpha = 0.4;
                    ctx.moveTo(cx(xv), cy(0));
                    ctx.lineTo(cx(xv), cy(normalPDF(xv, std)));
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.globalAlpha = 1;
                });
            });
        }

        // Main Curve
        ctx.beginPath();
        ctx.strokeStyle = "hsl(var(--primary))";
        ctx.lineWidth = 2.5;
        ctx.lineJoin = "round";

        for (let i = 0; i <= 250; i++) {
            const x = xMin + (i / 250) * (xMax - xMin);
            const pdf = normalPDF(x, std);
            i === 0 ? ctx.moveTo(cx(x), cy(pdf)) : ctx.lineTo(cx(x), cy(pdf));
        }
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = "hsl(var(--primary))";
        ctx.stroke();
        ctx.restore();

        // Axis
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(PAD.left, PAD.top + pH);
        ctx.lineTo(PAD.left + pW, PAD.top + pH);
        ctx.stroke();

        // Labels
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.font = "10px var(--font-jetbrains)";
        ctx.textAlign = "center";

        [-3, -2, -1, 0, 1, 2, 3].forEach(n => {
            const xv = n * std;
            if (xv < xMin || xv > xMax) return;
            ctx.fillText(n === 0 ? "μ" : `${n > 0 ? "+" : ""}${n}σ`, cx(xv), PAD.top + pH + 20);
        });

        // Band Percentage Labels
        if (bands) {
            ctx.font = "bold 9px var(--font-jetbrains)";
            BANDS.forEach(({ sigma: s, color, label }) => {
                const xVal = s * std;
                ctx.fillStyle = color;
                ctx.fillText(label, cx(xVal), cy(normalPDF(xVal, std)) - 10);
            });
        }

    }, []);

    useEffect(() => {
        if (reducedMotion) {
            currentSigmaRef.current = sigma;
            render(sigma, showBands);
            return;
        }

        const target = sigma;
        const startValue = currentSigmaRef.current;
        const startTime = performance.now();
        const duration = 400;

        const animate = (time: number) => {
            const t = Math.min((time - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - t, 4); // Quartic ease out
            currentSigmaRef.current = startValue + (target - startValue) * ease;

            render(currentSigmaRef.current, showBands);

            if (t < 1) {
                animRef.current = requestAnimationFrame(animate);
            }
        };

        animRef.current = requestAnimationFrame(animate);
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, [sigma, showBands, reducedMotion, render]);

    const variance = (sigma ** 2).toFixed(3);
    const peakHeight = normalPDF(0, sigma).toFixed(3);

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">graph_2</span>
                        Dispersion Dynamics
                    </h3>
                    <p className="text-xs text-muted/60 italic lowercase">Visualizing the Empirical Rule (68-95-99.7)</p>
                </div>
                <div className="flex gap-4 items-center">
                    <label className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface/50 cursor-pointer select-none transition-all active:scale-95 text-muted hover:text-foreground">
                        <input
                            type="checkbox"
                            checked={showBands}
                            onChange={e => setShowBands(e.target.checked)}
                            className="w-3.5 h-3.5 accent-primary"
                        />
                        <span className="text-[10px] font-bold uppercase tracking-tight">Show Sigma Tiers</span>
                    </label>
                    <div className="px-3 py-1 bg-primary/10 rounded border border-primary/20 font-mono text-xs text-primary font-bold">
                        σ = {sigma.toFixed(2)}
                    </div>
                </div>
            </div>

            <div className="relative rounded bg-slate-950/40 border border-border/50 overflow-hidden shadow-2xl">
                <canvas ref={canvasRef} width={W} height={H} className="w-full h-auto block" />
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold text-muted uppercase tracking-widest pl-1">
                    <span>Narrow / Focused</span>
                    <span>Wide / Dispersed</span>
                </div>
                <input
                    type="range" min="0.30" max="3.00" step="0.05"
                    value={sigma} onChange={e => setSigma(+e.target.value)}
                    className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: "Std Dev (σ)", val: sigma.toFixed(3), color: "text-primary", bg: "bg-primary/5", border: "border-primary/20", desc: "Density spread" },
                    { label: "Variance (σ²)", val: variance, color: "text-secondary", bg: "bg-secondary/5", border: "border-secondary/20", desc: "Squared deviation" },
                    { label: "Peak (1/σ√2π)", val: peakHeight, color: "text-emerald-500", bg: "bg-emerald-500/5", border: "border-emerald-500/20", desc: "Maximum density" },
                ].map((item) => (
                    <div key={item.label} className={`p-4 rounded-lg border ${item.bg} ${item.border} space-y-1 transition-all`}>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted/60">{item.label}</div>
                        <div className={`text-xl font-bold font-mono tracking-tighter tabular-nums ${item.color}`}>
                            {item.val}
                        </div>
                        <p className="text-[10px] text-muted/40 uppercase tracking-tighter leading-none">{item.desc}</p>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg flex gap-4">
                <span className="material-symbols-outlined text-primary text-lg shrink-0">info</span>
                <div className="space-y-2">
                    <p className="text-xs text-muted leading-relaxed">
                        <span className="text-foreground font-bold uppercase tracking-tighter">The Trade-off:</span> As Standard Deviation (σ) increases, the distribution flattens. Because the total area under the curve must always equal 1 (representing 100% probability), a wider spread automatically results in a shorter peak.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-1">
                        {BANDS.map(b => (
                            <div key={b.label} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                                <span className="text-[10px] font-mono text-muted/60">±{b.sigma}σ: <span className="text-foreground/80 font-bold">{b.label}</span></span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

