"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { MLPipelinesConfig } from "@/lib/visual-types";

// ─── Canvas dims ───────────────────────────────────────────────────────────────
const W = 560, H = 120;
const PAD = { left: 24, right: 24 };
const N_PARTICLES = 6;

// ─── Pipeline Steps ────────────────────────────────────────────────────────────
const STEPS = [
    { key: "raw", label: "Raw Data", icon: "📊", color: "#60a5fa", code: "pd.read_csv('data.csv')", desc: "Messy, unprocessed input" },
    { key: "scale", label: "StandardScaler", icon: "⚖️", color: "#a78bfa", code: "StandardScaler()", desc: "μ=0, σ=1 per feature" },
    { key: "encode", label: "OneHotEncoder", icon: "🔢", color: "#f472b6", code: "OneHotEncoder()", desc: "Cats → binary columns" },
    { key: "model", label: "Classifier", icon: "🧠", color: "#fbbf24", code: "RandomForestClassifier()", desc: "Learns from features" },
    { key: "predict", label: "Prediction", icon: "✅", color: "#34d399", code: "pipeline.predict(X_test)", desc: "Final output" },
];

interface Particle { id: number; x: number }
interface Props { config?: MLPipelinesConfig; }

// ─── Component ─────────────────────────────────────────────────────────────────
export default function MLPipelinesPrimitive({ config }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [active, setActive] = useState(false);
    const [curStep, setCurStep] = useState(-1);
    const rafRef = useRef<number>(0);
    const particles = useRef<Particle[]>([]);

    const stepXs = STEPS.map((_, i) => PAD.left + i * (W - PAD.left - PAD.right) / (STEPS.length - 1));

    const draw = useCallback((pts: Particle[], si: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "#0c0d18"; ctx.fillRect(0, 0, W, H);

        // Track
        ctx.beginPath(); ctx.moveTo(PAD.left, H / 2); ctx.lineTo(W - PAD.right, H / 2);
        ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 14; ctx.lineCap = "round"; ctx.stroke();

        // Active portion
        const activeTo = si >= 0 ? stepXs[si] : PAD.left;
        ctx.beginPath(); ctx.moveTo(PAD.left, H / 2); ctx.lineTo(activeTo, H / 2);
        ctx.strokeStyle = "#334155"; ctx.lineWidth = 10; ctx.stroke();

        // Nodes
        STEPS.forEach((s, i) => {
            const sx = stepXs[i];
            const isActive = si >= i, isCur = si === i;
            ctx.beginPath(); ctx.arc(sx, H / 2, isCur ? 16 : 12, 0, Math.PI * 2);
            ctx.fillStyle = isActive ? s.color + "cc" : "#1e293b";
            ctx.shadowColor = isCur ? s.color : "transparent"; ctx.shadowBlur = isCur ? 20 : 0;
            ctx.fill(); ctx.shadowBlur = 0;
            ctx.strokeStyle = s.color + (isActive ? "ff" : "33"); ctx.lineWidth = 2; ctx.stroke();
            // label
            ctx.fillStyle = isActive ? s.color : "#374151";
            ctx.font = `${isCur ? "bold " : ""}10px monospace`; ctx.textAlign = "center";
            ctx.fillText(s.label, sx, H - 8);
        });

        // Particles
        pts.forEach(p => {
            const nextNode = stepXs.findIndex(sx => p.x < sx);
            const color = nextNode > 0 ? STEPS[nextNode - 1].color : STEPS[0].color;
            ctx.beginPath(); ctx.arc(p.x, H / 2, 7, 0, Math.PI * 2);
            ctx.fillStyle = color; ctx.globalAlpha = 0.9;
            ctx.shadowColor = color; ctx.shadowBlur = 10; ctx.fill(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
        });
    }, [stepXs]);

    useEffect(() => { draw([], -1); }, [draw]);

    useEffect(() => {
        if (!active) {
            cancelAnimationFrame(rafRef.current);
            particles.current = [];
            draw([], -1);
            return;
        }
        particles.current = Array.from({ length: N_PARTICLES }, (_, i) => ({ id: i, x: -20 - i * 60 }));

        function animate() {
            particles.current = particles.current.map(p => ({ ...p, x: p.x + 1.8 }));
            const maxSi = particles.current.reduce((mx, p) => {
                const si = stepXs.findIndex((sx, i) => p.x >= sx - 8 && p.x <= sx + 8);
                return si > mx ? si : mx;
            }, -1);
            setCurStep(maxSi);
            particles.current = particles.current.filter(p => p.x < W + 30);
            draw(particles.current, maxSi);
            if (particles.current.length === 0) { setActive(false); setCurStep(-1); return; }
            rafRef.current = requestAnimationFrame(animate);
        }
        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [active, draw, stepXs]);

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6 select-none">

            {/* Header */}
            <div className="space-y-1">
                <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">account_tree</span>
                    ML Pipelines
                </h3>
                <p className="text-xs text-muted/60 max-w-xl">
                    A pipeline chains preprocessing and modelling steps so that <strong>no data leaks</strong> between train and test splits, and all transforms apply consistently.
                </p>
            </div>

            {/* Belt canvas */}
            <div className="border border-border rounded-xl overflow-hidden">
                <canvas ref={canvasRef} width={W} height={H} style={{ display: "block", maxWidth: "100%", height: "auto" }} />
            </div>

            {/* Step cards */}
            <div className="flex gap-3 flex-wrap justify-center">
                {STEPS.map((s, i) => {
                    const isActive = curStep >= i;
                    return (
                        <div
                            key={s.key}
                            className="rounded-xl p-3 text-center min-w-[90px] transition-all"
                            style={{ border: `1px solid ${isActive ? s.color + "66" : "rgba(255,255,255,0.06)"}`, background: isActive ? s.color + "10" : "transparent" }}
                        >
                            <div className="text-base mb-1">{s.icon}</div>
                            <div className="text-[10px] font-black" style={{ color: isActive ? s.color : "#374151" }}>{s.label}</div>
                            <div className="text-[9px] text-muted/40 mt-0.5">{s.desc}</div>
                        </div>
                    );
                })}
            </div>

            {/* Run button */}
            <div className="flex justify-center">
                <button
                    onClick={() => { setCurStep(-1); setActive(true); }}
                    disabled={active}
                    className="px-8 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                    style={{ background: active ? "rgba(255,255,255,0.05)" : "#34d399cc", color: active ? "rgba(255,255,255,0.2)" : "#000", cursor: active ? "not-allowed" : "pointer" }}
                >
                    {active ? "Processing…" : "▶ Run Pipeline"}
                </button>
            </div>

            {/* Code */}
            <div className="bg-black/60 border border-border rounded-xl p-4 font-mono text-xs space-y-1">
                <div className="text-muted/30"># sklearn Pipeline — no data leakage between steps</div>
                <div><span className="text-violet-400">from </span><span className="text-muted/70">sklearn.pipeline </span><span className="text-violet-400">import </span><span className="text-sky-400">Pipeline</span></div>
                <div className="text-muted/70">pipe = Pipeline([</div>
                {STEPS.slice(1, 4).map((s, i) => (
                    <div key={i} className="pl-4">
                        (<span className="text-amber-400">&apos;{s.key}&apos;</span>, <span style={{ color: s.color }}>{s.code}</span>){i < 2 ? "," : ""}
                    </div>
                ))}
                <div className="text-muted/70">])</div>
            </div>
        </div>
    );
}
