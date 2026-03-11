import subprocess
import sys
import tempfile
import os
import ast as _ast
import builtins as _builtins
from typing import Dict, Any, Tuple


class CodeRunner:
    def run_python(self, code: str) -> Dict[str, Any]:
        """
        Runs Python code locally and returns stdout, stderr, and optional image.

        Security note: The AST-based filter below is significantly more robust
        than the original string-scan approach, but true sandboxing requires
        running user code in an isolated container (Docker, Piston, Judge0, etc.).
        This implementation is appropriate for a trusted dev/educational environment;
        for public-facing production use, replace subprocess execution with a
        container-per-request approach.
        """
        is_safe, error_msg = self._is_safe(code)
        if not is_safe:
            return {
                "stdout": "",
                "stderr": f"Security Error: {error_msg}",
                "exit_code": -1
            }

        repl_code = self._add_repl_output(code)
        wrapped_code = self._wrap_code(repl_code)

        with tempfile.NamedTemporaryFile(suffix=".py", delete=False) as f:
            f.write(wrapped_code.encode("utf-8"))
            temp_file_path = f.name

        try:
            result = subprocess.run(
                [sys.executable, temp_file_path],
                capture_output=True,
                text=True,
                timeout=10
            )

            stdout = result.stdout
            image_base64 = None

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
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)

    def _is_safe(self, code: str) -> Tuple[bool, str]:
        """
        FIX C-1: AST-based security check replacing the naive string-scan approach.

        Walks the parsed AST to detect:
        - Calls to forbidden builtins (eval, exec, compile, __import__)
        - Attribute access on forbidden modules (os, sys, subprocess, etc.)
        - Use of dunder attributes that enable sandbox escapes (__class__, __bases__, etc.)
        - Import of forbidden modules

        This is substantially harder to bypass than substring matching, but still
        not a substitute for a proper sandboxed execution environment.
        """
        try:
            tree = _ast.parse(code)
        except SyntaxError as e:
            # Let the runner surface the real syntax error to the user
            return True, ""

        FORBIDDEN_CALLS = {
            "eval", "exec", "compile", "__import__", "breakpoint",
        }
        FORBIDDEN_MODULES = {
            "os", "sys", "subprocess", "shutil", "socket", "requests",
            "urllib", "http", "ftplib", "smtplib", "importlib", "builtins",
            "pickle", "marshal", "ctypes", "cffi", "multiprocessing",
            "threading", "signal", "resource", "pty", "tty", "termios",
            "readline", "pdb", "code", "codeop",
        }
        FORBIDDEN_DUNDERS = {
            "__class__", "__bases__", "__subclasses__", "__globals__",
            "__builtins__", "__code__", "__closure__", "__reduce__",
            "__reduce_ex__", "__getattribute__",
        }

        for node in _ast.walk(tree):
            # Forbidden function calls: eval(...), exec(...), etc.
            if isinstance(node, _ast.Call):
                if isinstance(node.func, _ast.Name) and node.func.id in FORBIDDEN_CALLS:
                    return False, f"Use of '{node.func.id}()' is not allowed."
                # getattr(obj, 'dangerous') pattern
                if isinstance(node.func, _ast.Name) and node.func.id == "getattr":
                    if node.args and isinstance(node.args[-1], _ast.Constant):
                        attr = node.args[-1].value
                        if isinstance(attr, str) and attr in FORBIDDEN_DUNDERS:
                            return False, f"getattr access to '{attr}' is not allowed."

            # Forbidden imports: import os, import subprocess, etc.
            if isinstance(node, (_ast.Import, _ast.ImportFrom)):
                if isinstance(node, _ast.Import):
                    names = [alias.name.split(".")[0] for alias in node.names]
                else:
                    names = [node.module.split(".")[0]] if node.module else []
                for name in names:
                    if name in FORBIDDEN_MODULES:
                        return False, f"Import of '{name}' is not allowed."

            # Forbidden attribute access: os.system, sys.exit, etc.
            if isinstance(node, _ast.Attribute):
                if node.attr in FORBIDDEN_DUNDERS:
                    return False, f"Access to '{node.attr}' is not allowed."
                if isinstance(node.value, _ast.Name) and node.value.id in FORBIDDEN_MODULES:
                    return False, f"Access to '{node.value.id}.{node.attr}' is not allowed."

        return True, ""

    def _add_repl_output(self, code: str) -> str:
        """
        Enhances code to produce output like a Jupyter/REPL cell.

        FIX M-2: Comment stripping is now done via AST tokenization (using the
        `tokenize` module) rather than a regex, so comments inside strings are
        never touched and multi-line expressions are handled correctly.
        """
        import tokenize
        import io as _io

        stripped = code.strip()
        if not stripped:
            return code

        try:
            tree = _ast.parse(stripped)
        except SyntaxError:
            return code

        if not tree.body:
            return code

        last_stmt = tree.body[-1]

        # Case 1: Last line is a bare expression → auto-print its repr
        if isinstance(last_stmt, _ast.Expr):
            is_print_call = (
                isinstance(last_stmt.value, _ast.Call) and
                isinstance(last_stmt.value.func, _ast.Name) and
                last_stmt.value.func.id == "print"
            )
            if is_print_call:
                return code

            lines = stripped.splitlines()
            last_line_no = last_stmt.lineno - 1  # 0-indexed

            # FIX M-2: Strip trailing comments from the expression source using
            # the tokenizer, which correctly handles strings containing '#'.
            expr_src = "\n".join(lines[last_line_no:])
            try:
                tokens = list(tokenize.generate_tokens(_io.StringIO(expr_src).readline))
                # Rebuild expression without COMMENT tokens
                safe_src = tokenize.untokenize(
                    t for t in tokens if t.type != tokenize.COMMENT
                ).strip()
            except tokenize.TokenError:
                # Fallback: use the raw source if tokenizing fails
                safe_src = expr_src.strip()

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

        # Case 2: Ends with assignment/loop — dump newly defined variables
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

        skip_names = {
            "THRESHOLD", "SEED", "np", "pd", "sys", "io", "types",
            "warnings", "n_samples", "total", "accuracy", "loss",
            "threshold", "s", "label", "status", "age", "values", "raw_data",
            "data", "dataset", "df", "features", "target", "X", "user_input",
            "transformed", "processed", "a", "skip_list", "results", "x", "y",
            "prediction_score",
        }

        display_names = []
        seen: set = set()
        for n in user_names:
            if n not in skip_names and not n.startswith("_") and n not in seen:
                display_names.append(n)
                seen.add(n)

        if not display_names:
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

        dump_lines = [""]
        for name in display_names:
            dump_lines.append(
                f"try:\n"
                f"    print('{name} =', repr({name}))\n"
                f"except Exception:\n"
                f"    pass"
            )
        return stripped + "\n" + "\n".join(dump_lines) + "\n"

    def _wrap_code(self, code: str) -> str:
        """
        Wraps user code with an educational preamble of stub variables.

        FIX M-1: The preamble no longer imports `sys` or `io` at the top level
        because the security filter now correctly blocks `sys.*` attribute access.
        The preamble's internal use of sys/io is kept for compatibility with
        lesson snippets, but those references are prefixed with underscores so
        they don't collide with the filter's module-name check.
        """
        preamble = r'''
import numpy as np
import pandas as pd
import warnings
import types as _types
warnings.filterwarnings("ignore")

# ── Keep sys/io available internally under aliases ─────────────────────────
import sys as _sys
import io as _io

# ── Stub DataFrame ─────────────────────────────────────────────────────────
_stub_df = pd.DataFrame({
    "age":    [25, 32, 45, 28, 35],
    "income": [50000, 75000, 80000, 60000, 90000],
    "score":  [0.80, 0.90, 0.70, 0.85, 0.92],
    "label":  [0, 1, 1, 0, 1],
})

# ── Monkey-patch pandas file readers ──────────────────────────────────────
_orig_read_csv     = pd.read_csv
_orig_read_json    = pd.read_json
_orig_read_parquet = pd.read_parquet
_orig_read_excel   = pd.read_excel

def _safe_read_csv(p, *a, **kw):
    try: return _orig_read_csv(p, *a, **kw)
    except Exception: print("[stub] pd.read_csv -> using sample DataFrame"); return _stub_df.copy()

def _safe_read_json(p, *a, **kw):
    try: return _orig_read_json(p, *a, **kw)
    except Exception: print("[stub] pd.read_json -> using sample DataFrame"); return _stub_df.copy()

def _safe_read_parquet(p, *a, **kw):
    try: return _orig_read_parquet(p, *a, **kw)
    except Exception: print("[stub] pd.read_parquet -> using sample DataFrame"); return _stub_df.copy()

def _safe_read_excel(p, *a, **kw):
    try: return _orig_read_excel(p, *a, **kw)
    except Exception: print("[stub] pd.read_excel -> using sample DataFrame"); return _stub_df.copy()

pd.read_csv     = _safe_read_csv
pd.read_json    = _safe_read_json
pd.read_parquet = _safe_read_parquet
pd.read_excel   = _safe_read_excel

# ── Stub modules ────────────────────────────────────────────────────────────
_preprocessing = _types.ModuleType("preprocessing")
def _stub_clean_data(df): return df
def _stub_split_data(df, test_size=0.2):
    n = int(len(df) * (1 - test_size)); return df.iloc[:n], df.iloc[n:]
def _stub_normalize(arr): return arr / np.max(arr) if np.max(arr) != 0 else arr
_preprocessing.clean_data = _stub_clean_data
_preprocessing.split_data = _stub_split_data
_preprocessing.normalize  = _stub_normalize
_sys.modules["preprocessing"] = _preprocessing

class _StubModel:
    def __init__(self, *a, **kw): pass
    def fit(self, X, y): print("Model trained."); return self
    def predict(self, X): return np.zeros(len(X), dtype=int)
    def score(self, X, y): return 0.87

_models = _types.ModuleType("models")
_models.LinearModel = _models.Classifier = _models.Regressor = _StubModel
_models.train_classifier = lambda X, y, **kw: (print("Classifier trained."), _StubModel())[1]
_models.train_regressor  = lambda X, y, **kw: (print("Regressor trained."),  _StubModel())[1]
_sys.modules["models"] = _models

_metrics = _types.ModuleType("metrics")
_metrics.accuracy = lambda yt, yp: 0.87
_metrics.rmse     = lambda yt, yp: 0.12
_sys.modules["metrics"] = _metrics

# ── Common stub variables ──────────────────────────────────────────────────
np.random.seed(42)
n_samples = 100; total = 5000; x = 3.14
y = np.array([0, 1, 1, 0, 1, 0, 1, 0, 0, 1])
accuracy = 0.87; loss = 0.35; threshold = 0.73; s = 0.85
prediction_score = 0.85; label = 0; status = "unknown"; age = 25
values = [1, 2, 3, 4, 5]
raw_data = np.array([1.0, 2.0, 3.0, 4.0, 5.0])
data = [{"name": "Alice", "scores": [80, 90]}, {"name": "Bob", "scores": [70, 85]}]
dataset = [{"age": 25, "income": 50000}, {"age": 32, "income": 75000}, {"age": None, "income": 80000}]
df = _stub_df.copy()
features = np.random.randn(10, 4)
target = np.array([0, 1, 1, 0, 1, 0, 1, 0, 0, 1])
X = np.random.randn(10, 4)
user_input = "42"; transformed = []; processed = []; a = [1, 2, 3]; skip_list = []; results = []

def load_data():    return _stub_df.copy()
def clean(d):       return d
def prepare(d):
    _X = d.select_dtypes(include=[np.number]).fillna(0).values
    return _X, np.zeros(len(d), dtype=int)
def train(f, t):    return _StubModel()
def evaluate(m, f, t): print(f"Accuracy: {accuracy}")
def process(d):     return d
def normalize(v):
    v = np.array(v, dtype=float); return v / np.max(v) if np.max(v) != 0 else v
def scale(v, factor=1.0): return np.array(v) * factor
def update_model(): pass
def compute_loss(): return max(loss - 0.01, 0)
def clean_data(d):  return d
def split_data(d, test_size=0.2): return d, d
def train_classifier(X, y, **kw): return _StubModel()
def train_regressor(X, y, **kw):  return _StubModel()

THRESHOLD = 0.73; SEED = 42
# ──────────────────────────────────────────────────────────────────────────
'''

        has_matplotlib = "matplotlib" in code or "plt" in code
        if has_matplotlib:
            plt_header = "import matplotlib\nmatplotlib.use('Agg')\nimport matplotlib.pyplot as plt\nimport base64\nfrom io import BytesIO\n"
            plt_footer = "\nif plt.get_fignums():\n    buf = BytesIO()\n    plt.savefig(buf, format='png', bbox_inches='tight')\n    plt.close()\n    print(f'\\n---IMAGE_DATA---{base64.b64encode(buf.getvalue()).decode()}---END_IMAGE_DATA---')\n"
            return plt_header + preamble + code + plt_footer

        return preamble + code


code_runner = CodeRunner()
