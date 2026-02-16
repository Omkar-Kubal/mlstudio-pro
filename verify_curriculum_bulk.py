from backend.app.services.curriculum_loader import curriculum_loader
import sys

def verify_all():
    modules = curriculum_loader.list_all_modules()
    print(f"Found {len(modules)} modules in JSON directory.")
    
    passed = 0
    failed = []
    
    for m in sorted(modules):
        try:
            module = curriculum_loader.load_module_by_id(m)
            if module:
                passed += 1
            else:
                failed.append((m, "Returned None (File not found?)"))
        except Exception as e:
            failed.append((m, str(e)))
            
    print(f"Passed: {passed}/{len(modules)}")
    if failed:
        print("Failed Modules:")
        for m, err in failed:
            print(f"- {m}: {err}")
        sys.exit(1)
    else:
        print("All modules loaded successfully!")

if __name__ == "__main__":
    verify_all()
