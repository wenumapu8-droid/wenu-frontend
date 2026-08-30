import csv
import json
import os
import sys

TRIAGE_CSV = '/Users/user1/wenu-frontend/ops/triage/TRIAGE-visual-clasificacion.csv'
MANIFEST_JSON = '/Users/user1/wenu-frontend/public/kodex-content/manifest.json'
BATCH_INVENTORY_JSON = '/Users/user1/wenu-frontend/ops/factory/build-out/batch_inventory_213.json'

def sync_triage_to_manifest():
    print("=======================================================")
    print("CONNECTING 213 COMPILED ARTWORKS TO ASTRO RUNTIME MANIFEST")
    print("=======================================================")

    if not os.path.exists(TRIAGE_CSV) or not os.path.exists(MANIFEST_JSON):
        print("ERROR: Required files not found.")
        sys.exit(1)

    with open(TRIAGE_CSV, 'r', encoding='utf8') as f:
        triage_items = list(csv.DictReader(f))

    art_items = [r for r in triage_items if r['categoria'] == 'OCIN_ART']
    print(f"Loaded {len(art_items)} OCIN_ART items from visual triage.")

    with open(BATCH_INVENTORY_JSON, 'r', encoding='utf8') as f:
        batch_inv = json.load(f).get('inventory', [])

    batch_map = {item['spec_id']: item for item in batch_inv}

    with open(MANIFEST_JSON, 'r', encoding='utf8') as f:
        manifest_data = json.load(f)

    existing_volumes = manifest_data.get('volumes', [])
    existing_ids = {v['id'] for v in existing_volumes}

    new_volumes_added = 0
    updated_volumes = 0

    for item in art_items:
        spec_id = item['id']
        folder_name = spec_id.replace('spec-', '')
        cover_asset_path = f"art/{folder_name}/cover.webp"
        
        batch_info = batch_map.get(spec_id, {})
        checksum = batch_info.get('checksum', '0'*64)
        recipe_id = batch_info.get('recipe_id', 'KDX_RECIPE_01')
        plate_type = batch_info.get('plate_type', 'OBSERVE')

        if spec_id in existing_ids:
            # Update existing volume entry
            for v in existing_volumes:
                if v['id'] == spec_id:
                    v['assets'] = [{'src': cover_asset_path, 'aspecto': '1/1'}]
                    v['assembly_os'] = {
                        'layer': 'L8',
                        'recipe_id': recipe_id,
                        'plate_type': plate_type,
                        'deterministic_checksum': checksum,
                        'manifest_file': f"ops/factory/build-out/manifests/{spec_id}.json"
                    }
                    updated_volumes += 1
        else:
            # Insert new volume entry
            new_vol = {
                "id": spec_id,
                "tipo": "artwork",
                "estrato": "macro-geometrias",
                "titulo_es": f"Obra Canónica Ocín · {folder_name[:8].upper()}",
                "titulo_en": f"Canonical Artwork Ocín · {folder_name[:8].upper()}",
                "curaduria_es": item['motivo_curaduria'],
                "curaduria_en": f"Canonical digital ritual artwork by Ocín. Validated visual triage.",
                "escritura": "greek",
                "assets": [{'src': cover_asset_path, 'aspecto': '1/1'}],
                "fecha": "2026-08",
                "registro": "documentado",
                "marco": "documentado",
                "paleta": "marca",
                "categoria": "organic pattern",
                "release_state": "published",
                "assembly_os": {
                    "layer": "L8",
                    "recipe_id": recipe_id,
                    "plate_type": plate_type,
                    "deterministic_checksum": checksum,
                    "manifest_file": f"ops/factory/build-out/manifests/{spec_id}.json"
                }
            }
            existing_volumes.append(new_vol)
            new_volumes_added += 1

    manifest_data['volumes'] = existing_volumes
    manifest_data['total_compiled_artworks'] = len(art_items)

    with open(MANIFEST_JSON, 'w', encoding='utf8') as f:
        json.dump(manifest_data, f, indent=2)

    print("\n=======================================================")
    print("🎉 MANIFEST INTEGRATION COMPLETE!")
    print(f"Total Volumes in Manifest: {len(existing_volumes)}")
    print(f"New Artwork Volumes Inserted: {new_volumes_added}")
    print(f"Existing Volumes Updated with Assembly OS Checksums: {updated_volumes}")
    print("=======================================================")

if __name__ == '__main__':
    sync_triage_to_manifest()
