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
        supported_modes=[RenderingMode.JSON],
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
        
        raise VisualValidationError(
            f"Unsupported rendering mode: {mode}",
            visual_id=self.VISUAL_TYPE,
        )
