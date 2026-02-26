"use client";

import React, { useState } from "react";

export const MetricsVisualizer = () => {
    const [tp, setTp] = useState(45);
    const [fp, setFp] = useState(10);
    const [fn, _setFn] = useState(5);
    const [tn, _setTn] = useState(40);

    const total = tp + fp + fn + tn;
    const accuracy = (tp + tn) / total;
    const precision = tp / (tp + fp) || 0;
    const recall = tp / (tp + fn) || 0;
    const f1 = 2 * (precision * recall) / (precision + recall) || 0;

    const getIntensity = (val: number) => {
        const percentage = (val / total) * 100;
        return Math.min(Math.max(percentage * 2, 5), 90);
    };

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto p-6 bg-surface/50 rounded-xl border border-border backdrop-blur-sm">
            <div className="text-center">
                <h4 className="text-sm font-bold text-foreground uppercase tracking-widest mb-1">Confusion Matrix</h4>
                <p className="text-[10px] text-muted font-mono">Interactive evaluation metrics</p>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full aspect-square max-w-[200px] relative font-mono">
                {/* Headers */}
                <div className="absolute -top-6 left-0 right-0 flex justify-around text-[8px] text-muted uppercase tracking-widest">
                    <span>Predicted -</span>
                    <span>Predicted +</span>
                </div>
                <div className="absolute -left-12 top-0 bottom-0 flex flex-col justify-around text-[8px] text-muted uppercase tracking-widest -rotate-90">
                    <span>Actual +</span>
                    <span>Actual -</span>
                </div>

                {/* Cells */}
                <div
                    className="rounded border border-white/5 flex flex-col items-center justify-center p-2 transition-all"
                    style={{ backgroundColor: `rgba(212, 212, 212, ${getIntensity(tn) / 500})` }}
                >
                    <span className="text-[8px] text-muted/50">TN</span>
                    <span className="text-sm font-bold">{tn}</span>
                </div>
                <div
                    className="rounded border border-rose-500/20 flex flex-col items-center justify-center p-2 transition-all"
                    style={{ backgroundColor: `rgba(244, 63, 94, ${getIntensity(fp) / 500})` }}
                >
                    <span className="text-[8px] text-rose-400/50">FP</span>
                    <span className="text-sm font-bold text-rose-400">{fp}</span>
                </div>
                <div
                    className="rounded border border-rose-500/20 flex flex-col items-center justify-center p-2 transition-all"
                    style={{ backgroundColor: `rgba(244, 63, 94, ${getIntensity(fn) / 500})` }}
                >
                    <span className="text-[8px] text-rose-400/50">FN</span>
                    <span className="text-sm font-bold text-rose-400">{fn}</span>
                </div>
                <div
                    className="rounded border border-primary/20 flex flex-col items-center justify-center p-2 transition-all"
                    style={{ backgroundColor: `rgba(212, 212, 212, ${getIntensity(tp) / 300})` }}
                >
                    <span className="text-[8px] text-primary/50">TP</span>
                    <span className="text-sm font-bold text-primary">{tp}</span>
                </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-4">
                <div className="space-y-4">
                    <div>
                        <span className="block text-[8px] text-muted uppercase mb-1">True Positives ({tp})</span>
                        <input type="range" min="0" max="100" value={tp} onChange={(e) => setTp(parseInt(e.target.value))} className="w-full accent-primary h-1" />
                    </div>
                    <div>
                        <span className="block text-[8px] text-muted uppercase mb-1">False Positives ({fp})</span>
                        <input type="range" min="0" max="100" value={fp} onChange={(e) => setFp(parseInt(e.target.value))} className="w-full accent-rose-500 h-1" />
                    </div>
                </div>
                <div className="space-y-4 text-xs font-mono">
                    <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-muted">Accuracy</span>
                        <span className="font-bold">{accuracy.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-muted">Precision</span>
                        <span className="text-primary font-bold">{precision.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-muted">Recall</span>
                        <span className="text-primary font-bold">{recall.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-muted">F1 Score</span>
                        <span className="font-bold">{f1.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
