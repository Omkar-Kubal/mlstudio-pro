# Subject 6: Deep Learning

> Neural networks are computational models that excel at learning complex, non-linear patterns. Through layers of connected neurons and learned representations, they can approximate any continuous function—the foundation of modern AI.

---

# Module 1: Neural Network Fundamentals

## Topic 1: Why Neural Networks

### Conceptual Intuition

Traditional machine learning hits a wall with complex data. Linear models can only learn linear relationships. Even polynomial features have limits—you need to know *which* polynomial features matter in advance.

Neural networks solve this through three key properties:

1. **Universal approximation**: With enough neurons, a neural network can approximate any continuous function. Not a specific pattern—*any* pattern.

2. **Automatic feature learning**: Instead of manual feature engineering, networks learn hierarchical representations:
   - Layer 1: edges, gradients, simple textures
   - Layer 2: shapes, patterns, combinations
   - Layer 3: parts of objects
   - Deep layers: complete concepts

3. **Scalability**: Unlike traditional ML that plateaus, neural network performance keeps improving with more data.

**Limitations**: Require large labeled datasets, computationally expensive, "black box" nature makes interpretation challenging.

### Visual Justification

**V1 Visual**: `boundary-morphing` (P3)

Show a spiral dataset. A linear model draws a straight line (fails completely). A polynomial model does a little better. A neural network creates a complex boundary that perfectly separates the spiral arms.

### Formal Definition

**Universal Approximation Theorem**: A feedforward network with a single hidden layer containing a finite number of neurons can approximate any continuous function on compact subsets of Rⁿ, under mild assumptions on the activation function.

```python
# Optional verification
from sklearn.datasets import make_moons
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split

# Non-linear dataset
X, y = make_moons(n_samples=1000, noise=0.2, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Compare models
linear = LogisticRegression().fit(X_train, y_train)
nn = MLPClassifier(hidden_layer_sizes=(10, 10), max_iter=1000).fit(X_train, y_train)

print(f"Linear Model Accuracy: {linear.score(X_test, y_test):.3f}")
print(f"Neural Network Accuracy: {nn.score(X_test, y_test):.3f}")
```

---

## Topic 2: The Perceptron

### Conceptual Intuition

The **perceptron** is the simplest artificial neuron—the building block of all neural networks.

**Components**:
- **Inputs (x)**: Feature values
- **Weights (w)**: Learned importance of each input
- **Bias (b)**: Shifts the decision threshold
- **Activation**: Step function that outputs 0 or 1

**The process**:
1. Compute weighted sum: z = w·x + b
2. Apply step activation: output = 1 if z ≥ 0, else 0

**Learning**: Adjust weights based on errors: w = w + α(y - ŷ)x

**Critical limitation**: A single perceptron can only learn **linearly separable** patterns. It cannot solve XOR. This limitation, proven by Minsky & Papert in 1969, drove the development of multi-layer networks.

### Visual Justification

**V1 Visual**: `boundary-morphing` (P3)

2D scatter with two classes. The perceptron's linear boundary adjusts during training. Show the weight vector as an arrow—the boundary is perpendicular to this vector.

### Formal Definition

**Perceptron output**:
$$y = \begin{cases} 1 & \text{if } \mathbf{w}^T\mathbf{x} + b \geq 0 \\ 0 & \text{otherwise} \end{cases}$$

**Perceptron learning rule**:
$$\mathbf{w}^{(t+1)} = \mathbf{w}^{(t)} + \alpha(y - \hat{y})\mathbf{x}$$

```python
# Optional verification
import numpy as np

class Perceptron:
    def __init__(self, lr=0.01, n_iter=1000):
        self.lr = lr
        self.n_iter = n_iter
        
    def fit(self, X, y):
        self.weights = np.zeros(X.shape[1])
        self.bias = 0
        
        for _ in range(self.n_iter):
            for xi, yi in zip(X, y):
                z = np.dot(xi, self.weights) + self.bias
                y_pred = 1 if z >= 0 else 0
                error = yi - y_pred
                self.weights += self.lr * error * xi
                self.bias += self.lr * error
        return self
    
    def predict(self, X):
        z = np.dot(X, self.weights) + self.bias
        return np.where(z >= 0, 1, 0)

# AND gate (linearly separable)
X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
y = np.array([0, 0, 0, 1])

perceptron = Perceptron(lr=0.1).fit(X, y)
print("Predictions:", perceptron.predict(X))
print("True labels: ", y)
```

---

## Topic 3: Neural Network Architecture

### Conceptual Intuition

A neural network arranges neurons into **layers**:

- **Input layer**: One neuron per feature (no computation, just passes data)
- **Hidden layers**: Where the learning happens—transform input into useful representations
- **Output layer**: Produces final predictions (1 neuron for binary classification, K for K classes)

**Architecture design**:
- **Depth** = number of hidden layers (deep networks learn hierarchical features)
- **Width** = neurons per layer (wider layers = more parameters)
- **Connections**: Typically fully connected between adjacent layers

**Common patterns**:
- Start with 1-2 hidden layers
- Use decreasing sizes: [256, 128, 64]
- Number of neurons between input size and output size
- More layers = more abstraction but harder to train

### Visual Justification

**V1 Visual**: Static network diagram (No primitive needed)

Show connected layers: circles (neurons) arranged in columns (layers), with lines showing connections. Label input, hidden, and output layers.

### Formal Definition

**Network notation**: [n⁽⁰⁾, n⁽¹⁾, ..., n⁽L⁾] where n⁽ˡ⁾ = neurons in layer l

**Parameter count** for layer l:
$$\text{params}_l = n^{(l-1)} \times n^{(l)} + n^{(l)}$$

(weights + biases)

```python
# Optional verification
from tensorflow import keras
from tensorflow.keras import layers

def create_network(architecture):
    """architecture: list like [784, 128, 64, 10]"""
    model = keras.Sequential()
    model.add(layers.Dense(architecture[1], activation='relu', 
                           input_shape=(architecture[0],)))
    for size in architecture[2:-1]:
        model.add(layers.Dense(size, activation='relu'))
    model.add(layers.Dense(architecture[-1], activation='softmax'))
    return model

# Example architectures
shallow = create_network([784, 64, 10])
deep = create_network([784, 128, 64, 32, 10])

print("Shallow network parameters:", shallow.count_params())
print("Deep network parameters:", deep.count_params())
```

---

## Topic 4: Activation Functions

### Conceptual Intuition

Without activation functions, a neural network is just a linear transformation—no matter how many layers, it collapses to a single linear function.

**Activation functions introduce non-linearity**:

**Sigmoid**: σ(z) = 1/(1+e⁻ᶻ)
- Output range: (0, 1)
- Good for probability outputs
- **Problem**: Saturates for large |z|, causing vanishing gradients

**ReLU** (Rectified Linear Unit): max(0, z)
- Simple and fast
- Avoids vanishing gradients for positive inputs
- **Problem**: "Dying ReLU" for negative inputs (gradient = 0 forever)

**Softmax** (for output layer):
- Converts scores to probabilities that sum to 1
- Used for multi-class classification

**Practical choice**: ReLU for hidden layers, sigmoid/softmax for output.

### Visual Justification

**V1 Visual**: Static function plots (No primitive needed)

Show three side-by-side plots: sigmoid (S-curve bounded 0-1), ReLU (linear for positive, zero for negative), tanh (S-curve bounded -1 to 1).

### Formal Definition

**Sigmoid**:
$$\sigma(z) = \frac{1}{1 + e^{-z}}$$

**ReLU**:
$$\text{ReLU}(z) = \max(0, z)$$

**Softmax** (for class k):
$$\text{softmax}(z)_k = \frac{e^{z_k}}{\sum_{j} e^{z_j}}$$

```python
# Optional verification
import numpy as np

z = np.linspace(-5, 5, 100)

# Sigmoid
sigmoid = 1 / (1 + np.exp(-z))

# ReLU
relu = np.maximum(0, z)

# Tanh
tanh = np.tanh(z)

# Derivatives
sigmoid_deriv = sigmoid * (1 - sigmoid)  # Max at 0.25
relu_deriv = np.where(z > 0, 1, 0)
```

---

## Topic 5: Forward and Backward Propagation

### Conceptual Intuition

Training a neural network has two phases:

**Forward propagation**: Data flows input → output
1. For each layer: compute z = Wx + b
2. Apply activation: a = σ(z)
3. Pass to next layer
4. Compare final output to true label using a **loss function**

**Backward propagation**: Gradients flow output → input
1. Compute gradient of loss with respect to output
2. Use chain rule to propagate gradient backward through each layer
3. Each layer computes: ∂L/∂W, ∂L/∂b
4. Update weights: W = W - α × ∂L/∂W

**Loss functions**:
- **Cross-entropy** for classification: L = -Σ y·log(ŷ)
- **MSE** for regression: L = Σ(y - ŷ)²

### Visual Justification

**V1 Visual**: Static flow diagram (No primitive needed)

Two panels: Forward pass shows data flowing left-to-right with activations highlighted. Backward pass shows gradients flowing right-to-left with weight updates shown.

### Formal Definition

**Forward pass** for layer l:
$$\mathbf{z}^{(l)} = \mathbf{W}^{(l)}\mathbf{a}^{(l-1)} + \mathbf{b}^{(l)}$$
$$\mathbf{a}^{(l)} = \sigma(\mathbf{z}^{(l)})$$

**Gradient descent update**:
$$\mathbf{W} = \mathbf{W} - \alpha \frac{\partial L}{\partial \mathbf{W}}$$

```python
# Optional verification
from tensorflow import keras
from tensorflow.keras import layers

# Load MNIST
(X_train, y_train), (X_test, y_test) = keras.datasets.mnist.load_data()
X_train = X_train.reshape(-1, 784).astype('float32') / 255.0
X_test = X_test.reshape(-1, 784).astype('float32') / 255.0

# Build model
model = keras.Sequential([
    layers.Dense(128, activation='relu', input_shape=(784,)),
    layers.Dense(64, activation='relu'),
    layers.Dense(10, activation='softmax')
])

model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# Train (forward + backward + update happens automatically)
history = model.fit(X_train, y_train, epochs=5, validation_split=0.2, verbose=1)

test_loss, test_acc = model.evaluate(X_test, y_test)
print(f"Test accuracy: {test_acc:.4f}")
```

---

# Module 2: Deep Learning Optimization

## Topic 1: Vanishing Gradients

### Conceptual Intuition

The **vanishing gradient problem** was the major bottleneck preventing deep networks before modern solutions.

**The problem**: During backpropagation, gradients are multiplied through each layer. If these multipliers are small (< 1), gradients shrink exponentially. After 10 layers with sigmoid (max derivative 0.25): gradient ∝ 0.25¹⁰ ≈ 0.000001

**Why sigmoid causes this**:
- Sigmoid derivative peaks at 0.25
- In saturated regions (very negative or positive z), derivative ≈ 0
- Gradients die before reaching early layers

**Solutions**:
- ReLU activation (gradient = 1 for positive inputs)
- Better initialization (Xavier, He)
- Batch Normalization
- Skip connections (ResNet)

### Visual Justification

**V1 Visual**: Static gradient flow diagram (No primitive needed)

Bar chart showing gradient magnitude by layer during training. With sigmoid: bars shrink exponentially toward early layers. With ReLU: bars remain relatively stable.

### Formal Definition

For a network with n layers using sigmoid activation:
$$\frac{\partial L}{\partial \mathbf{W}^{(1)}} \propto \prod_{l=1}^{n} \sigma'(\mathbf{z}^{(l)}) \cdot \mathbf{W}^{(l)}$$

Since max(σ'(z)) = 0.25, gradient decays as O(0.25ⁿ).

```python
# Optional verification
import numpy as np

def simulate_gradient_flow(n_layers, activation='sigmoid'):
    """Simulate gradient magnitude through deep network"""
    gradient = np.ones(100)  # Initial gradient from loss
    magnitudes = []
    
    for i in range(n_layers):
        W = np.random.randn(100, 100) * 0.5
        
        # Simulate activation derivative
        if activation == 'sigmoid':
            grad_activation = np.random.uniform(0.1, 0.25, 100)
        else:  # relu
            grad_activation = np.random.choice([0, 1], 100, p=[0.3, 0.7])
        
        gradient = gradient * grad_activation
        gradient = np.dot(gradient, W.T[:100, :100])
        magnitudes.append(np.mean(np.abs(gradient)))
    
    return magnitudes

sigmoid_grads = simulate_gradient_flow(10, 'sigmoid')
relu_grads = simulate_gradient_flow(10, 'relu')

print("Sigmoid gradient magnitudes:", [f"{g:.6f}" for g in sigmoid_grads])
print("ReLU gradient magnitudes:", [f"{g:.6f}" for g in relu_grads])
```

---

## Topic 2: Batch Normalization

### Conceptual Intuition

**Batch Normalization** normalizes the inputs to each layer, stabilizing and accelerating training.

**The problem it solves**: During training, the distribution of each layer's inputs keeps shifting as earlier layers update—called "internal covariate shift." Each layer must constantly adapt to changing inputs.

**How it works**:
1. For each mini-batch, compute mean μ and variance σ²
2. Normalize: x̂ = (x - μ) / √(σ² + ε)
3. Scale and shift with learnable parameters γ and β

**Benefits**:
- Stabilizes input distributions across layers
- Allows higher learning rates
- Acts as regularization (batch statistics add noise)
- Reduces sensitivity to initialization

**Important**: Training uses batch statistics; inference uses running averages collected during training.

### Visual Justification

**V1 Visual**: `distribution-evolution` (P1)

Two histograms side-by-side showing activation distributions over training epochs. Without BatchNorm: distributions shift dramatically. With BatchNorm: stable, centered distributions throughout training.

### Formal Definition

**Batch Normalization**:
$$\hat{x}_i = \frac{x_i - \mu_B}{\sqrt{\sigma_B^2 + \epsilon}}$$
$$y_i = \gamma \hat{x}_i + \beta$$

Where μ_B and σ_B² are batch mean and variance, γ and β are learned.

```python
# Optional verification
from tensorflow import keras
from tensorflow.keras import layers

(X_train, y_train), _ = keras.datasets.mnist.load_data()
X_train = X_train.reshape(-1, 784).astype('float32') / 255.0

# With BatchNorm
model_with_bn = keras.Sequential([
    layers.Dense(256, input_shape=(784,)),
    layers.BatchNormalization(),
    layers.Activation('relu'),
    layers.Dense(128),
    layers.BatchNormalization(),
    layers.Activation('relu'),
    layers.Dense(10, activation='softmax')
])

model_with_bn.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
history = model_with_bn.fit(X_train, y_train, epochs=3, validation_split=0.2, verbose=0)
print(f"With BatchNorm: val_accuracy = {history.history['val_accuracy'][-1]:.4f}")
```

---

## Topic 3: Weight Initialization

### Conceptual Intuition

How you initialize weights matters *a lot*. Poor initialization can doom training before it starts.

**If weights are too small**: Signals shrink as they pass through layers, vanishing
**If weights are too large**: Signals explode, or activations saturate

**Xavier initialization** (for tanh/sigmoid):
- W ~ N(0, 1/n_in)
- Maintains variance across layers for symmetric activations

**He initialization** (for ReLU):
- W ~ N(0, 2/n_in)
- Uses larger variance because ReLU zeroes half the inputs

With proper initialization + ReLU + BatchNorm, training deep networks (10-100+ layers) becomes feasible.

### Visual Justification

**V1 Visual**: Static bar chart (No primitive needed)

Show activation magnitude by layer with different initializations. Poor init: magnitudes explode or decay. Proper init: stable magnitudes layer to layer.

### Formal Definition

**Xavier initialization**:
$$W \sim \mathcal{N}\left(0, \frac{1}{n_{in}}\right)$$

**He initialization**:
$$W \sim \mathcal{N}\left(0, \frac{2}{n_{in}}\right)$$

```python
# Optional verification
from tensorflow.keras import layers, initializers

# Xavier/Glorot initialization (default for Dense)
xavier_layer = layers.Dense(
    64, 
    kernel_initializer=initializers.GlorotNormal(),
    activation='tanh'
)

# He initialization (for ReLU)
he_layer = layers.Dense(
    64,
    kernel_initializer=initializers.HeNormal(),
    activation='relu'
)

print("Xavier init for tanh/sigmoid")
print("He init for ReLU")
```

---

## Topic 4: Advanced Optimizers

### Conceptual Intuition

**Stochastic Gradient Descent (SGD)** is the baseline optimizer, but it has issues:
- Can oscillate in ravines
- Slow convergence
- Same learning rate for all parameters

**Momentum** adds velocity:
- Accumulates gradient direction over time
- Smooths out oscillations
- Helps escape shallow local minima

**Adam** (Adaptive Moment Estimation) is the default choice:
- Combines momentum (first moment) with adaptive learning rates (second moment)
- Different parameters can have different effective learning rates
- Works well out-of-the-box for most problems

**Learning rate scheduling**: Start high for fast progress, decrease over time for fine-tuning. Common schedules: step decay, exponential decay, cosine annealing.

### Visual Justification

**V1 Visual**: Static contour plot (No primitive needed)

Show optimization paths on a loss landscape. SGD oscillates, momentum follows smoother path, Adam adapts to the landscape curvature.

### Formal Definition

**Adam update** (simplified):
$$m_t = \beta_1 m_{t-1} + (1-\beta_1)g_t \quad \text{(momentum)}$$
$$v_t = \beta_2 v_{t-1} + (1-\beta_2)g_t^2 \quad \text{(adaptive learning rate)}$$
$$\theta_{t+1} = \theta_t - \frac{\alpha}{\sqrt{\hat{v}_t} + \epsilon}\hat{m}_t$$

```python
# Optional verification
from tensorflow import keras
from tensorflow.keras import layers, optimizers

model = keras.Sequential([
    layers.Dense(128, activation='relu', input_shape=(784,)),
    layers.Dense(10, activation='softmax')
])

# Different optimizers
optimizer_configs = [
    ('SGD', optimizers.SGD(learning_rate=0.01)),
    ('SGD+Momentum', optimizers.SGD(learning_rate=0.01, momentum=0.9)),
    ('Adam', optimizers.Adam(learning_rate=0.001)),
]

for name, opt in optimizer_configs:
    print(f"Optimizer: {name}")
```

---

## Topic 5: Regularization Techniques

### Conceptual Intuition

Neural networks with millions of parameters can easily memorize training data. **Regularization** prevents overfitting.

**Dropout**:
- Randomly zero out neurons during training (probability p)
- Forces redundant representations—network can't rely on any single neuron
- Typical p = 0.2 to 0.5
- Disabled during inference

**L2 Regularization (Weight Decay)**:
- Add λΣw² to loss
- Penalizes large weights, encouraging smaller distributed weights

**Early Stopping**:
- Stop training when validation loss stops improving
- Simple but effective

**Data Augmentation**:
- Create variations of training data (rotation, flip, crop for images)
- More effective training data without collecting more

### Visual Justification

**V1 Visual**: `fit-progression` (P2)

Training vs. validation loss curves. Without regularization: validation loss rises (overfit). With dropout/early stopping: curves stay close together.

### Formal Definition

**Dropout**: During training, each neuron is zeroed with probability p. During inference, weights are scaled by (1-p).

**L2 regularization**:
$$L_{total} = L_{original} + \lambda \sum_i w_i^2$$

```python
# Optional verification
from tensorflow import keras
from tensorflow.keras import layers, regularizers, callbacks

model = keras.Sequential([
    layers.Dense(128, activation='relu', input_shape=(784,),
                 kernel_regularizer=regularizers.l2(0.01)),  # L2
    layers.Dropout(0.3),  # Dropout
    layers.Dense(64, activation='relu'),
    layers.Dropout(0.3),
    layers.Dense(10, activation='softmax')
])

# Early stopping
early_stop = callbacks.EarlyStopping(
    monitor='val_loss',
    patience=3,
    restore_best_weights=True
)

print("Model with L2 regularization, Dropout, and Early Stopping")
```

---

# Module 3: Convolutional Neural Networks

## Topic 1: Why CNNs

### Conceptual Intuition

A 224×224×3 image has over 150,000 input values. With 1,000 neurons in the first hidden layer, a fully connected network needs **150 million parameters** just for that layer. This is:
- Computationally prohibitive
- Massively prone to overfitting
- Wasteful—nearby pixels are related but treated independently

**CNNs solve this through**:
1. **Local connectivity**: Each neuron connects only to a small region
2. **Parameter sharing**: The same filter scans the entire image
3. **Spatial hierarchy**: Build complex features from simple ones

To recognize a face, you first detect edges, combine them into features (eyes, nose), then combine features into the complete face. CNNs mirror this hierarchical processing.

### Visual Justification

**V1 Visual**: Static comparison diagram (No primitive needed)

Side-by-side: Fully connected network with overwhelming connections vs. CNN with organized local connectivity. Parameter counts compared.

### Formal Definition

A convolutional layer with k filters of size f×f on input of size H×W×C:
$$\text{Parameters} = k \times (f \times f \times C + 1)$$

Much smaller than fully connected: (H×W×C) × k

```python
# Optional verification
from tensorflow import keras
from tensorflow.keras import layers

# Fully Connected Network
fc_model = keras.Sequential([
    layers.Flatten(input_shape=(28, 28, 1)),
    layers.Dense(128, activation='relu'),
    layers.Dense(64, activation='relu'),
    layers.Dense(10, activation='softmax')
])

# CNN
cnn_model = keras.Sequential([
    layers.Conv2D(32, (3, 3), activation='relu', input_shape=(28, 28, 1)),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),
    layers.Flatten(),
    layers.Dense(64, activation='relu'),
    layers.Dense(10, activation='softmax')
])

print(f"FC Parameters: {fc_model.count_params():,}")
print(f"CNN Parameters: {cnn_model.count_params():,}")
```

---

## Topic 2: Convolution Operation

### Conceptual Intuition

**Convolution** slides a small filter (kernel) across an image, computing dot products. The kernel learns to detect specific patterns.

At each position:
1. Overlay the kernel on the image region
2. Multiply element-wise
3. Sum the products
4. Store in output (feature map)

**Key parameters**:
- **Kernel size**: Typically 3×3 or 5×5
- **Stride**: How many pixels to skip (stride=2 halves dimensions)
- **Padding**: Border handling ('same' to preserve size, 'valid' to shrink)

Different kernels detect different patterns: vertical edges, horizontal edges, textures. In CNNs, kernel values are **learned** during training.

### Visual Justification

**V1 Visual**: Static convolution diagram (No primitive needed)

Show a 3×3 kernel sliding over a 5×5 image patch. Highlight the current receptive field, show element-wise multiplication, display the computed output value.

### Formal Definition

**Output size**:
$$O = \frac{I - K + 2P}{S} + 1$$

Where I = input size, K = kernel size, P = padding, S = stride.

**Convolution operation**:
$$(I * K)_{ij} = \sum_m \sum_n I_{i+m, j+n} \cdot K_{m,n}$$

```python
# Optional verification
import numpy as np

def convolve2d(image, kernel, stride=1, padding=0):
    """Manual 2D convolution"""
    if padding > 0:
        image = np.pad(image, padding, mode='constant')
    
    i_h, i_w = image.shape
    k_h, k_w = kernel.shape
    o_h = (i_h - k_h) // stride + 1
    o_w = (i_w - k_w) // stride + 1
    output = np.zeros((o_h, o_w))
    
    for i in range(o_h):
        for j in range(o_w):
            region = image[i*stride:i*stride+k_h, j*stride:j*stride+k_w]
            output[i, j] = np.sum(region * kernel)
    return output

# Vertical edge detection kernel
vertical_edge = np.array([[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]])

# Sample image with vertical edge
image = np.array([[0,0,1,1], [0,0,1,1], [0,0,1,1], [0,0,1,1]], dtype=float)
result = convolve2d(image, vertical_edge, padding=1)
print("Edge detection result:\n", result)
```

---

## Topic 3: Feature Maps

### Conceptual Intuition

A **feature map** is the output when a filter is applied—it shows *where* in the image a pattern was detected.

- High activation = pattern present
- Low activation = pattern absent

Multiple filters create multiple feature maps (depth). Each filter learns a different pattern:
- Early layers: edges, textures, gradients
- Middle layers: shapes, patterns, combinations
- Deep layers: object parts, complete concepts

This **hierarchical learning** is the magic of CNNs—they automatically discover the right features for the task.

### Visual Justification

**V1 Visual**: Static feature map gallery (No primitive needed)

Original image surrounded by feature maps from each layer. Color intensity shows activation strength. Early maps show edge-like patterns; deep maps show object-like activations.

### Formal Definition

For input of shape (H, W, C) and k filters of size (f, f):
$$\text{Feature map shape} = \left(\frac{H-f+2P}{S}+1, \frac{W-f+2P}{S}+1, k\right)$$

```python
# Optional verification
from tensorflow import keras
from tensorflow.keras import layers, models

# Build simple CNN
model = models.Sequential([
    layers.Conv2D(32, (3, 3), activation='relu', padding='same', input_shape=(28, 28, 1)),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
])

# Create feature extractor
layer_outputs = [layer.output for layer in model.layers if 'conv' in layer.name]
feature_extractor = models.Model(inputs=model.input, outputs=layer_outputs)

# Get sample image
(x_train, _), _ = keras.datasets.mnist.load_data()
sample = x_train[0:1].reshape(1, 28, 28, 1) / 255.0

# Extract feature maps
feature_maps = feature_extractor.predict(sample, verbose=0)
print(f"Layer 1 feature maps shape: {feature_maps[0].shape}")
print(f"Layer 2 feature maps shape: {feature_maps[1].shape}")
```

---

## Topic 4: Pooling Layers

### Conceptual Intuition

**Pooling** reduces spatial dimensions while keeping the important information.

**Max pooling** (most common):
- Divide feature map into regions (typically 2×2)
- Take maximum value from each region
- Keeps the strongest activations
- 2×2 pooling with stride 2 halves each dimension

**Average pooling**: Takes the average instead of max

**Global Average Pooling (GAP)**:
- Averages entire feature map to a single value
- Replaces fully connected layers at the end of CNNs
- Dramatically reduces parameters

Pooling provides **translation invariance**—small shifts in input don't change output. A cat in the left corner and a cat in the right corner both activate the "cat" feature.

### Visual Justification

**V1 Visual**: Static pooling diagram (No primitive needed)

Show a 4×4 feature map with 2×2 max pooling. Highlight each region, circle the maximum value, show the resulting 2×2 output.

### Formal Definition

**Max pooling** over region R:
$$\text{output}_{ij} = \max_{(m,n) \in R_{ij}} \text{input}_{mn}$$

**Output dimensions**:
$$O = \frac{I - P}{S} + 1$$

Where P = pool size, S = stride.

```python
# Optional verification
import numpy as np

def max_pool_2d(image, pool_size=2):
    h, w = image.shape
    out_h, out_w = h // pool_size, w // pool_size
    output = np.zeros((out_h, out_w))
    
    for i in range(out_h):
        for j in range(out_w):
            region = image[i*pool_size:(i+1)*pool_size, 
                          j*pool_size:(j+1)*pool_size]
            output[i, j] = np.max(region)
    return output

# Example
feature_map = np.array([[1, 2, 3, 4], [5, 6, 7, 8], 
                        [9, 10, 11, 12], [13, 14, 15, 16]])
pooled = max_pool_2d(feature_map)
print("Original (4x4):\n", feature_map)
print("\nMax Pooled (2x2):\n", pooled)
```

---

## Topic 5: Classic CNN Architectures

### Conceptual Intuition

CNN evolution shows a clear trend: **deeper networks with clever architectural innovations**.

**LeNet (1998)**:
- First successful CNN for digit recognition
- 2 conv layers, 2 pooling, 3 FC layers
- Proved convolution works for visual recognition

**VGGNet (2014)**:
- Simple repeated pattern: 3×3 convs stacked
- Showed depth matters (VGG-16 has 16 layers)
- Clean but parameter-heavy

**ResNet (2015)**: Revolutionary
- Introduced **skip connections** (residual connections)
- Allow gradients to flow directly, enabling very deep networks (50, 101, 152 layers)
- Solved the "degradation problem" where deeper networks performed worse

**Modern architectures**: MobileNet (efficient for mobile), EfficientNet (compound scaling), Vision Transformers (attention-based).

### Visual Justification

**V1 Visual**: Static architecture comparison (No primitive needed)

Timeline showing CNN evolution: LeNet → AlexNet → VGG → ResNet. Highlight key innovations at each step. For ResNet, show the skip connection bypassing layers.

### Formal Definition

**Residual connection**:
$$\text{output} = F(x) + x$$

Where F(x) is the learned residual. If F(x) is hard to learn, the network can learn F(x) = 0 and just pass x through.

```python
# Optional verification
from tensorflow import keras
from tensorflow.keras import layers

# VGG-like block
def vgg_block(x, filters, num_convs):
    for _ in range(num_convs):
        x = layers.Conv2D(filters, (3, 3), activation='relu', padding='same')(x)
    x = layers.MaxPooling2D((2, 2))(x)
    return x

# Residual block (ResNet)
def residual_block(x, filters):
    shortcut = x
    x = layers.Conv2D(filters, (3, 3), padding='same')(x)
    x = layers.BatchNormalization()(x)
    x = layers.ReLU()(x)
    x = layers.Conv2D(filters, (3, 3), padding='same')(x)
    x = layers.BatchNormalization()(x)
    x = layers.Add()([shortcut, x])  # Skip connection!
    x = layers.ReLU()(x)
    return x

# Using pretrained models
resnet = keras.applications.ResNet50(weights='imagenet', include_top=False)
print(f"ResNet50 layers: {len(resnet.layers)}")
```

---

## Module Summary

Deep learning has revolutionized AI through neural networks that automatically learn hierarchical representations. The key innovations—ReLU, BatchNorm, skip connections, proper initialization—enable training networks hundreds of layers deep.

**Key takeaways**:
1. Neural networks can approximate any function through learned representations
2. Vanishing gradients limited early deep networks—solved by ReLU, BatchNorm, skip connections
3. Proper initialization (Xavier/He) is critical for training
4. Adam is the default optimizer; regularization (dropout, early stopping) prevents overfitting
5. CNNs exploit image structure through local connectivity and parameter sharing
6. Modern architectures like ResNet use skip connections to enable very deep networks
