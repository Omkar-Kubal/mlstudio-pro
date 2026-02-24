"""
V2 Sequence Flow Visual Primitive

Visualizes sequential data processing in RNNs and LSTMs.
Shows: Unrolled time steps, gradient flow over time, state propagation.

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
    VisualValidationError,
)


@dataclass
class SequenceStep:
    """A single time step in the sequence."""
    
    step_index: int
    input_value: Any
    hidden_state: List[float]
    output_value: Optional[Any] = None
    cell_state: Optional[List[float]] = None  # LSTM only
    gates: Optional[Dict[str, List[float]]] = None  # Gate activations
    gradient_magnitude: Optional[float] = None


@dataclass
class GradientFlow:
    """Gradient flow information for backpropagation visualization."""
    
    step_index: int
    gradient_values: List[float]
    gradient_norm: float
    vanishing: bool = False
    exploding: bool = False


class SequenceVisual(VisualPrimitive):
    """
    Sequence flow visual primitive for RNN/LSTM.
    
    Supports:
    - Unrolled time step visualization
    - Hidden state propagation
    - Gradient flow over time
    - Gate activation visualization (LSTM)
    
    Renders:
    - Step-by-step sequence diagram
    - Gradient magnitude over time
    - State evolution curves
    """
    
    VISUAL_TYPE = "sequence"
    
    SUPPORTED_TYPES = ["rnn", "lstm", "gru"]
    
    CONTRACT = VisualContract(
        visual_type="sequence",
        version="1.0",
        inputs=[
            VisualInput(
                name="inputs",
                dtype="array",
                required=True,
                shape=[None],  # Sequence of inputs
                description="Input sequence values",
            ),
            VisualInput(
                name="hidden_states",
                dtype="array",
                required=True,
                shape=[None, None],  # [time_steps, hidden_dim]
                description="Hidden states at each time step",
            ),
            VisualInput(
                name="outputs",
                dtype="array",
                required=False,
                shape=[None],
                description="Output values at each time step",
            ),
            VisualInput(
                name="cell_states",
                dtype="array",
                required=False,
                shape=[None, None],
                description="Cell states (LSTM only)",
            ),
            VisualInput(
                name="gradients",
                dtype="array",
                required=False,
                shape=[None],
                description="Gradient magnitudes per time step",
            ),
            VisualInput(
                name="sequence_type",
                dtype="string",
                required=True,
                constraints={"choices": ["rnn", "lstm", "gru"]},
                description="Type of sequence model",
            ),
        ],
        output_schema={
            "type": "object",
            "properties": {
                "steps": {"type": "array"},
                "sequence_type": {"type": "string"},
                "sequence_length": {"type": "integer"},
                "hidden_dim": {"type": "integer"},
                "gradient_flow": {"type": "array"},
            },
        },
        deterministic=True,
        failure_modes=[
            "empty_sequence",
            "dimension_mismatch",
            "invalid_sequence_type",
        ],
        supported_modes=[RenderingMode.JSON, RenderingMode.SVG],
    )
    
    def __init__(self, seed: int = 42):
        super().__init__(seed=seed)
        self.sequence_type: Optional[str] = None
    
    def validate_inputs(
        self,
        inputs: Any = None,
        hidden_states: Any = None,
        sequence_type: str = "rnn",
        **kwargs,
    ) -> bool:
        """Validate sequence inputs."""
        
        if sequence_type not in self.SUPPORTED_TYPES:
            raise VisualSchemaError(
                f"Unsupported sequence type: {sequence_type}",
                visual_id=self.VISUAL_TYPE,
                field="sequence_type",
            )
        
        if inputs is None or len(inputs) == 0:
            raise VisualSchemaError(
                "inputs is required and must not be empty",
                visual_id=self.VISUAL_TYPE,
                field="inputs",
            )
        
        if hidden_states is None:
            raise VisualSchemaError(
                "hidden_states is required",
                visual_id=self.VISUAL_TYPE,
                field="hidden_states",
            )
        
        # Validate sequence length consistency
        seq_len = len(inputs)
        if len(hidden_states) != seq_len:
            raise VisualSchemaError(
                f"Sequence length mismatch: inputs={seq_len}, hidden_states={len(hidden_states)}",
                visual_id=self.VISUAL_TYPE,
            )
        
        self.sequence_type = sequence_type
        self._validated = True
        return True
    
    def compute(
        self,
        inputs: List[Any],
        hidden_states: List[List[float]],
        outputs: Optional[List[Any]] = None,
        cell_states: Optional[List[List[float]]] = None,
        gradients: Optional[List[float]] = None,
        sequence_type: str = "rnn",
        **kwargs,
    ) -> Dict[str, Any]:
        """Compute sequence visual data."""
        
        seq_len = len(inputs)
        hidden_dim = len(hidden_states[0]) if hidden_states else 0
        
        steps = []
        for i in range(seq_len):
            step = SequenceStep(
                step_index=i,
                input_value=inputs[i],
                hidden_state=hidden_states[i],
                output_value=outputs[i] if outputs else None,
                cell_state=cell_states[i] if cell_states else None,
                gradient_magnitude=gradients[i] if gradients else None,
            )
            steps.append(step)
        
        # Compute gradient flow analysis
        gradient_flow = []
        if gradients:
            for i, grad in enumerate(gradients):
                flow = GradientFlow(
                    step_index=i,
                    gradient_values=[grad],
                    gradient_norm=abs(grad),
                    vanishing=abs(grad) < 1e-6,
                    exploding=abs(grad) > 1e6,
                )
                gradient_flow.append(flow)
        
        return {
            "steps": [
                {
                    "step_index": s.step_index,
                    "input_value": s.input_value,
                    "hidden_state": s.hidden_state,
                    "output_value": s.output_value,
                    "cell_state": s.cell_state,
                    "gradient_magnitude": s.gradient_magnitude,
                }
                for s in steps
            ],
            "sequence_type": sequence_type,
            "sequence_length": seq_len,
            "hidden_dim": hidden_dim,
            "gradient_flow": [
                {
                    "step_index": g.step_index,
                    "gradient_norm": g.gradient_norm,
                    "vanishing": g.vanishing,
                    "exploding": g.exploding,
                }
                for g in gradient_flow
            ],
        }
    
    def render(
        self,
        data: Dict[str, Any],
        mode: RenderingMode = RenderingMode.JSON,
    ) -> VisualOutput:
        """Render sequence to output format."""
        
        if mode == RenderingMode.JSON:
            return VisualOutput(
                visual_id=f"sequence_{data['sequence_type']}_{data['sequence_length']}",
                visual_type=self.VISUAL_TYPE,
                mode=mode,
                data=data,
                metadata={
                    "seed": self.seed,
                    "sequence_type": data["sequence_type"],
                    "sequence_length": data["sequence_length"],
                    "hidden_dim": data["hidden_dim"],
                },
                deterministic=True,
            )
            
        if mode == RenderingMode.SVG:
            svg_content = self._render_svg(data)
            return VisualOutput(
                visual_id=f"sequence_{data['sequence_type']}_{data['sequence_length']}",
                visual_type=self.VISUAL_TYPE,
                mode=mode,
                data=svg_content,
                metadata={
                    "seed": self.seed,
                    "sequence_type": data["sequence_type"],
                },
                deterministic=True,
            )
        
        raise VisualValidationError(
            f"Unsupported rendering mode: {mode}",
            visual_id=self.VISUAL_TYPE,
        )

    def _render_svg(self, data: Dict[str, Any]) -> str:
        """Render sequence unrolled diagram as SVG."""
        seq_len = data["sequence_length"]
        # steps = data["steps"]
        sequence_type = data["sequence_type"]
        
        box_width = 60
        box_height = 40
        spacing = 40
        margin_left = 50
        margin_top = 60
        
        width = margin_left + seq_len * (box_width + spacing)
        height = margin_top + box_height + 100
        
        svg = [f'<svg width="{width}" height="{height}" viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg">']
        svg.append('<rect width="100%" height="100%" fill="#fcfcfc" />')
        
        # Arrowhead definition
        svg.append('<defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" /></marker></defs>')

        for i in range(seq_len):
            x = margin_left + i * (box_width + spacing)
            y = margin_top
            
            # Draw block
            color = "#3b82f6" if sequence_type == "rnn" else "#10b981" if sequence_type == "lstm" else "#f59e0b"
            svg.append(f'<rect x="{x}" y="{y}" width="{box_width}" height="{box_height}" rx="4" fill="{color}" opacity="0.8" stroke="#1e40af" stroke-width="1" />')
            svg.append(f'<text x="{x + box_width/2}" y="{y + box_height/2 + 4}" text-anchor="middle" fill="white" font-family="monospace" font-size="10" font-weight="bold">{sequence_type.upper()}</text>')
            
            # Input arrow (bottom to top)
            svg.append(f'<line x1="{x + box_width/2}" y1="{y + box_height + 30}" x2="{x + box_width/2}" y2="{y + box_height + 2}" stroke="#6b7280" stroke-width="2" marker-end="url(#arrowhead)" />')
            svg.append(f'<text x="{x + box_width/2}" y="{y + box_height + 42}" text-anchor="middle" fill="#6b7280" font-family="monospace" font-size="8">x_{i}</text>')
            
            # Output arrow (bottom to top)
            svg.append(f'<line x1="{x + box_width/2}" y1="{y}" x2="{x + box_width/2}" y2="{y - 28}" stroke="#6b7280" stroke-width="2" marker-end="url(#arrowhead)" />')
            svg.append(f'<text x="{x + box_width/2}" y="{y - 35}" text-anchor="middle" fill="#6b7280" font-family="monospace" font-size="8">h_{i}</text>')
            
            # Horizontal state arrow (if not last)
            if i < seq_len - 1:
                svg.append(f'<line x1="{x + box_width}" y1="{y + box_height/2}" x2="{x + box_width + spacing - 2}" y2="{y + box_height/2}" stroke="#6b7280" stroke-width="2" marker-end="url(#arrowhead)" />')

        svg.append('</svg>')
        return "\n".join(svg)
