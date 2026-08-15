import json
import os
import sys

CONTRACT_FILE = '/Users/user1/wenu-frontend/ops/factory/element-library/holocore-rgx-contracts.json'

REQUIRED_FIELDS = [
    'element_id',
    'family',
    'version',
    'status',
    'allowed_plate_types',
    'allowed_scene_roles',
    'semantic_role',
    'slot_types',
    'min_max_size',
    'aspect_behavior',
    'responsive_behavior',
    'states',
    'inputs_tokens',
    'motion_cost',
    'fallback',
    'accessibility_contract',
    'provenance_rights',
    'incompatibilities'
]

def validate_contracts():
    if not os.path.exists(CONTRACT_FILE):
        print(f"ERROR: File not found: {CONTRACT_FILE}")
        sys.exit(1)
        
    with open(CONTRACT_FILE, 'r', encoding='utf8') as f:
        data = json.load(f)
        
    elements = data.get('elements', [])
    print(f"Loaded {len(elements)} elements from {CONTRACT_FILE}.")
    
    if len(elements) != 14:
        print(f"FAILED: Expected exactly 14 elements, found {len(elements)}")
        sys.exit(1)
        
    element_ids = set()
    errors = []
    needs_confirmation_fields = []
    
    for idx, elem in enumerate(elements, start=1):
        elem_id = elem.get('element_id', f'unknown-{idx}')
        if elem_id in element_ids:
            errors.append(f"Duplicate element_id: {elem_id}")
        element_ids.add(elem_id)
        
        # 1. Check all 18 required fields
        for field in REQUIRED_FIELDS:
            if field not in elem:
                errors.append(f"[{elem_id}] Missing required field '{field}'")
            elif elem[field] is None:
                errors.append(f"[{elem_id}] Field '{field}' cannot be null")
                
        # 2. Check min_max_size structure
        mms = elem.get('min_max_size')
        if isinstance(mms, dict):
            if 'min' not in mms or 'max' not in mms:
                errors.append(f"[{elem_id}] min_max_size must have 'min' and 'max' string keys")
        else:
            errors.append(f"[{elem_id}] min_max_size must be a dict")
            
        # 3. Check array fields
        for array_field in ['allowed_plate_types', 'allowed_scene_roles', 'slot_types', 'states', 'inputs_tokens', 'incompatibilities']:
            val = elem.get(array_field)
            if not isinstance(val, list):
                errors.append(f"[{elem_id}] Field '{array_field}' must be a list")
                
        # 4. Check for NEEDS_CONFIRMATION annotations
        for k, v in elem.items():
            if v == "NEEDS_CONFIRMATION" or (isinstance(v, list) and "NEEDS_CONFIRMATION" in v):
                needs_confirmation_fields.append((elem_id, k))

    print("\n=======================================================")
    print("SCHEMA VALIDATION RESULTS: L6 ELEMENT LIBRARY CONTRACTS")
    print("=======================================================")
    print(f"Total Elements Checked: {len(elements)}/14")
    print(f"Required Fields Per Element: {len(REQUIRED_FIELDS)}/18")
    
    if needs_confirmation_fields:
        print("\n[VERIFIED GAPS] Fields explicitly marked NEEDS_CONFIRMATION (Hard Rule Compliant):")
        for eid, f in needs_confirmation_fields:
            print(f"  - Element `{eid}` -> Field `{f}`: NEEDS_CONFIRMATION")
    else:
        print("\nAll fields fully verified.")

    if errors:
        print(f"\n❌ VALIDATION FAILED WITH {len(errors)} ERRORS:")
        for err in errors:
            print(f"  - {err}")
        sys.exit(1)
    else:
        print("\n✅ ALL 14 HOLOCORE RGX CONTRACTS STRICTLY VALIDATED (18/18 FIELDS PRESENT).")

if __name__ == '__main__':
    validate_contracts()
