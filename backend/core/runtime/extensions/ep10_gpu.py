import torch
import subprocess

def check_gpu_availability():
    capabilities = {"available": False, "device_count": 0, "device_names": [], "driver_version": None}
    try:
        if torch.cuda.is_available():
            capabilities["available"] = True
            capabilities["device_count"] = torch.cuda.device_count()
            capabilities["device_names"] = [torch.cuda.get_device_name(i) for i in range(capabilities["device_count"])]
    except: pass
    if not capabilities["available"]:
        try:
            result = subprocess.run(['nvidia-smi', '--query-gpu=driver_version', '--format=csv,noheader'], capture_output=True, text=True)
            if result.returncode == 0:
                capabilities["available"] = True
                capabilities["driver_version"] = result.stdout.strip()
        except: pass
    return capabilities

def is_hardware_compatible(lab_metadata):
    if lab_metadata.get("gpu_required", False):
        gpu_info = check_gpu_availability()
        if not gpu_info["available"]: return False, "GPU required but not found."
    return True, "Compatible"
