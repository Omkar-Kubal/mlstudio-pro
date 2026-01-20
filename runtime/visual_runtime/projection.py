"""
V2 Projection Visual Primitive

Visualizes dimensionality reduction and embedding projections.
Supports: PCA, t-SNE, UMAP (future-ready), static and animated embeddings.

V2 ONLY - Not for use with V1 content.
"""

from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, field
import json

from .base_visual import (
    VisualPrimitive,
    VisualOutput,
    VisualContract,
    VisualInput,
    RenderingMode,
)
from .visual_errors import (
    VisualSchemaError,
    VisualDimensionError,
    VisualValidationError,
)


@dataclass
class ProjectionPoint:
    """A single point in projected space."""
    
    x: float
    y: float
    z: Optional[float] = None  # For 3D projections
    label: Optional[str] = None
    cluster: Optional[int] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ProjectionFrame:
    """A single frame in an animated projection."""
    
    frame_index: int
    points: List[ProjectionPoint]
    timestamp: Optional[float] = None
    description: Optional[str] = None


class ProjectionVisual(VisualPrimitive):
    """
    Projection visual primitive for dimensionality reduction.
    
    Supports:
    - PCA: Principal Component Analysis
    - t-SNE: t-distributed Stochastic Neighbor Embedding
    - UMAP: Uniform Manifold Approximation (future-ready)
    
    Can render:
    - Static 2D/3D scatter plots
    - Animated convergence sequences
    - Cluster-colored embeddings
    """
    
    VISUAL_TYPE = "projection"
    
    # Supported projection methods
    SUPPORTED_METHODS = ["pca", "tsne", "umap"]
    
    CONTRACT = VisualContract(
        visual_type="projection",
        version="1.0",
        inputs=[
            VisualInput(
                name="points",
                dtype="array",
                required=True,
                shape=[None, None],  # [n_points, n_dims]
                description="High-dimensional data points",
            ),
            VisualInput(
                name="projected",
                dtype="array",
                required=True,
                shape=[None, 2],  # or [None, 3] for 3D
                description="Projected coordinates (2D or 3D)",
            ),
            VisualInput(
                name="labels",
                dtype="array",
                required=False,
                description="Point labels for coloring",
            ),
            VisualInput(
                name="method",
                dtype="string",
                required=True,
                constraints={"choices": ["pca", "tsne", "umap"]},
                description="Projection method used",
            ),
            VisualInput(
                name="explained_variance",
                dtype="array",
                required=False,
                description="Explained variance ratio (PCA only)",
            ),
        ],
        output_schema={
            "type": "object",
            "properties": {
                "points": {
                    "type": "array",
                    "items": {"type": "object"},
                },
                "method": {"type": "string"},
                "dimensions": {"type": "integer"},
                "explained_variance": {"type": "array"},
            },
        },
        deterministic=True,
        failure_modes=[
            "empty_input",
            "dimension_mismatch",
            "invalid_method",
            "non_numeric_data",
        ],
        supported_modes=[RenderingMode.JSON, RenderingMode.SVG],
    )
    
    def __init__(self, seed: int = 42):
        super().__init__(seed=seed)
        self.method: Optional[str] = None
        self.dimensions: int = 2
    
    def validate_inputs(
        self,
        points: Any = None,
        projected: Any = None,
        labels: Any = None,
        method: str = "pca",
        **kwargs,
    ) -> bool:
        """Validate projection inputs."""
        
        # Validate method
        if method not in self.SUPPORTED_METHODS:
            raise VisualSchemaError(
                f"Unsupported projection method: {method}",
                visual_id=self.VISUAL_TYPE,
                field="method",
            )
        
        # Validate points
        if points is None:
            raise VisualSchemaError(
                "points is required",
                visual_id=self.VISUAL_TYPE,
                field="points",
            )
        
        # Validate projected coordinates
        if projected is None:
            raise VisualSchemaError(
                "projected coordinates are required",
                visual_id=self.VISUAL_TYPE,
                field="projected",
            )
        
        # Check dimensions match
        try:
            n_points = len(points)
            n_projected = len(projected)
            
            if n_points != n_projected:
                raise VisualDimensionError(
                    f"Point count mismatch: {n_points} vs {n_projected}",
                    visual_id=self.VISUAL_TYPE,
                    expected_dims=n_points,
                    actual_dims=n_projected,
                )
            
            # Check projection dimensions (2D or 3D)
            if len(projected) > 0:
                proj_dims = len(projected[0])
                if proj_dims not in [2, 3]:
                    raise VisualDimensionError(
                        f"Projected dimensions must be 2 or 3, got {proj_dims}",
                        visual_id=self.VISUAL_TYPE,
                    )
                self.dimensions = proj_dims
                
        except (TypeError, AttributeError) as e:
            raise VisualSchemaError(
                f"Invalid data structure: {e}",
                visual_id=self.VISUAL_TYPE,
            )
        
        # Validate labels if provided
        if labels is not None and len(labels) != n_points:
            raise VisualDimensionError(
                f"Label count mismatch: {len(labels)} vs {n_points}",
                visual_id=self.VISUAL_TYPE,
            )
        
        self.method = method
        self._validated = True
        return True
    
    def compute(
        self,
        points: List[List[float]],
        projected: List[List[float]],
        labels: Optional[List[Any]] = None,
        method: str = "pca",
        explained_variance: Optional[List[float]] = None,
        **kwargs,
    ) -> Dict[str, Any]:
        """Compute projection visual data."""
        
        projection_points = []
        
        for i, (orig, proj) in enumerate(zip(points, projected)):
            point = ProjectionPoint(
                x=proj[0],
                y=proj[1],
                z=proj[2] if len(proj) > 2 else None,
                label=str(labels[i]) if labels else None,
                cluster=None,
                metadata={"original_index": i},
            )
            projection_points.append(point)
        
        return {
            "points": [
                {
                    "x": p.x,
                    "y": p.y,
                    "z": p.z,
                    "label": p.label,
                    "cluster": p.cluster,
                    "metadata": p.metadata,
                }
                for p in projection_points
            ],
            "method": method,
            "dimensions": self.dimensions,
            "n_points": len(projection_points),
            "explained_variance": explained_variance or [],
        }
    
    def render(
        self,
        data: Dict[str, Any],
        mode: RenderingMode = RenderingMode.JSON,
    ) -> VisualOutput:
        """Render projection to output format."""
        
        if mode == RenderingMode.JSON:
            return VisualOutput(
                visual_id=f"projection_{self.method}_{data['n_points']}",
                visual_type=self.VISUAL_TYPE,
                mode=mode,
                data=data,
                metadata={
                    "seed": self.seed,
                    "method": self.method,
                    "dimensions": self.dimensions,
                },
                deterministic=True,
            )
        
        elif mode == RenderingMode.SVG:
            # Generate SVG representation
            svg_data = self._render_svg(data)
            return VisualOutput(
                visual_id=f"projection_{self.method}_{data['n_points']}",
                visual_type=self.VISUAL_TYPE,
                mode=mode,
                data={"svg": svg_data},
                metadata={
                    "seed": self.seed,
                    "method": self.method,
                },
                deterministic=True,
            )
        
        else:
            raise VisualValidationError(
                f"Unsupported rendering mode: {mode}",
                visual_id=self.VISUAL_TYPE,
            )
    
    def _render_svg(self, data: Dict[str, Any]) -> str:
        """Generate SVG for projection."""
        
        points = data["points"]
        if not points:
            return "<svg></svg>"
        
        # Calculate bounds
        xs = [p["x"] for p in points]
        ys = [p["y"] for p in points]
        
        x_min, x_max = min(xs), max(xs)
        y_min, y_max = min(ys), max(ys)
        
        # Normalize to SVG viewport
        width, height = 400, 400
        padding = 20
        
        def scale_x(x):
            if x_max == x_min:
                return width / 2
            return padding + (x - x_min) / (x_max - x_min) * (width - 2 * padding)
        
        def scale_y(y):
            if y_max == y_min:
                return height / 2
            return padding + (y_max - y) / (y_max - y_min) * (height - 2 * padding)
        
        # Build SVG
        circles = []
        for p in points:
            cx = scale_x(p["x"])
            cy = scale_y(p["y"])
            circles.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="4" fill="#4A90D9" opacity="0.7"/>')
        
        svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}">
  <rect width="{width}" height="{height}" fill="#1a1a2e"/>
  {"".join(circles)}
</svg>'''
        
        return svg
