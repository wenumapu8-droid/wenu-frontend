import unittest
import os
import sys
import json

sys.path.insert(0, os.path.dirname(__file__))
from plate_assembler import assemble_astro_plate

class TestL8PlateAssembler(unittest.TestCase):
    def setUp(self):
        self.manifest_path = '/Users/user1/wenu-frontend/ops/factory/recipe-engine/sample_compiled_manifest.json'
        self.out_astro_path = '/Users/user1/wenu-frontend/src/components/kodex/compiled/KodexPlateCompiled.astro'

    def test_assemble_plate_code_generation(self):
        code = assemble_astro_plate(self.manifest_path, self.out_astro_path)
        
        self.assertTrue(os.path.exists(self.out_astro_path))
        self.assertIn("data-assembly-layer=\"L8\"", code)
        self.assertIn("KodexObserveV2Scene", code)
        self.assertIn("KodexField", code)
        self.assertIn("KodexCrtLayer", code)
        self.assertIn("KodexEje", code)
        self.assertIn("KodexAscii", code)
        self.assertIn("data-fallback=", code)

if __name__ == '__main__':
    unittest.main()
