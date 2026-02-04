import os
import psutil
import threading
import time

class ResourceProfiler:
    def __init__(self, interval=0.5):
        self.interval = interval
        self.peak_memory_mb = 0
        self.cpu_samples = []
        self.is_running = False
        self.pid = os.getpid()
        self.process = psutil.Process(self.pid)

    def _sample(self):
        while self.is_running:
            try:
                mem = self.process.memory_info().rss / (1024 * 1024)
                if mem > self.peak_memory_mb: self.peak_memory_mb = mem
                cpu = self.process.cpu_percent(interval=None)
                self.cpu_samples.append(cpu)
                time.sleep(self.interval)
            except (psutil.NoSuchProcess, psutil.AccessDenied): break

    def start(self):
        self.is_running = True
        self.thread = threading.Thread(target=self._sample, daemon=True)
        self.thread.start()

    def stop(self):
        self.is_running = False
        if hasattr(self, 'thread'): self.thread.join(timeout=1.0)
        avg_cpu = sum(self.cpu_samples) / len(self.cpu_samples) if self.cpu_samples else 0
        return {"peak_memory_mb": round(self.peak_memory_mb, 2), "avg_cpu_percent": round(avg_cpu, 2)}
