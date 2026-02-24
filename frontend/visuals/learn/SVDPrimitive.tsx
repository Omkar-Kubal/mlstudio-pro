"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Constants & Types ───────────────────────────────────────────────────────
const CW = 740, CH = 460;
const SCALE = 80;

type SVDStage = 0 | 1 | 2 | 3; // unit, rotation1, stretch, rotation2

// ─── Math Helpers ───────────────────────────────────────────────────────
const identity = () => [1, 0, 0, 1];

const rotation = (deg: number) => {
    const r = (deg * Math.PI) / 180;
    return [Math.cos(r), -Math.sin(r), Math.sin(r), Math.cos(r)];
};

const stretch = (s1: number, s2: number) => [s1, 0, 0, s2];

const multiply = (A: number[], B: number[]) => [
    A[0] * B[0] + A[1] * B[2],
    A[0] * B[1] + A[1] * B[3],
    A[2] * B[0] + A[3] * B[2],
    A[2] * B[1] + A[3] * B[3],
];

const applyM = (M: number[], v: { x: number, y: number }) => ({
    x: M[0] * v.x + M[1] * v.y,
    y: M[2] * v.x + M[3] * v.y,
});

// ─── Component ──────────────────────────────────────────────────────────────
export default function SVDPrimitive() {
    const [theta1, setTheta1] = useState(30);   // Vᵀ (First rotation)
    const [sigma1, setSigma1] = useState(2.0);  // Σ (Stretch x)
    const [sigma2, setSigma2] = useState(1.0);  // Σ (Stretch y)
    const [theta2, setTheta2] = useState(-20);  // U (Second rotation)
    const [stage, setStage] = useState<SVDStage>(3);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const OX = CW / 2, OY = CH / 2;

    const currentMatrix = useMemo(() => {
        let M = identity();
        if (stage >= 1) M = multiply(rotation(theta1), M);
        if (stage >= 2) M = multiply(stretch(sigma1, sigma2), M);
        if (stage >= 3) M = multiply(rotation(theta2), M);
        return M;
    }, [theta1, theta2, sigma1, sigma2, stage]);

    // ─── Drawing Logic ──────────────────────────────────────────────────────
    const drawGrid = (ctx: CanvasRenderingContext2D, M: number[], alpha: number, color: string) => {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        const range = 6;
        for (let x = -range; x <= range; x++) {
            const p1 = applyM(M, { x, y: -range });
            const p2 = applyM(M, { x, y: range });
            ctx.beginPath();
            ctx.moveTo(OX + p1.x * SCALE, OY - p1.y * SCALE);
            ctx.lineTo(OX + p2.x * SCALE, OY - p2.y * SCALE);
            ctx.stroke();
        }
        for (let y = -range; y <= range; y++) {
            const p1 = applyM(M, { x: -range, y });
            const p2 = applyM(M, { x: range, y });
            ctx.beginPath();
            ctx.moveTo(OX + p1.x * SCALE, OY - p1.y * SCALE);
            ctx.lineTo(OX + p2.x * SCALE, OY - p2.y * SCALE);
            ctx.stroke();
        }
        ctx.restore();
    };

    const drawUnitCircle = (ctx: CanvasRenderingContext2D, M: number[]) => {
        ctx.save();
        ctx.strokeStyle = "hsl(var(--rose-400))";
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let t = 0; t <= 2 * Math.PI + 0.1; t += 0.05) {
            const v = { x: Math.cos(t), y: Math.sin(t) };
            const p = applyM(M, v);
            const px = OX + p.x * SCALE;
            const py = OY - p.y * SCALE;
            if (t === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Draw major/minor axes of the resulting ellipse
        if (stage >= 2) {
            const axesM = stage === 2 ? multiply(stretch(sigma1, sigma2), rotation(theta1)) : currentMatrix;
            const v1 = applyM(axesM, { x: 1, y: 0 });
            const v2 = applyM(axesM, { x: 0, y: 1 });

            ctx.setLineDash([4, 4]);
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = "rgba(255,255,255,0.4)";

            ctx.beginPath(); ctx.moveTo(OX, OY); ctx.lineTo(OX + v1.x * SCALE, OY - v1.y * SCALE); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(OX, OY); ctx.lineTo(OX + v2.x * SCALE, OY - v2.y * SCALE); ctx.stroke();
        }
        ctx.restore();
    };

    const drawBasis = (ctx: CanvasRenderingContext2D, M: number[]) => {
        const iLand = applyM(M, { x: 1, y: 0 });
        const jLand = applyM(M, { x: 0, y: 1 });

        const drawArrow = (to: { x: number, y: number }, color: string) => {
            const dx = to.x, dy = to.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len < 0.1) return;
            const px = OX + to.x * SCALE;
            const py = OY - to.y * SCALE;
            ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(OX, OY); ctx.lineTo(px, py); ctx.stroke();
            const angle = Math.atan2(-dy, dx);
            ctx.beginPath(); ctx.moveTo(px, py);
            ctx.lineTo(px - 10 * Math.cos(angle - 0.4), py + 10 * Math.sin(angle - 0.4));
            ctx.lineTo(px - 10 * Math.cos(angle + 0.4), py + 10 * Math.sin(angle + 0.4));
            ctx.closePath(); ctx.fill();
        };

        drawArrow(iLand, "hsl(var(--emerald-400))");
        drawArrow(jLand, "hsl(var(--primary))");
    };

    const render = useCallback(() => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, CW, CH);
        ctx.fillStyle = "hsl(var(--surface))";
        ctx.fillRect(0, 0, CW, CH);

        // Base static grid
        drawGrid(ctx, identity(), 0.05, "white");

        // Transformed grid
        drawGrid(ctx, currentMatrix, 0.3, "hsl(var(--primary))");

        // Unit circle becomes Ellipse
        drawUnitCircle(ctx, currentMatrix);

        // Basis vectors
        drawBasis(ctx, currentMatrix);

        // Origin
        ctx.fillStyle = "white";
        ctx.beginPath(); ctx.arc(OX, OY, 4, 0, Math.PI * 2); ctx.fill();
    }, [currentMatrix]);

    useEffect(() => {
        render();
    }, [render]);

    const stageDescription = [
        "Identity: Unit circle and grid.",
        "Rotation Vᵀ: Rotating the input space to align with principal directions.",
        "Stretch Σ: Scaling along the perpendicular axes defined by singular values.",
        "Final Rotation U: Orienting the scaled space to its final destination."
    ];

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6 select-none">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">layers</span>
                            Singular Value Decomposition
                        </h3>
                        <p className="text-xs text-muted/60 max-w-lg">
                            An objective decomposition of any linear map into three components: <strong>Rotate (Vᵀ)</strong>, <strong>Stretch (Σ)</strong>, and <strong>Rotate (U)</strong>.
                        </p>
                    </div>

                    <div className="flex gap-2 p-1 bg-black/20 border border-border rounded-xl w-fit">
                        {[0, 1, 2, 3].map((s) => (
                            <button
                                key={s}
                                onClick={() => setStage(s as SVDStage)}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${stage === s ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted/60 hover:text-muted"
                                    }`}
                            >
                                Stage {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Info Panel */}
                <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex flex-col justify-center min-w-[280px]">
                    <div className="text-[9px] uppercase font-black text-primary/60 mb-1">Geometric Insight</div>
                    <p className="text-[11px] text-muted leading-relaxed font-medium italic">
                        {stageDescription[stage]}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Canvas Area */}
                <div className="lg:col-span-8 bg-black/60 border border-border rounded-xl overflow-hidden relative group">
                    <div className="absolute top-3 left-4 flex gap-4 text-[9px] font-bold text-muted/40 uppercase tracking-widest z-10">
                        <span>SVD Transformation Flow</span>
                        <span className="text-rose-400">σ₁: {sigma1.toFixed(2)} | σ₂: {sigma2.toFixed(2)}</span>
                    </div>
                    <canvas
                        ref={canvasRef} width={CW} height={CH}
                        className="w-full h-auto cursor-crosshair"
                    />
                </div>

                {/* Controls Area */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-black/40 border border-border rounded-xl p-5 space-y-6">
                        <div className="text-[10px] font-black text-muted uppercase tracking-widest border-b border-border pb-2">Decomposition Params</div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold text-rose-400 uppercase">
                                    <span>Stretch σ₁</span>
                                    <span>{sigma1.toFixed(2)}</span>
                                </div>
                                <input type="range" min="0.2" max="3" step="0.1" value={sigma1} onChange={e => setSigma1(parseFloat(e.target.value))} className="w-full accent-rose-400" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold text-emerald-400 uppercase">
                                    <span>Stretch σ₂</span>
                                    <span>{sigma2.toFixed(2)}</span>
                                </div>
                                <input type="range" min="0.2" max="3" step="0.1" value={sigma2} onChange={e => setSigma2(parseFloat(e.target.value))} className="w-full accent-emerald-400" />
                            </div>

                            <div className="space-y-2 pt-2 border-t border-border/40">
                                <div className="flex justify-between text-[10px] font-bold text-muted/60 uppercase">
                                    <span>Initial Rotation θ₁ (Vᵀ)</span>
                                    <span>{theta1}°</span>
                                </div>
                                <input type="range" min="-180" max="180" step="1" value={theta1} onChange={e => setTheta1(parseFloat(e.target.value))} className="w-full accent-primary" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold text-muted/60 uppercase">
                                    <span>Final Rotation θ₂ (U)</span>
                                    <span>{theta2}°</span>
                                </div>
                                <input type="range" min="-180" max="180" step="1" value={theta2} onChange={e => setTheta2(parseFloat(e.target.value))} className="w-full accent-primary" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface2/10 border border-border rounded-xl p-4 flex gap-3">
                        <span className="material-symbols-outlined text-primary text-sm">info</span>
                        <p className="text-[10px] text-muted leading-relaxed italic">
                            The singular values (σ₁, σ₂) represent the lengths of the semi-axes of the ellipse. This is the "gold standard" for understanding any matrix.
                        </p>
                    </div>

                    <button
                        onClick={() => { setTheta1(30); setTheta2(-20); setSigma1(2); setSigma2(1); setStage(3); }}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 border border-border rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
                    >
                        Standard Decomposition
                    </button>
                </div>
            </div>
        </div>
    );
}

