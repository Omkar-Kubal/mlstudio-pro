
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
    GradientDescentOptimizerConfig,
    DescriptiveStatisticsConfig,
    PopulationSampleConfig,
    CentralTendencyConfig,
    DispersionConfig,
    ProbabilityDistributionsConfig,
    CommonDistributionsConfig,
    ConditionalProbabilityConfig,
    LawOfLargeNumbersConfig,
    PoissonDistributionConfig,
    ExponentialDistributionConfig,
    UniformDistributionConfig,
    VectorOperationsConfig,
    MatrixTransformationConfig,
    MatrixPropertiesConfig,
    LinearIndependenceConfig,
    EigenvectorsConfig,
    SVDConfig,
    ObjectiveFunctionConfig,
    GradientChainRuleConfig,
    NumpyArraysConfig,
    BroadcastingConfig,
    FancyBooleanIndexingConfig,
    MemoryLayoutConfig,
    GroupByConfig,
    RollingAverageConfig,
    MatplotlibSeabornConfig,
    ModelResultsConfig,
    DecoratorsConfig,
    GeneratorsConfig,
    ContextManagersConfig,
    MLPipelinesConfig,
    OutlierDetectionConfig,
    DataValidationConfig,
    CategoricalEncodingConfig,
    FeatureScalingConfig,
    PolynomialFeaturesConfig,
    MissingDataConfig,
    DuplicateDataConfig,
    ResidualAnalysisConfig,
    NeuralNetworkConfig,
    ActivationFunctionsConfig,
    CNNConfig,
    RNNConfig,
    AttentionConfig,
    TransformerConfig,
    DropoutBNConfig,
    TransferLearningConfig,
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
    "Imbalanced Datasets and Threshold Tuning": thresholdTuningConfig,
    "Underfitting vs Overfitting": polynomialFitConfig,
    "Decision Boundaries": boundaryMorphingConfig,
    "Classification Metrics": metricDashboardConfig,
    "K-Means Clustering": clusterFormationConfig,
    "Forward and Backward Propagation": gradientBackflowConfig,
    "Gradient Descent Algorithms": {
        id: "gradient-descent-optimizers",
        primitiveType: "gradient-descent-optimizer",
        caption: "Comparing pure Gradient Descent, Momentum, and Adam. Observe how different optimizers handle the loss landscape ravines."
    },
    "Descriptive Statistics Overview": {
        id: "descriptive-stats-evolution",
        primitiveType: "law-of-large-numbers",
        caption: "Watch how randomness convergences into a predictable truth as sample size increases."
    },
    "Population vs Sample": {
        id: "population-vs-sample-inference",
        primitiveType: "population-sample",
        caption: "You don't need to eat the whole pot of soup to know if it's salty. Observe how samples represent the truth."
    },
    "Measures of Central Tendency": {
        id: "central-tendency-balance",
        primitiveType: "central-tendency",
        caption: "Mean chases outliers; Median stays anchored. Observe the balance shift."
    },
    "Measures of Dispersion": {
        id: "dispersion-dynamics",
        primitiveType: "dispersion",
        caption: "Standard deviation defines the spread. Observe the 68-95-99.7 rule in action."
    },
    "Random Variables & Probability Distributions": {
        id: "random-variables-galton",
        primitiveType: "probability-distributions",
        caption: "Drop balls to see how individual random paths converge into a predictable bell curve."
    },
    "Common Probability Distributions": {
        id: "common-distributions-explorer",
        primitiveType: "common-distributions",
        caption: "Explore and compare the Normal, Binomial, Poisson, and Uniform distributions."
    },
    "Conditional Probability & Bayes' Theorem": {
        id: "conditional-probability-bayes",
        primitiveType: "conditional-probability",
        caption: "See how new evidence restricts the sample space and updates your belief in real-time."
    },
    "Poisson Distribution": {
        id: "poisson-distribution-sparks",
        primitiveType: "poisson-distribution",
        caption: "Count rare, independent events in a fixed interval of time or space."
    },
    "Exponential Distribution": {
        id: "exponential-distribution-waits",
        primitiveType: "exponential-distribution",
        caption: "Waiting times until the next event: modeling intervals and the memoryless property."
    },
    "Uniform Distribution": {
        id: "uniform-distribution-fairness",
        primitiveType: "uniform-distribution",
        caption: "Every outcome in the range [a, b] is equally likely: the 'ultimate fair game'."
    },
    "Vector Operations": {
        id: "vector-operations-lab",
        primitiveType: "vector-operations",
        caption: "Explore vector addition, dot products, and norms through interactive geometry."
    },
    "Matrix Transformation": {
        id: "matrix-transformation-warp",
        primitiveType: "matrix-transformation",
        caption: "Visualize how linear transformations warp the coordinate grid using unit vectors."
    },
    "Matrix Properties": {
        id: "matrix-properties-lab",
        primitiveType: "matrix-properties",
        caption: "Deep dive into transposes, inverses, and rank collapses through geometric 'undoing'."
    },
    "Linear Independence & Basis": {
        id: "linear-independence-basis",
        primitiveType: "linear-independence",
        caption: "Explore span, basis vectors, and the geometric conditions for independence."
    },
    "Eigenvalues & Eigenvectors": {
        id: "eigen-vectors-lab",
        primitiveType: "eigen-vectors",
        caption: "Discover the invariant directions and scaling factors of linear transformations."
    },
    "Singular Value Decomposition": {
        id: "svd-lab",
        primitiveType: "svd",
        caption: "Decompose any transformation into rotation, stretch, and rotation."
    },
    "The Objective Function": {
        id: "objective-function-lab",
        primitiveType: "objective-function",
        caption: "Explore landscape geometry and how gradient descent navigates local and global minima."
    },
    "Gradients and the Chain Rule": {
        id: "gradient-chain-rule-lab",
        primitiveType: "gradient-chain-rule",
        caption: "The gradient is a signpost pointing uphill. Backpropagation is the chain rule, applied layer by layer."
    },
    "NumPy Arrays & Shapes": {
        id: "numpy-arrays-shapes-lab",
        primitiveType: "numpy-arrays",
        caption: "An array is just a view of a flat line of numbers in memory. reshape() never copies data — it just re-reads."
    },
    "Array Broadcasting": {
        id: "array-broadcasting-lab",
        primitiveType: "broadcasting",
        caption: "Broadcasting lets NumPy operate on arrays of different shapes — ghost rows and columns, zero extra RAM."
    },
    "Fancy & Boolean Indexing": {
        id: "fancy-boolean-indexing-lab",
        primitiveType: "fancy-boolean-indexing",
        caption: "Boolean indexing is a filter — values that don't pass the test get ghosted. Fancy indexing picks by coordinate."
    },
    "Memory Layout (C-order vs Fortran-order)": {
        id: "memory-layout-lab",
        primitiveType: "memory-layout",
        caption: "C-order reads row-by-row; Fortran reads column-by-column. Cache efficiency depends on which axis you traverse."
    },
    "GroupBy: Split-Apply-Combine": {
        id: "groupby-lab",
        primitiveType: "groupby",
        caption: "GroupBy is like sorting legos by color, then counting how many are in each pile — split, apply, combine."
    },
    "Rolling Average": {
        id: "rolling-average-lab",
        primitiveType: "rolling-average",
        caption: "A rolling average is a moving window that smooths daily jitter to reveal the long-term signal."
    },
    "Matplotlib vs Seaborn": {
        id: "matplotlib-seaborn-lab",
        primitiveType: "matplotlib-seaborn",
        caption: "Matplotlib is a low-level paintbrush; Seaborn is a high-level camera with beauty mode for statistics."
    },
    "Visualizing Model Results": {
        id: "model-results-lab",
        primitiveType: "model-results",
        caption: "A plot isn't decoration — it's a test to see if your model sees the right patterns."
    },
    "Decorators": {
        id: "decorators-lab",
        primitiveType: "decorators",
        caption: "A decorator is a custom suit for your function — adds powers without changing the person inside."
    },
    "Generators vs Lists": {
        id: "generators-lab",
        primitiveType: "generators",
        caption: "A generator makes one item at a time — perfectly fresh. A list puts everything in your fridge at once."
    },
    "Context Managers": {
        id: "context-managers-lab",
        primitiveType: "context-managers",
        caption: "The `with` statement guarantees __exit__ is called — even on exceptions. No resource leaks."
    },
    "ML Pipelines": {
        id: "ml-pipelines-lab",
        primitiveType: "ml-pipelines",
        caption: "A pipeline is a conveyor belt — raw data in, clean prediction out, no messy glue-code."
    },
    "Outlier Detection": {
        id: "outlier-detection-lab",
        primitiveType: "outlier-detection",
        caption: "Z-score asks how far from the crowd; IQR ignores extremes and counts the middle 50%."
    },
    "Data Validation": {
        id: "data-validation-lab",
        primitiveType: "data-validation",
        caption: "Validation is the Bouncer — if your data doesn't fit the schema, it's not getting in."
    },
    "Categorical Encoding": {
        id: "categorical-encoding-lab",
        primitiveType: "categorical-encoding",
        caption: "One-Hot turns 'Color' into yes/no questions. Label encoding hopes the model doesn't think 3 > 1."
    },
    "Feature Scaling": {
        id: "feature-scaling-lab",
        primitiveType: "feature-scaling",
        caption: "Scaling makes sure salary ($) and age (yrs) speak the same language to distance-based algorithms."
    },
    "Polynomial Features": {
        id: "polynomial-features-lab",
        primitiveType: "polynomial-features",
        caption: "Polynomial features are Lenses — they let a linear model see curves by adding x², x³ as new columns."
    },
    "Handling Missing Data": {
        id: "missing-data-lab",
        primitiveType: "missing-data",
        caption: "Mean imputation kills variance; KNN respects relationships. Choose wisely."
    },
    "Duplicate Data": {
        id: "duplicate-data-lab",
        primitiveType: "duplicate-data",
        caption: "Duplicates are Echoes — they make the model hear whatever was shouted twice."
    },
    "Residual Analysis": {
        id: "residual-analysis-lab",
        primitiveType: "residual-analysis",
        caption: "Residuals are Errors. If they have a pattern, your model missed a pattern in the data."
    },
    "Feature Selection": {
        id: "feature-selection-lab",
        primitiveType: "feature-selection",
        caption: "Feature selection is Marie Kondo for your variables — only keep the ones that spark signal."
    },
    "Domain-Driven Features": {
        id: "domain-features-lab",
        primitiveType: "domain-features",
        caption: "Raw data is just facts. Domain features (like Debt-to-Income) turn facts into knowledge."
    },
    "TF-IDF Text Features": {
        id: "tfidf-lab",
        primitiveType: "tfidf",
        caption: "TF-IDF highlights words that are frequent in a document but rare across the library — identifies 'essence'."
    },
    "Image Feature Extraction with CNNs": {
        id: "cnn-features-lab",
        primitiveType: "cnn-features",
        caption: "CNNs learn Gabor filters and textures, hierarchical features that identify complex visual structures."
    },
    "Linear Regression": {
        id: "linear-regression-lab",
        primitiveType: "linear-regression",
        caption: "Linear regression draws the best-fitting line. Simple, interpretable, and powerful for trends."
    },
    "Regularization (Ridge & Lasso)": {
        id: "regularization-lab",
        primitiveType: "regularization",
        caption: "L1 (Lasso) kills weak features; L2 (Ridge) just shrinks them. Choose your weapon."
    },
    "Decision Tree Regression": {
        id: "decision-tree-lab",
        primitiveType: "decision-tree",
        caption: "Trees split data into regions. They are easy to explain but prone to overfitting without pruning."
    },
    "Random Forest Regression": {
        id: "random-forest-lab",
        primitiveType: "random-forest",
        caption: "One tree is a guess; a forest is a consensus. Ensemble methods reduce variance and improve stability."
    },
    "Gradient Boosting": {
        id: "gradient-boosting-lab",
        primitiveType: "gradient-boosting",
        caption: "Boosting builds trees sequentially, with each new tree fixing the errors of the previous ensemble."
    },
    "Support Vector Regression": {
        id: "svr-lab",
        primitiveType: "svr",
        caption: "SVR ignores small errors within a 'tube' and only penalizes points that escape it."
    },
    "KNN Regression": {
        id: "knn-regression-lab",
        primitiveType: "knn-regression",
        caption: "KNN regression predicts by averaging the outcomes of the closest k data points."
    },
    "Regression Metrics": {
        id: "regression-metrics-lab",
        primitiveType: "regression-metrics",
        caption: "MAE is the average error; RMSE is the quadratic average that heavily punishes large outliers."
    },
    "Logistic Regression": {
        id: "logistic-regression-lab",
        primitiveType: "logistic-regression",
        caption: "Logistic regression predicts probabilities using the sigmoid function to map values to [0, 1]."
    },
    "Decision Tree Classification": {
        id: "decision-tree-classification-lab",
        primitiveType: "decision-tree-classification",
        caption: "Trees split the feature space into rectangular regions based on purity metrics like Gini."
    },
    "SVM Classification": {
        id: "svm-lab",
        primitiveType: "svm",
        caption: "SVM maximizes the margin between classes, ensuring the decision boundary is as far as possible from all points."
    },
    "Naive Bayes": {
        id: "naive-bayes-lab",
        primitiveType: "naive-bayes",
        caption: "Naive Bayes uses probability and word frequencies to classify text, assuming feature independence."
    },
    "KNN Classification": {
        id: "knn-classification-lab",
        primitiveType: "knn-classification",
        caption: "Classification by majority vote: you are what your neighbors are."
    },
    "Confusion Matrix": {
        id: "confusion-matrix-lab",
        primitiveType: "confusion-matrix",
        caption: "The confusion matrix reveals the exact count of TPs, FPs, TNs, and FNs."
    },
    "ROC and AUC": {
        id: "roc-auc-lab",
        primitiveType: "roc-auc",
        caption: "ROC curves show the tradeoff between TPR and FPR across all possible decision thresholds."
    },
    "Ensemble Methods": {
        id: "ensemble-methods-lab",
        primitiveType: "ensemble-methods",
        caption: "Bagging (averaging), Boosting (sequencing), and Stacking (meta-modeling) combine learners for peak performance."
    },
    "Neural Network Architecture": {
        id: "neural-network-anatomy",
        primitiveType: "neural-network",
        caption: "NN architecture consists of layers of interconnected neurons that learn hierarchical features."
    },
    "Activation Functions": {
        id: "activation-functions-lab",
        primitiveType: "activation-functions",
        caption: "Activation functions like ReLU, Sigmoid, and Tanh introduce non-linearity, allowing NNs to learn complex curves."
    },
    "Convolution Operation": {
        id: "convolution-lab",
        primitiveType: "cnn",
        caption: "Convolution uses sliding filters to detect spatial patterns like edges and textures in images."
    },
    "Recurrent Neural Networks (RNNs)": {
        id: "rnn-lab",
        primitiveType: "rnn",
        caption: "RNNs use hidden states to maintain memory across time steps in a sequence."
    },
    "LSTMs & GRUs (Gated Memory)": {
        id: "lstm-lab",
        primitiveType: "rnn",
        caption: "LSTMs use gates to control information flow, solving the vanishing gradient problem in long sequences."
    },
    "Attention Mechanism (Self-Attention)": {
        id: "attention-lab",
        primitiveType: "attention",
        caption: "Attention allows the model to dynamically focus on the most relevant parts of the input sequence."
    },
    "The Transformer Architecture": {
        id: "transformer-lab",
        primitiveType: "transformer",
        caption: "Transformers use parallel self-attention instead of sequential processing, enabling massive scalability."
    },
    "Dropout Regularization": {
        id: "dropout-lab",
        primitiveType: "dropout-bn",
        caption: "Dropout randomly deactivates neurons during training to prevent co-adaptation and overfitting."
    },
    "Batch Normalization": {
        id: "batch-norm-lab",
        primitiveType: "dropout-bn",
        caption: "Batch Norm stabilizes training by normalizing activations within each layer."
    },
    "Transfer Learning": {
        id: "transfer-learning-lab",
        primitiveType: "transfer-learning",
        caption: "Transfer learning leverages knowledge from pretrained models to solve new tasks with less data."
    },
    "Text Preprocessing & Tokenization": {
        id: "nlp-pipeline-lab",
        primitiveType: "nlp-pipeline",
        caption: "Tokenization and cleaning turn raw text into a structured format for machine learning."
    },
    "Word Embeddings (Word2Vec & GloVe)": {
        id: "word-embedding-lab",
        primitiveType: "word-embedding",
        caption: "Word embeddings map words to high-dimensional vectors, capturing semantic relationships."
    },
    "Data Pipelines & ETL": {
        id: "mlops-pipeline-lab",
        primitiveType: "mlops",
        caption: "MLOps pipelines automate the data flow from extraction to production deployment."
    },
    "Model Training & Versioning": {
        id: "mlops-versioning-lab",
        primitiveType: "mlops",
        caption: "Versioning tracks code, data, and models to ensure reproducibility and reliability."
    },
    "Monitoring & Concept Drift": {
        id: "mlops-monitoring-lab",
        primitiveType: "mlops",
        caption: "Monitoring detects performance decay and concept drift in production models."
    },
    "Time Series Decomposition": {
        id: "timeseries-lab",
        primitiveType: "time-series",
        caption: "Time series are decomposed into trend, seasonal, and residual components."
    },
    "Statistically Outlier Detection": {
        id: "anomaly-detection-lab",
        primitiveType: "anomaly-detection",
        caption: "Anomaly detection identifies rare events or observations that deviate significantly from the norm."
    },
    "Recommender Systems": {
        id: "recommender-lab",
        primitiveType: "recommender",
        caption: "Recommenders predict user preferences based on interaction history and item content."
    },
    "AI Ethics & Fairness": {
        id: "ai-ethics-lab",
        primitiveType: "ai-ethics",
        caption: "Fairness mitigation strategies address bias in data and algorithms to ensure equitable outcomes."
    }
};

/**
 * Get config for a topic title
 */
export function getVisualConfig(topicTitle: string): VisualConfig | null {
    return visualConfigs[topicTitle] || null;
}





