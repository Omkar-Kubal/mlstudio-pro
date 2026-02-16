import os
from pathlib import Path

base_dir = Path(r"d:\mlstudio-pro\backend\app\services\curriculum_loader.py").resolve().parent.parent.parent / "core" / "content" / "curriculum"
json_dir = base_dir / "foundations" / "json"

print(f"Base Dir: {base_dir}")
print(f"Base Dir Exists: {base_dir.exists()}")
print(f"JSON Dir: {json_dir}")
print(f"JSON Dir Exists: {json_dir.exists()}")

if json_dir.exists():
    print("Files in JSON Dir:")
    for f in json_dir.glob("*.json"):
        print(f" - {f.name}")
else:
    print("JSON Dir does not exist!")
