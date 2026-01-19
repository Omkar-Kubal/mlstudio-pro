/**
 * Configuration types for visual primitives
 * 
 * Rules:
 * - All fields serializable (no functions)
 * - No topic-specific assumptions
 */

// ============================================
// Parameter Sensitivity Primitive Config
// ============================================

export interface ParameterSensitivityConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Slider configuration */
    slider: SliderConfig;

    /** Axis configuration */
    axis: AxisConfig;

    /** Visualization mode */
    mode: "mean-median" | "threshold-classification";

    /** Data points (mode-specific structure) */
    data: MeanMedianData | ThresholdData;

    /** Metric bars to display (optional) */
    metrics?: MetricConfig[];

    /** Caption text */
    caption: string;
}

export interface SliderConfig {
    label: string;
    min: number;
    max: number;
    step: number;
    initial: number;
    format: "integer" | "decimal";
}

export interface AxisConfig {
    min: number;
    max: number;
    showMidpoint?: boolean;
}

export interface MeanMedianData {
    type: "mean-median";
    basePoints: number[];
}

export interface ThresholdData {
    type: "threshold-classification";
    points: Array<{
        probability: number;
        actualLabel: 0 | 1;
    }>;
}

export interface MetricConfig {
    name: string;
    color: string;
}

// ============================================
// Fit Progression Primitive Config
// ============================================

export interface FitProgressionConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Primitive type discriminator */
    primitiveType: "fit-progression";

    /** Slider configuration */
    slider: {
        label: string;
        min: number;
        max: number;
        step: number;
        initial: number;
        inverted?: boolean;  // true for KNN where low = overfit
    };

    /** Visualization mode */
    mode: "polynomial-regression" | "decision-boundary";

    /** Data points for visualization */
    data: {
        trainPoints: Array<{ x: number; y: number }>;
        testPoints: Array<{ x: number; y: number }>;
    };

    /** Caption text */
    caption: string;
}

// ============================================
// Distribution Evolution Primitive Config
// ============================================

export interface DistributionEvolutionConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Primitive type discriminator */
    primitiveType: "distribution-evolution";

    /** Slider configuration */
    slider: {
        label: string;
        min: number;
        max: number;
        step: number;
        initial: number;
    };

    /** Distribution mode */
    mode: "sample-size" | "outlier-effect" | "scaling" | "skew";

    /** Base distribution parameters */
    distribution: {
        type: "normal" | "uniform" | "skewed";
        mean: number;
        std: number;
        skew?: number;
    };

    /** Visual options */
    showMean: boolean;
    showMedian: boolean;
    showSpread: boolean;

    /** Secondary toggle (optional) */
    secondaryToggle?: {
        label: string;
        options: [string, string];
        initial: 0 | 1;
    };

    /** Caption text */
    caption: string;
}

// ============================================
// Boundary Morphing Primitive Config
// ============================================

export interface BoundaryMorphingConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Primitive type discriminator */
    primitiveType: "boundary-morphing";

    /** Slider configuration (Flexibility control) */
    slider: {
        label: string;
        min: number;
        max: number;
        step: number;
        initial: number;
        inverted?: boolean;  // true for KNN where high K = smooth
    };

    /** Model type for boundary computation */
    mode: "knn" | "polynomial" | "rbf";

    /** Data points */
    data: {
        points: Array<{ x: number; y: number; classLabel: 0 | 1 }>;
    };

    /** Visual options */
    showProbabilityGradient: boolean;

    /** Secondary toggle (optional) */
    secondaryToggle?: {
        label: string;
        options: [string, string];
        initial: 0 | 1;
    };

    /** Caption text */
    caption: string;
}

// ============================================
// Metric Dashboard Primitive Config
// ============================================

export interface MetricDashboardConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Primitive type discriminator */
    primitiveType: "metric-dashboard";

    /** Threshold slider configuration */
    slider: {
        label: string;
        min: number;
        max: number;
        step: number;
        initial: number;
    };

    /** Prediction data */
    data: {
        predictions: Array<{
            probability: number;
            actualLabel: 0 | 1;
        }>;
    };

    /** Metrics to display (max 6) */
    metrics: Array<"accuracy" | "precision" | "recall" | "f1" | "specificity" | "auc">;

    /** Curve view toggle */
    secondaryToggle?: {
        label: string;
        options: [string, string];
        initial: 0 | 1;
    };

    /** Caption text */
    caption: string;
}

// ============================================
// Cluster Formation Primitive Config
// ============================================

export interface ClusterFormationConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Primitive type discriminator */
    primitiveType: "cluster-formation";

    /** K slider configuration */
    slider: {
        label: string;
        min: number;
        max: number;
        step: number;
        initial: number;
    };

    /** Data points */
    data: {
        points: Array<{ x: number; y: number }>;
    };

    /** Show Voronoi regions */
    showVoronoi: boolean;

    /** Show inertia metric */
    showInertia: boolean;

    /** Caption text */
    caption: string;
}

// ============================================
// Network Forward Pass Primitive Config
// ============================================

export interface NetworkForwardPassConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Primitive type discriminator */
    primitiveType: "network-forward-pass";

    /** Input slider configuration */
    slider: {
        label: string;
        min: number;
        max: number;
        step: number;
        initial: number;
    };

    /** Network architecture (nodes per layer) */
    architecture: number[];

    /** Pre-defined weights (layer → from → to) */
    weights: number[][][];

    /** Activation function options */
    activations: Array<"linear" | "relu" | "sigmoid" | "tanh" | "leaky-relu">;

    /** Initial activation function */
    initialActivation: "linear" | "relu" | "sigmoid" | "tanh" | "leaky-relu";

    /** Caption text */
    caption: string;
}

// ============================================
// Gradient Backflow Primitive Config
// ============================================

export interface GradientBackflowConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Primitive type discriminator */
    primitiveType: "gradient-backflow";

    /** Error slider configuration */
    slider: {
        label: string;
        min: number;
        max: number;
        step: number;
        initial: number;
    };

    /** Network architecture (nodes per layer) */
    architecture: number[];

    /** Pre-defined weights (layer → from → to) */
    weights: number[][][];

    /** Activation function options */
    activations: Array<"linear" | "relu" | "sigmoid" | "tanh">;

    /** Initial activation function */
    initialActivation: "linear" | "relu" | "sigmoid" | "tanh";

    /** Caption text */
    caption: string;
}

// ============================================
// Config Registry Type
// ============================================

export type VisualConfig = ParameterSensitivityConfig | FitProgressionConfig | DistributionEvolutionConfig | BoundaryMorphingConfig | MetricDashboardConfig | ClusterFormationConfig | NetworkForwardPassConfig | GradientBackflowConfig;
export type VisualConfigRegistry = Record<string, VisualConfig>;






