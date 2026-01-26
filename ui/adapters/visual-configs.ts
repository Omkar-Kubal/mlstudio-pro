/**
 * Visual configuration registry
 * 
 * Contains configs for all visual primitives.
 * Topic → Config mapping happens in TopicRenderer.
 */

import type {
    ParameterSensitivityConfig,
    FitProgressionConfig,
    DistributionEvolutionConfig,
    BoundaryMorphingConfig,
    MetricDashboardConfig,
    ClusterFormationConfig,
    NetworkForwardPassConfig,
    GradientBackflowConfig,
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
// Distribution Evolution Config (Phase 1)
// ============================================

export const distributionEvolutionConfig: DistributionEvolutionConfig = {
    id: "distribution-evolution",

    primitiveType: "distribution-evolution",

    slider: {
        label: "Sample Size (n)",
        min: 5,
        max: 500,
        step: 5,
        initial: 20
    },

    mode: "sample-size",

    distribution: {
        type: "normal",
        mean: 50,
        std: 15
    },

    showMean: true,
    showMedian: true,
    showSpread: true,

    secondaryToggle: {
        label: "View",
        options: ["Histogram", "Density"],
        initial: 0
    },

    caption: "Drag the slider to see how sample size affects distribution shape. Watch the histogram smooth into a density curve."
};

// ============================================
// Boundary Morphing Config (Phase 3)
// ============================================

export const boundaryMorphingConfig: BoundaryMorphingConfig = {
    id: "boundary-morphing",

    primitiveType: "boundary-morphing",

    slider: {
        label: "Neighbors (K)",
        min: 1,
        max: 25,
        step: 2,
        initial: 5,
        inverted: true  // High K = smooth boundary
    },

    mode: "knn",

    data: {
        points: [
            // Class 0 cluster (Blue) - bottom-left
            { x: 0.15, y: 0.75, classLabel: 0 },
            { x: 0.22, y: 0.82, classLabel: 0 },
            { x: 0.18, y: 0.68, classLabel: 0 },
            { x: 0.28, y: 0.78, classLabel: 0 },
            { x: 0.25, y: 0.70, classLabel: 0 },
            { x: 0.12, y: 0.72, classLabel: 0 },
            { x: 0.20, y: 0.85, classLabel: 0 },
            { x: 0.30, y: 0.65, classLabel: 0 },
            { x: 0.35, y: 0.72, classLabel: 0 },
            { x: 0.22, y: 0.62, classLabel: 0 },
            // Class 0 outliers
            { x: 0.55, y: 0.45, classLabel: 0 },
            { x: 0.42, y: 0.55, classLabel: 0 },

            // Class 1 cluster (Orange) - top-right
            { x: 0.75, y: 0.25, classLabel: 1 },
            { x: 0.82, y: 0.20, classLabel: 1 },
            { x: 0.70, y: 0.30, classLabel: 1 },
            { x: 0.78, y: 0.35, classLabel: 1 },
            { x: 0.85, y: 0.28, classLabel: 1 },
            { x: 0.72, y: 0.18, classLabel: 1 },
            { x: 0.88, y: 0.22, classLabel: 1 },
            { x: 0.68, y: 0.38, classLabel: 1 },
            { x: 0.80, y: 0.15, classLabel: 1 },
            { x: 0.65, y: 0.28, classLabel: 1 },
            // Class 1 outliers
            { x: 0.45, y: 0.52, classLabel: 1 },
            { x: 0.52, y: 0.42, classLabel: 1 }
        ]
    },

    showProbabilityGradient: false,

    secondaryToggle: {
        label: "Boundary Style",
        options: ["Hard Boundary", "Probability Gradient"],
        initial: 0
    },

    caption: "Drag the slider to see how K affects the decision boundary. Low K = fragmented islands. High K = smooth regions."
};

// ============================================
// Metric Dashboard Config (Phase 4)
// ============================================

export const metricDashboardConfig: MetricDashboardConfig = {
    id: "metric-dashboard",

    primitiveType: "metric-dashboard",

    slider: {
        label: "Decision Threshold",
        min: 0,
        max: 1,
        step: 0.01,
        initial: 0.5
    },

    data: {
        predictions: [
            // True positives cluster (high prob, actual = 1)
            { probability: 0.95, actualLabel: 1 },
            { probability: 0.92, actualLabel: 1 },
            { probability: 0.88, actualLabel: 1 },
            { probability: 0.85, actualLabel: 1 },
            { probability: 0.82, actualLabel: 1 },
            { probability: 0.78, actualLabel: 1 },
            { probability: 0.75, actualLabel: 1 },
            { probability: 0.72, actualLabel: 1 },
            { probability: 0.68, actualLabel: 1 },
            { probability: 0.65, actualLabel: 1 },
            // Borderline positives
            { probability: 0.58, actualLabel: 1 },
            { probability: 0.52, actualLabel: 1 },
            { probability: 0.48, actualLabel: 1 },
            { probability: 0.42, actualLabel: 1 },
            { probability: 0.38, actualLabel: 1 },
            // True negatives cluster (low prob, actual = 0)
            { probability: 0.05, actualLabel: 0 },
            { probability: 0.08, actualLabel: 0 },
            { probability: 0.12, actualLabel: 0 },
            { probability: 0.15, actualLabel: 0 },
            { probability: 0.18, actualLabel: 0 },
            { probability: 0.22, actualLabel: 0 },
            { probability: 0.25, actualLabel: 0 },
            { probability: 0.28, actualLabel: 0 },
            { probability: 0.32, actualLabel: 0 },
            { probability: 0.35, actualLabel: 0 },
            // Borderline negatives (some overlap)
            { probability: 0.42, actualLabel: 0 },
            { probability: 0.48, actualLabel: 0 },
            { probability: 0.55, actualLabel: 0 },
            { probability: 0.62, actualLabel: 0 },
            { probability: 0.68, actualLabel: 0 }
        ]
    },

    metrics: ["accuracy", "precision", "recall", "f1"],

    secondaryToggle: {
        label: "Curve",
        options: ["ROC", "PR"],
        initial: 0
    },

    caption: "Drag the threshold to see how it affects the precision-recall tradeoff. Watch the confusion matrix cells animate."
};

// ============================================
// Cluster Formation Config (Phase 5)
// ============================================

export const clusterFormationConfig: ClusterFormationConfig = {
    id: "cluster-formation",

    primitiveType: "cluster-formation",

    slider: {
        label: "Number of Clusters (K)",
        min: 2,
        max: 8,
        step: 1,
        initial: 3
    },

    data: {
        points: [
            // Cluster 1 (bottom-left)
            { x: 0.15, y: 0.75 }, { x: 0.20, y: 0.80 }, { x: 0.18, y: 0.70 },
            { x: 0.25, y: 0.78 }, { x: 0.12, y: 0.72 }, { x: 0.22, y: 0.85 },
            { x: 0.28, y: 0.68 }, { x: 0.16, y: 0.82 }, { x: 0.23, y: 0.73 },
            { x: 0.19, y: 0.76 }, { x: 0.14, y: 0.79 }, { x: 0.26, y: 0.74 },
            // Cluster 2 (bottom-right)
            { x: 0.75, y: 0.75 }, { x: 0.80, y: 0.80 }, { x: 0.78, y: 0.70 },
            { x: 0.85, y: 0.78 }, { x: 0.72, y: 0.72 }, { x: 0.82, y: 0.85 },
            { x: 0.88, y: 0.68 }, { x: 0.76, y: 0.82 }, { x: 0.83, y: 0.73 },
            { x: 0.79, y: 0.76 }, { x: 0.74, y: 0.79 }, { x: 0.86, y: 0.74 },
            // Cluster 3 (top-center)
            { x: 0.45, y: 0.20 }, { x: 0.50, y: 0.25 }, { x: 0.48, y: 0.15 },
            { x: 0.55, y: 0.22 }, { x: 0.42, y: 0.18 }, { x: 0.52, y: 0.28 },
            { x: 0.58, y: 0.12 }, { x: 0.46, y: 0.24 }, { x: 0.53, y: 0.17 },
            { x: 0.49, y: 0.21 }, { x: 0.44, y: 0.23 }, { x: 0.56, y: 0.19 }
        ]
    },

    showVoronoi: true,

    showInertia: true,

    caption: "Drag the K slider to see how cluster count affects grouping. Watch centroids drift to their cluster centers."
};

// ============================================
// Network Forward Pass Config (Phase 6)
// ============================================

export const networkForwardPassConfig: NetworkForwardPassConfig = {
    id: "network-forward-pass",

    primitiveType: "network-forward-pass",

    slider: {
        label: "Input Value",
        min: -2,
        max: 2,
        step: 0.1,
        initial: 0
    },

    // 2 inputs → 4 hidden → 2 outputs
    architecture: [2, 4, 2],

    // Weights: layer 0→1 (2×4), layer 1→2 (4×2)
    weights: [
        // Input to Hidden (2 inputs → 4 hidden nodes)
        [
            [0.8, -0.5, 0.3, 0.9],   // from input 0
            [-0.4, 0.7, -0.6, 0.2]  // from input 1
        ],
        // Hidden to Output (4 hidden → 2 outputs)
        [
            [0.6, -0.3],   // from hidden 0
            [-0.5, 0.8],   // from hidden 1
            [0.4, 0.5],    // from hidden 2
            [-0.2, 0.7]    // from hidden 3
        ]
    ],

    activations: ["relu", "sigmoid", "tanh", "linear", "leaky-relu"],

    initialActivation: "relu",

    caption: "Move the input slider to see how values propagate through the network. Toggle activation functions to observe different behaviors."
};

// ============================================
// Gradient Backflow Config (Phase 7)
// ============================================

export const gradientBackflowConfig: GradientBackflowConfig = {
    id: "gradient-backflow",

    primitiveType: "gradient-backflow",

    slider: {
        label: "Output Error",
        min: 0.1,
        max: 2.0,
        step: 0.1,
        initial: 1.0
    },

    // 2 inputs → 4 hidden → 4 hidden → 2 outputs (4 layers for vanishing demonstration)
    architecture: [2, 4, 4, 2],

    weights: [
        // Input to Hidden 1
        [
            [0.7, -0.5, 0.4, 0.8],
            [-0.3, 0.6, -0.5, 0.3]
        ],
        // Hidden 1 to Hidden 2
        [
            [0.6, -0.4, 0.3, 0.5],
            [-0.5, 0.7, -0.4, 0.2],
            [0.4, -0.3, 0.6, -0.5],
            [-0.2, 0.5, -0.3, 0.4]
        ],
        // Hidden 2 to Output
        [
            [0.8, -0.4],
            [-0.5, 0.7],
            [0.3, 0.5],
            [-0.4, 0.6]
        ]
    ],

    activations: ["sigmoid", "relu", "tanh", "linear"],

    initialActivation: "sigmoid",

    caption: "Move the error slider to see how gradients flow backward. Sigmoid causes vanishing gradients; ReLU preserves flow (but can have dead neurons)."
};

// ============================================
// Config Registry (by topic title)
// ============================================

export const visualConfigs: VisualConfigRegistry = {
    "Measures of Central Tendency": meanSensitivityConfig,
    "Imbalanced Datasets and Threshold Tuning": thresholdTuningConfig,
    "Underfitting vs Overfitting": polynomialFitConfig,
    "Distributions and Data Shapes": distributionEvolutionConfig,
    "Decision Boundaries": boundaryMorphingConfig,
    "Model Evaluation Metrics": metricDashboardConfig,
    "Clustering Algorithms": clusterFormationConfig,
    "Neural Network Basics": networkForwardPassConfig,
    "Backpropagation and Gradients": gradientBackflowConfig
};

/**
 * Get config for a topic title
 */
export function getVisualConfig(topicTitle: string): VisualConfig | null {
    return visualConfigs[topicTitle] || null;
}





