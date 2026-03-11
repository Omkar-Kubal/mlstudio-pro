# PATCH for backend/core/runtime/engine/runner.py
# Replace the eval() call in execute_notebook() with a safe builtins lookup.
#
# FIND this block (around line 25160 in the original):
#
#     try:
#         exc_class = eval(error_name) if error_name in dir(__builtins__) else Exception
#         exc = exc_class(error_value)
#     except:
#         exc = Exception(error_value)
#
# REPLACE WITH:

import builtins as _builtins

# FIX H-5: Never call eval() on data from notebook outputs.
# Use getattr on the builtins module for a safe, type-checked lookup.
exc_class = getattr(_builtins, error_name, None)
if not (isinstance(exc_class, type) and issubclass(exc_class, BaseException)):
    exc_class = Exception
try:
    exc = exc_class(error_value)
except Exception:
    exc = Exception(error_value)
