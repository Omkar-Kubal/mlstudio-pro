# MLStudio Pro — Animation Research Prompts

> **Purpose**: Detailed prompts for researching and designing interactive animations for all 137 curriculum topics.
> Each entry includes: topic context, suggested interaction model, visual approach, technical specs, and search keywords.
> **9 topics already have implemented visual primitives** — all others need research.

---

## How to Use This Document

For each topic, research:
1. **Existing implementations** — use the search keywords on CodePen, Observable, D3 Gallery, Manim Gallery, 3Blue1Brown
2. **Competitor references** — Khan Academy, Brilliant.org, Seeing Theory, MLU-Explain, Distill.pub, r2d3.us
3. **Feasibility** — can it be built with React + Canvas/SVG? Does it need WebGL? Is a static diagram sufficient?
4. **Interaction value** — would interactivity genuinely deepen understanding, or is a static visualization better?

---

## Subject 1: Foundations

### Module: Statistics (s1m1)

#### 1. Measures of Central Tendency ✅ IMPLEMENTED
- **Primitive**: ParameterSensitivity (mean-sensitivity)
- **Status**: Working — slider controls outlier, shows mean vs median divergence
- **Enhance**: Add mode indicator, animate histogram bars on slider change

#### 2. Descriptive Statistics Overview ✅ IMPLEMENTED  
- **Primitive**: DistributionEvolution (distribution-evolution)
- **Status**: Working — sample size slider shows histogram → density convergence
- **Enhance**: Add skewness/kurtosis indicators, toggle between distribution types

#### 3. Dispersion & Spread
- **Concept**: Variance and standard deviation as measures of data spread
- **Interaction Model**: Slider changes σ of a normal distribution; show 68-95-99.7 rule bands appearing/disappearing
- **Visual Approach**: Overlaid bell curves with different σ values, animated transitions between them
- **Technical Spec**: SVG + D3 transition, responsive canvas 600×400
- **Search Keywords**: `standard deviation visualization interactive`, `68-95-99.7 rule animation`, `variance spread d3`, `normal distribution sigma slider`
- **Competitor Reference**: Khan Academy statistics unit, Seeing Theory (Brown University)

---

### Module: Probability (s1m2)

#### 4. Random Variables & Probability Distributions
- **Concept**: Random process → numerical outcomes; PMF vs PDF distinction
- **Interaction Model**: "Add samples" button — watch histogram emerge from chaos, overlaid with theoretical PDF
- **Visual Approach**: Animated dots dropping into bins, histogram growing, smooth curve overlay fading in
- **Technical Spec**: Canvas animation, 60fps particle system, responsive
- **Search Keywords**: `probability distribution histogram animation`, `random sampling visualization`, `PMF vs PDF interactive`, `d3 histogram builder`
- **Competitor Reference**: Seeing Theory Ch1, 3Blue1Brown probability series

#### 5. Common Probability Distributions
- **Concept**: Bernoulli, Binomial, Normal, CLT
- **Interaction Model**: Distribution selector + parameter sliders (p, n, μ, σ); CLT demo: sample from skewed → plot means → watch normality emerge
- **Visual Approach**: Multi-panel: distribution shape changes as parameters slide; CLT panel shows progressive convergence
- **Technical Spec**: SVG, needs smooth interpolation between distribution shapes
- **Search Keywords**: `central limit theorem animation`, `binomial distribution interactive`, `distribution parameter slider`, `CLT demonstration d3`
- **Competitor Reference**: Seeing Theory Ch3, Setosa.io CLT visualization

#### 6. Conditional Probability & Bayes' Theorem
- **Concept**: Prior → Evidence → Posterior belief updating
- **Interaction Model**: Prior slider + evidence toggle; Venn diagram showing conditional space shrinking
- **Visual Approach**: Animated Venn diagram or waffle chart; Bayesian updating bar chart showing prior → posterior shift
- **Technical Spec**: SVG transitions, needs smooth interpolation
- **Search Keywords**: `bayes theorem visualization interactive`, `conditional probability venn diagram`, `bayesian updating animation`, `prior posterior slider`
- **Competitor Reference**: 3Blue1Brown Bayes video, Brilliant.org Bayesian course

#### 7. Law of Large Numbers
- **Concept**: Running mean converges to true value as samples grow
- **Interaction Model**: "Add samples" button or auto-play; running mean line with confidence band narrowing
- **Visual Approach**: Time series chart with running average, true value horizontal line, volatility envelope shrinking
- **Technical Spec**: Canvas line chart, smooth append animation
- **Search Keywords**: `law of large numbers simulation`, `running average convergence animation`, `LLN interactive d3`
- **Competitor Reference**: Seeing Theory Ch4

---

### Module: Linear Algebra (s1m3)

#### 8. Scalars, Vectors & Spaces
- **Concept**: Scalars control magnitude, vectors have direction, spaces contain data
- **Interaction Model**: 2D/3D vector plot with sliders for components; dimension toggle (2D → 3D projection)
- **Visual Approach**: Arrow vectors from origin, point cloud for spaces, slider morphs vector direction
- **Technical Spec**: SVG for 2D, Three.js for 3D projection if available
- **Search Keywords**: `vector visualization interactive`, `2d vector components slider`, `feature space point cloud`, `vector arrow d3`
- **Competitor Reference**: 3Blue1Brown Essence of Linear Algebra Ch1

#### 9. Matrix Operations
- **Concept**: Matrix multiplication as space transformation
- **Interaction Model**: 2×2 matrix entries as sliders; watch how a grid/shape transforms in real-time
- **Visual Approach**: Unit square grid being sheared/rotated/scaled as matrix values change
- **Technical Spec**: SVG grid transformation, real-time matrix computation
- **Search Keywords**: `matrix transformation visualization`, `linear transformation 2d grid`, `matrix multiplication animation`, `3blue1brown linear transformation`
- **Competitor Reference**: 3Blue1Brown Essence of Linear Algebra Ch3, Immersive Math (immersivemath.com)

#### 10. Eigenvalues & Eigenvectors
- **Concept**: Eigenvectors maintain direction under transformation, eigenvalues scale them
- **Interaction Model**: Show transformation where most vectors change direction but eigenvectors stay aligned (just stretched)
- **Visual Approach**: Many arrows transforming, with eigenvectors highlighted staying on their line
- **Technical Spec**: SVG animation, highlight special vectors
- **Search Keywords**: `eigenvector visualization`, `eigenvalue animation`, `PCA eigenvector d3`, `eigenvector stays on span`
- **Competitor Reference**: 3Blue1Brown Essence of Linear Algebra Ch14, Setosa.io Eigenvectors

#### 11. SVD & Dimensionality Reduction
- **Concept**: Rotate → Scale → Rotate decomposition; PCA as data variance alignment
- **Interaction Model**: Show data cloud, then align principal axes, then project to lower dimension
- **Visual Approach**: 3D point cloud → PCA axes appear → project to 2D plane with variance preservation shown
- **Technical Spec**: Three.js or SVG with perspective projection
- **Search Keywords**: `SVD visualization animation`, `PCA dimensionality reduction interactive`, `singular value decomposition geometry`, `data projection dimension reduction`
- **Competitor Reference**: Setosa.io PCA, Distill.pub

---

### Module: Optimization (s1m4)

#### 12. The Objective Function
- **Concept**: Loss landscape — models navigate a surface to find minima
- **Interaction Model**: 3D surface plot with a ball rolling toward minimum; toggle between convex and non-convex surfaces
- **Visual Approach**: 3D loss surface with gradient arrows, ball following gradient descent path
- **Technical Spec**: Three.js or Plotly 3D surface, interactive rotation
- **Search Keywords**: `loss landscape visualization 3d`, `gradient descent surface animation`, `objective function 3d plot`, `loss surface neural network`
- **Competitor Reference**: losslandscape.com, Distill.pub optimization articles

#### 13. Gradients and the Chain Rule
- **Concept**: Gradient as direction of steepest ascent; chain rule decomposes through layers
- **Interaction Model**: Function composition diagram showing how gradients flow backward through each node
- **Visual Approach**: Computation graph with nodes; forward pass lights up left-to-right, backward pass lights up right-to-left with gradient values
- **Technical Spec**: SVG node-link diagram with animation
- **Search Keywords**: `backpropagation computation graph animation`, `chain rule visualization neural network`, `gradient flow diagram`, `automatic differentiation graph`
- **Competitor Reference**: CS231n gradient flow diagrams, 3Blue1Brown neural network series

#### 14. Gradient Descent Algorithms
- **Concept**: GD vs SGD vs Adam — how step size and momentum affect convergence
- **Interaction Model**: Multiple optimizers racing on the same loss surface; learning rate slider
- **Visual Approach**: 2D contour plot with multiple trajectories (GD=smooth, SGD=noisy, Adam=adaptive)
- **Technical Spec**: Canvas 2D, animated paths with trails
- **Search Keywords**: `gradient descent optimizer comparison animation`, `SGD vs Adam visualization`, `learning rate effect animation`, `optimizer trajectory contour plot`
- **Competitor Reference**: Distill.pub "Why Momentum Really Works", Sebastian Ruder optimizer overview

---

## Subject 2: Programming

### Module: Python Basics (s2m1)

#### 15-19. Python variables, Control Flow, Functions, Data Structures, OOP
- **Concept**: Core Python programming fundamentals
- **Interaction Model**: Live code sandbox with instant output; step-through debugger visualization
- **Visual Approach**: Memory diagram showing variables as boxes, pointers, stack frames
- **Technical Spec**: Code editor with Pyodide execution, visual memory state
- **Search Keywords**: `python memory visualization`, `variable scope diagram interactive`, `python tutor visualization`, `pythontutor.com execution`
- **Competitor Reference**: PythonTutor.com, Codecademy interactive lessons
- **Note**: These topics benefit more from **code sandbox** interaction than animations. Ensure CodeEditor works well.

---

### Module: NumPy (s2m2)

#### 20-22. NumPy arrays, broadcasting, linear algebra
- **Concept**: Array operations, broadcasting rules, matrix math
- **Interaction Model**: Array shape visualizer — show how broadcasting stretches arrays; matrix multiplication step-by-step
- **Visual Approach**: Grid cells lighting up during operations; broadcasting arrows showing dimension expansion
- **Technical Spec**: SVG grid with cell highlighting animation
- **Search Keywords**: `numpy broadcasting visualization`, `matrix multiplication step by step animation`, `array operations interactive`, `broadcasting rules diagram`
- **Competitor Reference**: NumPy docs broadcasting page, Jay Alammar blog posts

---

### Module: Pandas (s2m3)

#### 23-27. Reading Data, Indexing, GroupBy, Merging, Missing Data
- **Concept**: DataFrame operations and data manipulation
- **Interaction Model**: Interactive DataFrame viewer showing operations step-by-step (filter highlighting, groupby animation)
- **Visual Approach**: Table with rows highlighting during filter; split-apply-combine animation for groupby
- **Technical Spec**: HTML table with CSS transitions
- **Search Keywords**: `pandas groupby visualization`, `sql join types venn diagram interactive`, `split apply combine animation`, `dataframe filter visualization`
- **Competitor Reference**: Pandas documentation, Mode Analytics SQL visual joins

---

### Module: Visualization (s2m4)

#### 28-31. Why Visualization Matters, Matplotlib, Seaborn, Model Visualization
- **Concept**: Data visualization principles and tools
- **Interaction Model**: Anscombe's Quartet interactive — show identical statistics, reveal different plots
- **Visual Approach**: Side-by-side: statistics panel (all identical) vs plot panel (all different)
- **Technical Spec**: SVG/Canvas scatter plots
- **Search Keywords**: `anscombes quartet interactive`, `data visualization importance demo`, `matplotlib vs seaborn comparison`, `datasaurus dozen`
- **Competitor Reference**: Datasaurus Dozen, Anscombe's Quartet interactive demos

---

### Module: ML Workflow (s2m5)

#### 32-34. Pipelines, Reproducibility, Environment Management
- **Concept**: ML engineering best practices
- **Interaction Model**: Pipeline flow diagram — drag and drop components into a pipeline
- **Visual Approach**: Flowchart with animated data flowing through preprocessing → training → evaluation
- **Technical Spec**: SVG node-link diagram with animated particles
- **Search Keywords**: `ml pipeline visualization`, `sklearn pipeline diagram`, `data science workflow animation`, `mlops pipeline flow`
- **Competitor Reference**: MLflow pipeline docs, Kubeflow pipeline UI

---

## Subject 3: Data Handling

### Module: Data Cleaning (s3m1)

#### 35. Missing Data Strategies
- **Concept**: MCAR/MAR/MNAR types; imputation effects on distributions
- **Interaction Model**: Imputation strategy selector — show distribution before/after each strategy
- **Visual Approach**: Overlaid histograms: original vs dropped vs mean-imputed vs KNN-imputed
- **Technical Spec**: SVG histogram with smooth transitions between strategies
- **Search Keywords**: `missing data imputation visualization`, `MCAR MAR MNAR diagram`, `imputation effect on distribution`, `missing data pattern matrix`
- **Competitor Reference**: scikit-learn imputation docs, R mice package visualization

#### 36. Duplicate Data
- **Concept**: How duplicates distort statistics and cause leakage
- **Interaction Model**: Toggle duplicates on/off — watch how distribution, mean, and class balance shift
- **Visual Approach**: Before/after comparison: distribution with/without duplicates, class balance bars shifting
- **Technical Spec**: SVG bar chart with animated transitions
- **Search Keywords**: `duplicate data impact visualization`, `data deduplication effects`, `train test leakage from duplicates`

#### 37. Model Result Visualization for Data Quality
- **Concept**: Residual analysis reveals data quality issues
- **Interaction Model**: Toggle between good-fit and poor-fit residual patterns
- **Visual Approach**: Residual scatter plot: random scatter vs structured pattern; interactive highlighting
- **Technical Spec**: SVG scatter plot
- **Search Keywords**: `residual plot analysis interactive`, `model diagnostics visualization`, `heteroscedasticity residual plot`

---

### Module: Feature Engineering (s3m2)

#### 38. Categorical Encoding
- **Concept**: One-hot vs ordinal vs target encoding tradeoffs
- **Interaction Model**: Same data, toggle encoding method — see sparse matrix (one-hot) vs single column (ordinal) vs continuous (target)
- **Visual Approach**: Matrix visualization showing encoding output side by side
- **Technical Spec**: SVG/HTML table with animated transitions
- **Search Keywords**: `categorical encoding comparison visualization`, `one hot encoding matrix`, `target encoding leakage demo`

#### 39. Feature Scaling
- **Concept**: Standardization vs MinMax vs Robust scaling effects
- **Interaction Model**: Scaling method selector — show distribution transformation; gradient descent comparison with/without scaling
- **Visual Approach**: Before/after distribution overlays; contour plot showing gradient descent path difference
- **Technical Spec**: SVG distribution chart + contour plot
- **Search Keywords**: `feature scaling effect visualization`, `standardization vs normalization`, `gradient descent without scaling contour`
- **Competitor Reference**: scikit-learn preprocessing docs

#### 40. Polynomial Features
- **Concept**: Linear vs polynomial fit on curved data
- **Interaction Model**: Degree slider — watch fit curve change from underfit (linear) to overfit (wiggly)
- **Visual Approach**: Scatter plot with overlaid polynomial curve; train/test error plot showing bias-variance tradeoff
- **Technical Spec**: Canvas with real-time polynomial fitting
- **Search Keywords**: `polynomial regression degree slider`, `overfitting underfitting visualization`, `bias variance tradeoff interactive`

#### 41. Feature Selection
- **Concept**: Filter vs wrapper vs embedded methods
- **Interaction Model**: Feature importance bar chart with elimination animation
- **Visual Approach**: Horizontal bars ranked by importance; RFE shows bars being removed one by one
- **Technical Spec**: SVG bar chart with transitions
- **Search Keywords**: `feature importance visualization`, `recursive feature elimination animation`, `feature selection comparison`

#### 42. Domain-Driven Features
- **Concept**: Time features, aggregation features, leakage detection
- **Interaction Model**: Timestamp → extracted features animation (hour, day, month appearing as new columns)
- **Visual Approach**: Table with timestamp column; new columns animate into existence
- **Technical Spec**: HTML table with CSS animations
- **Search Keywords**: `feature engineering time series visualization`, `data leakage detection`, `domain feature extraction`

---

### Module: EDA (s3m3)

#### 43-45. EDA techniques, Correlation analysis, Distribution analysis
- **Concept**: Exploratory data analysis methodology
- **Interaction Model**: Interactive correlation heatmap with click-to-zoom scatter plots
- **Visual Approach**: Heatmap → click cell → scatter plot appears showing the relationship
- **Technical Spec**: SVG heatmap + linked scatter plot
- **Search Keywords**: `interactive correlation heatmap d3`, `EDA visualization dashboard`, `linked plots d3`
- **Competitor Reference**: Seaborn pairplot, Plotly Express

---

### Module: Data Splitting (s3m4)

#### 46-48. Train/Val/Test splits, Stratified splitting, Time-series CV
- **Concept**: Proper data splitting strategies
- **Interaction Model**: Dataset bar diagram showing different split strategies; time-series animation showing expanding window
- **Visual Approach**: Data points colored by split; k-fold animation rotating the validation fold
- **Technical Spec**: SVG rectangle diagram with animations
- **Search Keywords**: `k-fold cross validation animation`, `time series cross validation diagram`, `stratified split visualization`, `train test split diagram`
- **Competitor Reference**: scikit-learn cross-validation docs

---

## Subject 4: Machine Learning

### Module: ML Fundamentals (s4m1)

#### 49. Bias-Variance Tradeoff
- **Concept**: Underfitting vs overfitting; finding the sweet spot
- **Interaction Model**: Complexity slider — watch bias and variance curves cross; bullseye diagram
- **Visual Approach**: Dual: bias-variance curves + dart board analogy (high bias = clustered off-center, high variance = scattered)
- **Technical Spec**: SVG dual chart
- **Search Keywords**: `bias variance tradeoff visualization`, `underfitting overfitting slider`, `bias variance bullseye diagram`
- **Competitor Reference**: MLU-Explain bias-variance article

#### 50. Cross-Validation
- **Concept**: K-fold evaluation for robust performance estimation
- **Interaction Model**: Animate k-fold splits: data bar rotates validation window through each fold
- **Visual Approach**: Horizontal data bar with colored segments rotating position
- **Technical Spec**: SVG with CSS animation
- **Search Keywords**: `k-fold cross validation animation`, `cross validation visualization`, `leave one out cv diagram`

#### 51. Regularization
- **Concept**: L1 (Lasso) and L2 (Ridge) penalty effects
- **Interaction Model**: Lambda slider — watch coefficient magnitudes shrink; L1 drives some to exactly zero
- **Visual Approach**: Bar chart of coefficients shrinking as λ increases; contour plot showing constraint region
- **Technical Spec**: SVG bar chart + contour overlay
- **Search Keywords**: `lasso ridge regularization visualization`, `L1 L2 penalty contour plot`, `regularization coefficient path`
- **Competitor Reference**: Elements of Statistical Learning figures

---

### Module: Tree Models (s4m2)

#### 52. Decision Trees
- **Concept**: Recursive splitting by information gain
- **Interaction Model**: Step-through tree building — each click adds a split, shows Gini reduction
- **Visual Approach**: Tree growing one split at a time; data space shows partition appearing
- **Technical Spec**: SVG tree + linked scatter plot with decision regions
- **Search Keywords**: `decision tree building animation`, `information gain visualization`, `decision tree boundary interactive`, `r2d3 decision tree`
- **Competitor Reference**: r2d3.us "A Visual Introduction to Machine Learning"

#### 53. Random Forests & Bagging
- **Concept**: Multiple trees averaging predictions
- **Interaction Model**: Show individual tree predictions (noisy) vs ensemble average (smooth)
- **Visual Approach**: Multiple small trees with individual boundaries fading; composite boundary emerging
- **Technical Spec**: Multi-panel SVG
- **Search Keywords**: `random forest individual trees visualization`, `bagging ensemble animation`, `variance reduction ensemble`

#### 54. Gradient Boosting
- **Concept**: Sequential error correction
- **Interaction Model**: Step through boosting rounds — each tree corrects residuals from previous
- **Visual Approach**: Residual scatter plot that gets progressively flatter with each round
- **Technical Spec**: Animated scatter + running fit curve
- **Search Keywords**: `gradient boosting visualization step by step`, `xgboost learning animation`, `boosting residual correction`
- **Competitor Reference**: MLU-Explain boosting article

---

### Module: Distance & Instance Models (s4m3)

#### 55. SVM
- **Concept**: Maximum margin hyperplane with support vectors
- **Interaction Model**: Drag data points — watch margin and hyperplane shift in real-time
- **Visual Approach**: 2D scatter with margin band; support vectors highlighted; drag point to see boundary move
- **Technical Spec**: SVG scatter with interactive drag
- **Search Keywords**: `svm margin visualization interactive`, `support vector machine boundary`, `maximum margin hyperplane d3`

#### 56. KNN ✅ IMPLEMENTED (Decision Boundaries)
- **Primitive**: BoundaryMorphing (boundary-morphing)
- **Status**: Working — K slider morphs boundary from fragmented to smooth
- **Enhance**: Add probability gradient toggle, show Voronoi regions

#### 57. Distance Metrics
- **Concept**: Euclidean vs Manhattan vs Cosine distance
- **Interaction Model**: Toggle distance metric — watch distance circles morph (circle → diamond → arc)
- **Visual Approach**: Isocontour lines around a query point changing shape with metric
- **Technical Spec**: SVG contour animation
- **Search Keywords**: `distance metric comparison visualization`, `euclidean manhattan cosine interactive`, `distance metric isocontour`

---

### Module: Clustering (s4m4)

#### 58. K-Means ✅ IMPLEMENTED
- **Primitive**: ClusterFormation (cluster-formation)
- **Status**: Working — K slider changes cluster count, centroids animate
- **Enhance**: Add step-by-step mode showing assign → update cycle

#### 59. Hierarchical Clustering
- **Concept**: Dendrogram building from bottom up (agglomerative)
- **Interaction Model**: Step through merges; cut height slider to select number of clusters
- **Visual Approach**: Points merging into clusters; dendrogram growing; horizontal cut line
- **Technical Spec**: SVG dendrogram with animation
- **Search Keywords**: `hierarchical clustering dendrogram animation`, `agglomerative clustering step by step`, `dendrogram interactive cut`

#### 60. DBSCAN
- **Concept**: Density-based clustering with noise detection
- **Interaction Model**: ε radius slider and minPts control — watch clusters form and noise points appear
- **Visual Approach**: Points with expanding radius circles; core/border/noise coloring
- **Technical Spec**: SVG with radius circles animation
- **Search Keywords**: `DBSCAN visualization interactive`, `density based clustering animation`, `DBSCAN epsilon minpts slider`

---

### Module: Dimensionality Reduction (s4m5)

#### 61. PCA
- **Concept**: Finding principal axes of maximum variance
- **Interaction Model**: 2D data cloud → show PC1 and PC2 axes → project onto PC1 line
- **Visual Approach**: Scatter plot with rotatable axes; projection lines from points to axis
- **Technical Spec**: SVG with rotation animation
- **Search Keywords**: `PCA visualization 2d interactive`, `principal component analysis projection`, `PCA explained variance`
- **Competitor Reference**: Setosa.io PCA explained visually

#### 62. t-SNE
- **Concept**: Non-linear dimensionality reduction preserving neighborhoods
- **Interaction Model**: Perplexity slider — watch clusters form/dissolve in 2D projection; step through iterations
- **Visual Approach**: Points moving from random positions to meaningful clusters over iterations
- **Technical Spec**: Canvas with particle animation (many points)
- **Search Keywords**: `t-SNE visualization interactive`, `t-SNE perplexity effect`, `dimensionality reduction animation`
- **Competitor Reference**: Distill.pub "How to Use t-SNE Effectively"

#### 63. Feature Extraction
- **Concept**: Deriving new features from existing ones (autoencoders, embeddings)
- **Interaction Model**: Show high-dim data → bottleneck → reconstructed data; toggle latent dimensions
- **Visual Approach**: Hourglass diagram with data flowing through narrow bottleneck
- **Technical Spec**: SVG flow diagram with animated particles
- **Search Keywords**: `autoencoder visualization`, `feature extraction bottleneck diagram`, `embedding space visualization`

---

### Module: Probabilistic Models (s4m6)

#### 64. Bayes Theorem & Conditional Probability
- **Concept**: Bayesian inference and belief updating
- **Interaction Model**: Prior/likelihood sliders → watch posterior shift; medical test example
- **Visual Approach**: Animated bar chart showing prior → posterior transition with evidence multiplier
- **Technical Spec**: SVG bar chart with smooth transitions
- **Search Keywords**: `bayesian inference visualization`, `bayes theorem interactive`, `prior posterior animation`

#### 65. Naive Bayes Classifier
- **Concept**: Independence assumption enables fast classification
- **Interaction Model**: Show feature likelihoods per class; multiply them together; classify new point
- **Visual Approach**: Side-by-side class distributions per feature; product visualization
- **Technical Spec**: SVG distribution panels
- **Search Keywords**: `naive bayes classifier visualization`, `conditional independence demo`, `naive bayes step by step`

#### 66. Hidden Markov Models / Latent Variables
- **Concept**: Hidden states generating observable outputs
- **Interaction Model**: State machine diagram; reveal hidden state sequence given observations
- **Visual Approach**: Two-row animation: hidden states (top) → emissions (bottom) with connecting arrows
- **Technical Spec**: SVG state diagram with animation
- **Search Keywords**: `hidden markov model visualization`, `HMM viterbi animation`, `latent variable graphical model`

---

### Module: Evaluation (s4m7 — if exists)

#### 67. Imbalanced Datasets and Threshold Tuning ✅ IMPLEMENTED
- **Primitive**: ParameterSensitivity (threshold-tuning)
- **Status**: Working — threshold slider shows precision-recall tradeoff

#### 68. Underfitting vs Overfitting ✅ IMPLEMENTED
- **Primitive**: FitProgression (polynomial-fit)
- **Status**: Working — polynomial degree slider shows bias-variance tradeoff

#### 69. Classification Metrics ✅ IMPLEMENTED
- **Primitive**: MetricDashboard (metric-dashboard)  
- **Status**: Working — threshold slider animates confusion matrix

---

## Subject 5: Deep Learning

### Module: Neural Network Fundamentals (s5m1)

#### 70. Neural Network Architecture ✅ IMPLEMENTED
- **Primitive**: NetworkForwardPass (network-forward-pass)
- **Status**: Working — input slider shows values propagating through layers

#### 71. Forward and Backward Propagation ✅ IMPLEMENTED
- **Primitive**: GradientBackflow (gradient-backflow)
- **Status**: Working — error slider shows gradient flow, vanishing gradient demo

#### 72. Loss Functions
- **Concept**: MSE, Cross-entropy, Hinge loss — how they penalize errors differently
- **Interaction Model**: Predicted probability slider — see how each loss function penalizes the same error
- **Visual Approach**: Overlaid loss curves showing MSE (quadratic), cross-entropy (logarithmic), hinge (linear then flat)
- **Technical Spec**: SVG multi-line chart with shared x-axis
- **Search Keywords**: `loss function comparison visualization`, `cross entropy vs mse chart`, `loss function curves interactive`

---

### Module: Training Techniques (s5m2)

#### 73. Batch Normalization
- **Concept**: Normalizing layer activations for stable training
- **Interaction Model**: Toggle BN on/off — watch activation distributions stabilize
- **Visual Approach**: Histogram of activations per layer: without BN (shifting, wide) vs with BN (centered, stable)
- **Technical Spec**: SVG histogram grid
- **Search Keywords**: `batch normalization visualization`, `internal covariate shift animation`, `batch norm activation distribution`

#### 74. Dropout
- **Concept**: Random neuron deactivation for regularization
- **Interaction Model**: Toggle dropout — watch neurons randomly deactivate; show ensemble interpretation
- **Visual Approach**: Network diagram with neurons blinking on/off; ensemble of sub-networks fading in/out
- **Technical Spec**: SVG network diagram with animation
- **Search Keywords**: `dropout neural network visualization`, `dropout regularization animation`, `dropout ensemble interpretation`

#### 75. Vanishing/Exploding Gradients
- **Concept**: Gradient magnitude problems in deep networks
- **Interaction Model**: Toggle activation function — see gradient magnitude bars per layer (sigmoid = vanish, ReLU = stable)
- **Visual Approach**: Bar chart of gradient magnitudes per layer; sigmoid bars shrink to nothing, ReLU stays
- **Technical Spec**: SVG bar chart with animation
- **Search Keywords**: `vanishing gradient visualization`, `gradient magnitude per layer`, `sigmoid vs relu gradient flow`
- **Competitor Reference**: 3Blue1Brown deep learning series

---

### Module: CNNs (s5m3)

#### 76. CNN Architecture
- **Concept**: Convolution → Pooling → Fully Connected pipeline
- **Interaction Model**: Step through layers showing feature maps at each stage
- **Visual Approach**: Layer-by-layer visualization: input image → edge maps → texture maps → abstract features → class scores
- **Technical Spec**: Canvas with feature map grid visualization
- **Search Keywords**: `CNN feature visualization`, `convolutional neural network layer by layer`, `CNN architecture animation`, `feature map visualization`
- **Competitor Reference**: CNN Explainer (poloclub.github.io/cnn-explainer), Distill.pub feature visualization

#### 77. Pooling Operations
- **Concept**: Max pooling and average pooling for downsampling
- **Interaction Model**: Highlight pooling window sliding across feature map; compare max vs average output
- **Visual Approach**: Grid with sliding window; selected values highlighted; output grid filling in
- **Technical Spec**: SVG grid with sliding window animation
- **Search Keywords**: `max pooling animation`, `pooling operation step by step`, `CNN pooling visualization`

#### 78. Transfer Learning
- **Concept**: Pre-trained features as starting point for new tasks
- **Interaction Model**: Show frozen base layers + trainable top layers; feature reuse diagram
- **Visual Approach**: Network diagram with lower layers locked (frozen), upper layers highlighted as trainable
- **Technical Spec**: SVG network diagram with layer highlighting
- **Search Keywords**: `transfer learning visualization`, `fine tuning frozen layers diagram`, `pretrained features reuse`

---

### Module: Sequence Models (s5m4)

#### 79. RNNs
- **Concept**: Processing sequences with recurrent connections
- **Interaction Model**: Step through sequence — watch hidden state evolve token by token
- **Visual Approach**: Unrolled RNN diagram with hidden state flowing right; current token highlighted
- **Technical Spec**: SVG sequence diagram with animation
- **Search Keywords**: `RNN unrolled visualization`, `recurrent neural network animation`, `hidden state sequence`
- **Competitor Reference**: Distill.pub "Understanding LSTMs"

#### 80. LSTMs & GRUs
- **Concept**: Gated memory for long-range dependencies
- **Interaction Model**: Step through gates — show forget, input, output gates controlling information flow
- **Visual Approach**: LSTM cell diagram with gates opening/closing, cell state line flowing through
- **Technical Spec**: SVG cell diagram with gate animations
- **Search Keywords**: `LSTM cell visualization`, `LSTM gates animation`, `forget gate input gate interactive`, `GRU vs LSTM diagram`
- **Competitor Reference**: Distill.pub "Understanding LSTMs", colah's blog

#### 81. Encoder-Decoder & Seq2Seq
- **Concept**: Encoding input sequence to context vector, decoding to output sequence
- **Interaction Model**: Show encoding phase compressing, then decoding phase generating
- **Visual Approach**: Two-sided animation: encoder (left) compresses sequence → context vector (center) → decoder (right) expands
- **Technical Spec**: SVG flow diagram
- **Search Keywords**: `encoder decoder visualization`, `seq2seq animation`, `attention mechanism visualization`
- **Competitor Reference**: Jay Alammar "Illustrated Transformer"

---

### Module: Generative Models (s5m5)

#### 82. VAEs
- **Concept**: Encoding to latent space with regularization, generating new samples
- **Interaction Model**: Latent space 2D plot — click/drag to generate new samples; interpolation between points
- **Visual Approach**: 2D latent space scatter (colored by class) with generated sample preview; smooth interpolation path
- **Technical Spec**: Canvas latent space + generated sample display
- **Search Keywords**: `VAE latent space visualization`, `variational autoencoder interpolation`, `latent space exploration interactive`

#### 83. GANs
- **Concept**: Generator vs discriminator adversarial training
- **Interaction Model**: Step through training: generator improves, discriminator adapts
- **Visual Approach**: Two-agent diagram with generated samples improving over rounds; discriminator confidence bars
- **Technical Spec**: SVG diagram + sample quality progression
- **Search Keywords**: `GAN training visualization`, `generator discriminator animation`, `GAN mode collapse visualization`
- **Competitor Reference**: GAN Lab (poloclub.github.io/ganlab)

#### 84. Diffusion Models
- **Concept**: Progressive noise addition and learned denoising
- **Interaction Model**: Timestep slider — watch image progressively add/remove noise
- **Visual Approach**: Image going from clean → pure noise (forward) then noise → clean (reverse)
- **Technical Spec**: Canvas with image noise overlay
- **Search Keywords**: `diffusion model visualization`, `denoising diffusion step by step`, `noise schedule animation`

---

### Module: Advanced Architectures (s5m6 — if exists)

#### 85. Attention Mechanism
- **Concept**: Weighted focus on relevant parts of input
- **Interaction Model**: Input sentence → attention weights heatmap showing which words attend to which
- **Visual Approach**: Matrix heatmap with brightness = attention weight; connecting lines between tokens
- **Technical Spec**: SVG heatmap + token connections
- **Search Keywords**: `attention mechanism visualization`, `self attention heatmap`, `transformer attention weights`, `attention is all you need visualization`
- **Competitor Reference**: Jay Alammar "Illustrated Transformer", BertViz

#### 86. Transformers
- **Concept**: Self-attention + positional encoding + multi-head attention
- **Interaction Model**: Step through transformer block: embed → attend → feedforward → output
- **Visual Approach**: Block diagram with data flowing through each sub-layer; attention heads shown as parallel streams
- **Technical Spec**: SVG block diagram
- **Search Keywords**: `transformer architecture visualization`, `multi-head attention diagram`, `transformer block animation`
- **Competitor Reference**: Jay Alammar "Illustrated Transformer"

#### 87. ResNets & Skip Connections
- **Concept**: Identity shortcuts enabling very deep networks
- **Interaction Model**: Toggle skip connections — watch gradient flow improve through very deep network
- **Visual Approach**: Deep network with gradient magnitude bars; skip connections shown as bypass arrows
- **Technical Spec**: SVG network diagram
- **Search Keywords**: `resnet skip connection visualization`, `residual connection gradient flow`, `identity mapping deep network`

---

## Subject 6: Applied ML

### Modules: s6m1 through s6m5 cover practical ML deployment topics

#### 88-100. Applied ML Topics (Industry Applications, Deployment, Monitoring, Experiment Tracking)
- **Concept**: Production ML systems, MLOps, and real-world deployment
- **Interaction Model**: Pipeline/workflow diagrams with animated data flow; dashboard mockups
- **Visual Approach**: Flowcharts, system architecture diagrams, monitoring dashboards
- **Technical Spec**: SVG flow diagrams, dashboard layouts
- **Search Keywords**: `MLOps pipeline visualization`, `model monitoring dashboard`, `model deployment architecture`, `A/B testing ml diagram`, `feature store architecture`, `data drift detection visualization`, `experiment tracking dashboard`
- **Competitor Reference**: MLflow UI, Weights & Biases dashboards, Neptune.ai, Google Vertex AI docs
- **Note**: These topics benefit from **architecture diagrams and dashboard mockups** rather than mathematical animations

---

## Subject 7: Ethics & Systems

### Modules: s7m1 through s7m4 cover ethics, privacy, and systems

#### 101-137. Ethics, Privacy, End-to-End Systems, Deployment
- **Concept**: Responsible AI, privacy-preserving ML, production system design
- **Interaction Model**: Interactive case studies; bias detection demos; differential privacy noise slider
- **Visual Approach**: Fairness metric comparison dashboards; privacy budget visualization; system architecture diagrams
- **Technical Spec**: SVG diagrams, interactive case studies
- **Search Keywords**: `algorithmic fairness visualization`, `differential privacy interactive`, `federated learning animation`, `model bias detection demo`, `responsible AI dashboard`, `privacy budget visualization`, `docker containerization diagram`, `REST API architecture ml`, `batch vs realtime inference comparison`
- **Competitor Reference**: Google What-If Tool, AI Fairness 360 (IBM), Opacus (PyTorch Privacy)
- **Note**: Ethics topics benefit most from **interactive case studies** and **fairness comparison tools** rather than mathematical animations

---

## Priority Ranking for Animation Development

### Tier 1: Highest Impact (start here)
| # | Topic | Why |
|---|-------|-----|
| 1 | Gradient Descent Algorithms (#14) | Core ML concept, highly visual, optimizer comparison |
| 2 | Decision Tree Building (#52) | Very intuitive, great step-through potential |
| 3 | PCA (#61) | Geometric intuition, existing reference implementations |
| 4 | Bias-Variance Tradeoff (#49) | Universal concept, bullseye + curves |
| 5 | CNN Feature Visualization (#76) | Wow factor, strong competitor references |

### Tier 2: High Impact
| # | Topic | Why |
|---|-------|-----|
| 6 | LSTM Gates (#80) | Complex concept that benefits enormously from visualization |
| 7 | Attention Mechanism (#85) | Modern relevance (transformers everywhere) |
| 8 | t-SNE Perplexity (#62) | Interactive exploration, Distill.pub reference |
| 9 | GAN Training (#83) | GAN Lab reference exists, high engagement |
| 10 | SVM Margins (#55) | Classic ML, draggable points = great interaction |

### Tier 3: Medium Impact
- Matrix Transformations (#9), Eigenvalues (#10), DBSCAN (#60)
- Boosting step-through (#54), Regularization (#51), Diffusion (#84)

### Tier 4: Lower Priority (diagram-first)
- Applied ML topics (#88-100) — architecture diagrams
- Ethics topics (#101-137) — case studies and fairness tools
- Programming topics (#15-19) — code sandbox is sufficient

---

## Technical Stack Recommendations

| Component | Recommendation | Why |
|-----------|---------------|-----|
| 2D Charts | D3.js or Recharts | Smooth transitions, responsive |
| Canvas Animations | HTML Canvas 2D API | Particle systems, many points |
| 3D Visualizations | Three.js | Loss surfaces, point clouds |
| Network Diagrams | SVG + D3 force layout | Neural network structures |
| Interactive Widgets | React + CSS transitions | Sliders, toggles, buttons |
| Code Execution | Pyodide (in-browser) | No backend needed for demos |
