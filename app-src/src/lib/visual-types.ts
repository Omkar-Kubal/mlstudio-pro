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
// Config Registry Type
// ============================================

export type VisualConfig = ParameterSensitivityConfig | FitProgressionConfig;
export type VisualConfigRegistry = Record<string, VisualConfig>;

