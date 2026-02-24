"use client";

import React from "react";
import { CalculusVisualizer } from "./CalculusVisualizer";
import { OptimizationVisualizer } from "./OptimizationVisualizer";
import { NeuralVisualizer } from "./NeuralVisualizer";
import { MetricsVisualizer } from "./MetricsVisualizer";

interface VisualizerProps {
    type: string;
    subject?: string;
    module?: string;
}

export const Visualizer = ({ type, subject, module }: VisualizerProps) => {
    // Determine which primitive to show based on type or context
    const renderContent = () => {
        if (type === "calculus" || module?.includes("calculus")) {
            return <CalculusVisualizer functionType="parabola" />;
        }
        
        if (type === "sine") {
            return <CalculusVisualizer functionType="sine" />;
        }

        if (type === "cubic") {
            return <CalculusVisualizer functionType="cubic" />;
        }
        
        if (type === "optimization" || module?.includes("optimization")) {
            return <OptimizationVisualizer />;
        }
        
        if (type === "neural" || module?.includes("deep-learning") || module?.includes("neural")) {
            return <NeuralVisualizer />;
        }

        if (type === "metrics" || module?.includes("model-evaluation")) {
            return <MetricsVisualizer />;
        }

        // Default or legacy statistics/algebra placeholders
        if (module?.includes("statistics")) {
            return (
                <div className="flex items-end gap-2 h-24">
                    <div className="w-6 bg-primary/30 rounded-t animate-pulse" style={{ height: '40%' }} />
                    <div className="w-6 bg-primary/50 rounded-t animate-pulse" style={{ height: '70%', animationDelay: '0.1s' }} />
                    <div className="w-6 bg-primary/70 rounded-t animate-pulse" style={{ height: '55%', animationDelay: '0.2s' }} />
                    <div className="w-6 bg-primary rounded-t animate-pulse" style={{ height: '85%', animationDelay: '0.3s' }} />
                    <div className="w-6 bg-primary/60 rounded-t animate-pulse" style={{ height: '45%', animationDelay: '0.4s' }} />
                    <div className="w-6 bg-primary/40 rounded-t animate-pulse" style={{ height: '65%', animationDelay: '0.5s' }} />
                </div>
            );
        }

        return (
            <div className="relative size-32 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <div className="size-16 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/30">
                    <span className="material-symbols-outlined text-primary scale-125">analytics</span>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            {renderContent()}
        </div>
    );
};
