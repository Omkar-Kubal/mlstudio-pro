"use client";

import React from "react";

export const NeuralVisualizer = () => {
    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto p-6 bg-surface/50 rounded-xl border border-border backdrop-blur-sm">
            <div className="text-center">
                <h4 className="text-sm font-bold text-foreground uppercase tracking-widest mb-1">Perceptron Architecture</h4>
                <p className="text-[10px] text-muted font-mono">Flow: Input → Weights → Bias → Activation</p>
            </div>

            <div className="relative w-full h-48 bg-background/30 rounded-lg border border-border overflow-hidden p-4">
                <div className="absolute inset-0 grid-bg opacity-10" />
                
                <div className="h-full flex items-center justify-between relative">
                    {/* Input Nodes */}
                    <div className="flex flex-col gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="relative">
                                <div className="size-6 rounded-full bg-surface border border-border flex items-center justify-center text-[10px] text-muted font-bold font-mono">
                                    x{i}
                                </div>
                                <div className="absolute left-6 top-3 w-12 h-px bg-gradient-to-r from-primary/50 to-primary animate-pulse" />
                            </div>
                        ))}
                    </div>

                    {/* Weights Junction */}
                    <div className="absolute left-18 top-1/2 -translate-y-1/2 text-[8px] font-mono text-muted/50 rotate-90 tracking-[1em]">
                        WEIGHTS
                    </div>

                    {/* Calculation Node */}
                    <div className="size-20 rounded-2xl bg-surface border-2 border-primary/50 flex flex-col items-center justify-center relative shadow-[0_0_20px_rgba(212,212,212,0.1)]">
                        <span className="text-lg font-bold">Σ</span>
                        <span className="text-[8px] text-muted font-mono">w·x + b</span>
                        
                        {/* Activation Function Indicator */}
                        <div className="absolute -right-1 -bottom-1 size-8 rounded-lg bg-background border border-border flex items-center justify-center rotate-3 shadow-lg">
                            <span className="material-symbols-outlined text-sm text-primary">show_chart</span>
                        </div>
                    </div>

                    {/* Output */}
                    <div className="flex flex-col items-end gap-2">
                        <div className="size-8 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-xs shadow-xl">
                            ŷ
                        </div>
                        <span className="text-[8px] font-mono text-muted uppercase">Prediction</span>
                    </div>

                    {/* Connection lines handled by absolute positioning above */}
                </div>
            </div>

            <div className="w-full p-4 bg-background/50 rounded-lg border border-border border-l-4 border-l-primary">
                <p className="text-[10px] text-muted leading-relaxed">
                    The <span className="text-foreground font-bold">Perceptron</span> is the fundamental building block. It takes multiple inputs, multiplies them by weights, adds a bias, and passes the result through an activation function like <span className="text-primary italic">ReLU</span> or <span className="text-primary italic">Sigmoid</span>.
                </p>
            </div>
        </div>
    );
};
