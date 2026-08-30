import json
import hashlib
import os
import sys

L6_LIBRARY_FILE = '/Users/user1/wenu-frontend/ops/factory/element-library/holocore-rgx-contracts.json'
RECIPES_FILE = '/Users/user1/wenu-frontend/src/lib/kodex/grammar/kdx_scene_recipes.json'
GRID_FILE = '/Users/user1/wenu-frontend/src/lib/kodex/grammar/kdx_grid_system.json'

class DeterministicPlateCompiler:
    def __init__(self):
        with open(L6_LIBRARY_FILE, 'r', encoding='utf8') as f:
            self.l6_library = json.load(f).get('elements', [])
            
        with open(RECIPES_FILE, 'r', encoding='utf8') as f:
            self.recipes = json.load(f)
            
        with open(GRID_FILE, 'r', encoding='utf8') as f:
            self.grids = json.load(f)
            
        self.l6_map = {elem['element_id']: elem for elem in self.l6_library}
        self.recipe_map = {r['id']: r for r in self.recipes}

    def compile_plate(self, spec_id, recipe_id="KDX_RECIPE_01", plate_type="OBSERVE"):
        recipe = self.recipe_map.get(recipe_id)
        if not recipe:
            raise ValueError(f"Unknown recipe ID: {recipe_id}")
            
        # Select slot bindings deterministically based on plate_type and recipe
        if plate_type == "THRESHOLD":
            hero_elem = self.l6_map["holocore-threshold-portal"]
        elif plate_type == "OBSERVE":
            hero_elem = self.l6_map["holocore-observe-v2"]
        elif plate_type == "MUSEO":
            hero_elem = self.l6_map["holocore-museo"]
        else:
            hero_elem = self.l6_map["holocore-artifact"]
            
        field_elem = self.l6_map["holocore-field"]
        crt_elem = self.l6_map["holocore-crt-layer"]
        eje_elem = self.l6_map["holocore-eje-axis"]
        ascii_elem = self.l6_map["holocore-ascii"]

        slots = [
            {
                "slot_id": "SLOT_01_HERO_VIEWPORT",
                "slot_role": "hero-viewport",
                "assigned_element_id": hero_elem["element_id"],
                "family": hero_elem["family"],
                "version": hero_elem["version"],
                "fallback": hero_elem["fallback"],
                "accessibility_contract": hero_elem["accessibility_contract"]
            },
            {
                "slot_id": "SLOT_02_BACKGROUND_FIELD",
                "slot_role": "background-canvas-slot",
                "assigned_element_id": field_elem["element_id"],
                "family": field_elem["family"],
                "version": field_elem["version"],
                "fallback": field_elem["fallback"],
                "accessibility_contract": field_elem["accessibility_contract"]
            },
            {
                "slot_id": "SLOT_03_POST_PROCESSING",
                "slot_role": "post-processing-overlay",
                "assigned_element_id": crt_elem["element_id"],
                "family": crt_elem["family"],
                "version": crt_elem["version"],
                "fallback": crt_elem["fallback"],
                "accessibility_contract": crt_elem["accessibility_contract"]
            },
            {
                "slot_id": "SLOT_04_SPINAL_AXIS",
                "slot_role": "vertical-axis-rail",
                "assigned_element_id": eje_elem["element_id"],
                "family": eje_elem["family"],
                "version": eje_elem["version"],
                "fallback": eje_elem["fallback"],
                "accessibility_contract": eje_elem["accessibility_contract"]
            },
            {
                "slot_id": "SLOT_05_EMBLEM_HEADER",
                "slot_role": "emblem-slot",
                "assigned_element_id": ascii_elem["element_id"],
                "family": ascii_elem["family"],
                "version": ascii_elem["version"],
                "fallback": ascii_elem["fallback"],
                "accessibility_contract": ascii_elem["accessibility_contract"]
            }
        ]

        compiled_manifest = {
            "assembly_version": "0.1.0",
            "layer": "L7",
            "layer_name": "Recipe Engine / Deterministic Factory",
            "spec_id": spec_id,
            "plate_type": plate_type,
            "recipe_id": recipe_id,
            "grid_id": recipe["grid_id"],
            "density": recipe["density"],
            "slots": slots,
            "motion_ids": recipe["motion_ids"],
            "provenance_signature": f"KODEX-L7-DETERMINISTIC-ASSEMBLY:{spec_id}:{recipe_id}"
        }

        # Deterministic checksum computation
        manifest_json_str = json.dumps(compiled_manifest, sort_keys=True)
        compiled_checksum = hashlib.sha256(manifest_json_str.encode('utf8')).hexdigest()
        compiled_manifest["deterministic_checksum"] = compiled_checksum

        return compiled_manifest

def run_compiler_demo():
    compiler = DeterministicPlateCompiler()
    spec_id = "spec-02a52eb7-9856"
    
    manifest_obs = compiler.compile_plate(spec_id, "KDX_RECIPE_01", "OBSERVE")
    manifest_thr = compiler.compile_plate(spec_id, "KDX_RECIPE_02", "THRESHOLD")
    
    print("\n=======================================================")
    print("DETERMINISTIC COMPILER OUTPUT: L7 RECIPE ENGINE")
    print("=======================================================")
    print(f"Specimen ID: {spec_id}")
    print(f"Compiled OBSERVE Manifest Checksum: {manifest_obs['deterministic_checksum']}")
    print(f"Compiled THRESHOLD Manifest Checksum: {manifest_thr['deterministic_checksum']}")
    print(f"Slots Bound: {len(manifest_obs['slots'])} slots")
    for slot in manifest_obs['slots']:
        print(f"  - [{slot['slot_id']}] -> Element `{slot['assigned_element_id']}` ({slot['family']})")
        
    out_dir = '/Users/user1/wenu-frontend/ops/factory/recipe-engine'
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'sample_compiled_manifest.json')
    with open(out_path, 'w', encoding='utf8') as f:
        json.dump(manifest_obs, f, indent=2)
    print(f"\nSample compiled manifest written to: {out_path}")

if __name__ == '__main__':
    run_compiler_demo()
