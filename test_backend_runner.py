import requests
import json

url = "http://localhost:8000/runner/run"
payload = {
    "code": "import numpy as np; print(f'Numpy version: {np.__version__}')",
    "language": "python"
}

try:
    response = requests.post(url, json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
