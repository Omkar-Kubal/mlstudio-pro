"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import type { NetworkForwardPassConfig } from "@/lib/visual-types";

interface Props {
    config: NetworkForwardPassConfig;
}

// Activation function implementations
const activationFunctions = {
    linear: (x: number) => x,
    relu: (x: number) => Math.max(0, x),
    sigmoid: (x: number) => 1 / (1 + Math.exp(-x)),
    tanh: (x: number) => Math.tanh(x),
    "leaky-relu": (x: number) => x > 0 ? x : 0.1 * x
};

// Color utilities
function getNodeColor(value: number, maxVal: number = 2): string {
    const normalized = Math.max(-1, Math.min(1, value / maxVal));
    if (normalized > 0) {
        const intensity = Math.floor(normalized * 200 + 55);
        return `rgb(59, ${130 + Math.floor(normalized * 50)}, ${intensity})`;
    } else {
        const intensity = Math.floor(-normalized * 200 + 55);
        return `rgb(${intensity}, ${115 - Math.floor(normalized * 50)}, 22)`;
    }
}

function getEdgeColor(weight: number): string {
    return weight >= 0 ? "rgba(59, 130, 246, 0.6)" : "rgba(249, 115, 22, 0.6)";
}

/**
 * NetworkForwardPassPrimitive - Phase 6 Visual Primitive
 * 
 * Visualizes neural network forward propagation:
 * - Nodes show activation values (fill color)
 * - Edges show weights (thickness + color)
 * - Input slider drives propagation
 * - Activation function toggle
 */
export default function NetworkForwardPassPrimitive({ config }: Props) {
    const { slider, architecture, weights, activations, initialActivation, caption } = config;

    // Input value
    const [inputValue, setInputValue] = useState(slider.initial);

    // Activation function
    const [activation, setActivation] = useState<keyof typeof activationFunctions>(initialActivation);

    // Reduced motion
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReducedMotion(mediaQuery.matches);
        const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
    }, []);

    // Compute activations through the network
    const layerActivations = useMemo(() => {
        const activationFn = activationFunctions[activation];
        const layers: number[][] = [];

        // Input layer - spread input value across input nodes
        const inputLayer = architecture[0] === 1
            ? [inputValue]
            : Array.from({ length: architecture[0] }, (_, i) => inputValue * (i % 2 === 0 ? 1 : -0.5));
        layers.push(inputLayer);

        // Forward pass through hidden and output layers
        for (let l = 1; l < architecture.length; l++) {
            const prevLayer = layers[l - 1];
            const layerWeights = weights[l - 1];
            const currentLayer: number[] = [];

            for (let j = 0; j < architecture[l]; j++) {
                let sum = 0;
                for (let i = 0; i < prevLayer.length; i++) {
                    sum += prevLayer[i] * (layerWeights?.[i]?.[j] ?? 0.5);
                }
                // Apply activation (except for output layer in some cases)
                const activated = l === architecture.length - 1 ? sum : activationFn(sum);
                currentLayer.push(Math.max(-10, Math.min(10, activated)));
            }
            layers.push(currentLayer);
        }

        return layers;
    }, [inputValue, activation, architecture, weights]);

    // Layout calculations
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
            {/* Network Visualization */}
            <div className="relative border border-border/50 rounded bg-surface/30 overflow-hidden">
                <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="xMidYMid meet">
                    {/* Edges */}
                    {architecture.slice(0, -1).map((_, layerIdx) =>
                        Array.from({ length: architecture[layerIdx] }).map((_, fromIdx) =>
                            Array.from({ length: architecture[layerIdx + 1] }).map((_, toIdx) => {
                                const from = getNodePosition(layerIdx, fromIdx);
                                const to = getNodePosition(layerIdx + 1, toIdx);
                                const weight = weights[layerIdx]?.[fromIdx]?.[toIdx] ?? 0.5;
                                const thickness = Math.abs(weight) * 2 + 0.5;

                                return (
                                    <motion.line
                                        key={`edge-${layerIdx}-${fromIdx}-${toIdx}`}
                                        x1={from.x + nodeRadius}
                                        y1={from.y}
                                        x2={to.x - nodeRadius}
                                        y2={to.y}
                                        stroke={getEdgeColor(weight)}
                                        strokeWidth={thickness}
                                        initial={false}
                                        animate={{ opacity: Math.abs(weight) > 0.1 ? 0.7 : 0.2 }}
                                        transition={springTransition}
                                    />
                                );
                            })
                        )
                    )}

                    {/* Nodes */}
                    {architecture.map((nodesInLayer, layerIdx) =>
                        Array.from({ length: nodesInLayer }).map((_, nodeIdx) => {
                            const pos = getNodePosition(layerIdx, nodeIdx);
                            const value = layerActivations[layerIdx]?.[nodeIdx] ?? 0;
                            const isInput = layerIdx === 0;
                            const isOutput = layerIdx === architecture.length - 1;

                            return (
                                <g key={`node-${layerIdx}-${nodeIdx}`}>
                                    {/* Node circle */}
                                    <motion.circle
                                        cx={pos.x}
                                        cy={pos.y}
                                        r={nodeRadius}
                                        stroke="white"
                                        strokeWidth={2}
                                        initial={false}
                                        animate={{ fill: getNodeColor(value) }}
                                        transition={springTransition}
                                    />
                                    {/* Value text */}
                                    <text
                                        x={pos.x}
                                        y={pos.y + 4}
                                        textAnchor="middle"
                                        fontSize="9"
                                        fill="white"
                                        fontWeight="bold"
                                    >
                                        {value.toFixed(1)}
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
                                            {isInput ? "Input" : isOutput ? "Output" : `H${layerIdx}`}
                                        </text>
                                    )}
                                </g>
                            );
                        })
                    )}
                </svg>
            </div>

            {/* Activation Function Selector */}
            <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-muted">Activation:</span>
                {activations.map(act => (
                    <button
                        key={act}
                        onClick={() => setActivation(act)}
                        className={`px-2 py-1 text-xs rounded capitalize transition-colors ${activation === act
                                ? "bg-primary text-white"
                                : "bg-surface text-muted hover:text-foreground"
                            }`}
                    >
                        {act}
                    </button>
                ))}
            </div>

            {/* Input Slider */}
            <div className="space-y-2">
                <label className="flex items-center justify-between text-sm">
                    <span className="text-muted">{slider.label}</span>
                    <span className="font-mono text-foreground">{inputValue.toFixed(2)}</span>
                </label>
                <input
                    type="range"
                    min={slider.min}
                    max={slider.max}
                    step={slider.step}
                    value={inputValue}
                    onChange={(e) => setInputValue(Number(e.target.value))}
                    className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
                />
            </div>

            {/* Caption */}
            <p className="text-sm text-muted italic">{caption}</p>
        </div>
    );
}
