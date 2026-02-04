# PRIMITIVE SPEC: Cluster Formation

**Status:** DESIGN_APPROVED  
**Type:** Visual Primitive (Theory-Grade)  
**Context:** Foundational reusable component for k-Means, Hierarchical Clustering, DBSCAN, GMM, Spectral Clustering

---

## 1. CORE CONCEPT

**Intuition Built:**
Clustering is not "finding groups"—it is **defining what "near" means** and watching structure emerge. Different algorithms encode different definitions of proximity, and the resulting clusters are consequences of those definitions, not discoveries of ground truth.

**Misconception Fixed:**
*"Clusters are objective groups in the data."*
(Users think clusters exist independently. This primitive shows that changing K, epsilon, or linkage *creates* different valid groupings from the same data. There is no "correct" answer—only trade-offs.)

**Why Visual?**
- Text says "k-means assigns points to the nearest centroid."
- The Primitive shows centroids *drifting* toward their members while points *switch allegiance* in real-time.
- Text says "DBSCAN finds dense regions."
- The Primitive shows a "wave" of connectivity propagating through dense areas, leaving isolated points behind as noise.

---

## 2. INPUT / CONTROL MODEL

### Primary Control (Context-Dependent Slider)

| Algorithm | Control Label | Range | Effect |
| :--- | :--- | :--- | :--- |
| k-Means | K (Number of Clusters) | 2 → 10 | More centroids appear; regions subdivide. |
| DBSCAN | Epsilon (Radius) | 0.1 → 2.0 | Larger radius → More points connected → Fewer clusters. |
| Hierarchical | Cut Height | 0 → max | Lower cut → More clusters; higher cut → Fewer clusters. |
| GMM | K (Components) | 2 → 8 | More Gaussians; ellipses can overlap. |

*Behavior:* Continuous transition. Centroids/regions morph smoothly. Points re-assign with animated transitions (not instant snapping).

### Secondary Control (Algorithm Toggle)
**"Clustering Method"** (Discrete, max 4 options)
- k-Means
- DBSCAN
- Hierarchical (Agglomerative)
- GMM

*Behavior:* Switching algorithm triggers a full re-computation with a smooth transition animation (existing clusters dissolve, new clusters form).

### Tertiary Control (Optional Toggle)
**"Show Iteration Steps"** (For k-Means / GMM)
- **OFF:** Final converged state is shown.
- **ON:** User can step through iterations manually (Previous / Next buttons or a mini-slider).

---

## 3. OUTPUT VISUALS

### A. The Data Points (Ground Truth)
- **Style:** Solid circles, initially uniform color (gray or neutral).
- **Assigned State:** Points change color to match their cluster.
- **Transition:** Color fades smoothly (200ms) when reassigned to a new cluster.
- **Noise Points (DBSCAN):** Remain gray with a distinct "hollow" or "X" marker.

### B. The Centroids / Anchors (k-Means, GMM)
- **k-Means Centroids:** Larger bold circles with a crosshair or pulsing ring.
- **GMM Ellipses:** Semi-transparent ellipses representing mean + covariance.
- **Motion:** Centroids *drift* toward their cluster center as K changes or iterations progress.
- **Spawn/Destroy:** When K increases, a new centroid fades in at a random or strategic location. When K decreases, one centroid fades out and its points redistribute.

### C. The Connectivity / Regions
- **k-Means Voronoi:** Faint Voronoi lines show decision boundaries between centroids.
- **DBSCAN Reachability:** Lines or arcs connect points within epsilon distance. Dense regions form visible "webs."
- **Hierarchical Dendrogram (optional overlay):** A tree structure showing merge history, with a horizontal "cut line" at the current height.

### D. The Cluster Regions (Optional Fill)
- **Convex Hull / Alpha Shape:** A semi-transparent polygon wrapping each cluster.
- **Motion:** Hulls expand/contract and reshape as points are added/removed.

### E. Metrics Panel (Non-Intrusive)
- **Inertia (k-Means):** A small gauge showing within-cluster sum of squares.
- **Silhouette Score:** A bar or number indicating cluster quality.
- **Cluster Count:** Simple numeric display.

---

## 4. VISUAL STATES

### I. Initialization (Before Clustering)
- All points are gray/neutral.
- No centroids or regions visible.
- User Feeling: "This is raw, unstructured data."

### II. Formation (Clustering in Progress)
- **k-Means:** Centroids appear at initial (random or k-means++) positions. Points snap to nearest centroid, coloring instantly. Then, centroid drifts begin.
- **DBSCAN:** A "scan wave" visually propagates. Points light up as they join a cluster. Noise points remain dim.
- **Hierarchical:** Dendrogram builds from leaves to root. As cut height slider moves, clusters merge/split.
- User Feeling: "I can see the algorithm working."

### III. Converged / Stable (Steady State)
- Centroids stop moving (within threshold).
- Points are colored by cluster.
- Voronoi boundaries (if shown) are stable.
- User Feeling: "This is the final answer for these settings."

### IV. Over-Clustering (K Too High)
- Many small clusters, some with very few points.
- Voronoi cells are cramped.
- Inertia is very low, but silhouette may degrade.
- User Feeling: "I've split natural groups unnecessarily."

### V. Under-Clustering (K Too Low)
- Large heterogeneous clusters merging distinct groups.
- Voronoi cells are huge.
- User Feeling: "I'm missing structure."

### VI. Noise Dominance (DBSCAN, Epsilon Too Small)
- Most points are marked as noise (gray/hollow).
- Very few clusters, each tiny.
- User Feeling: "The algorithm can't find density here."

### VII. Single Cluster (DBSCAN, Epsilon Too Large)
- Nearly all points belong to one giant cluster.
- No structure.
- User Feeling: "Everything is connected—I've lost granularity."

### VIII. Failure Modes (Do Not Show)
- **Never:** Allow centroids to drift off-screen.
- **Never:** Show more than 10 clusters (color palette limit).
- **Never:** Let points overlap so densely they become a solid blob without zoom.
- **Never:** Auto-animate K/epsilon. User must drive it.

---

## 5. REUSE SCENARIOS (Implementation Matrix)

| Topic | Algorithm | Primary Control | Key Visual |
| :--- | :--- | :--- | :--- |
| **k-Means** | Centroid-based | K slider | Centroids drift; Voronoi boundaries shift. |
| **Elbow Method** | k-Means | K slider + Inertia plot | Inertia curve overlaid; "elbow" highlighted. |
| **DBSCAN** | Density-based | Epsilon slider | Connectivity webs; noise isolation. |
| **Hierarchical** | Linkage-based | Cut height slider | Dendrogram with dynamic cut line. |
| **GMM** | Probabilistic | K slider | Ellipses overlap; soft assignments (color blends). |
| **Cluster Comparison** | Multiple | Algorithm toggle | Same data, different clusterings side-by-side. |
| **Silhouette Analysis** | Any | K slider + Silhouette plot | Silhouette bar chart per cluster. |

---

## 6. GUARDRAILS

### Stability
- **Centroid Smoothing:** Centroid position updates interpolated over 5 frames to avoid jitter.
- **Color Consistency:** Cluster colors are assigned deterministically (by initial centroid position or merge order) to minimize "color swapping" when K changes by 1.
- **Dendrogram Layout:** Pre-computed; only the cut line moves.

### Performance
- **Point Limit:** Max 500 points for real-time k-Means / DBSCAN in JS.
- **Iteration Cap:** k-Means capped at 50 iterations for convergence.
- **Fallback:** For larger datasets, pre-compute cluster assignments at discrete K values and interpolate point colors.

### Interactions
- **No Scroll-Jacking:** All animation is tied to sliders or manual step buttons.
- **Hover:** Hovering over a point shows its cluster assignment and distance to centroid.
- **Hover Centroid:** Shows cluster size and inertia contribution.

### Accessibility
- **Reduced Motion:** Disable drifting animations. Show instant state changes.
- **Color Blind Safe:** Use distinct shapes (circle, square, triangle, diamond) per cluster in addition to color.
- **Screen Reader:** Announce "Cluster 1: 45 points. Cluster 2: 38 points." on K change.

---

## 7. PLACEHOLDER ↔ ANIMATION HANDOFF

### Loading State
- Gray points scattered randomly.
- Skeleton centroids (faint pulsing circles).
- Text: "Initializing Clusters..."

### Static Fallback (No JS / Print View)
- Renders a **triptych** (3-panel image):
  - **Panel 1:** K=2 (two large clusters, clearly separated).
  - **Panel 2:** K=5 (moderate clustering).
  - **Panel 3:** K=10 (over-clustered, fragmented).
- Caption: "Drag the K slider to see how cluster count changes structure."

### Placeholder Text Mapping
When a content block contains `[VISUAL INTUITION: CLUSTER_FORMATION]`:
1. Load the Cluster Formation primitive component.
2. Initialize with K = 3 (default).
3. Use sample 2D dataset with 3-4 natural blobs.

---

## 8. DESIGN INVARIANTS (Checklist for Implementers)

- [ ] Primary slider (K / epsilon / cut height) drives all clustering updates.
- [ ] Centroids drift smoothly; they do not teleport.
- [ ] Points transition colors smoothly when reassigned.
- [ ] Noise points (DBSCAN) are visually distinct (gray + hollow).
- [ ] Max 10 clusters displayed; max 500 points computed live.
- [ ] Algorithm toggle triggers dissolve → reform animation.
- [ ] Static fallback shows K spectrum via triptych.
- [ ] Color + shape used together for accessibility.
