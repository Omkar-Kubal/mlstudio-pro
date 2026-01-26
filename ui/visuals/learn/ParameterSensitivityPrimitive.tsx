"use client";

import { useState, useMemo } from "react";
import type {
    ParameterSensitivityConfig,
    MeanMedianData,
    ThresholdData
} from "@/lib/visual-types";

interface Props {
    config: ParameterSensitivityConfig;
}

/**
 * ParameterSensitivityPrimitive - Generalized animation component
 * 
 * Renders different visualizations based on config.mode:
 * - "mean-median": Shows mean/median sensitivity to outliers
 * - "threshold-classification": Shows threshold tuning with precision/recall
 * 
 * Behavior is identical to original pilots - this is a refactor only.
 */
export default function ParameterSensitivityPrimitive({ config }: Props) {
    const { slider, axis, mode, data, metrics, caption } = config;

    // Slider state
    const [paramValue, setParamValue] = useState(slider.initial);

    // Format value for display
    const displayValue = slider.format === "integer"
        ? Math.round(paramValue).toString()
        : paramValue.toFixed(2);

    // Compute axis position from value
    const toPercent = (val: number) =>
        ((val - axis.min) / (axis.max - axis.min)) * 100;

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6">
            {/* Visualization Area */}
            {mode === "mean-median" && (
                <MeanMedianVisual
                    data={data as MeanMedianData}
                    paramValue={paramValue}
                    toPercent={toPercent}
                    axisMin={axis.min}
                    axisMax={axis.max}
                />
            )}
            {mode === "threshold-classification" && (
                <ThresholdVisual
                    data={data as ThresholdData}
                    threshold={paramValue}
                    toPercent={toPercent}
                    showMidpoint={axis.showMidpoint}
                    metrics={metrics}
                />
            )}

            {/* Slider */}
            <div className="space-y-2">
                <label className="flex items-center justify-between text-sm">
                    <span className="text-muted">{slider.label}</span>
                    <span className="font-mono text-foreground">{displayValue}</span>
                </label>
                <input
                    type="range"
                    min={slider.min}
                    max={slider.max}
                    step={slider.step}
                    value={paramValue}
                    onChange={(e) => setParamValue(Number(e.target.value))}
                    className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
                />
            </div>
        </div>
    );
}

// ============================================
// Mean-Median Mode Visual
// ============================================

function MeanMedianVisual({
    data,
    paramValue,
    toPercent,
    axisMin,
    axisMax
}: {
    data: MeanMedianData;
    paramValue: number;
    toPercent: (val: number) => number;
    axisMin: number;
    axisMax: number;
}) {
    // Compute mean and median with outlier
    const { mean, median } = useMemo(() => {
        const all = [...data.basePoints, paramValue].sort((a, b) => a - b);
        const sum = all.reduce((acc, val) => acc + val, 0);
        const m = sum / all.length;
        const mid = Math.floor(all.length / 2);
        const med = all.length % 2 === 0
            ? (all[mid - 1] + all[mid]) / 2
            : all[mid];
        return { mean: m, median: med };
    }, [data.basePoints, paramValue]);

    return (
        <div className="relative h-24">
            {/* Axis line */}
            <div className="absolute left-0 right-0 top-1/2 h-px bg-border" />

            {/* Axis labels */}
            <div className="absolute left-0 bottom-0 text-xs text-muted font-mono">{axisMin}</div>
            <div className="absolute right-0 bottom-0 text-xs text-muted font-mono">{axisMax}</div>

            {/* Base data points */}
            {data.basePoints.map((val, idx) => (
                <div
                    key={idx}
                    className="absolute w-2 h-2 rounded-full bg-muted/60"
                    style={{
                        left: `${toPercent(val)}%`,
                        top: "50%",
                        transform: "translate(-50%, -50%)"
                    }}
                />
            ))}

            {/* Outlier point */}
            <div
                className="absolute w-3 h-3 rounded-full bg-primary border-2 border-white"
                style={{
                    left: `${toPercent(paramValue)}%`,
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    transition: "left 0.05s ease-out"
                }}
            />

            {/* Mean indicator */}
            <div
                className="absolute w-0.5 bg-red-500"
                style={{
                    left: `${toPercent(mean)}%`,
                    top: "30%",
                    height: "40%",
                    transform: "translateX(-50%)",
                    transition: "left 0.05s ease-out"
                }}
            />
            <div
                className="absolute text-xs font-medium text-red-500"
                style={{
                    left: `${toPercent(mean)}%`,
                    top: "10%",
                    transform: "translateX(-50%)"
                }}
            >
                Mean
            </div>

            {/* Median indicator */}
            <div
                className="absolute w-0.5 bg-green-500"
                style={{
                    left: `${toPercent(median)}%`,
                    top: "30%",
                    height: "40%",
                    transform: "translateX(-50%)"
                }}
            />
            <div
                className="absolute text-xs font-medium text-green-500"
                style={{
                    left: `${toPercent(median)}%`,
                    top: "75%",
                    transform: "translateX(-50%)"
                }}
            >
                Median
            </div>
        </div>
    );
}

// ============================================
// Threshold Classification Mode Visual
// ============================================

function ThresholdVisual({
    data,
    threshold,
    toPercent,
    showMidpoint,
    metrics
}: {
    data: ThresholdData;
    threshold: number;
    toPercent: (val: number) => number;
    showMidpoint?: boolean;
    metrics?: { name: string; color: string }[];
}) {
    // Compute predictions and metrics
    const { predictions, precision, recall } = useMemo(() => {
        const preds = data.points.map(d => ({
            ...d,
            predicted: d.probability >= threshold ? 1 : 0
        }));

        let tp = 0, fp = 0, fn = 0;
        preds.forEach(p => {
            if (p.predicted === 1 && p.actualLabel === 1) tp++;
            else if (p.predicted === 1 && p.actualLabel === 0) fp++;
            else if (p.predicted === 0 && p.actualLabel === 1) fn++;
        });

        const prec = (tp + fp) > 0 ? tp / (tp + fp) : 1;
        const rec = (tp + fn) > 0 ? tp / (tp + fn) : 1;

        return { predictions: preds, precision: prec, recall: rec };
    }, [data.points, threshold]);

    const metricValues = [precision, recall];

    return (
        <>
            {/* Probability Axis */}
            <div className="relative h-20">
                {/* Axis line */}
                <div className="absolute left-0 right-0 top-1/2 h-px bg-border" />

                {/* Axis labels */}
                <div className="absolute left-0 bottom-0 text-xs text-muted font-mono">0</div>
                <div className="absolute right-0 bottom-0 text-xs text-muted font-mono">1</div>
                {showMidpoint && (
                    <div className="absolute left-1/2 bottom-0 text-xs text-muted font-mono transform -translate-x-1/2">
                        0.5
                    </div>
                )}

                {/* Data points */}
                {predictions.map((point, idx) => (
                    <div
                        key={idx}
                        className={`absolute w-2.5 h-2.5 rounded-full border transition-colors duration-100 ${point.predicted === 1
                                ? point.actualLabel === 1
                                    ? "bg-green-500 border-green-400"
                                    : "bg-red-500 border-red-400"
                                : point.actualLabel === 1
                                    ? "bg-yellow-500 border-yellow-400"
                                    : "bg-gray-500 border-gray-400"
                            }`}
                        style={{
                            left: `${toPercent(point.probability)}%`,
                            top: point.actualLabel === 1 ? "35%" : "55%",
                            transform: "translate(-50%, -50%)"
                        }}
                    />
                ))}

                {/* Threshold line */}
                <div
                    className="absolute w-0.5 bg-primary"
                    style={{
                        left: `${toPercent(threshold)}%`,
                        top: "15%",
                        height: "70%",
                        transform: "translateX(-50%)",
                        transition: "left 0.05s ease-out"
                    }}
                />
                <div
                    className="absolute text-xs font-bold text-primary"
                    style={{
                        left: `${toPercent(threshold)}%`,
                        top: "0%",
                        transform: "translateX(-50%)"
                    }}
                >
                    T
                </div>

                {/* Row labels */}
                <div className="absolute -left-2 text-xs text-muted font-mono" style={{ top: "35%", transform: "translate(-100%, -50%)" }}>
                    +
                </div>
                <div className="absolute -left-2 text-xs text-muted font-mono" style={{ top: "55%", transform: "translate(-100%, -50%)" }}>
                    −
                </div>
            </div>

            {/* Metric Bars */}
            {metrics && metrics.length > 0 && (
                <div className="grid grid-cols-2 gap-6">
                    {metrics.map((metric, idx) => (
                        <div key={metric.name} className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted">{metric.name}</span>
                                <span className="font-mono text-foreground">
                                    {(metricValues[idx] * 100).toFixed(0)}%
                                </span>
                            </div>
                            <div className="h-2 bg-surface rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${metric.color} transition-all duration-100`}
                                    style={{ width: `${metricValues[idx] * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
