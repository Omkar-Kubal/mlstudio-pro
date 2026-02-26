
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

    caption: "Drag the slider to see how the mean responds to outliers while the median stays stable.",
    description: "Outliers can significantly pull the mean away from the center of the data, while the median remains robust. This is why the median is often preferred for skewed distributions like income."
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

    caption: "Drag the slider to see how the threshold affects predictions and the precision–recall tradeoff.",
    description: "A classification threshold determines how we turn probabilities into labels. Moving it higher reduces False Positives (better Precision) but increases False Negatives (worse Recall)."
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

    caption: "Drag the slider to see how polynomial degree affects model fit. Watch train/test error diverge when overfitting.",
    description: "Higher-degree polynomials can capture complex patterns but risk fitting the noise in the training data. This 'memorization' leads to high error on new, unseen test data (overfitting)."
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

    caption: "Drag the slider to see how sample size affects distribution shape. Watch the histogram smooth into a density curve.",
    description: "The Law of Large Numbers states that as a sample size grows, its mean gets closer to the average of the whole population. Larger samples also yield more stable and predictable distributions."
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

    caption: "Drag the slider to see how K affects the decision boundary. Low K = fragmented islands. High K = smooth regions.",
    description: "The decision boundary determines how a model separates different classes. In KNN, a small number of neighbors creates a complex, wiggly boundary, while more neighbors smooth it out."
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

    caption: "Drag the threshold to see how it affects the precision-recall tradeoff. Watch the confusion matrix cells animate.",
    description: "Metrics like Accuracy, Precision, and Recall give different perspectives on model performance. A high Accuracy can be misleading if the model is ignoring a small but important class (imbalance)."
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

    caption: "Drag the K slider to see how cluster count affects grouping. Watch centroids drift to their cluster centers.",
    description: "Clustering groups items by similarity. The Voronoi diagram shows the 'influence zone' of each centroid. K-Means aims to minimize the average distance between points and their closest centroid."
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

    caption: "Move the input slider to see how values propagate through the network. Toggle activation functions to observe different behaviors.",
    description: "Neural networks are function approximators. Each layer transforms input data into increasingly abstract representations. Activation functions introduce nonlinearity, allowing the network to learn complex patterns."
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

    caption: "Move the error slider to see how gradients flow backward. Sigmoid causes vanishing gradients; ReLU preserves flow (but can have dead neurons).",
    description: "Backpropagation is the heart of training. The 'Signal' (gradient) tells each weight how much to change to reduce error. If the signal vanishes or explodes across many layers, the network stops learning."
};

// ============================================
// Config Registry (by topic title)
// ============================================

export const visualConfigs: VisualConfigRegistry = {
    "Gradient Descent Algorithms": {
        id: "gradient-descent-optimizers",
        primitiveType: "gradient-descent-optimizer",
        caption: "Comparing pure Gradient Descent, Momentum, and Adam. Observe how different optimizers handle the loss landscape ravines.",
        description: "Optimizers are strategies for finding the lowest point of a loss function. Pure Gradient Descent is often slow; Momentum adds speed by accumulating 'veloctiy', and Adam adapts the learning rate for each specific weight."
    },
    // Module 1: Statistics
    "Descriptive Statistics Overview": {
        id: "descriptive-stats-overview",
        primitiveType: "descriptive-statistics",
        caption: "A bird's-eye view of your data: Mean, Median, and the shape of the distribution.",
        description: "Descriptive statistics turn a sea of raw numbers into a few key values (Mean, Median, Std Dev) that tell the story of your dataset's center and spread."
    },
    "Population vs Sample": {
        id: "population-vs-sample-inference",
        primitiveType: "population-sample",
        caption: "You don't need to eat the whole pot of soup to know if it's salty. Observe how samples represent the truth.",
        description: "Since it's usually impossible to measure every item in a population, we use samples. A representative sample allows us to infer properties of the entire population with measurable confidence."
    },
    "Measures of Central Tendency": {
        id: "central-tendency-balance",
        primitiveType: "central-tendency",
        caption: "Mean chases outliers; Median stays anchored. Observe the balance shift.",
        description: "The Mean is where the data would balance on a scale; the Median is the literal middle point. In skewed data, the Mean gets pulled away, while the Median stays true to the center."
    },
    "Measures of Dispersion": {
        id: "dispersion-dynamics",
        primitiveType: "dispersion",
        caption: "Standard deviation defines the spread. Observe the 68-95-99.7 rule in action.",
        description: "Variance and Standard Deviation measure how much the data 'spreads' away from the center. High dispersion means the data is inconsistent; low dispersion means it's tightly clustered."
    },
    // Module 2: Probability
    "Random Variables & Probability Distributions": {
        id: "random-variables-galton",
        primitiveType: "probability-distributions",
        caption: "Drop balls to see how individual random paths converge into a predictable bell curve.",
        description: "Galton board balls drop randomly, but their collective outcome forms a Bell Curve. This transition from individual chaos to aggregate order is the foundation of probability theory."
    },
    "Common Probability Distributions": {
        id: "common-distributions-explorer",
        primitiveType: "common-distributions",
        caption: "Explore and compare the Normal, Binomial, Poisson, and Uniform distributions.",
        description: "Different scenarios follow different mathematical patterns. The Normal distribution models nature and noise; Binomial models trials; Poisson models rare counts."
    },
    "Conditional Probability & Bayes' Theorem": {
        id: "conditional-probability-bayes",
        primitiveType: "conditional-probability",
        caption: "See how new evidence restricts the sample space and updates your belief in real-time.",
        description: "Bayes' Theorem is the logic of updating beliefs. Given a prior probability and new evidence, we can compute a posterior probability that reflects our new state of knowledge."
    },
    "Law of Large Numbers": {
        id: "lln-convergence",
        primitiveType: "law-of-large-numbers",
        caption: "Watch how randomness convergences into a predictable truth as sample size increases.",
        description: "The Law of Large Numbers ensures that as we collect more data, our sample averages stabilize toward the true population mean, forming the statistical bedrock of machine learning."
    },
    "Poisson Distribution": {
        id: "poisson-distribution-sparks",
        primitiveType: "poisson-distribution",
        caption: "Count rare, independent events in a fixed interval of time or space.",
        description: "The Poisson distribution models the number of events in an interval. It's used for everything from web traffic analysis to predicting radioactive decay."
    },
    "Exponential Distribution": {
        id: "exponential-distribution-waits",
        primitiveType: "exponential-distribution",
        caption: "Waiting times until the next event: modeling intervals and the memoryless property.",
        description: "Exponential distributions model the time between Poisson events. It is unique for its 'memorylessness'—the past doesn't affect the future wait time."
    },
    "Uniform Distribution": {
        id: "uniform-distribution-fairness",
        primitiveType: "uniform-distribution",
        caption: "Every outcome in the range [a, b] is equally likely: the 'ultimate fair game'.",
        description: "In a uniform distribution, every value has equal density. This is commonly used in neural network weight initialization and random hyperparameter search."
    },
    // Module 3: Linear Algebra
    "Vector Operations (Addition, Dot Product, Norms)": {
        id: "vector-operations-lab",
        primitiveType: "vector-operations",
        caption: "Explore vector addition, dot products, and norms through interactive geometry.",
        description: "Vectors are arrows in space. Adding them tip-to-tail finds the combined direction, while dot products measure how much they point in the same direction—the essence of similarity."
    },
    "Matrices & Matrix Multiplication": {
        id: "matrix-transformation-warp",
        primitiveType: "matrix-transformation",
        caption: "Visualize how linear transformations warp the coordinate grid using unit vectors.",
        description: "Matrices are functions that warp space. They can rotate, scale, or shear the grid. Linear algebra is the study of how these warps behave and what stays invariant."
    },
    "Matrix Properties: Transpose, Inverse, Rank": {
        id: "matrix-properties-lab",
        primitiveType: "matrix-properties",
        caption: "Deep dive into transposes, inverses, and rank collapses through geometric 'undoing'.",
        description: "An inverse 'un-warps' space back to its original state. Transposing flips the grid across its diagonal. If a matrix is 'singular', it collapses space into a line or point, making it impossible to undo."
    },
    "Linear Independence & Basis": {
        id: "linear-independence-basis",
        primitiveType: "linear-independence",
        caption: "Explore span, basis vectors, and the geometric conditions for independence.",
        description: "Basis vectors are the building blocks of a coordinate system. If they are 'independent', they don't overlap, allowing them to span the entire space without redundancy."
    },
    "Eigenvalues & Eigenvectors": {
        id: "eigen-vectors-lab",
        primitiveType: "eigen-vectors",
        caption: "Discover the invariant directions and scaling factors of linear transformations.",
        description: "Eigenvectors are the specific directions that don't change their orientation during a transformation—they only get stretched or squished by an amount called the Eigenvalue."
    },
    "Singular Value Decomposition (SVD)": {
        id: "svd-lab",
        primitiveType: "svd",
        caption: "Decompose any transformation into rotation, stretch, and rotation.",
        description: "SVD is the 'master decomposition' that works for any matrix. It reveals the underlying structure of data, enabling powerful compression and noise reduction techniques."
    },
    "The Objective Function": {
        id: "objective-function-lab",
        primitiveType: "objective-function",
        caption: "Explore landscape geometry and how gradient descent navigates local and global minima.",
        description: "Loss functions create a landscape where the lowest point is the 'correct' model. Gradient descent is like a hiker in a fog, always stepping in the steepest downward direction to find the valley."
    },
    "Gradients and the Chain Rule": {
        id: "gradient-chain-rule-lab",
        primitiveType: "gradient-chain-rule",
        caption: "The gradient is a signpost pointing uphill. Backpropagation is the chain rule, applied layer by layer.",
        description: "The gradient points in the direction of steepest ascent. Calculus's Chain Rule allows us to propagate error gradients backwards from the output to every single weight in a network, enabling efficient learning."
    },
    // Programming - Python Basics
    "Python Syntax for Data Science": {
        id: "python-syntax-ds",
        primitiveType: "python-basics",
        caption: "Readability over brevity, explicit over implicit. Indentation defines logic.",
        description: "Python's clear syntax makes it the lingua franca of data science. Its interactive nature matches the experimental workflow: Observe -> Modify -> Test -> Reason -> Repeat."
    },
    "Data Types and Data Structures": {
        id: "python-data-structures",
        primitiveType: "python-basics",
        caption: "int, float, bool, str vs list, tuple, dict, set. Mutability matters.",
        description: "Understanding types prevents data bugs. Lists are flexible, while NumPy arrays (learned later) are mathematical objects. Knowing what is mutable versus immutable is key to predictable code."
    },
    "Control Flow": {
        id: "python-control-flow",
        primitiveType: "python-control-flow",
        caption: "If/Else for logic, For/While for iteration. The engine of data filtering.",
        description: "Control flow allows code to make decisions based on data. Loops process datasets step-by-step, while conditionals apply thresholds and handle edge cases."
    },
    "Functions and Modules": {
        id: "python-functions",
        primitiveType: "python-basics",
        caption: "Encapsulate logic. Prevent repetition. Re-run experiments reliably.",
        description: "Functions turn repetitive scripts into testable, modular tools. Modules organize these functions into logical units of responsibility like preprocessing, training, and metrics."
    },
    "Error Handling": {
        id: "python-error-handling",
        primitiveType: "python-error-handling",
        caption: "Exceptions are signals. Fail safely, not silently.",
        description: "Real data is messy. Error handling allows pipelines to survive broken assumptions by providing controlled failure paths rather than crashing without explanation."
    },
    "Writing Clean, Maintainable Code": {
        id: "python-clean-code",
        primitiveType: "python-basics",
        caption: "Clarity beats cleverness. If you can't trust the code, you can't trust the results.",
        description: "Clean code is about trust and reproducibility. Meaningful variable names and modular pipelines ensure experiments can be revisited and audited months later."
    },
    // Programming - NumPy
    "NumPy Arrays": {
        id: "numpy-arrays-shapes-lab",
        primitiveType: "numpy-arrays",
        caption: "An array is just a view of a flat line of numbers in memory. reshape() never copies data — it just re-reads.",
        description: "NumPy is the backbone of data science. It manages memory efficiently, allowing for lightning-fast operations on large datasets without the overhead of plain Python lists."
    },
    "Array Shapes and Broadcasting": {
        id: "array-broadcasting-lab",
        primitiveType: "broadcasting",
        caption: "Broadcasting lets NumPy operate on arrays of different shapes — ghost rows and columns, zero extra RAM.",
        description: "Broadcasting is NumPy's way of performing operations on arrays with different shapes without actually copying data, making mathematical code both cleaner and much faster."
    },
    "Numerical Stability": {
        id: "numerical-stability-lab",
        primitiveType: "numerical-stability",
        caption: "Floating-point numbers are approximations. log-probs and stable-softmax prevent nan/inf.",
        description: "Computers use finite precision. In ML, tiny errors can accumulate into infinities (overflow) or zeros (underflow). Stability techniques like log-transforms protect model training."
    },
    "Fancy Indexing": {
        id: "fancy-indexing-lab",
        primitiveType: "fancy-boolean-indexing",
        caption: "Fancy indexing picks by coordinate using integer arrays. Always returns a copy.",
        description: "Unlike simple slices, fancy indexing creates new arrays from specified indices. It's like a shopping list of specific data points you want to extract for further analysis."
    },
    "Boolean Indexing & np.where": {
        id: "boolean-indexing-lab",
        primitiveType: "fancy-boolean-indexing",
        caption: "Boolean indexing is a filter mask. np.where is a vectorized if-else.",
        description: "Masks allow you to filter entire datasets based on logical conditions (X > 0). np.where combines two data sources based on a signal, enabling fast conditional transformations."
    },
    "Memory Layout: C-order vs Fortran-order": {
        id: "memory-layout-lab",
        primitiveType: "memory-layout",
        caption: "C-order reads row-by-row; Fortran reads column-by-column. Cache efficiency depends on which axis you traverse.",
        description: "How data sits in memory affects speed. Row-major order (C) is faster for row-wise operations because it respects CPU cache locality. Transposing often changes strides without copying data."
    },
    // Programming - Pandas
    "Reading & Writing Data": {
        id: "pandas-io-lab",
        primitiveType: "pandas-usage",
        caption: "CSV, Parquet, SQL. Don't let schema inference break your pipeline.",
        description: "Data ingestion is the start of the integrity chain. Formats like Parquet are faster and preserve types, while CSVs are flexible but require explicit schema checks."
    },
    "Indexing & Filtering": {
        id: "pandas-indexing-lab",
        primitiveType: "pandas-usage",
        caption: "loc (label) vs iloc (position). Index alignment is more important than row numbers.",
        description: "Pandas selection is semantic. Boolean masks provide vectorized filtering, allowing you to query billion-row tables with simple declarative expressions."
    },
    "GroupBy & Aggregation": {
        id: "groupby-lab",
        primitiveType: "groupby",
        caption: "Split data by key, apply stats per group, combine into summary. The heart of analytics.",
        description: "GroupBy is the Swiss Army knife of data analysis. It turns raw rows into aggregated insights—counting users by region, calculating averages by category, or finding trends over time."
    },
    "Merging & Joining": {
        id: "pandas-merge-lab",
        primitiveType: "pandas-usage",
        caption: "Inner, Left, Right, Outer. Cardinals matter: avoid unintentional row multiplication.",
        description: "Relational joins reconstruct reality from fragmented data. Understanding how keys align prevents data duplication and metrics distortion."
    },
    "Handling Missing Data": {
        id: "pandas-missing-lab",
        primitiveType: "missing-data",
        caption: "NaN propagation is intentional. missing != zero. impute or drop based on assumptions.",
        description: "Missingness is a signal, not just an error. Pandas propagates NaNs to force you to handle them explicitly, ensuring you don't compute misleading averages from incomplete data."
    },
    "Time Series Handling": {
        id: "timeseries-lab",
        primitiveType: "time-series",
        caption: "Datetimes as indices. Resample frequencies. Smooth noise with rolling windows.",
        description: "Time series data requires special care. Moving windows (rolling) and exponential smoothing reveal long-term trends by filtering out daily or hourly fluctuations."
    },
    "Rolling Average": {
        id: "rolling-average-lab",
        primitiveType: "rolling-average",
        caption: "A rolling average is a moving window that smooths daily jitter to reveal the long-term signal.",
        description: "Rolling averages act as low-pass filters. By averaging data points within a sliding window, we remove high-frequency noise to reveal the underlying trend or signal."
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
    "Missing Data Strategies": {
        id: "missing-data-lab",
        primitiveType: "missing-data",
        caption: "Mean imputation kills variance; KNN respects relationships. Choose wisely.",
        description: "Data isn't missing at random. Deciding whether to drop rows, impute with simple averages, or use complex model-based estimates is a critical modeling choice."
    },
    "Duplicate Data": {
        id: "duplicate-data-lab",
        primitiveType: "duplicate-data",
        caption: "Duplicates are Echoes — they make the model hear whatever was shouted twice.",
        description: "Repeated data points distort class balance and inflate performance metrics. Deduplication ensures that your model is learning from unique evidence rather than memorizing repetitions."
    },
    "Model Result Visualization for Data Quality": {
        id: "residual-analysis-lab",
        primitiveType: "residual-analysis",
        caption: "Residuals are Errors. If they have a pattern, your model missed a pattern in the data.",
        description: "Looking at where a model fails reveals data quality issues. Residual plots should ideally show random noise; patterns suggest missing features or systematic data corruption."
    },
    "Outlier Detection (IQR & Z-score)": {
        id: "outlier-detection-lab",
        primitiveType: "outlier-detection",
        caption: "Z-score asks how far from the crowd; IQR ignores extremes and counts the middle 50%.",
        description: "Outliers tell two stories: either they are valuable anomalies (like fraud) or measurement errors. Robust methods like IQR prevent a few extreme points from pulling your entire model off-course."
    },
    "Data Validation": {
        id: "data-validation-lab",
        primitiveType: "data-validation",
        caption: "Validation is the Bouncer — if your data doesn't fit the schema, it's not getting in.",
        description: "Before modeling, you must enforce invariants: IDs must be unique, ages must be positive, and null rates must be low. This 'fail-early' approach prevents downstream disasters."
    },
    // ML - Regression
    "Linear Regression": {
        id: "linear-regression-lab",
        primitiveType: "linear-regression",
        caption: "Linear regression draws the best-fitting line. Simple, interpretable, and powerful for trends.",
        description: "Regression is about finding the best linear map from features to a continuous target. It assumes that the relationship is additive and that error is distributed normally around the line."
    },
    "Polynomial Regression": {
        id: "polynomial-features-lab",
        primitiveType: "polynomial-features",
        caption: "Polynomial features are Lenses — they let a linear model see curves by adding x², x³ as new columns.",
        description: "Non-linear data doesn't need a non-linear model. By expanding the input space into higher orders, we can fit complex curves using basic linear arithmetic."
    },
    "Regularization (Ridge & Lasso)": {
        id: "regularization-lab",
        primitiveType: "regularization",
        caption: "L1 (Lasso) kills weak features; L2 (Ridge) just shrinks them. Choose your weapon.",
        description: "Complexity leads to overfitting. Regularization adds a penalty to the loss function that discourages large weights, forcing the model to generalize rather than memorize noise."
    },
    "Elastic Net Regression": {
        id: "elastic-net-lab",
        primitiveType: "regularization",
        caption: "Combining L1 for selection and L2 for stability. The best of both worlds.",
        description: "Lasso fails if features are highly correlated (picks one arbitrarily). Elastic Net balances the two penalties to handle collinearity while maintaining feature selection capabilities."
    },
    "Decision Tree Regression": {
        id: "decision-tree-lab",
        primitiveType: "decision-tree",
        caption: "Trees split data into regions based on variance reduction. No equations, just rules.",
        description: "Decision trees partition the feature space into hyper-rectangles and predict the mean target value for each region. They handle non-linearity naturally but overfit easily without depth control."
    },
    "Random Forest Regression": {
        id: "random-forest-lab",
        primitiveType: "random-forest",
        caption: "One tree is a guess; a forest is a consensus. Ensemble methods reduce variance and improve stability.",
        description: "By averaging predictions from hundreds of independent trees (bagging), random forests cancel out individual errors and produce some of the most robust out-of-the-box performance in ML."
    },
    "Gradient Boosting Regression": {
        id: "gradient-boosting-lab",
        primitiveType: "gradient-boosting",
        caption: "Boosting builds trees sequentially, with each new tree fixing the residuals of the previous ensemble.",
        description: "Boosting models learn from their mistakes. Each step adds a new learner that focuses on the hardest remaining examples, incrementally refining the prediction into a powerful ensemble."
    },
    "Support Vector Regression (SVR)": {
        id: "svr-lab",
        primitiveType: "svr",
        caption: "SVR ignores small errors within a 'tube' and only penalizes points that escape it.",
        description: "Unlike OLS which minimizes all squared errors, SVR focuses on deviations larger than ε. The resulting model is defined only by a subset of points—the 'Support Vectors'."
    },
    "K-Nearest Neighbors (KNN) Regression": {
        id: "knn-regression-lab",
        primitiveType: "knn-regression",
        caption: "KNN regression predicts by averaging the outcomes of the closest k data points.",
        description: "KNN makes no assumptions about data shapes. It simply looks at the neighboring 'samples' and assumes the outcome will be similar—an intuitive but memory-heavy approach."
    },
    "Gaussian Process Regression (GPR)": {
        id: "gpr-lab",
        primitiveType: "gpr",
        caption: "Probabilistic regression that provides both a mean prediction and an uncertainty range.",
        description: "GPR learns a distribution over possible functions. It's powerful for small datasets where knowing how much to 'trust' a prediction (confidence intervals) is as important as the prediction itself."
    },
    "Evaluation Metrics": {
        id: "regression-metrics-lab",
        primitiveType: "regression-metrics",
        caption: "MAE is the average error; RMSE is the quadratic average that heavily punishes large outliers.",
        description: "Metrics answer: how close are we to the truth? While MAE treats all errors equally, RMSE squares them, making it sensitive to extreme failures that could break a product."
    },
    // Evaluation & Metrics
    "Why Evaluation Matters": {
        id: "why-eval-lab",
        primitiveType: "why-eval",
        caption: "Training error is hope; Test error is reality. Avoid the trap of overfitting.",
        description: "A model that memorizes training data will fail on new customers. Real evaluation requires hidden test sets and cross-validation to measure true generalization power."
    },
    "Regression Metrics": {
        id: "regression-metrics-eval-lab",
        primitiveType: "regression-metrics",
        caption: "MAE, RMSE, and R-squared. Choosing the right ruler for your error.",
        description: "Regression metrics aren't interchangeable. R-squared measures relative improvement over a baseline, while RMSE gives you the error in the original units (e.g. dollars or degrees)."
    },
    "Classification Metrics": {
        id: "classification-metrics-lab",
        primitiveType: "classification-metrics",
        caption: "Precision, Recall, and F1. Accuracy lies when classes are imbalanced.",
        description: "In fraud detection (99.9% legit), a model that 'always says legit' has 99.9% accuracy but 0.0% utility. Precision and Recall reveal how well you handle the rare classes that actually matter."
    },
    "Confusion Matrix": {
        id: "confusion-matrix-lab",
        primitiveType: "confusion-matrix",
        caption: "The confusion matrix reveals the exact count of TPs, FPs, TNs, and FNs.",
        description: "A grid that maps predicted versus actual labels. It shows exactly which classes the model confuses—allowing you to tune for specific types of error (like fatal False Negatives)."
    },
    "ROC and AUC": {
        id: "roc-auc-lab",
        primitiveType: "roc-auc",
        caption: "ROC curves show the tradeoff between TPR and FPR across all possible decision thresholds.",
        description: "AUC measures the probability that the model ranks a random positive example higher than a random negative one. It's a threshold-independent measure of classifier 'sorting' quality."
    },
    "Precision-Recall Curves": {
        id: "pr-curves-lab",
        primitiveType: "precision-recall",
        caption: "PR curves are superior to ROC when the positive class is extremely rare.",
        description: "When the negative class is massive, FPR stays low and ROC looks optimistic. PR curves focus on the positive class, showing how much noise (False Positives) we tolerate for a given recall level."
    },
    "Multi-class Classification Metrics": {
        id: "multiclass-metrics-lab",
        primitiveType: "multiclass-metrics",
        caption: "Macro vs Micro averaging. Balancing class-specific performance vs overall samples.",
        description: "In multi-class settings, we must choose how to aggregate scores across categories. Macro-averaging treats a rare disease class as equal to a common one; micro-averaging counts every sample equally."
    },
    "Brier Score and Probability Scoring": {
        id: "brier-score-lab",
        primitiveType: "brier-score",
        caption: "Score how well calibrated your probabilities are. Confidence must match reality.",
        description: "An '80% confident' prediction should be right exactly 80% of the time. Brier score measures the mean squared difference between predicted probabilities and actual outcomes."
    },
    "Ensemble Methods": {
        id: "ensemble-methods-lab",
        primitiveType: "ensemble-methods",
        caption: "Bagging (averaging), Boosting (sequencing), and Stacking (meta-modeling) combine learners for peak performance."
    },
    "Neural Network Architecture": {
        id: "neural-network-anatomy",
        primitiveType: "neural-network",
        caption: "NN architecture consists of layers of interconnected neurons that learn hierarchical features.",
        description: "Networks are layers of interconnected neurons. Each layer learns to extract more complex features—from simple edges to entire objects—enabling the model to understand complex hierarchies."
    },
    "Activation Functions": {
        id: "activation-functions-lab",
        primitiveType: "activation-functions",
        caption: "Activation functions like ReLU, Sigmoid, and Tanh introduce non-linearity, allowing NNs to learn complex curves.",
        description: "Without activation functions, a neural network is just a giant linear model. ReLU, Sigmoid, and Tanh allow the network to warp and bend space to fit complex, multi-dimensional patterns."
    },
    "Convolution Operation": {
        id: "convolution-lab",
        primitiveType: "cnn",
        caption: "Convolution uses sliding filters to detect spatial patterns like edges and textures in images.",
        description: "Inspired by the visual cortex, convolutions slide filters across input data to detect local patterns. This 'weight sharing' makes them incredibly efficient for images and time series."
    },
    "Recurrent Neural Networks (RNNs)": {
        id: "rnn-lab",
        primitiveType: "rnn",
        caption: "RNNs use hidden states to maintain memory across time steps in a sequence.",
        description: "RNNs have loops in them, allowing information to persist across time steps. They are designed to process sequences where the 'now' depends on the 'then', like text or music."
    },
    "LSTMs & GRUs (Gated Memory)": {
        id: "lstm-lab",
        primitiveType: "rnn",
        caption: "LSTMs use gates to control information flow, solving the vanishing gradient problem in long sequences."
    },
    "Attention Mechanism (Self-Attention)": {
        id: "attention-lab",
        primitiveType: "attention",
        caption: "Attention allows the model to dynamically focus on the most relevant parts of the input sequence.",
        description: "Attention allows a model to look at the entire input sequence and decide which parts are most important at any given moment. It 'focuses' its resources on the most relevant context."
    },
    "The Transformer Architecture": {
        id: "transformer-lab",
        primitiveType: "transformer",
        caption: "Transformers use parallel self-attention instead of sequential processing, enabling massive scalability.",
        description: "Transformers revolutionized AI by replacing sequential recurrence with parallelized self-attention. This allows them to process massive amounts of data and understand long-range relationships."
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
        caption: "Transfer learning leverages knowledge from pretrained models to solve new tasks with less data.",
        description: "Transfer learning is the 'standing on the shoulders of giants' of ML. We take a model trained on millions of images and 'fine-tune' it for our specific task, saving time and compute."
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
        caption: "Fairness mitigation strategies address bias in data and algorithms to ensure equitable outcomes.",
        description: "Models can inherit and amplify human biases present in data. Understanding fairness means proactively checking if our predictions vary unfairly across different demographic groups."
    },
    "Forward and Backward Propagation": gradientBackflowConfig,
    "K-Means Clustering": clusterFormationConfig
};

/**
 * Get config for a topic title
 */
export function getVisualConfig(topicTitle: string): VisualConfig | null {
    return visualConfigs[topicTitle] || null;
}





