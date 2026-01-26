"""
V2 Attention Visual Primitive

Visualizes attention mechanisms in Transformer models.
Shows: Attention heatmaps, token-to-token weights, multi-head attention.

V2 ONLY - Not for use with V1 content.
"""

from typing import Dict, Any, List, Optional
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
class AttentionHead:
    """Attention weights for a single head."""
    
    head_index: int
    weights: List[List[float]]  # [seq_len, seq_len]
    head_name: Optional[str] = None


@dataclass
class AttentionLayer:
    """Attention for a single layer."""
    
    layer_index: int
    heads: List[AttentionHead]
    aggregated_weights: Optional[List[List[float]]] = None  # Averaged across heads


class AttentionVisual(VisualPrimitive):
    """
    Attention visual primitive for Transformer attention.
    
    Supports:
    - Self-attention heatmaps
    - Cross-attention visualization
    - Multi-head attention (all heads or selected)
    - Layer-by-layer attention flow
    
    Renders:
    - Token-to-token attention matrix
    - Attention weight heatmaps
    - Head comparison views
    """
    
    VISUAL_TYPE = "attention"
    
    SUPPORTED_TYPES = ["self_attention", "cross_attention", "multi_head"]
    
    CONTRACT = VisualContract(
        visual_type="attention",
        version="1.0",
        inputs=[
            VisualInput(
                name="attention_weights",
                dtype="array",
                required=True,
                shape=[None, None, None],  # [heads, seq_len, seq_len]
                description="Attention weight matrices",
            ),
            VisualInput(
                name="source_tokens",
                dtype="array",
                required=True,
                description="Source sequence tokens",
            ),
            VisualInput(
                name="target_tokens",
                dtype="array",
                required=False,
                description="Target sequence tokens (for cross-attention)",
            ),
            VisualInput(
                name="attention_type",
                dtype="string",
                required=True,
                constraints={"choices": ["self_attention", "cross_attention", "multi_head"]},
                description="Type of attention mechanism",
            ),
            VisualInput(
                name="layer_index",
                dtype="integer",
                required=False,
                description="Layer index (if from specific layer)",
            ),
            VisualInput(
                name="selected_heads",
                dtype="array",
                required=False,
                description="Indices of heads to visualize (None = all)",
            ),
        ],
        output_schema={
            "type": "object",
            "properties": {
                "attention_type": {"type": "string"},
                "num_heads": {"type": "integer"},
                "seq_length": {"type": "integer"},
                "source_tokens": {"type": "array"},
                "target_tokens": {"type": "array"},
                "heads": {"type": "array"},
                "aggregated": {"type": "array"},
            },
        },
        deterministic=True,
        failure_modes=[
            "empty_weights",
            "token_mismatch",
            "invalid_attention_type",
            "dimension_mismatch",
        ],
        supported_modes=[RenderingMode.JSON],
    )
    
    def __init__(self, seed: int = 42):
        super().__init__(seed=seed)
        self.attention_type: Optional[str] = None
    
    def validate_inputs(
        self,
        attention_weights: Any = None,
        source_tokens: Any = None,
        attention_type: str = "self_attention",
        target_tokens: Any = None,
        **kwargs,
    ) -> bool:
        """Validate attention inputs."""
        
        if attention_type not in self.SUPPORTED_TYPES:
            raise VisualSchemaError(
                f"Unsupported attention type: {attention_type}",
                visual_id=self.VISUAL_TYPE,
                field="attention_type",
            )
        
        if attention_weights is None or len(attention_weights) == 0:
            raise VisualSchemaError(
                "attention_weights is required and must not be empty",
                visual_id=self.VISUAL_TYPE,
                field="attention_weights",
            )
        
        if source_tokens is None or len(source_tokens) == 0:
            raise VisualSchemaError(
                "source_tokens is required and must not be empty",
                visual_id=self.VISUAL_TYPE,
                field="source_tokens",
            )
        
        # Validate dimensions
        try:
            num_heads = len(attention_weights)
            seq_len_q = len(attention_weights[0])
            seq_len_k = len(attention_weights[0][0])
            
            # For self-attention, source tokens should match query dimension
            if attention_type == "self_attention":
                if len(source_tokens) != seq_len_q:
                    raise VisualDimensionError(
                        f"Token count mismatch: {len(source_tokens)} tokens vs {seq_len_q} attention dim",
                        visual_id=self.VISUAL_TYPE,
                    )
            
            # For cross-attention, need target tokens
            if attention_type == "cross_attention":
                if target_tokens is None:
                    raise VisualSchemaError(
                        "target_tokens required for cross_attention",
                        visual_id=self.VISUAL_TYPE,
                        field="target_tokens",
                    )
                
        except (TypeError, IndexError) as e:
            raise VisualSchemaError(
                f"Invalid attention weights structure: {e}",
                visual_id=self.VISUAL_TYPE,
            )
        
        self.attention_type = attention_type
        self._validated = True
        return True
    
    def compute(
        self,
        attention_weights: List[List[List[float]]],
        source_tokens: List[str],
        attention_type: str = "self_attention",
        target_tokens: Optional[List[str]] = None,
        layer_index: Optional[int] = None,
        selected_heads: Optional[List[int]] = None,
        **kwargs,
    ) -> Dict[str, Any]:
        """Compute attention visual data."""
        
        num_heads = len(attention_weights)
        seq_len = len(attention_weights[0])
        
        # Process each head
        heads = []
        for h_idx, weights in enumerate(attention_weights):
            if selected_heads and h_idx not in selected_heads:
                continue
            
            head = AttentionHead(
                head_index=h_idx,
                weights=weights,
                head_name=f"Head {h_idx}",
            )
            heads.append(head)
        
        # Compute aggregated attention (average across heads)
        aggregated = [[0.0] * seq_len for _ in range(seq_len)]
        for h in heads:
            for i in range(seq_len):
                for j in range(seq_len):
                    aggregated[i][j] += h.weights[i][j] / len(heads)
        
        return {
            "attention_type": attention_type,
            "num_heads": num_heads,
            "seq_length": seq_len,
            "layer_index": layer_index,
            "source_tokens": source_tokens,
            "target_tokens": target_tokens or source_tokens,
            "heads": [
                {
                    "head_index": h.head_index,
                    "head_name": h.head_name,
                    "weights": h.weights,
                }
                for h in heads
            ],
            "aggregated": aggregated,
        }
    
    def render(
        self,
        data: Dict[str, Any],
        mode: RenderingMode = RenderingMode.JSON,
    ) -> VisualOutput:
        """Render attention to output format."""
        
        if mode == RenderingMode.JSON:
            return VisualOutput(
                visual_id=f"attention_{data['attention_type']}_{data['num_heads']}h",
                visual_type=self.VISUAL_TYPE,
                mode=mode,
                data=data,
                metadata={
                    "seed": self.seed,
                    "attention_type": data["attention_type"],
                    "num_heads": data["num_heads"],
                    "seq_length": data["seq_length"],
                },
                deterministic=True,
            )
        
        raise VisualValidationError(
            f"Unsupported rendering mode: {mode}",
            visual_id=self.VISUAL_TYPE,
        )
