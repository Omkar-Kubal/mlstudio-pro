"use client";

import React, { useState, useEffect } from "react";

interface CalculusVisualizerProps {
    functionType?: "parabola" | "sine" | "cubic";
}

export const CalculusVisualizer = ({ functionType = "parabola" }: CalculusVisualizerProps) => {
    const [x, setX] = useState(0);
    
    // Function definitions
    const f = (x: number) => {
        switch (functionType) {
            case "sine": return Math.sin(x);
            case "cubic": return 0.1 * Math.pow(x, 3) - x;
            case "parabola":
            default: return 0.2 * x * x - 2;
        }
    };

    // Derivative definitions
    const df = (x: number) => {
        switch (functionType) {
            case "sine": return Math.cos(x);
            case "cubic": return 0.3 * Math.pow(x, 2) - 1;
            case "parabola":
            default: return 0.4 * x;
        }
    };

    const y = f(x);
    const slope = df(x);

    // Coordinate mapping
    const scale = 20;
    const centerX = 150;
    const centerY = 150;

    const toCanvasX = (val: number) => centerX + val * scale;
    const toCanvasY = (val: number) => centerY - val * scale;

    // Generate curve points
    const points = [];
    for (let i = -6; i <= 6; i += 0.2) {
        points.push(`${toCanvasX(i)},${toCanvasY(f(i))}`);
    }

    // Tangent line points
    const tX1 = x - 2;
    const tY1 = y - slope * 2;
    const tX2 = x + 2;
    const tY2 = y + slope * 2;

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto p-6 bg-surface/50 rounded-xl border border-border backdrop-blur-sm">
            <div className="text-center">
                <h4 className="text-sm font-bold text-foreground uppercase tracking-widest mb-1">Derivative Explorer</h4>
                <p className="text-[10px] text-muted font-mono">Exploring slope at x = {x.toFixed(2)}</p>
            </div>

            <div className="relative w-full aspect-square bg-background rounded-lg border border-border overflow-hidden shadow-inner uppercase font-mono text-[8px] text-muted/30">
                <div className="absolute inset-0 grid-bg opacity-30" />
                
                {/* Axes */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10" />
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />

                <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-lg">
                    {/* The Function Curve */}
                    <polyline
                        points={points.join(" ")}
                        fill="none"
                        stroke="rgba(212, 212, 212, 0.3)"
                        strokeWidth="2"
                    />

                    {/* The Tangent Line */}
                    <line
                        x1={toCanvasX(tX1)}
                        y1={toCanvasY(tY1)}
                        x2={toCanvasX(tX2)}
                        y2={toCanvasY(tY2)}
                        stroke="#D4D4D4"
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                    />

                    {/* Intersection Point */}
                    <circle
                        cx={toCanvasX(x)}
                        cy={toCanvasY(y)}
                        r="4"
                        fill="#D4D4D4"
                        className="animate-pulse"
                    />
                </svg>

                {/* Legend */}
                <div className="absolute bottom-3 left-3 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-primary" />
                        <span>f(x) value: {y.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-white" />
                        <span>Slope (df/dx): {slope.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="w-full space-y-4">
                <div className="flex justify-between items-center text-[10px] font-mono text-muted">
                    <span>-5.0</span>
                    <span>ADJUST X POSITION</span>
                    <span>+5.0</span>
                </div>
                <input
                    type="range"
                    min="-5"
                    max="5"
                    step="0.1"
                    value={x}
                    onChange={(e) => setX(parseFloat(e.target.value))}
                    className="w-full accent-primary bg-background h-1.5 rounded-full border border-border appearance-none cursor-pointer"
                />
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-background/50 rounded-lg border border-border text-center">
                        <span className="block text-[8px] text-muted uppercase tracking-tighter">Current Position</span>
                        <span className="text-sm font-bold font-mono">({x.toFixed(1)}, {y.toFixed(1)})</span>
                    </div>
                    <div className="p-3 bg-background/50 rounded-lg border border-border text-center">
                        <span className="block text-[8px] text-muted uppercase tracking-tighter">Local Slope</span>
                        <span className="text-sm font-bold font-mono text-primary">{slope.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
