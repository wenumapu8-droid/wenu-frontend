import unittest
import os
import json

MASTER_INVENTORY = '/Users/user1/wenu-frontend/ops/factory/build-out/batch_inventory_213.json'

class TestBatchCompilation213(unittest.TestCase):
    def setUp(self):
        self.assertTrue(os.path.exists(MASTER_INVENTORY), f"Master inventory found at {MASTER_INVENTORY}")
        with open(MASTER_INVENTORY, 'r', encoding='utf8') as f:
            self.data = json.load(f)

    def test_total_compiled_count(self):
        self.assertEqual(self.data['total_compiled'], 213, "Must compile exactly 213 canonical artworks")
        self.assertEqual(len(self.data['inventory']), 213)

    def test_files_and_checksums_exist(self):
        seen_checksums = set()
        for entry in self.data['inventory']:
            m_file = entry['manifest_file']
            c_file = entry['component_file']
            chk = entry['checksum']

            self.assertTrue(os.path.exists(m_file), f"Manifest file missing: {m_file}")
            self.assertTrue(os.path.exists(c_file), f"Component file missing: {c_file}")
            self.assertTrue(len(chk) == 64, f"SHA-256 checksum invalid length: {chk}")
            seen_checksums.add(chk)

        print(f"✅ Verified 213/213 manifests & components. Unique Checksums: {len(seen_checksums)}")

if __name__ == '__main__':
    unittest.main()
