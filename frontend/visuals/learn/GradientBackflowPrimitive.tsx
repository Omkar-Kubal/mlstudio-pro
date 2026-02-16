"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import type { GradientBackflowConfig } from "@/lib/visual-types";

interface Props {
    config: GradientBackflowConfig;
}

// Gradient derivative by activation function
const activationDerivatives = {
    linear: (activation: number) => 1,
    relu: (activation: number) => activation > 0 ? 1 : 0,
    sigmoid: (activation: number) => activation * (1 - activation), // max ≈ 0.25
    tanh: (activation: number) => 1 - activation * activation
};

// Color for gradients (purple/green to distinguish from forward pass blue/orange)
function getGradientColor(magnitude: number): string {
    const clamped = Math.min(1, Math.max(0, magnitude));
    if (clamped < 0.01) return "rgba(128, 128, 128, 0.3)"; // Dead
    const intensity = Math.floor(clamped * 200 + 55);
    return `rgba(${100 + intensity * 0.3}, ${intensity}, ${180}, ${0.5 + clamped * 0.5})`;
}

/**
 * GradientBackflowPrimitive - Phase 7 Visual Primitive
 * 
 * Visualizes gradient backpropagation:
 * - Right→left wave animation
 * - Error slider seeds gradient at output
 * - Activation function affects attenuation
 * - Per-layer gradient magnitude bars
 * - Dead ReLU neurons show zero gradient
 * 
 * Per Spec: Conceptual gradient flow, not real backprop.
 */
export default function GradientBackflowPrimitive({ config }: Props) {
    const { slider, architecture, weights, activations, initialActivation, caption } = config;

    // Error magnitude
    const [errorMagnitude, setErrorMagnitude] = useState(slider.initial);

    // Activation function
    const [activation, setActivation] = useState<keyof typeof activationDerivatives>(initialActivation);

    // Reduced motion
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

    // First compute forward activations (needed for gradient derivatives)
    const forwardActivations = useMemo(() => {
        const layers: number[][] = [];
        const inputVal = 1.0; // Fixed input for derivative computation

        const activationFn = {
            linear: (x: number) => x,
            relu: (x: number) => Math.max(0, x),
            sigmoid: (x: number) => 1 / (1 + Math.exp(-x)),
            tanh: (x: number) => Math.tanh(x)
        }[activation];

        const inputLayer = Array.from({ length: architecture[0] }, () => inputVal);
        layers.push(inputLayer);

        for (let l = 1; l < architecture.length; l++) {
            const prevLayer = layers[l - 1];
            const layerWeights = weights[l - 1];
            const currentLayer: number[] = [];

            for (let j = 0; j < architecture[l]; j++) {
                let sum = 0;
                for (let i = 0; i < prevLayer.length; i++) {
                    sum += prevLayer[i] * (layerWeights?.[i]?.[j] ?? 0.5);
                }
                currentLayer.push(activationFn(sum));
            }
            layers.push(currentLayer);
        }
        return layers;
    }, [architecture, weights, activation]);

    // Compute backward gradients (right to left)
    const { layerGradients, gradientMagnitudes } = useMemo(() => {
        const derivativeFn = activationDerivatives[activation];
        const layers: number[][] = [];
        const magnitudes: number[] = [];

        // Output layer gradient = error magnitude
        const outputGrad = Array.from({ length: architecture[architecture.length - 1] }, () => errorMagnitude);
        layers.unshift(outputGrad);
        magnitudes.unshift(outputGrad.reduce((a, b) => a + Math.abs(b), 0) / outputGrad.length);

        // Backpropagate through layers (reverse order)
        for (let l = architecture.length - 2; l >= 0; l--) {
            const nextLayerGrad = layers[0];
            const layerWeights = weights[l];
            const forwardActs = forwardActivations[l];
            const currentGrad: number[] = [];

            for (let i = 0; i < architecture[l]; i++) {
                let gradSum = 0;
                for (let j = 0; j < architecture[l + 1]; j++) {
                    const weight = layerWeights?.[i]?.[j] ?? 0.5;
                    gradSum += nextLayerGrad[j] * weight;
                }
                // Multiply by activation derivative
                const derivative = derivativeFn(forwardActs[i]);
                const grad = gradSum * derivative;
                currentGrad.push(Math.max(-10, Math.min(10, grad)));
            }
            layers.unshift(currentGrad);
            magnitudes.unshift(currentGrad.reduce((a, b) => a + Math.abs(b), 0) / currentGrad.length);
        }

        return { layerGradients: layers, gradientMagnitudes: magnitudes };
    }, [errorMagnitude, activation, architecture, weights, forwardActivations]);

    // Max gradient for normalization
    const maxGradient = Math.max(...gradientMagnitudes, 0.1);

    // Layout
    const svgWidth = 400;
    const svgHeight = 200;
    const layerSpacing = svgWidth / (architecture.length + 1);
    const nodeRadius = 14;

    function getNodePosition(layerIdx: number, nodeIdx: number) {
        const nodesInLayer = architecture[layerIdx];
        const layerHeight = (nodesInLayer - 1) * 40;
        const startY = (svgHeight - layerHeight) / 2;
        return {
            x: (layerIdx + 1) * layerSpacing,
            y: startY + nodeIdx * 40
        };
    }

    const springTransition = reducedMotion
        ? { duration: 0 }
        : { type: "spring" as const, stiffness: 200, damping: 25 };

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6">
            {/* Network with Gradient Visualization */}
            <div className="relative border border-border/50 rounded bg-surface/30 overflow-hidden">
                <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="xMidYMid meet">
                    {/* Backward arrows between layers */}
                    {architecture.slice(0, -1).map((_, layerIdx) => {
                        const fromPos = getNodePosition(layerIdx + 1, 0);
                        const toPos = getNodePosition(layerIdx, 0);
                        return (
                            <text
                                key={`arrow-${layerIdx}`}
                                x={(fromPos.x + toPos.x) / 2}
                                y={svgHeight - 10}
                                textAnchor="middle"
                                fontSize="12"
                                fill="rgba(168, 85, 247, 0.6)"
                            >
                                ←
                            </text>
                        );
                    })}

                    {/* Edges with gradient flow indication */}
                    {architecture.slice(0, -1).map((_, layerIdx) =>
                        Array.from({ length: architecture[layerIdx] }).map((_, fromIdx) =>
                            Array.from({ length: architecture[layerIdx + 1] }).map((_, toIdx) => {
                                const from = getNodePosition(layerIdx, fromIdx);
                                const to = getNodePosition(layerIdx + 1, toIdx);
                                const weight = weights[layerIdx]?.[fromIdx]?.[toIdx] ?? 0.5;
                                const gradMag = layerGradients[layerIdx]?.[fromIdx] ?? 0;

                                return (
                                    <motion.line
                                        key={`edge-${layerIdx}-${fromIdx}-${toIdx}`}
                                        x1={from.x + nodeRadius}
                                        y1={from.y}
                                        x2={to.x - nodeRadius}
                                        y2={to.y}
                                        stroke="rgba(168, 85, 247, 0.4)"
                                        strokeWidth={Math.abs(weight) * 2 + 0.5}
                                        initial={false}
                                        animate={{ opacity: Math.abs(gradMag) > 0.01 ? 0.6 : 0.15 }}
                                        transition={springTransition}
                                    />
                                );
                            })
                        )
                    )}

                    {/* Nodes with gradient glow */}
                    {architecture.map((nodesInLayer, layerIdx) =>
                        Array.from({ length: nodesInLayer }).map((_, nodeIdx) => {
                            const pos = getNodePosition(layerIdx, nodeIdx);
                            const gradVal = layerGradients[layerIdx]?.[nodeIdx] ?? 0;
                            const isOutput = layerIdx === architecture.length - 1;
                            const isDead = Math.abs(gradVal) < 0.01;

                            return (
                                <g key={`node-${layerIdx}-${nodeIdx}`}>
                                    {/* Glow effect */}
                                    <motion.circle
                                        cx={pos.x}
                                        cy={pos.y}
                                        r={nodeRadius + 4}
                                        initial={false}
                                        animate={{
                                            fill: getGradientColor(Math.abs(gradVal) / maxGradient),
                                            opacity: isDead ? 0.2 : 0.8
                                        }}
                                        transition={springTransition}
                                    />
                                    {/* Node circle */}
                                    <circle
                                        cx={pos.x}
                                        cy={pos.y}
                                        r={nodeRadius}
                                        fill="rgba(30, 30, 40, 0.9)"
                                        stroke={isDead ? "rgba(128,128,128,0.5)" : "rgba(168, 85, 247, 0.8)"}
                                        strokeWidth={2}
                                    />
                                    {/* Gradient value */}
                                    <text
                                        x={pos.x}
                                        y={pos.y + 4}
                                        textAnchor="middle"
                                        fontSize="8"
                                        fill={isDead ? "rgba(128,128,128,0.7)" : "rgba(200, 160, 255, 1)"}
                                        fontWeight="bold"
                                    >
                                        {isDead ? "×" : gradVal.toFixed(2)}
                                    </text>
                                    {/* Layer labels */}
                                    {nodeIdx === 0 && (
                                        <text
                                            x={pos.x}
                                            y={pos.y - nodeRadius - 8}
                                            textAnchor="middle"
                                            fontSize="9"
                                            fill="rgba(255,255,255,0.5)"
                                        >
                                            {layerIdx === 0 ? "Input" : isOutput ? "Output" : `H${layerIdx}`}
                                        </text>
                                    )}
                                </g>
                            );
                        })
                    )}
                </svg>
            </div>

            {/* Per-Layer Gradient Magnitude Bars */}
            <div className="space-y-1">
                <h4 className="text-xs font-medium text-muted uppercase tracking-wide">Gradient Magnitude by Layer</h4>
                <div className="flex gap-2 items-end h-12">
                    {gradientMagnitudes.map((mag, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                            <motion.div
                                className="w-full rounded-t"
                                style={{ backgroundColor: getGradientColor(mag / maxGradient) }}
                                initial={false}
                                animate={{ height: `${Math.min(100, (mag / maxGradient) * 100)}%` }}
                                transition={springTransition}
                            />
                            <span className="text-[8px] text-muted">
                                {idx === 0 ? "In" : idx === gradientMagnitudes.length - 1 ? "Out" : `H${idx}`}
                            </span>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-center text-muted/70">
                    {gradientMagnitudes[0] < gradientMagnitudes[gradientMagnitudes.length - 1] * 0.3
                        ? "⚠️ Vanishing Gradient"
                        : gradientMagnitudes[0] > gradientMagnitudes[gradientMagnitudes.length - 1] * 3
                            ? "⚠️ Exploding Gradient"
                            : "✓ Healthy Flow"}
                </p>
            </div>

            {/* Activation Function Selector */}
            <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-muted">Activation:</span>
                {activations.map(act => (
                    <button
                        key={act}
                        onClick={() => setActivation(act)}
                        className={`px-2 py-1 text-xs rounded capitalize transition-colors ${activation === act
                            ? "bg-purple-600 text-white"
                            : "bg-surface text-muted hover:text-foreground"
                            }`}
                    >
                        {act}
                    </button>
                ))}
            </div>

            {/* Error Slider */}
            <div className="space-y-2">
                <label className="flex items-center justify-between text-sm">
                    <span className="text-muted">{slider.label}</span>
                    <span className="font-mono text-foreground">{errorMagnitude.toFixed(2)}</span>
                </label>
                <input
                    type="range"
                    min={slider.min}
                    max={slider.max}
                    step={slider.step}
                    value={errorMagnitude}
                    onChange={(e) => setErrorMagnitude(Number(e.target.value))}
                    className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
            </div>

            {/* Caption */}
            <p className="text-sm text-muted italic">{caption}</p>
        </div>
    );
}
