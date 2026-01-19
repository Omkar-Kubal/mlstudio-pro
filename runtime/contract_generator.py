"""
EP-2: Contract Generator

Auto-generates output contracts for labs based on analysis.
"""

import json
import re
from pathlib import Path
from typing import Dict, Any, List, Optional
from dataclasses import dataclass

from .validator import LabContract, ScalarContract, ShapeContract, InvariantContract


# Lab categories and their expected invariants
LAB_CATEGORIES = {
    "stats_": {
        "invariants": ["no_nan", "no_inf"],
        "description": "Statistics labs",
    },
    "prob_": {
        "invariants": ["no_nan", "no_inf"],
        "scalars_in_range": {"lower": 0, "upper": 1},  # Probabilities
    },
    "linalg_": {
        "invariants": ["no_nan", "no_inf"],
    },
    "opt_": {
        "invariants": ["no_nan", "no_inf"],
    },
    "ml_": {
        "invariants": ["no_nan", "no_inf"],
    },
    "dl_": {
        "invariants": ["no_nan", "no_inf"],
    },
    "eval_": {
        "invariants": ["no_nan"],
        "scalars_in_range": {"lower": 0, "upper": 1},  # Metrics
    },
    "cnn_": {
        "invariants": ["no_nan", "no_inf"],
    },
    "cv_": {
        "invariants": ["no_nan"],
    },
    "nlp_": {
        "invariants": ["no_nan"],
    },
    "pd_": {
        "invariants": ["no_nan"],
    },
    "np_": {
        "invariants": ["no_nan", "no_inf"],
    },
    "py_": {
        "invariants": [],
    },
    "viz_": {
        "invariants": ["no_nan"],
    },
}


def analyze_lab(notebook_path: Path) -> Dict[str, Any]:
    """
    Analyze a lab notebook to determine expected contracts.
    
    Args:
        notebook_path: Path to .ipynb file
        
    Returns:
        Analysis results for contract generation
    """
    with open(notebook_path, 'r', encoding='utf-8') as f:
        notebook = json.load(f)
    
    lab_name = notebook_path.stem
    
    # Determine category
    category_info = {}
    for prefix, info in LAB_CATEGORIES.items():
        if lab_name.startswith(prefix):
            category_info = info
            break
    
    # Analyze code cells for patterns
    analysis = {
        "lab_name": lab_name,
        "category": category_info.get("description", "general"),
        "invariants": category_info.get("invariants", ["no_nan"]),
        "has_accuracy": False,
        "has_loss": False,
        "has_mse": False,
        "has_r2": False,
        "has_probabilities": False,
    }
    
    for cell in notebook.get("cells", []):
        if cell.get("cell_type") != "code":
            continue
        
        source = "".join(cell.get("source", []))
        
        # Check for common patterns
        if "accuracy" in source.lower():
            analysis["has_accuracy"] = True
        if re.search(r'\bloss\b', source.lower()):
            analysis["has_loss"] = True
        if "mse" in source.lower() or "mean_squared_error" in source:
            analysis["has_mse"] = True
        if "r2_score" in source or "r2" in source.lower():
            analysis["has_r2"] = True
        if "predict_proba" in source or "softmax" in source:
            analysis["has_probabilities"] = True
    
    return analysis


def generate_contract(lab_name: str, analysis: Dict[str, Any]) -> LabContract:
    """
    Generate a contract from analysis results.
    
    Args:
        lab_name: Name of the lab
        analysis: Analysis results from analyze_lab
        
    Returns:
        Generated LabContract
    """
    invariants = []
    scalars = []
    shapes = []
    
    # Add base invariants
    for inv_type in analysis.get("invariants", ["no_nan"]):
        invariants.append(InvariantContract(
            name=f"{lab_name}_{inv_type}",
            invariant_type=inv_type,
        ))
    
    # Add metric-specific contracts
    if analysis.get("has_accuracy"):
        invariants.append(InvariantContract(
            name=f"{lab_name}_accuracy_bounded",
            invariant_type="in_range",
            params={"lower": 0.0, "upper": 1.0},
        ))
    
    if analysis.get("has_r2"):
        invariants.append(InvariantContract(
            name=f"{lab_name}_r2_bounded",
            invariant_type="in_range",
            params={"lower": -10.0, "upper": 1.0},  # R2 can be negative
        ))
    
    if analysis.get("has_probabilities"):
        invariants.append(InvariantContract(
            name=f"{lab_name}_probs_normalized",
            invariant_type="normalized",
        ))
    
    if analysis.get("has_loss"):
        invariants.append(InvariantContract(
            name=f"{lab_name}_loss_non_negative",
            invariant_type="non_negative",
        ))
    
    return LabContract(
        lab_name=lab_name,
        version="1.0",
        scalars=scalars,
        shapes=shapes,
        invariants=invariants,
    )


def generate_contracts(
    labs_dir: Path,
    contracts_dir: Path,
    specific_lab: Optional[str] = None,
) -> Dict[str, Path]:
    """
    Generate contracts for labs.
    
    Args:
        labs_dir: Directory containing lab notebooks
        contracts_dir: Directory to save contracts
        specific_lab: If provided, only generate for this lab
        
    Returns:
        Dict mapping lab names to contract file paths
    """
    contracts_dir = Path(contracts_dir)
    contracts_dir.mkdir(parents=True, exist_ok=True)
    
    labs_dir = Path(labs_dir)
    
    if specific_lab:
        notebooks = [labs_dir / f"{specific_lab}.ipynb"]
    else:
        notebooks = list(labs_dir.glob("*.ipynb"))
    
    results = {}
    
    for nb_path in notebooks:
        if not nb_path.exists():
            continue
        
        lab_name = nb_path.stem
        
        # Analyze lab
        analysis = analyze_lab(nb_path)
        
        # Generate contract
        contract = generate_contract(lab_name, analysis)
        
        # Save contract
        contract_path = contracts_dir / f"{lab_name}.json"
        with open(contract_path, 'w', encoding='utf-8') as f:
            json.dump(contract.to_dict(), f, indent=2)
        
        results[lab_name] = contract_path
        print(f"Generated contract: {lab_name}")
    
    print(f"\nGenerated {len(results)} contracts in {contracts_dir}")
    return results
