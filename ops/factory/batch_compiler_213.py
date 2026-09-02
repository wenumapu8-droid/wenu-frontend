import csv
import os
import sys
import json
import time

FACTORY_DIR = '/Users/user1/wenu-frontend/ops/factory'
sys.path.insert(0, os.path.join(FACTORY_DIR, 'recipe-engine'))
sys.path.insert(0, os.path.join(FACTORY_DIR, 'assembler'))
sys.path.insert(0, os.path.join(FACTORY_DIR, 'qa'))
sys.path.insert(0, os.path.join(FACTORY_DIR, 'dispatcher'))

from compile_lamina_recipe import DeterministicPlateCompiler
from plate_assembler import assemble_astro_plate

TRIAGE_CSV = '/Users/user1/wenu-frontend/ops/triage/TRIAGE-visual-clasificacion.csv'
BUILD_OUT_DIR = '/Users/user1/wenu-frontend/ops/factory/build-out'
MANIFESTS_DIR = os.path.join(BUILD_OUT_DIR, 'manifests')
COMPONENTS_DIR = os.path.join(BUILD_OUT_DIR, 'components')

RECIPES = [
    "KDX_RECIPE_01", "KDX_RECIPE_02", "KDX_RECIPE_03", "KDX_RECIPE_04",
    "KDX_RECIPE_05", "KDX_RECIPE_06", "KDX_RECIPE_07", "KDX_RECIPE_08",
    "KDX_RECIPE_09", "KDX_RECIPE_10"
]

PLATE_TYPES = ["OBSERVE", "THRESHOLD", "MUSEO"]

def run_batch_compilation_213():
    print("=======================================================")
    print("BATCH COMPILER 213: MASS ASSEMBLY OS COMPILATION")
    print("=======================================================")
    
    if not os.path.exists(TRIAGE_CSV):
        print(f"ERROR: Triage CSV not found at {TRIAGE_CSV}")
        sys.exit(1)
        
    with open(TRIAGE_CSV, 'r', encoding='utf8') as f:
        rows = list(csv.DictReader(f))
        
    art_items = [r for r in rows if r['categoria'] == 'OCIN_ART']
    total_art = len(art_items)
    
    print(f"Loaded {len(rows)} classified items from triage.")
    print(f"Filtering for OCIN_ART candidates: {total_art} items found.\n")
    
    os.makedirs(MANIFESTS_DIR, exist_ok=True)
    os.makedirs(COMPONENTS_DIR, exist_ok=True)
    
    compiler = DeterministicPlateCompiler()
    batch_inventory = []
    
    t0 = time.time()
    
    for idx, item in enumerate(art_items, start=1):
        spec_id = item['id']
        
        # Deterministic recipe and plate_type selection based on spec_id hash
        recipe_idx = int(spec_id.replace('spec-', '').replace('-', '')[:4], 16) % len(RECIPES) if spec_id else 0
        recipe_id = RECIPES[recipe_idx]
        
        plate_type = PLATE_TYPES[idx % len(PLATE_TYPES)]
        
        # 1. Compile L7 Manifest
        manifest = compiler.compile_plate(spec_id, recipe_id, plate_type)
        manifest_path = os.path.join(MANIFESTS_DIR, f"{spec_id}.json")
        with open(manifest_path, 'w', encoding='utf8') as mf:
            json.dump(manifest, mf, indent=2)
            
        # 2. Compile L8 Astro Component
        component_path = os.path.join(COMPONENTS_DIR, f"KodexPlate_{spec_id.replace('spec-', '')}.astro")
        code = assemble_astro_plate(manifest_path, component_path)
        
        entry = {
            "index": idx,
            "spec_id": spec_id,
            "recipe_id": recipe_id,
            "plate_type": plate_type,
            "checksum": manifest["deterministic_checksum"],
            "manifest_file": manifest_path,
            "component_file": component_path,
            "code_lines": len(code.splitlines())
        }
        batch_inventory.append(entry)
        
        if idx % 50 == 0 or idx == total_art:
            print(f"  Processed {idx}/{total_art} láminas ({idx/total_art*100:.1f}%)...")

    t1 = time.time()
    elapsed = t1 - t0
    
    master_file = os.path.join(BUILD_OUT_DIR, 'batch_inventory_213.json')
    with open(master_file, 'w', encoding='utf8') as out_f:
        json.dump({
            "assembly_os_version": "0.1.0",
            "total_compiled": len(batch_inventory),
            "compilation_time_seconds": round(elapsed, 2),
            "manifests_directory": MANIFESTS_DIR,
            "components_directory": COMPONENTS_DIR,
            "inventory": batch_inventory
        }, out_f, indent=2)
        
    print("\n=======================================================")
    print(f"🎉 BATCH COMPILATION COMPLETED IN {elapsed:.2f} SECONDS!")
    print(f"Total Compiled Artworks: {len(batch_inventory)}/{total_art}")
    print(f"Master Batch Inventory Written to: {master_file}")
    print("=======================================================")

if __name__ == '__main__':
    run_batch_compilation_213()
