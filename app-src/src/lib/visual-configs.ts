/**
 * Visual configuration registry
 * 
 * Contains configs for all visual primitives.
 * Topic → Config mapping happens in TopicRenderer.
 */

import type {
    ParameterSensitivityConfig,
    FitProgressionConfig,
    VisualConfig,
    VisualConfigRegistry
} from "./visual-types";

// ============================================
// Mean Sensitivity Config (Pilot #1)
// ============================================

export const meanSensitivityConfig: ParameterSensitivityConfig = {
    id: "mean-sensitivity",

    slider: {
        label: "Outlier value",
        min: 10,
        max: 120,
        step: 1,
        initial: 50,
        format: "integer"
    },

    axis: {
        min: 10,
        max: 120,
        showMidpoint: false
    },

    mode: "mean-median",

    data: {
        type: "mean-median",
        basePoints: [
            32, 35, 37, 38, 40, 41, 42, 43, 44, 45,
            46, 47, 48, 49, 50, 51, 52, 53, 55, 58
        ]
    },

    metrics: undefined,

    caption: "Drag the slider to see how the mean responds to outliers while the median stays stable."
};

// ============================================
// Threshold Tuning Config (Pilot #2)
// ============================================

export const thresholdTuningConfig: ParameterSensitivityConfig = {
    id: "threshold-tuning",

    slider: {
        label: "Classification threshold",
        min: 0,
        max: 1,
        step: 0.01,
        initial: 0.5,
        format: "decimal"
    },

    axis: {
        min: 0,
        max: 1,
        showMidpoint: true
    },

    mode: "threshold-classification",

    data: {
        type: "threshold-classification",
        points: [
            // True positives cluster (high prob, actual = 1)
            { probability: 0.92, actualLabel: 1 },
            { probability: 0.88, actualLabel: 1 },
            { probability: 0.85, actualLabel: 1 },
            { probability: 0.82, actualLabel: 1 },
            { probability: 0.78, actualLabel: 1 },
            { probability: 0.75, actualLabel: 1 },
            { probability: 0.71, actualLabel: 1 },
            { probability: 0.68, actualLabel: 1 },
            // Borderline positives
            { probability: 0.62, actualLabel: 1 },
            { probability: 0.55, actualLabel: 1 },
            { probability: 0.48, actualLabel: 1 },
            { probability: 0.42, actualLabel: 1 },
            // True negatives cluster (low prob, actual = 0)
            { probability: 0.08, actualLabel: 0 },
            { probability: 0.12, actualLabel: 0 },
            { probability: 0.15, actualLabel: 0 },
            { probability: 0.18, actualLabel: 0 },
            { probability: 0.22, actualLabel: 0 },
            { probability: 0.25, actualLabel: 0 },
            { probability: 0.28, actualLabel: 0 },
            { probability: 0.32, actualLabel: 0 },
            // Borderline negatives
            { probability: 0.38, actualLabel: 0 },
            { probability: 0.45, actualLabel: 0 },
            { probability: 0.52, actualLabel: 0 },
            { probability: 0.58, actualLabel: 0 }
        ]
    },

    metrics: [
        { name: "Precision", color: "bg-blue-500" },
        { name: "Recall", color: "bg-orange-500" }
    ],

    caption: "Drag the slider to see how the threshold affects predictions and the precision–recall tradeoff."
};

// ============================================
// Polynomial Fit Progression Config
// ============================================

export const polynomialFitConfig: FitProgressionConfig = {
    id: "polynomial-fit",

    primitiveType: "fit-progression",

    slider: {
        label: "Polynomial Degree",
        min: 1,
        max: 12,
        step: 1,
        initial: 1
    },

    mode: "polynomial-regression",

    data: {
        // Synthetic sine-like curve with noise (normalized to 0-1)
        trainPoints: [
            { x: 0.05, y: 0.15 },
            { x: 0.10, y: 0.28 },
            { x: 0.15, y: 0.35 },
            { x: 0.20, y: 0.45 },
            { x: 0.25, y: 0.52 },
            { x: 0.30, y: 0.58 },
            { x: 0.35, y: 0.62 },
            { x: 0.40, y: 0.65 },
            { x: 0.45, y: 0.66 },
            { x: 0.50, y: 0.65 },
            { x: 0.55, y: 0.62 },
            { x: 0.60, y: 0.58 },
            { x: 0.65, y: 0.52 },
            { x: 0.70, y: 0.45 },
            { x: 0.75, y: 0.38 },
            { x: 0.80, y: 0.30 },
            { x: 0.85, y: 0.22 },
            { x: 0.90, y: 0.18 },
            { x: 0.95, y: 0.12 }
        ],
        testPoints: [
            { x: 0.08, y: 0.22 },
            { x: 0.18, y: 0.40 },
            { x: 0.28, y: 0.56 },
            { x: 0.38, y: 0.64 },
            { x: 0.48, y: 0.66 },
            { x: 0.58, y: 0.60 },
            { x: 0.68, y: 0.48 },
            { x: 0.78, y: 0.34 },
            { x: 0.88, y: 0.20 }
        ]
    },

    caption: "Drag the slider to see how polynomial degree affects model fit. Watch train/test error diverge when overfitting."
};

// ============================================
// Config Registry (by topic title)
// ============================================

export const visualConfigs: VisualConfigRegistry = {
    "Measures of Central Tendency": meanSensitivityConfig,
    "Imbalanced Datasets and Threshold Tuning": thresholdTuningConfig,
    "Underfitting vs Overfitting": polynomialFitConfig
};

/**
 * Get config for a topic title
 */
export function getVisualConfig(topicTitle: string): VisualConfig | null {
    return visualConfigs[topicTitle] || null;
}

