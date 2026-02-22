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
// Gradient Descent Optimizer Primitive Config
// ============================================

export interface GradientDescentOptimizerConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Primitive type discriminator */
    primitiveType: "gradient-descent-optimizer";

    /** Caption text */
    caption: string;
}

// ============================================
// Descriptive Statistics Primitive Config
// ============================================

export interface DescriptiveStatisticsConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Primitive type discriminator */
    primitiveType: "descriptive-statistics";

    /** Caption text */
    caption: string;
}

// ============================================
// Population Sample Primitive Config
// ============================================

export interface PopulationSampleConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Primitive type discriminator */
    primitiveType: "population-sample";

    /** Caption text */
    caption: string;
}

// ============================================
// Central Tendency Primitive Config
// ============================================

export interface CentralTendencyConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Primitive type discriminator */
    primitiveType: "central-tendency";

    /** Caption text */
    caption: string;
}

// ============================================
// Dispersion Primitive Config
// ============================================

export interface DispersionConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Primitive type discriminator */
    primitiveType: "dispersion";

    /** Caption text */
    caption: string;
}

// ============================================
// Probability Distributions Primitive Config
// ============================================

export interface ProbabilityDistributionsConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Primitive type discriminator */
    primitiveType: "probability-distributions";

    /** Caption text */
    caption: string;
}

// ============================================
// Common Distributions Primitive Config
// ============================================

export interface CommonDistributionsConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Primitive type discriminator */
    primitiveType: "common-distributions";

    /** Caption text */
    caption: string;
}

// ============================================
// Conditional Probability Primitive Config
// ============================================

export interface ConditionalProbabilityConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Primitive type discriminator */
    primitiveType: "conditional-probability";

    /** Caption text */
    caption: string;
}

// ============================================
// Law of Large Numbers Primitive Config
// ============================================

export interface LawOfLargeNumbersConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Primitive type discriminator */
    primitiveType: "law-of-large-numbers";

    /** Caption text */
    caption: string;
}

// ============================================
// Poisson Distribution Primitive Config
// ============================================

export interface PoissonDistributionConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Primitive type discriminator */
    primitiveType: "poisson-distribution";

    /** Caption text */
    caption: string;
}

// ============================================
// Exponential Distribution Primitive Config
// ============================================

export interface ExponentialDistributionConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Primitive type discriminator */
    primitiveType: "exponential-distribution";

    /** Caption text */
    caption: string;
}

// ============================================
// Uniform Distribution Primitive Config
// ============================================

export interface UniformDistributionConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Primitive type discriminator */
    primitiveType: "uniform-distribution";

    /** Caption text */
    caption: string;
}

// ============================================
// Vector Operations Primitive Config
// ============================================

export interface VectorOperationsConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Primitive type discriminator */
    primitiveType: "vector-operations";

    /** Caption text */
    caption: string;
}

// ============================================
// Matrix Transformation Primitive Config
// ============================================

export interface MatrixTransformationConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Primitive type discriminator */
    primitiveType: "matrix-transformation";

    /** Caption text */
    caption: string;
}

// ============================================
// Matrix Properties Primitive Config
// ============================================

export interface MatrixPropertiesConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Primitive type discriminator */
    primitiveType: "matrix-properties";

    /** Caption text */
    caption: string;
}

// ============================================
// Linear Independence Primitive Config
// ============================================

export interface LinearIndependenceConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Primitive type discriminator */
    primitiveType: "linear-independence";

    /** Caption text */
    caption: string;
}

// ============================================
// Eigenvectors Primitive Config
// ============================================

export interface EigenvectorsConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Primitive type discriminator */
    primitiveType: "eigen-vectors";

    /** Caption text */
    caption: string;
}

// ============================================
// SVD Primitive Config
// ============================================

export interface SVDConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Primitive type discriminator */
    primitiveType: "svd";

    /** Caption text */
    caption: string;
}

// ============================================
// Objective Function Primitive Config
// ============================================

export interface ObjectiveFunctionConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Primitive type discriminator */
    primitiveType: "objective-function";

    /** Caption text */
    caption: string;
}

// ============================================
// Gradient Chain Rule Primitive Config
// ============================================

export interface GradientChainRuleConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Primitive type discriminator */
    primitiveType: "gradient-chain-rule";

    /** Caption text */
    caption: string;
}

// ============================================
// NumPy Arrays & Shapes Primitive Config
// ============================================

export interface NumpyArraysConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Primitive type discriminator */
    primitiveType: "numpy-arrays";

    /** Caption text */
    caption: string;
}

// ============================================
// Broadcasting Primitive Config
// ============================================

export interface BroadcastingConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Primitive type discriminator */
    primitiveType: "broadcasting";

    /** Caption text */
    caption: string;
}

// ============================================
// Fancy & Boolean Indexing Primitive Config
// ============================================

export interface FancyBooleanIndexingConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Primitive type discriminator */
    primitiveType: "fancy-boolean-indexing";

    /** Caption text */
    caption: string;
}

// ============================================
// Memory Layout Primitive Config
// ============================================

export interface MemoryLayoutConfig {
    /** Unique identifier for this visualization */
    id: string;

    /** Primitive type discriminator */
    primitiveType: "memory-layout";

    /** Caption text */
    caption: string;
}

// ============================================
// GroupBy Primitive Config
// ============================================

export interface GroupByConfig {
    id: string;
    primitiveType: "groupby";
    caption: string;
}

// ============================================
// Rolling Average Primitive Config
// ============================================

export interface RollingAverageConfig {
    id: string;
    primitiveType: "rolling-average";
    caption: string;
}

// ============================================
// Matplotlib vs Seaborn Primitive Config
// ============================================

export interface MatplotlibSeabornConfig {
    id: string;
    primitiveType: "matplotlib-seaborn";
    caption: string;
}

// ============================================
// Model Results Primitive Config
// ============================================
export interface ModelResultsConfig { id: string; primitiveType: "model-results"; caption: string; }

// ============================================
// Decorators Primitive Config
// ============================================
export interface DecoratorsConfig { id: string; primitiveType: "decorators"; caption: string; }

// ============================================
// Generators Primitive Config
// ============================================
export interface GeneratorsConfig { id: string; primitiveType: "generators"; caption: string; }

// ============================================
// Context Managers Primitive Config
// ============================================
export interface ContextManagersConfig { id: string; primitiveType: "context-managers"; caption: string; }

// ============================================
// ML Pipelines Primitive Config
// ============================================
export interface MLPipelinesConfig { id: string; primitiveType: "ml-pipelines"; caption: string; }

// ============================================
// Outlier Detection Primitive Config
// ============================================
export interface OutlierDetectionConfig { id: string; primitiveType: "outlier-detection"; caption: string; }

// ============================================
// Data Validation Primitive Config
// ============================================
export interface DataValidationConfig { id: string; primitiveType: "data-validation"; caption: string; }

// ============================================
// Categorical Encoding Primitive Config
// ============================================
export interface CategoricalEncodingConfig { id: string; primitiveType: "categorical-encoding"; caption: string; }

// ============================================
// Feature Scaling Primitive Config
// ============================================
export interface FeatureScalingConfig { id: string; primitiveType: "feature-scaling"; caption: string; }

// ============================================
// Polynomial Features Primitive Config
// ============================================
export interface PolynomialFeaturesConfig { id: string; primitiveType: "polynomial-features"; caption: string; }

// ============================================
// Missing Data Primitive Config
// ============================================
export interface MissingDataConfig { id: string; primitiveType: "missing-data"; caption: string; }

// ============================================
// Duplicate Data Primitive Config
// ============================================
export interface DuplicateDataConfig { id: string; primitiveType: "duplicate-data"; caption: string; }

// ============================================
// Residual Analysis Primitive Config
// ============================================
export interface ResidualAnalysisConfig { id: string; primitiveType: "residual-analysis"; caption: string; }

// ============================================
// Feature Selection Primitive Config
// ============================================
export interface FeatureSelectionConfig { id: string; primitiveType: "feature-selection"; caption: string; }

// ============================================
// Domain Features Primitive Config
// ============================================
export interface DomainFeaturesConfig { id: string; primitiveType: "domain-features"; caption: string; }

// ============================================
// TF-IDF Primitive Config
// ============================================
export interface TFIDFConfig { id: string; primitiveType: "tfidf"; caption: string; }

// ============================================
// CNN Features Primitive Config
// ============================================
export interface CNNFeaturesConfig { id: string; primitiveType: "cnn-features"; caption: string; }

// ============================================
// Linear Regression Primitive Config
// ============================================
export interface LinearRegressionConfig { id: string; primitiveType: "linear-regression"; caption: string; }

// ============================================
// Regularization Primitive Config
// ============================================
export interface RegularizationConfig { id: string; primitiveType: "regularization"; caption: string; }

// ============================================
// Decision Tree Primitive Config
// ============================================
export interface DecisionTreeConfig { id: string; primitiveType: "decision-tree"; caption: string; }

// ============================================
// Random Forest Primitive Config
// ============================================
export interface RandomForestConfig { id: string; primitiveType: "random-forest"; caption: string; }

// ============================================
// Gradient Boosting Primitive Config
// ============================================
export interface GradientBoostingConfig { id: string; primitiveType: "gradient-boosting"; caption: string; }

// ============================================
// SVR Primitive Config
// = ============================================
export interface SVRConfig { id: string; primitiveType: "svr"; caption: string; }

// ============================================
// KNN Regression Primitive Config
// ============================================
export interface KNNRegressionConfig { id: string; primitiveType: "knn-regression"; caption: string; }

// ============================================
// Regression Metrics Primitive Config
// ============================================
export interface RegressionMetricsConfig { id: string; primitiveType: "regression-metrics"; caption: string; }

// ============================================
// Logistic Regression Primitive Config
// ============================================
export interface LogisticRegressionConfig { id: string; primitiveType: "logistic-regression"; caption: string; }

// ============================================
// Decision Tree Classification Primitive Config
// ============================================
export interface DecisionTreeClassificationConfig { id: string; primitiveType: "decision-tree-classification"; caption: string; }

// ============================================
// SVM Primitive Config
// ============================================
export interface SVMConfig { id: string; primitiveType: "svm"; caption: string; }

// ============================================
// Naive Bayes Primitive Config
// ============================================
export interface NaiveBayesConfig { id: string; primitiveType: "naive-bayes"; caption: string; }

// ============================================
// KNN Classification Primitive Config
// ============================================
export interface KNNClassificationConfig { id: string; primitiveType: "knn-classification"; caption: string; }

// ============================================
// Confusion Matrix Primitive Config
// ============================================
export interface ConfusionMatrixConfig { id: string; primitiveType: "confusion-matrix"; caption: string; }

// ============================================
// ROC AUC Primitive Config
// ============================================
export interface ROCAUCConfig { id: string; primitiveType: "roc-auc"; caption: string; }

// ============================================
// Ensemble Methods Primitive Config
// ============================================
export interface EnsembleMethodsConfig { id: string; primitiveType: "ensemble-methods"; caption: string; }

export type VisualConfig =
    | ParameterSensitivityConfig
    | FitProgressionConfig
    | DistributionEvolutionConfig
    | BoundaryMorphingConfig
    | MetricDashboardConfig
    | ClusterFormationConfig
    | NetworkForwardPassConfig
    | GradientBackflowConfig
    | GradientDescentOptimizerConfig
    | DescriptiveStatisticsConfig
    | PopulationSampleConfig
    | CentralTendencyConfig
    | DispersionConfig
    | ProbabilityDistributionsConfig
    | CommonDistributionsConfig
    | ConditionalProbabilityConfig
    | LawOfLargeNumbersConfig
    | PoissonDistributionConfig
    | ExponentialDistributionConfig
    | UniformDistributionConfig
    | VectorOperationsConfig
    | MatrixTransformationConfig
    | MatrixPropertiesConfig
    | LinearIndependenceConfig
    | EigenvectorsConfig
    | SVDConfig
    | ObjectiveFunctionConfig
    | GradientChainRuleConfig
    | NumpyArraysConfig
    | BroadcastingConfig
    | FancyBooleanIndexingConfig
    | MemoryLayoutConfig
    | GroupByConfig
    | RollingAverageConfig
    | MatplotlibSeabornConfig
    | ModelResultsConfig
    | DecoratorsConfig
    | GeneratorsConfig
    | ContextManagersConfig
    | MLPipelinesConfig
    | OutlierDetectionConfig
    | DataValidationConfig
    | CategoricalEncodingConfig
    | FeatureScalingConfig
    | PolynomialFeaturesConfig
    | MissingDataConfig
    | DuplicateDataConfig
    | ResidualAnalysisConfig
    | FeatureSelectionConfig
    | DomainFeaturesConfig
    | TFIDFConfig
    | CNNFeaturesConfig
    | LinearRegressionConfig
    | RegularizationConfig
    | DecisionTreeConfig
    | RandomForestConfig
    | GradientBoostingConfig
    | SVRConfig
    | KNNRegressionConfig
    | RegressionMetricsConfig
    | LogisticRegressionConfig
    | DecisionTreeClassificationConfig
    | SVMConfig
    | NaiveBayesConfig
    | KNNClassificationConfig
    | ConfusionMatrixConfig
    | ROCAUCConfig
    | EnsembleMethodsConfig
    | NeuralNetworkConfig
    | ActivationFunctionsConfig
    | CNNConfig
    | RNNConfig
    | AttentionConfig
    | TransformerConfig
    | DropoutBNConfig
    | TransferLearningConfig
    | NLPPipelineConfig
    | WordEmbeddingConfig
    | TimeSeriesConfig
    | AnomalyDetectionConfig
    | RecommenderConfig
    | ClusteringConfig
    | MLOpsConfig
    | AIEthicsConfig;

export interface NeuralNetworkConfig {
    id: string;
    primitiveType: "neural-network";
    caption: string;
}

export interface ActivationFunctionsConfig {
    id: string;
    primitiveType: "activation-functions";
    caption: string;
}

export interface CNNConfig {
    id: string;
    primitiveType: "cnn";
    caption: string;
}

export interface RNNConfig {
    id: string;
    primitiveType: "rnn";
    caption: string;
}

export interface AttentionConfig {
    id: string;
    primitiveType: "attention";
    caption: string;
}

export interface TransformerConfig {
    id: string;
    primitiveType: "transformer";
    caption: string;
}

export interface DropoutBNConfig {
    id: string;
    primitiveType: "dropout-bn";
    caption: string;
}

export interface TransferLearningConfig {
    id: string;
    primitiveType: "transfer-learning";
    caption: string;
}

export interface NLPPipelineConfig {
    id: string;
    primitiveType: "nlp-pipeline";
    caption: string;
}

export interface WordEmbeddingConfig {
    id: string;
    primitiveType: "word-embedding";
    caption: string;
}

export interface TimeSeriesConfig {
    id: string;
    primitiveType: "time-series";
    caption: string;
}

export interface AnomalyDetectionConfig {
    id: string;
    primitiveType: "anomaly-detection";
    caption: string;
}

export interface RecommenderConfig {
    id: string;
    primitiveType: "recommender";
    caption: string;
}

export interface ClusteringConfig {
    id: string;
    primitiveType: "clustering";
    caption: string;
}

export interface MLOpsConfig {
    id: string;
    primitiveType: "mlops";
    caption: string;
}

export interface AIEthicsConfig {
    id: string;
    primitiveType: "ai-ethics";
    caption: string;
}

export type VisualConfigRegistry = Record<string, VisualConfig>;

// ============================================
// Config Registry Type

