"""
V2 Filters and Feature Map Visual Primitive

Visualizes CNN filters and intermediate feature maps.
Shows: Convolutional filters, activation maps, channel-wise inspection.

V2 ONLY - Not for use with V1 content.
"""

from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, field

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
class Filter:
    """A single convolutional filter."""
    
    filter_index: int
    weights: List[List[List[float]]]  # [in_channels, H, W]
    layer_name: Optional[str] = None
    out_channel: int = 0


@dataclass
class FeatureMap:
    """A single feature map (activation)."""
    
    channel_index: int
    activation: List[List[float]]  # [H, W]
    layer_name: Optional[str] = None
    statistics: Optional[Dict[str, float]] = None  # mean, std, max, etc.


class FiltersVisual(VisualPrimitive):
    """
    Filters and feature map visual primitive for CNNs.
    
    Supports:
    - Convolutional filter visualization
    - Feature map / activation visualization
    - Channel-wise inspection
    - Layer-by-layer feature extraction
    
    Renders:
    - Filter weight grids
    - Activation heatmaps
    - Channel statistics
    """
    
    VISUAL_TYPE = "filters"
    
    SUPPORTED_TYPES = ["filters", "feature_maps", "both"]
    
    CONTRACT = VisualContract(
        visual_type="filters",
        version="1.0",
        inputs=[
            VisualInput(
                name="filters",
                dtype="array",
                required=False,
                shape=[None, None, None, None],  # [out_ch, in_ch, H, W]
                description="Convolutional filter weights",
            ),
            VisualInput(
                name="feature_maps",
                dtype="array",
                required=False,
                shape=[None, None, None],  # [channels, H, W]
                description="Feature map activations",
            ),
            VisualInput(
                name="layer_name",
                dtype="string",
                required=False,
                description="Name of the layer",
            ),
            VisualInput(
                name="visualization_type",
                dtype="string",
                required=True,
                constraints={"choices": ["filters", "feature_maps", "both"]},
                description="What to visualize",
            ),
            VisualInput(
                name="selected_channels",
                dtype="array",
                required=False,
                description="Indices of channels to visualize (None = all)",
            ),
            VisualInput(
                name="normalize",
                dtype="boolean",
                required=False,
                description="Whether to normalize values for visualization",
            ),
        ],
        output_schema={
            "type": "object",
            "properties": {
                "visualization_type": {"type": "string"},
                "layer_name": {"type": "string"},
                "filters": {"type": "array"},
                "feature_maps": {"type": "array"},
                "filter_shape": {"type": "array"},
                "feature_map_shape": {"type": "array"},
            },
        },
        deterministic=True,
        failure_modes=[
            "empty_data",
            "invalid_type",
            "dimension_mismatch",
        ],
        supported_modes=[RenderingMode.JSON, RenderingMode.SVG],
    )
    
    def __init__(self, seed: int = 42):
        super().__init__(seed=seed)
        self.visualization_type: Optional[str] = None
    
    def validate_inputs(
        self,
        visualization_type: str = "filters",
        filters: Any = None,
        feature_maps: Any = None,
        **kwargs,
    ) -> bool:
        """Validate filter/feature map inputs."""
        
        if visualization_type not in self.SUPPORTED_TYPES:
            raise VisualSchemaError(
                f"Unsupported visualization type: {visualization_type}",
                visual_id=self.VISUAL_TYPE,
                field="visualization_type",
            )
        
        # Check required data based on type
        if visualization_type == "filters":
            if filters is None or len(filters) == 0:
                raise VisualSchemaError(
                    "filters is required for filters visualization",
                    visual_id=self.VISUAL_TYPE,
                    field="filters",
                )
        
        if visualization_type == "feature_maps":
            if feature_maps is None or len(feature_maps) == 0:
                raise VisualSchemaError(
                    "feature_maps is required for feature_maps visualization",
                    visual_id=self.VISUAL_TYPE,
                    field="feature_maps",
                )
        
        if visualization_type == "both":
            if filters is None or feature_maps is None:
                raise VisualSchemaError(
                    "Both filters and feature_maps required for 'both' type",
                    visual_id=self.VISUAL_TYPE,
                )
        
        self.visualization_type = visualization_type
        self._validated = True
        return True
    
    def compute(
        self,
        visualization_type: str = "filters",
        filters: Optional[List[List[List[List[float]]]]] = None,
        feature_maps: Optional[List[List[List[float]]]] = None,
        layer_name: Optional[str] = None,
        selected_channels: Optional[List[int]] = None,
        normalize: bool = True,
        **kwargs,
    ) -> Dict[str, Any]:
        """Compute filter/feature map visual data."""
        
        result = {
            "visualization_type": visualization_type,
            "layer_name": layer_name,
            "filters": [],
            "feature_maps": [],
            "filter_shape": None,
            "feature_map_shape": None,
        }
        
        # Process filters
        if filters is not None:
            filter_shape = [
                len(filters),  # out_channels
                len(filters[0]) if filters else 0,  # in_channels
                len(filters[0][0]) if filters and filters[0] else 0,  # H
                len(filters[0][0][0]) if filters and filters[0] and filters[0][0] else 0,  # W
            ]
            result["filter_shape"] = filter_shape
            
            for f_idx, f_weights in enumerate(filters):
                if selected_channels and f_idx not in selected_channels:
                    continue
                
                # Normalize if requested
                processed = self._normalize_filter(f_weights) if normalize else f_weights
                
                filter_obj = Filter(
                    filter_index=f_idx,
                    weights=processed,
                    layer_name=layer_name,
                    out_channel=f_idx,
                )
                result["filters"].append({
                    "filter_index": filter_obj.filter_index,
                    "weights": filter_obj.weights,
                    "layer_name": filter_obj.layer_name,
                })
        
        # Process feature maps
        if feature_maps is not None:
            fm_shape = [
                len(feature_maps),  # channels
                len(feature_maps[0]) if feature_maps else 0,  # H
                len(feature_maps[0][0]) if feature_maps and feature_maps[0] else 0,  # W
            ]
            result["feature_map_shape"] = fm_shape
            
            for ch_idx, activation in enumerate(feature_maps):
                if selected_channels and ch_idx not in selected_channels:
                    continue
                
                # Normalize if requested
                processed = self._normalize_2d(activation) if normalize else activation
                
                # Compute statistics
                flat = [v for row in activation for v in row]
                stats = {
                    "mean": sum(flat) / len(flat) if flat else 0,
                    "max": max(flat) if flat else 0,
                    "min": min(flat) if flat else 0,
                }
                
                fm_obj = FeatureMap(
                    channel_index=ch_idx,
                    activation=processed,
                    layer_name=layer_name,
                    statistics=stats,
                )
                result["feature_maps"].append({
                    "channel_index": fm_obj.channel_index,
                    "activation": fm_obj.activation,
                    "layer_name": fm_obj.layer_name,
                    "statistics": fm_obj.statistics,
                })
        
        return result
    
    def _normalize_filter(
        self,
        weights: List[List[List[float]]],
    ) -> List[List[List[float]]]:
        """Normalize filter weights to [0, 1] range."""
        
        # Flatten to find min/max
        flat = [v for ch in weights for row in ch for v in row]
        if not flat:
            return weights
        
        v_min, v_max = min(flat), max(flat)
        v_range = v_max - v_min
        
        if v_range < 1e-10:
            return weights
        
        return [
            [
                [(v - v_min) / v_range for v in row]
                for row in ch
            ]
            for ch in weights
        ]
    
    def _normalize_2d(
        self,
        activation: List[List[float]],
    ) -> List[List[float]]:
        """Normalize 2D activation to [0, 1] range."""
        
        flat = [v for row in activation for v in row]
        if not flat:
            return activation
        
        v_min, v_max = min(flat), max(flat)
        v_range = v_max - v_min
        
        if v_range < 1e-10:
            return activation
        
        return [
            [(v - v_min) / v_range for v in row]
            for row in activation
        ]
    
    def render(
        self,
        data: Dict[str, Any],
        mode: RenderingMode = RenderingMode.JSON,
    ) -> VisualOutput:
        """Render filters/feature maps to output format."""
        
        if mode == RenderingMode.JSON:
            return VisualOutput(
                visual_id=f"filters_{data['visualization_type']}_{data['layer_name'] or 'layer'}",
                visual_type=self.VISUAL_TYPE,
                mode=mode,
                data=data,
                metadata={
                    "seed": self.seed,
                    "visualization_type": data["visualization_type"],
                    "layer_name": data["layer_name"],
                    "filter_shape": data["filter_shape"],
                    "feature_map_shape": data["feature_map_shape"],
                },
                deterministic=True,
            )
            
        if mode == RenderingMode.SVG:
            svg_content = self._render_svg(data)
            return VisualOutput(
                visual_id=f"filters_{data['visualization_type']}_{data['layer_name'] or 'layer'}",
                visual_type=self.VISUAL_TYPE,
                mode=mode,
                data=svg_content,
                metadata={
                    "seed": self.seed,
                    "visualization_type": data["visualization_type"],
                },
                deterministic=True,
            )
        
        raise VisualValidationError(
            f"Unsupported rendering mode: {mode}",
            visual_id=self.VISUAL_TYPE,
        )

    def _render_svg(self, data: Dict[str, Any]) -> str:
        """Render filters or feature maps as SVG grid."""
        vis_type = data["visualization_type"]
        items = data["feature_maps"] if vis_type == "feature_maps" else data["filters"]
        
        if not items:
            return '<svg width="100" height="100"><text x="10" y="50">No data</text></svg>'
            
        # Grid settings
        cols = 4
        rows = (len(items) + cols - 1) // cols
        cell_size = 60
        padding = 10
        margin = 30
        
        width = margin * 2 + cols * (cell_size + padding)
        height = margin * 2 + rows * (cell_size + padding) + 20
        
        svg = [f'<svg width="{width}" height="{height}" viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg">']
        svg.append('<rect width="100%" height="100%" fill="#fcfcfc" />')
        svg.append(f'<text x="{margin}" y="20" font-family="monospace" font-size="12" font-weight="bold">{vis_type.upper()}: {data["layer_name"] or "Layer"}</text>')

        for idx, item in enumerate(items):
            if idx >= 16: # Limit to 16 for SVG performance
                break
                
            r = idx // cols
            c = idx % cols
            x = margin + c * (cell_size + padding)
            y = margin + 10 + r * (cell_size + padding)
            
            # Draw individual map
            activation = item["activation"] if "activation" in item else item["weights"][0]
            if not activation: continue
            
            h = len(activation)
            w = len(activation[0])
            pixel_size = cell_size / max(h, w)
            
            for i in range(h):
                for j in range(w):
                    val = activation[i][j]
                    alpha = min(1.0, max(0.0, val))
                    color = f"rgba(0, 0, 0, {alpha})"
                    svg.append(f'<rect x="{x + j * pixel_size}" y="{y + i * pixel_size}" width="{pixel_size + 0.1}" height="{pixel_size + 0.1}" fill="{color}" />')
            
            # Label
            label = item.get("channel_index", item.get("filter_index", idx))
            svg.append(f'<text x="{x}" y="{y + cell_size + 8}" font-family="monospace" font-size="6">Ch {label}</text>')

        svg.append('</svg>')
        return "\n".join(svg)
