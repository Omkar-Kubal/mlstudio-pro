#!/usr/bin/env python3
"""
V2 Runtime CLI

Command-line interface for lab execution and validation.
"""

import argparse
import json
import sys
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(
        description="V2 Runtime - Lab Execution and Validation"
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Commands")
    
    # Run command
    run_parser = subparsers.add_parser("run", help="Execute labs")
    run_parser.add_argument(
        "--lab", "-l",
        help="Specific lab name to run (without .ipynb)"
    )
    run_parser.add_argument(
        "--all", "-a",
        action="store_true",
        help="Run all labs"
    )
    run_parser.add_argument(
        "--no-validate",
        action="store_true",
        help="Skip contract validation"
    )
    run_parser.add_argument(
        "--timeout", "-t",
        type=int,
        default=60,
        help="Timeout per cell in seconds (default: 60)"
    )
    
    # Validate command
    validate_parser = subparsers.add_parser("validate", help="Validate labs against contracts")
    validate_parser.add_argument(
        "--lab", "-l",
        help="Specific lab name to validate"
    )
    
    # Generate contracts command
    gen_parser = subparsers.add_parser("generate-contracts", help="Generate output contracts")
    gen_parser.add_argument(
        "--lab", "-l",
        help="Specific lab name"
    )
    gen_parser.add_argument(
        "--all", "-a",
        action="store_true",
        help="Generate for all labs"
    )
    
    # Check seeds command
    seed_parser = subparsers.add_parser("check-seeds", help="Check seed enforcement")
    seed_parser.add_argument(
        "--fix",
        action="store_true",
        help="Inject seeds into notebooks that lack them"
    )
    
    # Report command
    report_parser = subparsers.add_parser("report", help="Show execution reports")
    report_parser.add_argument(
        "--summary",
        action="store_true",
        help="Show summary only"
    )
    
    args = parser.parse_args()
    
    # Set up paths
    base_dir = Path(__file__).parent.parent.parent.parent
    labs_dir = base_dir / "core" / "content" / "labs" / "foundations"
    contracts_dir = base_dir / "core" / "contracts"
    reports_dir = base_dir / "reports"
    
    if args.command == "run":
        from .runner import NotebookRunner
        
        runner = NotebookRunner(
            labs_dir=labs_dir,
            contracts_dir=contracts_dir,
            reports_dir=reports_dir,
            timeout=args.timeout,
        )
        
        if args.lab:
            lab_path = labs_dir / f"{args.lab}.ipynb"
            if not lab_path.exists():
                print(f"Lab not found: {lab_path}")
                sys.exit(1)
            
            result = runner.execute_notebook(lab_path, validate=not args.no_validate)
            print(json.dumps(result.to_dict(), indent=2))
        
        elif args.all:
            results, summary = runner.run_all(
                validate=not args.no_validate,
                save_reports=True,
            )
            print("\n" + "="*50)
            print(f"Total: {summary['total']}")
            print(f"Pass: {summary['pass']}")
            print(f"Soft Fail: {summary['soft_fail']}")
            print(f"Hard Fail: {summary['hard_fail']}")
            print(f"Duration: {summary['total_duration']:.1f}s")
        
        else:
            print("Specify --lab <name> or --all")
            sys.exit(1)
    
    elif args.command == "check-seeds":
        from .seed_enforcer import SeedEnforcer
        
        enforcer = SeedEnforcer()
        notebooks = list(labs_dir.glob("*.ipynb"))
        
        issues = []
        for nb_path in notebooks:
            with open(nb_path, 'r', encoding='utf-8') as f:
                notebook = json.load(f)
            
            has_seeds, problems = enforcer.check_notebook(notebook)
            if not has_seeds:
                issues.append((nb_path.stem, problems))
                
                if args.fix:
                    notebook = enforcer.inject_seed_cell(notebook, force=True)
                    with open(nb_path, 'w', encoding='utf-8') as f:
                        json.dump(notebook, f, indent=1)
                    print(f"Fixed: {nb_path.stem}")
        
        if issues and not args.fix:
            print(f"Found {len(issues)} labs without proper seeds:")
            for name, probs in issues[:10]:
                print(f"  {name}: {', '.join(probs)}")
            if len(issues) > 10:
                print(f"  ... and {len(issues) - 10} more")
        elif not issues:
            print("All labs have proper seed enforcement.")
    
    elif args.command == "report":
        summary_path = reports_dir / "summary.json"
        if summary_path.exists():
            with open(summary_path) as f:
                summary = json.load(f)
            print(json.dumps(summary, indent=2))
        else:
            print("No reports found. Run 'python -m runtime run --all' first.")
    
    elif args.command == "generate-contracts":
        from .contract_generator import generate_contracts
        
        if args.all:
            generate_contracts(labs_dir, contracts_dir)
        elif args.lab:
            lab_path = labs_dir / f"{args.lab}.ipynb"
            generate_contracts(labs_dir, contracts_dir, specific_lab=args.lab)
        else:
            print("Specify --lab <name> or --all")
            sys.exit(1)
    
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
