// pyodide.worker.ts
import { loadPyodide, PyodideInterface } from "pyodide";

let pyodide: PyodideInterface | null = null;

async function initPyodide() {
  if (pyodide) return pyodide;

  // Use the official Pyodide CDN
  const indexURL = "https://cdn.jsdelivr.net/pyodide/v0.29.3/full/";
  pyodide = await loadPyodide({ indexURL });

  // Load common data science packages
  await pyodide.loadPackage(["numpy", "pandas", "matplotlib", "micropip"]);

  // Setup basic stdout/stderr capturing
  pyodide.setStdout({
    batched: (msg: string) => {
      self.postMessage({ type: "stdout", content: msg });
    },
  });

  pyodide.setStderr({
    batched: (msg: string) => {
      self.postMessage({ type: "stderr", content: msg });
    },
  });

  // Inject Matplotlib helper for SVG/Base64 rendering
  await pyodide.runPythonAsync(`
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import base64
from io import BytesIO

def get_plot():
    if not plt.get_fignums():
        return None
    buf = BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight')
    plt.close()
    return base64.b64encode(buf.getvalue()).decode()
  `);

  self.postMessage({ type: "ready" });
  return pyodide;
}

self.onmessage = async (event) => {
  const { type, code, id } = event.data;

  if (type === "init") {
    try {
      await initPyodide();
    } catch (error) {
      self.postMessage({ type: "error", content: String(error) });
    }
  }

  if (type === "run") {
    if (!pyodide) {
      self.postMessage({ type: "error", content: "Pyodide not initialized", id });
      return;
    }

    try {
      const result = await pyodide.runPythonAsync(code);
      const plot = await pyodide.runPythonAsync("get_plot()");

      self.postMessage({
        type: "success",
        id,
        content: result,
        image: plot
      });
    } catch (error) {
      self.postMessage({ type: "error", content: String(error), id });
    }
  }
};
