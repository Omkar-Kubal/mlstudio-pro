"""
EP-4: Execution Harness

Headless notebook runner for programmatic execution.
"""

import json
import time
import traceback
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime

try:
    import nbformat
    from nbconvert.preprocessors import ExecutePreprocessor
    from nbconvert.preprocessors import CellExecutionError
except ImportError:
    raise ImportError("nbformat and nbconvert are required. Install with: pip install nbformat nbconvert")

from .errors import ExecutionError, ExecutionException, classify_error
from .scorer import LabResult, CompletionState, ValidationResult, determine_completion_state
from .seed_enforcer import SeedEnforcer
from .logger import ExecutionLogger
from .validator import ContractValidator


class NotebookRunner:
    """
    Headless notebook executor with validation and logging.
    
    EP-4 Implementation: Executes notebooks programmatically,
    captures outputs and exceptions, reports pass/fail per lab.
    """
    
    DEFAULT_TIMEOUT = 60  # seconds per cell
    DEFAULT_KERNEL = "python3"
    
    def __init__(
        self,
        labs_dir: Path,
        contracts_dir: Path,
        reports_dir: Path,
        timeout: int = DEFAULT_TIMEOUT,
        kernel_name: str = DEFAULT_KERNEL,
        seed: int = 42,
        enforce_seeds: bool = True,
    ):
        self.labs_dir = Path(labs_dir)
        self.timeout = timeout
        self.kernel_name = kernel_name
        self.seed = seed
        self.enforce_seeds = enforce_seeds
        
        # Initialize components
        self.seed_enforcer = SeedEnforcer(seed=seed)
        self.validator = ContractValidator(contracts_dir)
        self.logger = ExecutionLogger(reports_dir)
    
    def execute_notebook(
        self,
        notebook_path: Path,
        validate: bool = True,
    ) -> LabResult:
        """
        Execute a single notebook and return results.
        
        Args:
            notebook_path: Path to .ipynb file
            validate: Whether to validate against contract
            
        Returns:
            LabResult with execution details
        """
        lab_name = notebook_path.stem
        result = LabResult(
            lab_name=lab_name,
            lab_path=str(notebook_path),
            completion_state=CompletionState.HARD_FAIL,
        )
        
        try:
            # Load notebook
            with open(notebook_path, 'r', encoding='utf-8') as f:
                notebook = nbformat.read(f, as_version=4)
            
            # Count code cells
            code_cells = [c for c in notebook.cells if c.cell_type == 'code']
            result.cells_total = len(code_cells)
            
            # Enforce seeds if enabled
            if self.enforce_seeds:
                notebook = self.seed_enforcer.inject_seed_cell(notebook)
                code_cells = [c for c in notebook.cells if c['cell_type'] == 'code']
                result.cells_total = len(code_cells)
            
            # Extract seed from notebook
            result.random_seed = SeedEnforcer.extract_seed_from_notebook(
                {"cells": notebook.cells}
            ) or self.seed
            
            # Execute
            ep = ExecutePreprocessor(
                timeout=self.timeout,
                kernel_name=self.kernel_name,
                allow_errors=True,  # Continue on errors to capture all issues
            )
            
            start_time = time.time()
            
            try:
                ep.preprocess(notebook, {'metadata': {'path': str(notebook_path.parent)}})
            except CellExecutionError as e:
                # Cell raised an exception
                error = ExecutionException(
                    error_type=classify_error(e),
                    message=str(e),
                    traceback=traceback.format_exc(),
                )
                result.errors.append(error)
            except Exception as e:
                # Unexpected error
                error = ExecutionException(
                    error_type=classify_error(e),
                    message=str(e),
                    traceback=traceback.format_exc(),
                )
                result.errors.append(error)
            
            execution_time = time.time() - start_time
            
            # Count executed cells and collect errors
            cells_executed = 0
            for i, cell in enumerate(notebook.cells):
                if cell['cell_type'] != 'code':
                    continue
                
                # Check if cell was executed
                if cell.get('execution_count') is not None:
                    cells_executed += 1
                
                # Check for errors in outputs
                for output in cell.get('outputs', []):
                    if output.get('output_type') == 'error':
                        error_name = output.get('ename', 'Error')
                        error_value = output.get('evalue', '')
                        error_tb = '\n'.join(output.get('traceback', []))
                        
                        # Create synthetic exception for classification
                        try:
                            exc_class = eval(error_name) if error_name in dir(__builtins__) else Exception
                            exc = exc_class(error_value)
                        except:
                            exc = Exception(error_value)
                        
                        error = ExecutionException(
                            error_type=classify_error(exc, cell.get('source', '')),
                            message=f"{error_name}: {error_value}",
                            cell_index=i,
                            cell_source=cell.get('source', ''),
                            traceback=error_tb,
                        )
                        result.errors.append(error)
            
            result.cells_executed = cells_executed
            
            # Collect outputs for hashing
            outputs = self._extract_outputs(notebook)
            result.output_hash = self.logger.compute_output_hash(outputs)
            
            # Validate if requested
            if validate:
                contract = self.validator.load_contract(lab_name)
                if contract:
                    validations = self._validate_outputs(contract, outputs)
                    result.validations = validations
            
            # Determine completion state
            result.completion_state = determine_completion_state(
                result.cells_total,
                result.cells_executed,
                result.errors,
                result.validations,
            )
            
        except Exception as e:
            error = ExecutionException(
                error_type=ExecutionError.SETUP_ERROR,
                message=str(e),
                traceback=traceback.format_exc(),
            )
            result.errors.append(error)
            result.completion_state = CompletionState.HARD_FAIL
        
        result.finalize()
        return result
    
    def _extract_outputs(self, notebook: nbformat.NotebookNode) -> List[Dict[str, Any]]:
        """Extract all outputs from executed notebook."""
        outputs = []
        
        for cell in notebook.cells:
            if cell['cell_type'] != 'code':
                continue
            
            for output in cell.get('outputs', []):
                output_data = {
                    'output_type': output.get('output_type'),
                }
                
                if output.get('output_type') == 'stream':
                    output_data['text'] = output.get('text', '')
                elif output.get('output_type') == 'execute_result':
                    output_data['data'] = output.get('data', {})
                elif output.get('output_type') == 'display_data':
                    output_data['data'] = output.get('data', {})
                
                outputs.append(output_data)
        
        return outputs
    
    def _validate_outputs(
        self, 
        contract: Any, 
        outputs: List[Dict[str, Any]]
    ) -> List[ValidationResult]:
        """Validate outputs against contract (placeholder for custom validation)."""
        # This is a simplified implementation
        # Real validation would parse outputs and match to contract
        validations = []
        
        # For now, just check invariants that can be verified
        for inv in contract.invariants:
            if inv.invariant_type == "no_nan":
                # Check all numeric outputs for NaN
                has_nan = False
                for output in outputs:
                    # Check stream text
                    if output.get('output_type') == 'stream':
                        text = output.get('text', '').lower()
                        if 'nan' in text:
                            has_nan = True
                            break
                    
                    # Check execute_result or display_data text/plain
                    if output.get('output_type') in ('execute_result', 'display_data'):
                        data = output.get('data', {})
                        if 'text/plain' in data:
                            text = str(data['text/plain']).lower()
                            if 'nan' in text:
                                has_nan = True
                                break
                
                validations.append(ValidationResult(
                    check_name=f"invariant:{inv.name}",
                    passed=not has_nan,
                    expected="no NaN",
                    actual="has NaN" if has_nan else "no NaN",
                ))
        
        return validations
    
    def run_all(
        self,
        validate: bool = True,
        save_reports: bool = True,
    ) -> Tuple[Dict[str, LabResult], Dict[str, Any]]:
        """
        Execute all notebooks in labs directory.
        
        Returns:
            (results, summary): Dict of results per lab and aggregate summary
        """
        results = {}
        notebooks = list(self.labs_dir.glob("*.ipynb"))
        
        print(f"Running {len(notebooks)} notebooks...")
        
        for i, nb_path in enumerate(notebooks, 1):
            lab_name = nb_path.stem
            print(f"[{i}/{len(notebooks)}] {lab_name}...", end=" ")
            
            result = self.execute_notebook(nb_path, validate=validate)
            results[lab_name] = result
            
            # Print status
            status = result.completion_state.value.upper()
            duration = result.duration_seconds
            print(f"{status} ({duration:.1f}s)")
            
            # Save individual report
            if save_reports:
                metadata = self.logger.create_metadata(lab_name, nb_path, self.seed)
                metadata.completion_state = result.completion_state.value
                metadata.duration_seconds = result.duration_seconds
                metadata.cells_executed = result.cells_executed
                metadata.cells_total = result.cells_total
                metadata.error_count = len(result.errors)
                metadata.errors = [e.to_dict() for e in result.errors]
                metadata.validations = [v.to_dict() for v in result.validations]
                metadata.output_hash = result.output_hash
                self.logger.save_metadata(metadata)
        
        # Generate summary
        summary = {
            "total": len(results),
            "pass": sum(1 for r in results.values() if r.completion_state == CompletionState.PASS),
            "soft_fail": sum(1 for r in results.values() if r.completion_state == CompletionState.SOFT_FAIL),
            "hard_fail": sum(1 for r in results.values() if r.completion_state == CompletionState.HARD_FAIL),
            "total_duration": sum(r.duration_seconds for r in results.values()),
            "timestamp": datetime.now().isoformat(),
        }
        
        if save_reports:
            summary_path = self.logger.reports_dir / "summary.json"
            with open(summary_path, 'w') as f:
                json.dump(summary, f, indent=2)
        
        return results, summary
