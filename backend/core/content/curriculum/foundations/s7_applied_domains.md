# Subject 7: Applied Domains - Computer Vision

> Computer Vision enables machines to interpret and understand visual information. This module covers the foundations: how computers "see" images, preprocessing techniques, and the complete image classification pipeline.

---

# Module 1: Computer Vision Fundamentals

## Topic 1: Image Representation

### Conceptual Intuition

To a computer, an image is not a picture—it's a **3D tensor of numbers**.

**The structure**:
- A 1920×1080 RGB image has shape (1080, 1920, 3)
- That's 6.2 million values—height × width × color channels
- Each value is 0-255 representing pixel intensity

**Color channels (RGB)**:
- **Red, Green, Blue** combine to create all colors
- White = (255, 255, 255), Black = (0, 0, 0)
- Pure red = (255, 0, 0)

**Grayscale**:
- Single channel (2D array)
- Computed as weighted average: Gray = 0.299R + 0.587G + 0.114B
- Weights reflect human eye sensitivity

**Other color spaces**:
- **HSV** (Hue, Saturation, Value): Better for color-based operations
- **LAB**: Perceptually uniform—equal distance means equal perceived difference
- **YCbCr**: Separates luminance from color, used in compression

### Visual Justification

**V1 Visual**: Static diagram (No primitive needed)

Show an image with a pixel zoomed in, displaying its RGB values. Side panel shows the same image split into R, G, B channels as separate grayscale images.

### Formal Definition

An image I is a tensor:
$$I \in \mathbb{R}^{H \times W \times C}$$

Where H = height, W = width, C = channels (3 for RGB, 1 for grayscale).

**Grayscale conversion**:
$$Y = 0.299R + 0.587G + 0.114B$$

```python
# Optional verification
import numpy as np
from PIL import Image

# Load image - Shape: (H, W, 3)
img = np.array(Image.open('sample.jpg'))

print(f"Shape: {img.shape}")
print(f"Data type: {img.dtype}")
print(f"Value range: [{img.min()}, {img.max()}]")
print(f"Memory: {img.nbytes / 1024:.2f} KB")

# RGB channels
red, green, blue = img[:,:,0], img[:,:,1], img[:,:,2]

# Grayscale conversion
gray = 0.299 * red + 0.587 * green + 0.114 * blue

# Normalization for neural networks
normalized = img.astype('float32') / 255.0  # Range: [0, 1]
standardized = (img - img.mean()) / img.std()  # Mean 0, std 1
```

---

## Topic 2: Image Preprocessing

### Conceptual Intuition

Raw images need preparation before feeding to neural networks.

**Resizing**:
- Neural networks require fixed input size (e.g., 224×224)
- Images come in all shapes and sizes
- Interpolation methods: nearest neighbor (blocky), bilinear (smooth), bicubic (best quality)

**Normalization**:
- Scale 0-255 to 0-1 (division by 255)
- Or standardize to zero mean, unit variance
- Critical for stable training—without it, gradients may explode or vanish

**Data augmentation**:
- Create variations of training images
- Random flips, rotations, crops, brightness changes
- Artificially expands dataset, reduces overfitting
- The model sees different versions of each image during training

**Batch processing**:
- Process multiple images together for efficiency
- Tensor shape: (Batch, Height, Width, Channels)
- Example: (32, 224, 224, 3) for 32 RGB images

### Visual Justification

**V1 Visual**: Static augmentation showcase (No primitive needed)

Original image in center, surrounded by augmented versions: horizontally flipped, slightly rotated, color-jittered, cropped, brightened, darkened.

### Formal Definition

**Normalization**:
$$x_{norm} = \frac{x - \min}{\max - \min}$$

**Standardization**:
$$x_{std} = \frac{x - \mu}{\sigma}$$

```python
# Optional verification
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import cv2

# Resize image
resized = cv2.resize(img, (224, 224), interpolation=cv2.INTER_AREA)

# Data augmentation generator
datagen = ImageDataGenerator(
    rotation_range=15,
    horizontal_flip=True,
    width_shift_range=0.1,
    height_shift_range=0.1,
    brightness_range=[0.8, 1.2],
    zoom_range=0.1
)

# Generate augmented versions
img_batch = img.reshape(1, *img.shape)  # Add batch dimension
augmented = datagen.flow(img_batch, batch_size=1)
```

---

## Topic 3: Image Classification Pipeline

### Conceptual Intuition

**Image classification** assigns one label from predefined categories to an entire image. It's the foundational task of computer vision.

**The complete pipeline**:

1. **Input**: Raw image (any size, any format)
2. **Preprocessing**: Resize to fixed dimensions, normalize pixel values
3. **Feature extraction**: CNN layers transform pixels into meaningful features
4. **Classification**: Dense layers + softmax produce class probabilities
5. **Output**: Probability distribution over classes

**Loss function**: Categorical cross-entropy
- For true class c with predicted probability p_c: Loss = -log(p_c)
- Heavily penalizes confident wrong predictions
- Drives model to output high probability for correct class

**Common architectures** (by purpose):
- **Simple CNN**: Learning and experimentation
- **VGG**: Simple but many parameters
- **ResNet**: Deep networks with skip connections
- **MobileNet**: Efficient for mobile/edge devices
- **EfficientNet**: State-of-the-art accuracy/efficiency

### Visual Justification

**V1 Visual**: Static pipeline diagram (No primitive needed)

Flow diagram: Image → Preprocessing box → CNN feature extraction (shrinking feature maps) → Flatten → Dense → Softmax → Bar chart of class probabilities.

### Formal Definition

**Classification output**:
$$P(y=c|x) = \text{softmax}(f_\theta(x))_c = \frac{e^{z_c}}{\sum_j e^{z_j}}$$

**Categorical cross-entropy**:
$$L = -\sum_{c} y_c \log(\hat{y}_c) = -\log(\hat{y}_{true})$$

```python
# Optional verification
from tensorflow import keras
from tensorflow.keras import layers, models

def build_classifier(input_shape=(224, 224, 3), num_classes=10):
    model = models.Sequential([
        # Feature extraction
        layers.Conv2D(32, (3, 3), activation='relu', padding='same', input_shape=input_shape),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(128, (3, 3), activation='relu', padding='same'),
        layers.GlobalAveragePooling2D(),
        
        # Classification
        layers.Dense(256, activation='relu'),
        layers.Dropout(0.5),
        layers.Dense(num_classes, activation='softmax')
    ])
    
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    return model

classifier = build_classifier()
print(classifier.summary())
```

---

## Topic 4: Evaluation and Metrics

### Conceptual Intuition

How do you know if your classifier is good? Different metrics reveal different aspects of performance.

**Accuracy**:
- Correct predictions / Total predictions
- Simple but misleading with imbalanced classes
- 99% accuracy means nothing if 99% of images are one class

**Confusion matrix**:
- N×N table for N classes
- Entry (i, j) = count of class i predicted as j
- Diagonal = correct predictions
- Off-diagonal = errors (reveals which classes are confused)

**Per-class metrics**:
- **Precision**: Of predicted class X, how many are correct?
- **Recall**: Of actual class X, how many did we find?
- **F1**: Harmonic mean of precision and recall

**Top-K accuracy**:
- Is the true label in the top K predictions?
- Essential for many-class problems (ImageNet: 1000 classes)
- Top-5 accuracy: true label in top 5 predictions

### Visual Justification

**V1 Visual**: `metric-dashboard` (P4)

Heatmap confusion matrix showing counts. Rows = true classes, columns = predicted classes. Darker colors on diagonal indicate better performance. Sidebar shows per-class precision and recall.

### Formal Definition

**Top-K accuracy**:
$$\text{Top-K Acc} = \frac{1}{N}\sum_{i=1}^{N} \mathbb{1}[y_i \in \text{top-}k(\hat{y}_i)]$$

**Macro-averaged precision**:
$$\text{Precision}_{macro} = \frac{1}{C}\sum_{c=1}^{C} \text{Precision}_c$$

```python
# Optional verification
from sklearn.metrics import confusion_matrix, classification_report
import numpy as np

# After training...
y_pred = model.predict(x_test)
y_pred_classes = np.argmax(y_pred, axis=1)
y_true = np.argmax(y_test, axis=1)  # If one-hot encoded

# Confusion matrix
cm = confusion_matrix(y_true, y_pred_classes)
print("Confusion Matrix:\n", cm)

# Classification report
print("\nClassification Report:")
print(classification_report(y_true, y_pred_classes, target_names=class_names))

# Top-K accuracy (manual)
def top_k_accuracy(y_true, y_pred_probs, k=5):
    top_k_preds = np.argsort(y_pred_probs, axis=1)[:, -k:]
    return np.mean([y_true[i] in top_k_preds[i] for i in range(len(y_true))])
```

---

## Topic 5: Transfer Learning

### Conceptual Intuition

Training from scratch requires massive data (millions of images) and compute (days on GPUs). **Transfer learning** leverages pretrained models instead.

**The idea**: Models trained on ImageNet (1.2 million images, 1000 classes) have already learned general visual features—edges, textures, shapes, parts. These features transfer to new tasks.

**Two approaches**:

**Feature extraction** (simple, fast):
1. Load pretrained model (e.g., ResNet50)
2. Freeze all pretrained layers (no gradient updates)
3. Add new classification layer for your classes
4. Train only the new layer

**Fine-tuning** (more powerful):
1. Start with feature extraction
2. After initial training, unfreeze some pretrained layers
3. Train with very low learning rate to preserve learned features
4. Risk: "catastrophic forgetting" if learning rate too high

**When to use which**:
- Small dataset (< 1000 images): Feature extraction only
- Medium dataset: Fine-tune top layers
- Large dataset: Full fine-tuning or train from scratch

### Visual Justification

**V1 Visual**: Static network diagram (No primitive needed)

Pretrained network with layers colored: Blue (frozen) for feature extraction layers, green (trainable) for new classification head. Arrow shows data flowing through frozen layers.

### Formal Definition

**Feature extraction**: Given pretrained model f_pretrained, add new classifier g:
$$\hat{y} = g(f_{pretrained}(x; \theta_{frozen}); \phi_{trainable})$$

Only φ is updated during training.

**Fine-tuning**: After initial training, unfreeze some layers:
$$\hat{y} = g(f_{pretrained}(x; \theta_{partial}); \phi)$$

Both θ_partial and φ are updated with reduced learning rate.

```python
# Optional verification
from tensorflow.keras.applications import ResNet50
from tensorflow.keras import layers, models

# Load pretrained ResNet50 (without top classification layer)
base_model = ResNet50(weights='imagenet', include_top=False, input_shape=(224, 224, 3))

# FEATURE EXTRACTION: Freeze all pretrained layers
base_model.trainable = False

# Add custom classification head
model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dense(256, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(num_classes, activation='softmax')
])

model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

# Train only the new layers
model.fit(train_data, epochs=10)

# FINE-TUNING: Unfreeze some layers
base_model.trainable = True
for layer in base_model.layers[:-20]:  # Freeze all except last 20 layers
    layer.trainable = False

# Use much lower learning rate
model.compile(optimizer=keras.optimizers.Adam(1e-5), loss='categorical_crossentropy')
model.fit(train_data, epochs=5)
```

---

## Module Summary

Computer vision transforms raw pixels into understanding. The pipeline—preprocessing, feature extraction, classification, evaluation—forms the backbone of any vision application.

**Key takeaways**:
1. Images are 3D tensors (H × W × C) with values 0-255
2. Preprocessing (resize, normalize, augment) is essential for model training
3. Classification outputs probabilities over classes using softmax
4. Confusion matrices reveal which classes are confused; per-class metrics show imbalance
5. Transfer learning leverages pretrained models—start frozen, optionally fine-tune

---

# Module 2: Natural Language Processing

> *This module is pending content development.*

NLP topics to be developed include:
- Text preprocessing and tokenization
- Word embeddings (Word2Vec, GloVe)
- Sequence models (RNNs, LSTMs)
- Attention mechanisms
- Transformers (BERT, GPT architecture)

*Note: Source content was not available in the provided JSON files. This section will be completed in a future content authoring pass.*
