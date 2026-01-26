# K-Means Clustering

## Visual Classification
**V1 Primitive:** `cluster-formation` (P5)

---

## Lesson Content

### Searching for Structure

In supervised learning, we tell the model what the answers are (labels). In **Unsupervised Learning**, there are no labels. We just give the model data and ask: "Is there any pattern here?"

One of the most common patterns is **clustering**—finding groups of data points that are similar to each other.

### The Algorithm

**K-Means** is the simplest and most popular clustering algorithm. It tries to find $K$ center points ("centroids") that best represent the data.

It works in a loop:
1. **Assignment:** Every data point joins the "team" of the closest centroid.
2. **Update:** Each team calculates its new center (mean) based on its members.
3. **Repeat:** The centroids move, points switch teams, and the cycle continues until nothing changes (convergence).

### Iterative Improvement

At the start, the centroids might be in random, terrible locations. But with each step, they drift toward the density of the data. It's like gravity—the data pulls the centroids in.

[VISUAL INTUITION: CLUSTER_FORMATION]

Watch the centroids migrate.
- Initially, the regions (Voronoi cells) change rapidly.
- As the centroids settle into the dense clusters, the movement slows down.
- Notice how increasing $K$ breaks large clusters into smaller sub-groups.

### The Limitation of K

The biggest weakness of K-Means is that you have to choose $K$ (the number of clusters) before you start. If you guess wrong:
- **Too small:** Distinct groups are merged together.
- **Too large:** A single natural group is split apart artificially.

Techniques like the "Elbow Method" use the total distance (Inertia) to help find the optimal $K$, looking for the point of diminishing returns.

### Formal Concept

Objective Function (Inertia): minimize the sum of squared distances between points and their assigned centroid $\mu_j$.

$$ J = \sum_{j=1}^{K} \sum_{i \in C_j} ||x_i - \mu_j||^2 $$

This is theoretically equivalent to minimizing the variance within each cluster.

---

## Visual Justification

The cluster-formation primitive brings the iterative nature of K-Means to life. Static diagrams show the result; this visual shows the *process*. Watching the centroids drift and lock into place builds intuition for convergence and sensitivity to initialization.
