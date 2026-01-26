def classify_sluggishness(duration, timeout, threshold=0.8):
    is_sluggish = duration > (timeout * threshold)
    return {"is_sluggish": is_sluggish, "ratio": round(duration / timeout, 2), "status": "SOFT_TIMEOUT" if is_sluggish else "OPTIMAL"}

def update_result_with_timeout_info(result, timeout):
    sluggish_info = classify_sluggishness(result.duration_seconds, timeout)
    result.metadata["v4_sluggishness"] = sluggish_info
    return result
