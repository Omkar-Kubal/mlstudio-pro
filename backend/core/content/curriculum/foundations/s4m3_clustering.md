# Subject 4, Module 3: Clustering

> Clustering is an unsupervised learning task that organizes data into groups where similar objects end up in the same cluster and dissimilar objects end up in different clusters. Unlike supervised learning, there are no labels—the algorithm discovers structure directly from feature patterns.

---

## Topic 1: Clustering Fundamentals and Distance Metrics

### Conceptual Intuition

Clustering answers the question: *which data points "go together"?*

But "together" depends on how you measure similarity. **Distance metrics** quantify how "far apart" two points are:

**Euclidean distance (L2)**: The straight-line distance. Think of stretching a string between two points. In 2D, points equidistant from a center form a **circle**.

**Manhattan distance (L1)**: The "taxicab" distance—how far you'd travel on a grid, only moving horizontally or vertically. Points equidistant from a center form a **diamond**.

**Minkowski distance**: A generalization with parameter p. When p=2, it's Euclidean. When p=1, it's Manhattan.

**Cosine similarity**: Measures the angle between vectors, ignoring magnitude. Common for text data where document length shouldn't matter.

The choice of metric affects cluster shapes and which points get grouped together. Euclidean distance is sensitive to scale, so data often needs normalization first.

### Visual Justification

**V1 Visual**: Static diagram

Show distance contours: a circle for Euclidean (all points at distance r from center) vs. a diamond for Manhattan. This illustrates how metric choice affects what "equally close" means.

### Formal Definition

**Euclidean distance**:
$$d_{L2}(\mathbf{p}, \mathbf{q}) = \sqrt{\sum_{i=1}^{n}(p_i - q_i)^2}$$

**Manhattan distance**:
$$d_{L1}(\mathbf{p}, \mathbf{q}) = \sum_{i=1}^{n}|p_i - q_i|$$

**Minkowski distance**:
$$d_p(\mathbf{p}, \mathbf{q}) = \left(\sum_{i=1}^{n}|p_i - q_i|^p\right)^{1/p}$$

```python
# Optional verification
import numpy as np

p = np.array([1, 2])
q = np.array([4, 0])

euclid = np.linalg.norm(p - q)
manhattan = np.sum(np.abs(p - q))

print(f"Euclidean: {euclid:.2f}")
print(f"Manhattan: {manhattan:.2f}")
```

---

## Topic 2: K-Means Clustering

### Conceptual Intuition

K-Means is the most widely used clustering algorithm. It partitions data into k clusters by finding k **centroids** (cluster centers) that minimize the total within-cluster variance.

**The algorithm**:
1. Initialize k centroids (randomly or using k-means++)
2. **Assign**: Each point goes to its nearest centroid
3. **Update**: Move each centroid to the mean of its assigned points
4. Repeat until convergence (assignments stop changing)

The algorithm always converges, but may find a local optimum rather than the global best. Running multiple times with different initializations helps.

**Limitations**:
- Requires specifying k in advance
- Assumes roughly spherical clusters of similar size
- Sensitive to outliers (they pull centroids away)
- Finds only convex clusters (can't wrap around)

### Visual Justification

**V1 Visual**: `cluster-lifecycle` (composed from P1/P3)

Animate the K-Means iterations: points change colors as they reassign, centroids drift toward cluster means. Voronoi regions show how space is partitioned at each step.

### Formal Definition

K-Means minimizes the **within-cluster sum of squares (WCSS)**:
$$J = \sum_{k=1}^{K}\sum_{\mathbf{x}_i \in C_k} ||\mathbf{x}_i - \boldsymbol{\mu}_k||^2$$

Where μₖ is the centroid of cluster k.

```python
# Optional verification
from sklearn.datasets import make_blobs
from sklearn.cluster import KMeans

# Generate 2D data with 3 clusters
X, _ = make_blobs(n_samples=200, centers=3, random_state=42)

# Run K-Means
kmeans = KMeans(n_clusters=3, random_state=42)
kmeans.fit(X)

print("Centroids:\n", kmeans.cluster_centers_)
print("Labels:", kmeans.labels_[:10])
```

---

## Topic 3: Choosing k: Elbow Method and Silhouette

### Conceptual Intuition

How many clusters should you use? There's no universal answer, but two popular techniques help guide the choice:

**Elbow Method**:
- Compute WCSS (inertia) for k = 1, 2, 3, ...
- Plot inertia vs. k
- Inertia always decreases as k increases (more clusters = tighter fits)
- Look for the "elbow"—where the rate of decrease sharply changes
- The elbow represents the point of diminishing returns

**Silhouette Score**:
- For each point, measure how similar it is to its own cluster vs. the nearest other cluster
- Silhouette = (b - a) / max(a, b), where:
  - a = average distance to points in the same cluster
  - b = average distance to points in the nearest other cluster
- Ranges from -1 (wrong cluster) to +1 (perfect clustering)
- Average silhouette > 0.5 is generally considered good

Other methods include the Gap Statistic and Davies-Bouldin Index.

### Visual Justification

**V1 Visual**: `metric-dashboard` (P4)

Show the elbow plot with inertia vs. k. A second view shows silhouette scores for each k, with bars for individual points colored by cluster.

### Formal Definition

**Silhouette coefficient** for point i:
$$s(i) = \frac{b(i) - a(i)}{\max\{a(i), b(i)\}}$$

Where:
- a(i) = mean intra-cluster distance
- b(i) = mean nearest-cluster distance

```python
# Optional verification
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import matplotlib.pyplot as plt

# Elbow method
inertias = []
K_range = range(1, 8)
for k in K_range:
    km = KMeans(n_clusters=k, random_state=0).fit(X)
    inertias.append(km.inertia_)

# Silhouette score for k=3
labels = KMeans(n_clusters=3, random_state=0).fit_predict(X)
print(f"Silhouette score (k=3): {silhouette_score(X, labels):.3f}")
```

---

## Topic 4: Hierarchical Clustering

### Conceptual Intuition

Hierarchical clustering builds a **tree of clusters** (dendrogram) rather than producing a single flat partition. This reveals nested structure and doesn't require specifying k upfront.

**Agglomerative (bottom-up)** approach:
1. Start with each point as its own cluster
2. Merge the two closest clusters
3. Repeat until only one cluster remains
4. The dendrogram records the merge history

**Linkage criteria** determine how to measure distance between clusters:
- **Single linkage**: Minimum distance between any two points in different clusters (forms chains)
- **Complete linkage**: Maximum distance (forms tight, compact clusters)
- **Ward's method**: Minimize within-cluster variance increase (balanced clusters)

To get k clusters, "cut" the dendrogram at a height that yields k branches.

### Visual Justification

**V1 Visual**: Static dendrogram diagram

A dendrogram shows points at the bottom, branches forming as clusters merge, and the height axis representing merge distance. A horizontal cut line shows how changing the cut height changes the number of clusters.

### Formal Definition

**Ward's linkage criterion**:
$$d(A, B) = \sqrt{\frac{2|A||B|}{|A|+|B|}} \cdot ||\mathbf{c}_A - \mathbf{c}_B||$$

Where cₐ and c_B are cluster centroids.

```python
# Optional verification
from sklearn.cluster import AgglomerativeClustering
from scipy.cluster.hierarchy import dendrogram, linkage

# Agglomerative clustering
model = AgglomerativeClustering(n_clusters=3, linkage='ward')
labels = model.fit_predict(X)
print("Labels:", labels[:10])

# Build linkage matrix for dendrogram
Z = linkage(X, method='ward')
```

---

## Topic 5: DBSCAN: Density-Based Clustering

### Conceptual Intuition

DBSCAN takes a fundamentally different approach: instead of looking for centroids or hierarchies, it looks for **dense regions** separated by sparse regions.

**Two parameters**:
- **ε (eps)**: The neighborhood radius—how close points must be to be "neighbors"
- **minPts**: The minimum number of points required to form a dense region

**Three types of points**:
- **Core points**: Have at least minPts neighbors within ε (they anchor clusters)
- **Border points**: Within ε of a core point but not core themselves (on cluster edges)
- **Noise points**: Neither core nor reachable from core points (outliers)

**Advantages**:
- No need to specify k—finds however many dense regions exist
- Can find arbitrarily shaped clusters (not just spheres)
- Naturally identifies outliers

**Limitations**:
- Struggles with clusters of varying density
- Sensitive to ε and minPts—too small makes everything noise, too large merges clusters

### Visual Justification

**V1 Visual**: Static diagram with neighborhood circles

Show points with ε-radius circles. Core points (many neighbors in circle) link to form clusters. Isolated points are marked as noise.

### Formal Definition

A point p is a **core point** if:
$$|\{q \in D : d(p, q) \leq \epsilon\}| \geq \text{minPts}$$

A point q is **density-reachable** from p if there exists a chain of core points connecting them.

```python
# Optional verification
from sklearn.cluster import DBSCAN
from sklearn.datasets import make_moons

# Non-globular data (two half-moons)
X_moons, _ = make_moons(n_samples=200, noise=0.05, random_state=0)

# DBSCAN
db = DBSCAN(eps=0.2, min_samples=5)
labels = db.fit_predict(X_moons)

# -1 indicates noise
print("Unique labels:", set(labels))
print(f"Noise points: {(labels == -1).sum()}")
```

---

## Topic 6: Clustering Evaluation

### Conceptual Intuition

Evaluating clustering is tricky—there's no "ground truth" to compare against in unsupervised learning. We use **internal** and **external** metrics:

**Internal metrics** (use only data and labels):
- **Silhouette Score**: Measures cohesion (how close points are to their cluster) vs. separation (how far from other clusters). Range [-1, 1], higher is better.
- **Davies-Bouldin Index**: Measures average cluster similarity based on size and distance between clusters. Lower is better.
- **Calinski-Harabasz Index**: Ratio of between-cluster to within-cluster variance. Higher is better.

**External metrics** (when ground truth is available):
- **Adjusted Rand Index (ARI)**: Measures agreement between predicted and true labels, adjusted for chance. Range [-1, 1], where 1 is perfect and ~0 is random.
- **Normalized Mutual Information (NMI)**: Information-theoretic measure of shared information between labelings.

**Algorithm selection**: Use DBSCAN for arbitrary-shaped clusters with noise. Use K-Means for compact, spherical clusters. Use hierarchical for nested relationships.

### Visual Justification

**V1 Visual**: `metric-dashboard` (P4)

Side-by-side comparison: K-Means on two-moons data (fails, cuts through moons) vs. DBSCAN (succeeds, finds the two curves). Metric values update with algorithm choice.

### Formal Definition

**Adjusted Rand Index**:
$$ARI = \frac{RI - E[RI]}{\max(RI) - E[RI]}$$

Where RI is the Rand Index (fraction of correct pairwise decisions).

```python
# Optional verification
from sklearn.metrics import silhouette_score, davies_bouldin_score

labels = KMeans(n_clusters=3, random_state=42).fit_predict(X)

sil = silhouette_score(X, labels)
dbi = davies_bouldin_score(X, labels)

print(f"Silhouette Score: {sil:.3f}")
print(f"Davies-Bouldin Index: {dbi:.3f}")
```

---

## Module Summary

Clustering organizes data by similarity without labels. The choice of algorithm and distance metric determines what "similar" means.

**Key takeaways**:
1. Distance metrics (Euclidean, Manhattan, cosine) define similarity differently
2. K-Means finds spherical clusters but requires knowing k
3. Use elbow plots and silhouette scores to choose k
4. Hierarchical clustering reveals nested structure via dendrograms
5. DBSCAN finds arbitrary-shaped clusters and identifies outliers
6. Evaluate with internal metrics (silhouette, Davies-Bouldin) or external metrics if ground truth exists
