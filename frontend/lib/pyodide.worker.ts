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

    // Preamble: inject common stub variables so partial code snippets don't crash
    const PREAMBLE = `
import numpy as np
import pandas as pd
import warnings
warnings.filterwarnings('ignore')

# Common stub variables for educational code snippets
n_samples = 100
total = 5000
x, y = 3.14, 2.71
accuracy = 0.87
loss = 0.35
threshold = 0.73
values = [1, 2, 3, 4, 5]
raw_data = np.array([1, 2, 3, 4, 5])
data = [{"name": "A", "scores": [80, 90]}, {"name": "B", "scores": [70, 85]}]
dataset = [{"age": 25, "income": 50000}, {"age": 32, "income": 75000}, {"age": None, "income": 80000}]
df = pd.DataFrame({"age": [25, 32, None], "income": [50000, 75000, 80000], "score": [0.8, 0.9, 0.7]})
model_input = np.random.randn(10, 4)
features = np.random.randn(10, 4)
target = np.array([0, 1, 1, 0, 1, 0, 1, 0, 0, 1])
user_input = "42"
transformed = []
processed = []
s = 0.85
prediction_score = 0.85
label = 0
status = "unknown"
age = 25
X = np.random.randn(50, 4)
a = [1, 2, 3]

def load_data(): return df
def clean(d): return d
def prepare(d): return d.drop(columns=["income"], errors="ignore").values, np.zeros(len(d))
def train(f, t):
    class M:
        def fit(self, f, t): return self
        def predict(self, f): return [0]*len(f)
    return M().fit(f, t)
def evaluate(m, f, t): print("Accuracy:", 0.87)
def process(d): return d
def normalize(v): return v / max(v) if max(v) != 0 else v
def scale(x, factor=1.0): return x * factor
def update_model(): pass
def compute_loss(): return max(loss - 0.01, 0)

THRESHOLD = 0.73
`;

    try {
      const fullCode = PREAMBLE + "\n" + code;
      const result = await pyodide.runPythonAsync(fullCode);
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
