import subprocess
import sys
import tempfile
import os
from typing import Dict, Any

class CodeRunner:
    def run_python(self, code: str) -> Dict[str, Any]:
        """
        Runs Python code locally and returns stdout, stderr, and optional image.
        Includes basic security checks to mitigate RCE.
        """
        import ast as _ast

        # Basic security check
        is_safe, error_msg = self._is_safe(code)
        if not is_safe:
            return {
                "stdout": "",
                "stderr": f"Security Error: {error_msg}",
                "exit_code": -1
            }

        # Add REPL-like auto-print for the last expression
        repl_code = self._add_repl_output(code)

        # Inject code to handle matplotlib if it's imported
        wrapped_code = self._wrap_code(repl_code)
        
        # Use a temporary file to store the code
        with tempfile.NamedTemporaryFile(suffix=".py", delete=False) as f:
            f.write(wrapped_code.encode("utf-8"))
            temp_file_path = f.name

        try:
            # Run the code using the current python executable
            result = subprocess.run(
                [sys.executable, temp_file_path],
                capture_output=True,
                text=True,
                timeout=10 # 10 second timeout
            )
            
            stdout = result.stdout
            image_base64 = None
            
            # Extract image if present in stdout
            if "---IMAGE_DATA---" in stdout:
                parts = stdout.split("---IMAGE_DATA---")
                stdout = parts[0]
                image_parts = parts[1].split("---END_IMAGE_DATA---")
                image_base64 = image_parts[0]
                if len(image_parts) > 1:
                    stdout += image_parts[1]

            return {
                "stdout": stdout.strip(),
                "stderr": result.stderr,
                "exit_code": result.returncode,
                "image": image_base64
            }
        except subprocess.TimeoutExpired:
            return {
                "stdout": "",
                "stderr": "Execution timed out (10s)",
                "exit_code": -1
            }
        except Exception as e:
            return {
                "stdout": "",
                "stderr": f"System error: {str(e)}",
                "exit_code": -1
            }
        finally:
            # Clean up the temporary file
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)

    def _add_repl_output(self, code: str) -> str:
        """
        Enhances code to produce output like a Jupyter/REPL cell:
        - If the last statement is a bare expression, auto-prints its repr
          (strips inline comments first to avoid SyntaxError when wrapping)
        - Otherwise dumps newly-defined user variables, or shows [OK] message
        """
        import ast as _ast
        import re as _re

        stripped = code.strip()
        if not stripped:
            return code

        try:
            tree = _ast.parse(stripped)
        except SyntaxError:
            return code  # Let runner surface the real error

        if not tree.body:
            return code

        last_stmt = tree.body[-1]

        # Case 1: Last line is a bare expression
        if isinstance(last_stmt, _ast.Expr):
            lines = stripped.splitlines()
            last_line_no = last_stmt.lineno - 1  # 0-indexed
            last_src_lines = lines[last_line_no:]

            # Skip if it's a plain print() call (already outputs)
            is_print_call = (
                isinstance(last_stmt.value, _ast.Call) and
                isinstance(last_stmt.value.func, _ast.Name) and
                last_stmt.value.func.id == "print"
            )
            if is_print_call:
                return code

            # Strip inline comments from each source line before wrapping
            # (inline comments break `_repl_result = (expr  # comment)`)
            cleaned_lines = []
            for ln in last_src_lines:
                # Remove inline comments (but not inside strings - simple heuristic)
                cleaned = _re.sub(r'\s*#.*$', '', ln)
                cleaned_lines.append(cleaned)
            safe_src = " ".join(cleaned_lines).strip()

            earlier = "\n".join(lines[:last_line_no])
            auto_print = (
                "\ntry:\n"
                f"    _repl_result = ({safe_src})\n"
                "    if _repl_result is not None:\n"
                "        print(repr(_repl_result))\n"
                "except Exception as _e:\n"
                "    print('[error]', _e)\n"
            )
            return earlier + auto_print

        # Case 2: Ends with assignment/if/loop - dump newly defined variables
        user_names = []
        for node in tree.body:
            if isinstance(node, _ast.Assign):
                for t in node.targets:
                    if isinstance(t, _ast.Name):
                        user_names.append(t.id)
            elif isinstance(node, _ast.AugAssign):
                if isinstance(node.target, _ast.Name):
                    user_names.append(node.target.id)
            elif isinstance(node, _ast.AnnAssign):
                if isinstance(node.target, _ast.Name):
                    user_names.append(node.target.id)

        # Skip preamble stubs and private names
        skip_names = {
            "THRESHOLD", "SEED", "np", "pd", "sys", "io", "types",
            "warnings", "n_samples", "total", "accuracy", "loss",
            "threshold", "s", "label", "status", "age", "values", "raw_data",
            "data", "dataset", "df", "features", "target", "X", "user_input",
            "transformed", "processed", "a", "skip_list", "results", "x", "y",
            "prediction_score",
        }

        display_names = []
        seen = set()
        for n in user_names:
            if n not in skip_names and not n.startswith("_") and n not in seen:
                display_names.append(n)
                seen.add(n)

        if not display_names:
            # Capture stdout to detect if the code itself printed anything
            header_wrap = (
                "import io as _io, sys as _sys\n"
                "_captured = _io.StringIO()\n"
                "_orig_out = _sys.stdout\n"
                "_sys.stdout = _captured\n"
            )
            footer_wrap = (
                "\n_sys.stdout = _orig_out\n"
                "_out = _captured.getvalue()\n"
                "if _out:\n"
                "    print(_out, end='')\n"
                "else:\n"
                "    print('[OK] Code executed successfully')\n"
            )
            return header_wrap + stripped + footer_wrap

        # Pretty-print each user variable
        dump_lines = [""]
        for name in display_names:
            dump_lines.append(
                f"try:\n"
                f"    print('{name} =', repr({name}))\n"
                f"except Exception:\n"
                f"    pass"
            )
        return stripped + "\n" + "\n".join(dump_lines) + "\n"


    def _is_safe(self, code: str) -> tuple[bool, str]:
        """
        Performs basic keyword filtering to prevent common RCE patterns.
        NOTE: This is a basic check and not a substitute for proper sandboxing.
        """
        blacklisted = [
            "os.", "sys.", "subprocess", "eval(", "exec(", "open(", 
            "shutil", "importlib", "socket", "requests", "urllib",
            "builtins", "__import__", "pickle", "marshal"
        ]
        
        # Check for blacklisted keywords
        for word in blacklisted:
            if word in code:
                return False, f"Use of '{word}' is restricted in this environment."
        
        return True, ""

    def _wrap_code(self, code: str) -> str:
        """
        Wraps user code with an educational preamble of stub variables
        so partial code snippets from lessons don't crash with NameError.
        """
        # Educational preamble — stub variables/functions for lesson snippets
        preamble = r'''
import sys
import io
import types
import numpy as np
import pandas as pd
import warnings
warnings.filterwarnings("ignore")

# ── Stub DataFrame (used as fall-through for file reads) ──────────────────
_stub_df = pd.DataFrame({
    "age":    [25, 32, 45, 28, 35],
    "income": [50000, 75000, 80000, 60000, 90000],
    "score":  [0.80, 0.90, 0.70, 0.85, 0.92],
    "label":  [0, 1, 1, 0, 1],
})

# ── Monkey-patch pandas file readers to never throw FileNotFoundError ──────
_original_read_csv     = pd.read_csv
_original_read_json    = pd.read_json
_original_read_parquet = pd.read_parquet
_original_read_excel   = pd.read_excel

def _safe_read_csv(path_or_buf, *args, **kwargs):
    try:
        return _original_read_csv(path_or_buf, *args, **kwargs)
    except Exception:
        print("[stub] pd.read_csv('" + str(path_or_buf) + "') -> using sample DataFrame")
        return _stub_df.copy()

def _safe_read_json(path_or_buf, *args, **kwargs):
    try:
        return _original_read_json(path_or_buf, *args, **kwargs)
    except Exception:
        print("[stub] pd.read_json -> using sample DataFrame")
        return _stub_df.copy()

def _safe_read_parquet(path_or_buf, *args, **kwargs):
    try:
        return _original_read_parquet(path_or_buf, *args, **kwargs)
    except Exception:
        print("[stub] pd.read_parquet -> using sample DataFrame")
        return _stub_df.copy()

def _safe_read_excel(path_or_buf, *args, **kwargs):
    try:
        return _original_read_excel(path_or_buf, *args, **kwargs)
    except Exception:
        print("[stub] pd.read_excel -> using sample DataFrame")
        return _stub_df.copy()

pd.read_csv     = _safe_read_csv
pd.read_json    = _safe_read_json
pd.read_parquet = _safe_read_parquet
pd.read_excel   = _safe_read_excel

# ── Stub modules for common lesson imports ─────────────────────────────────
_preprocessing = types.ModuleType("preprocessing")
def _stub_clean_data(df): return df
def _stub_split_data(df, test_size=0.2):
    n = int(len(df) * (1 - test_size))
    return df.iloc[:n], df.iloc[n:]
def _stub_normalize(arr): return arr / np.max(arr) if np.max(arr) != 0 else arr
_preprocessing.clean_data  = _stub_clean_data
_preprocessing.split_data  = _stub_split_data
_preprocessing.normalize   = _stub_normalize
sys.modules["preprocessing"] = _preprocessing

class _StubModel:
    def __init__(self, *a, **kw): pass
    def fit(self, X, y): print("Model trained."); return self
    def predict(self, X): return np.zeros(len(X), dtype=int)
    def score(self, X, y): return 0.87

def _stub_train_classifier(X, y, **kw):
    print("Classifier trained."); return _StubModel()
def _stub_train_regressor(X, y, **kw):
    print("Regressor trained."); return _StubModel()

_models = types.ModuleType("models")
_models.LinearModel        = _StubModel
_models.Classifier         = _StubModel
_models.Regressor          = _StubModel
_models.train_classifier   = _stub_train_classifier
_models.train_regressor    = _stub_train_regressor
sys.modules["models"] = _models

_metrics = types.ModuleType("metrics")
def _stub_accuracy(y_true, y_pred): return 0.87
def _stub_rmse(y_true, y_pred): return 0.12
_metrics.accuracy = _stub_accuracy
_metrics.rmse     = _stub_rmse
sys.modules["metrics"] = _metrics

# ── Common stub variables ──────────────────────────────────────────────────
np.random.seed(42)
n_samples  = 100
total      = 5000
x          = 3.14          # scalar x
y          = np.array([0, 1, 1, 0, 1, 0, 1, 0, 0, 1])  # array y (has .shape)
accuracy   = 0.87
loss       = 0.35
threshold  = 0.73
s          = 0.85
prediction_score = 0.85
label      = 0
status     = "unknown"
age        = 25
values     = [1, 2, 3, 4, 5]
raw_data   = np.array([1.0, 2.0, 3.0, 4.0, 5.0])
data       = [{"name": "Alice", "scores": [80, 90]}, {"name": "Bob", "scores": [70, 85]}]
dataset    = [
    {"age": 25, "income": 50000},
    {"age": 32, "income": 75000},
    {"age": None, "income": 80000},
]
df         = _stub_df.copy()
features   = np.random.randn(10, 4)
target     = np.array([0, 1, 1, 0, 1, 0, 1, 0, 0, 1])
X          = np.random.randn(10, 4)   # shape (10,4) matches y shape (10,)
user_input = "42"
transformed = []
processed   = []
a           = [1, 2, 3]
skip_list   = []
results     = []

# ── Common stub functions ──────────────────────────────────────────────────
def load_data():    return _stub_df.copy()
def clean(d):       return d
def prepare(d):
    _X = d.select_dtypes(include=[np.number]).fillna(0).values
    _y = np.zeros(len(d), dtype=int)
    return _X, _y
def train(f, t):    return _StubModel()
def evaluate(m, f, t): print(f"Accuracy: {accuracy}")
def process(d):     return d
def normalize(v):
    v = np.array(v, dtype=float)
    return v / np.max(v) if np.max(v) != 0 else v
def scale(v, factor=1.0): return np.array(v) * factor
def update_model(): pass
def compute_loss(): return max(loss - 0.01, 0)
def clean_data(d):  return d
def split_data(d, test_size=0.2): return d, d
def train_classifier(X, y, **kw): return _StubModel()
def train_regressor(X, y, **kw):  return _StubModel()

THRESHOLD = 0.73
SEED = 42
# ──────────────────────────────────────────────────────────────────────────
'''


        has_matplotlib = "matplotlib" in code or "plt" in code
        if has_matplotlib:
            plt_header = "import matplotlib\nmatplotlib.use('Agg')\nimport matplotlib.pyplot as plt\nimport base64\nfrom io import BytesIO\n"
            plt_footer = "\nif plt.get_fignums():\n    buf = BytesIO()\n    plt.savefig(buf, format='png', bbox_inches='tight')\n    plt.close()\n    print(f'\\n---IMAGE_DATA---{base64.b64encode(buf.getvalue()).decode()}---END_IMAGE_DATA---')\n"
            return plt_header + preamble + code + plt_footer

        return preamble + code

code_runner = CodeRunner()
