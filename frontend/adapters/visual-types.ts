/**
 * Configuration types for visual primitives
 * 
 * Rules:
 * - All fields serializable (no functions)
 * - No topic-specific assumptions
 */

// ============================================
// Shared Base Types
// ============================================

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
// Base Configuration
// ============================================

export interface BaseVisualConfig {
    id: string;
    caption: string;
    description?: string;
}

// ============================================
// Specialized Primitives (Heavily Structured)
// ============================================

export interface ParameterSensitivityConfig extends BaseVisualConfig {
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
}

export interface FitProgressionConfig extends BaseVisualConfig {
    /** Primitive type discriminator */
    primitiveType: "fit-progression";

    /** Slider configuration */
    slider: {
        label: string;
        min: number;
        max: number;
        step: number;
        initial: number;
        inverted?: boolean;
    };

    /** Visualization mode */
    mode: "polynomial-regression" | "decision-boundary";

    /** Data points for visualization */
    data: {
        trainPoints: Array<{ x: number; y: number }>;
        testPoints: Array<{ x: number; y: number }>;
    };
}

export interface DistributionEvolutionConfig extends BaseVisualConfig {
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
}

export interface BoundaryMorphingConfig extends BaseVisualConfig {
    /** Primitive type discriminator */
    primitiveType: "boundary-morphing";

    /** Slider configuration (Flexibility control) */
    slider: {
        label: string;
        min: number;
        max: number;
        step: number;
        initial: number;
        inverted?: boolean;
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
}

export interface MetricDashboardConfig extends BaseVisualConfig {
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
}

export interface ClusterFormationConfig extends BaseVisualConfig {
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
}

export interface NetworkForwardPassConfig extends BaseVisualConfig {
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
}

export interface GradientBackflowConfig extends BaseVisualConfig {
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
}

export interface GradientDescentOptimizerConfig extends BaseVisualConfig { primitiveType: "gradient-descent-optimizer"; }
export interface DescriptiveStatisticsConfig extends BaseVisualConfig { primitiveType: "descriptive-statistics"; }
export interface PopulationSampleConfig extends BaseVisualConfig { primitiveType: "population-sample"; }
export interface CentralTendencyConfig extends BaseVisualConfig { primitiveType: "central-tendency"; }
export interface DispersionConfig extends BaseVisualConfig { primitiveType: "dispersion"; }
export interface ProbabilityDistributionsConfig extends BaseVisualConfig { primitiveType: "probability-distributions"; }
export interface CommonDistributionsConfig extends BaseVisualConfig { primitiveType: "common-distributions"; }
export interface ConditionalProbabilityConfig extends BaseVisualConfig { primitiveType: "conditional-probability"; }
export interface LawOfLargeNumbersConfig extends BaseVisualConfig { primitiveType: "law-of-large-numbers"; }
export interface PoissonDistributionConfig extends BaseVisualConfig { primitiveType: "poisson-distribution"; }
export interface ExponentialDistributionConfig extends BaseVisualConfig { primitiveType: "exponential-distribution"; }
export interface UniformDistributionConfig extends BaseVisualConfig { primitiveType: "uniform-distribution"; }
export interface VectorOperationsConfig extends BaseVisualConfig { primitiveType: "vector-operations"; }
export interface MatrixTransformationConfig extends BaseVisualConfig { primitiveType: "matrix-transformation"; }
export interface MatrixPropertiesConfig extends BaseVisualConfig { primitiveType: "matrix-properties"; }
export interface LinearIndependenceConfig extends BaseVisualConfig { primitiveType: "linear-independence"; }
export interface EigenvectorsConfig extends BaseVisualConfig { primitiveType: "eigen-vectors"; }
export interface SVDConfig extends BaseVisualConfig { primitiveType: "svd"; }
export interface ObjectiveFunctionConfig extends BaseVisualConfig { primitiveType: "objective-function"; }
export interface GradientChainRuleConfig extends BaseVisualConfig { primitiveType: "gradient-chain-rule"; }
export interface NumpyArraysConfig extends BaseVisualConfig { primitiveType: "numpy-arrays"; }
export interface BroadcastingConfig extends BaseVisualConfig { primitiveType: "broadcasting"; }
export interface FancyBooleanIndexingConfig extends BaseVisualConfig { primitiveType: "fancy-boolean-indexing"; }
export interface MemoryLayoutConfig extends BaseVisualConfig { primitiveType: "memory-layout"; }
export interface GroupByConfig extends BaseVisualConfig { primitiveType: "groupby"; }
export interface RollingAverageConfig extends BaseVisualConfig { primitiveType: "rolling-average"; }
export interface MatplotlibSeabornConfig extends BaseVisualConfig { primitiveType: "matplotlib-seaborn"; }
export interface ModelResultsConfig extends BaseVisualConfig { primitiveType: "model-results"; }
export interface DecoratorsConfig extends BaseVisualConfig { primitiveType: "decorators"; }
export interface GeneratorsConfig extends BaseVisualConfig { primitiveType: "generators"; }
export interface ContextManagersConfig extends BaseVisualConfig { primitiveType: "context-managers"; }
export interface MLPipelinesConfig extends BaseVisualConfig { primitiveType: "ml-pipelines"; }
export interface OutlierDetectionConfig extends BaseVisualConfig { primitiveType: "outlier-detection"; }
export interface DataValidationConfig extends BaseVisualConfig { primitiveType: "data-validation"; }
export interface CategoricalEncodingConfig extends BaseVisualConfig { primitiveType: "categorical-encoding"; }
export interface FeatureScalingConfig extends BaseVisualConfig { primitiveType: "feature-scaling"; }
export interface PolynomialFeaturesConfig extends BaseVisualConfig { primitiveType: "polynomial-features"; }
export interface MissingDataConfig extends BaseVisualConfig { primitiveType: "missing-data"; }
export interface DuplicateDataConfig extends BaseVisualConfig { primitiveType: "duplicate-data"; }
export interface ResidualAnalysisConfig extends BaseVisualConfig { primitiveType: "residual-analysis"; }
export interface FeatureSelectionConfig extends BaseVisualConfig { primitiveType: "feature-selection"; }
export interface DomainFeaturesConfig extends BaseVisualConfig { primitiveType: "domain-features"; }
export interface TFIDFConfig extends BaseVisualConfig { primitiveType: "tfidf"; }
export interface CNNFeaturesConfig extends BaseVisualConfig { primitiveType: "cnn-features"; }
export interface LinearRegressionConfig extends BaseVisualConfig { primitiveType: "linear-regression"; }
export interface RegularizationConfig extends BaseVisualConfig { primitiveType: "regularization"; }
export interface DecisionTreeConfig extends BaseVisualConfig { primitiveType: "decision-tree"; }
export interface RandomForestConfig extends BaseVisualConfig { primitiveType: "random-forest"; }
export interface GradientBoostingConfig extends BaseVisualConfig { primitiveType: "gradient-boosting"; }
export interface SVRConfig extends BaseVisualConfig { primitiveType: "svr"; }
export interface KNNRegressionConfig extends BaseVisualConfig { primitiveType: "knn-regression"; }
export interface RegressionMetricsConfig extends BaseVisualConfig { primitiveType: "regression-metrics"; }
export interface LogisticRegressionConfig extends BaseVisualConfig { primitiveType: "logistic-regression"; }
export interface DecisionTreeClassificationConfig extends BaseVisualConfig { primitiveType: "decision-tree-classification"; }
export interface SVMConfig extends BaseVisualConfig { primitiveType: "svm"; }
export interface NaiveBayesConfig extends BaseVisualConfig { primitiveType: "naive-bayes"; }
export interface KNNClassificationConfig extends BaseVisualConfig { primitiveType: "knn-classification"; }
export interface ConfusionMatrixConfig extends BaseVisualConfig { primitiveType: "confusion-matrix"; }
export interface ROCAUCConfig extends BaseVisualConfig { primitiveType: "roc-auc"; }
export interface EnsembleMethodsConfig extends BaseVisualConfig { primitiveType: "ensemble-methods"; }

export interface NeuralNetworkConfig extends BaseVisualConfig { primitiveType: "neural-network"; }
export interface ActivationFunctionsConfig extends BaseVisualConfig { primitiveType: "activation-functions"; }
export interface CNNConfig extends BaseVisualConfig { primitiveType: "cnn"; }
export interface RNNConfig extends BaseVisualConfig { primitiveType: "rnn"; }
export interface AttentionConfig extends BaseVisualConfig { primitiveType: "attention"; }
export interface TransformerConfig extends BaseVisualConfig { primitiveType: "transformer"; }
export interface DropoutBNConfig extends BaseVisualConfig { primitiveType: "dropout-bn"; }
export interface TransferLearningConfig extends BaseVisualConfig { primitiveType: "transfer-learning"; }
export interface NLPPipelineConfig extends BaseVisualConfig { primitiveType: "nlp-pipeline"; }
export interface WordEmbeddingConfig extends BaseVisualConfig { primitiveType: "word-embedding"; }
export interface TimeSeriesConfig extends BaseVisualConfig { primitiveType: "time-series"; }
export interface AnomalyDetectionConfig extends BaseVisualConfig { primitiveType: "anomaly-detection"; }
export interface RecommenderConfig extends BaseVisualConfig { primitiveType: "recommender"; }
export interface ClusteringConfig extends BaseVisualConfig { primitiveType: "clustering"; }
export interface MLOpsConfig extends BaseVisualConfig { primitiveType: "mlops"; }
export interface AIEthicsConfig extends BaseVisualConfig { primitiveType: "ai-ethics"; }
export interface PythonBasicsConfig extends BaseVisualConfig { primitiveType: "python-basics"; }
export interface PythonControlFlowConfig extends BaseVisualConfig { primitiveType: "python-control-flow"; }
export interface PythonErrorHandlingConfig extends BaseVisualConfig { primitiveType: "python-error-handling"; }
export interface NumericalStabilityConfig extends BaseVisualConfig { primitiveType: "numerical-stability"; }
export interface PandasUsageConfig extends BaseVisualConfig { primitiveType: "pandas-usage"; }
export interface GPRConfig extends BaseVisualConfig { primitiveType: "gpr"; }
export interface WhyEvalConfig extends BaseVisualConfig { primitiveType: "why-eval"; }
export interface ClassificationMetricsConfig extends BaseVisualConfig { primitiveType: "classification-metrics"; }
export interface PrecisionRecallConfig extends BaseVisualConfig { primitiveType: "precision-recall"; }
export interface MulticlassMetricsConfig extends BaseVisualConfig { primitiveType: "multiclass-metrics"; }
export interface BrierScoreConfig extends BaseVisualConfig { primitiveType: "brier-score"; }

// ============================================
// Combined Configuration Type
// ============================================

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
    | AIEthicsConfig
    | PythonBasicsConfig
    | PythonControlFlowConfig
    | PythonErrorHandlingConfig
    | NumericalStabilityConfig
    | PandasUsageConfig
    | GPRConfig
    | WhyEvalConfig
    | ClassificationMetricsConfig
    | PrecisionRecallConfig
    | MulticlassMetricsConfig
    | BrierScoreConfig;

export type VisualConfigRegistry = Record<string, VisualConfig>;
