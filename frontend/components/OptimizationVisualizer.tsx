"use client";

import React, { useState, useEffect } from "react";

const INIT_POINT = { x: 3.5, y: -3.2 };

export const OptimizationVisualizer = () => {
    const [step, setStep] = useState(0);
    const [path, setPath] = useState<{ x: number, y: number }[]>([]);
    const [lr, setLr] = useState(0.1);

    // Convergent bowl function: f(x, y) = x^2 + y^2
    const centerX = 150;
    const centerY = 150;
    const scale = 30;

    useEffect(() => {
        setPath([INIT_POINT]);
        setStep(0);
    }, []);

    const handleStep = () => {
        if (path.length === 0) return;
        const current = path[path.length - 1];

        // Gradient of x^2 + y^2 is [2x, 2y]
        const dx = 2 * current.x;
        const dy = 2 * current.y;

        const next = {
            x: current.x - lr * dx,
            y: current.y - lr * dy
        };

        setPath([...path, next]);
        setStep(step + 1);
    };

    const handleReset = () => {
        setPath([INIT_POINT]);
        setStep(0);
    };

    // Mapping to canvas
    const toCanvasX = (val: number) => centerX + val * scale;
    const toCanvasY = (val: number) => centerY - val * scale;

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto p-6 bg-surface/50 rounded-xl border border-border backdrop-blur-sm">
            <div className="text-center">
                <h4 className="text-sm font-bold text-foreground uppercase tracking-widest mb-1">Gradient Descent</h4>
                <p className="text-[10px] text-muted font-mono">Epoch: {step} • Learning Rate: {lr}</p>
            </div>

            <div className="relative w-full aspect-square bg-[#050505] rounded-lg border border-border overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-20" />

                {/* Contour Rings */}
                <svg viewBox="0 0 300 300" className="w-full h-full">
                    {[1, 2, 3, 4, 5].map(r => (
                        <circle
                            key={r}
                            cx={centerX}
                            cy={centerY}
                            r={r * scale}
                            fill="none"
                            stroke="rgba(212, 212, 212, 0.1)"
                            strokeWidth="1"
                        />
                    ))}

                    {/* Gradient Path */}
                    {path.length > 1 && (
                        <polyline
                            points={path.map(p => `${toCanvasX(p.x)},${toCanvasY(p.y)}`).join(" ")}
                            fill="none"
                            stroke="#D4D4D4"
                            strokeWidth="1.5"
                            className="drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]"
                        />
                    )}

                    {/* Current Position */}
                    {path.length > 0 && (
                        <circle
                            cx={toCanvasX(path[path.length - 1].x)}
                            cy={toCanvasY(path[path.length - 1].y)}
                            r="5"
                            fill="#D4D4D4"
                            className="animate-pulse"
                        />
                    )}
                </svg>

                <div className="absolute top-2 right-2 text-[8px] font-mono text-muted/50 text-right">
                    Minimize: f(x,y) = x² + y²<br />
                    Target: (0,0)
                </div>
            </div>

            <div className="w-full space-y-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <span className="block text-[8px] text-muted uppercase tracking-widest mb-2">Learning Rate</span>
                        <input
                            type="range"
                            min="0.01"
                            max="0.5"
                            step="0.01"
                            value={lr}
                            onChange={(e) => setLr(parseFloat(e.target.value))}
                            className="w-full accent-primary h-1 rounded-full border border-border appearance-none cursor-pointer"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 rounded-lg bg-surface border border-border text-[10px] font-bold uppercase tracking-wider text-muted hover:text-foreground transition-colors"
                    >
                        Reset Path
                    </button>
                    <button
                        onClick={handleStep}
                        className="px-4 py-2 rounded-lg bg-foreground text-background font-bold text-[10px] uppercase tracking-wider hover:bg-white transition-all shadow-lg shadow-white/10"
                    >
                        Next Step
                    </button>
                </div>
            </div>
        </div>
    );
};
