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
        # Basic security check
        is_safe, error_msg = self._is_safe(code)
        if not is_safe:
            return {
                "stdout": "",
                "stderr": f"Security Error: {error_msg}",
                "exit_code": -1
            }

        # Inject code to handle matplotlib if it's imported
        wrapped_code = self._wrap_code(code)
        
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
        Wraps user code to capture matplotlib plots.
        """
        if "matplotlib" not in code and "plt" not in code:
            return code
            
        header = "import matplotlib\nmatplotlib.use('Agg')\nimport matplotlib.pyplot as plt\nimport base64\nfrom io import BytesIO\n"
        footer = "\nif plt.get_fignums():\n    buf = BytesIO()\n    plt.savefig(buf, format='png', bbox_inches='tight')\n    plt.close()\n    print(f'\\n---IMAGE_DATA---{base64.b64encode(buf.getvalue()).decode()}---END_IMAGE_DATA---')\n"
        return header + code + footer

code_runner = CodeRunner()
