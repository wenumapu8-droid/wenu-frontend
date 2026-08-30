import unittest
import os
import sys
import json

sys.path.insert(0, os.path.dirname(__file__))
from compile_lamina_recipe import DeterministicPlateCompiler

class TestDeterministicCompiler(unittest.TestCase):
    def setUp(self):
        self.compiler = DeterministicPlateCompiler()

    def test_determinism_checksum(self):
        spec_id = "spec-02a52eb7-9856"
        m1 = self.compiler.compile_plate(spec_id, "KDX_RECIPE_01", "OBSERVE")
        m2 = self.compiler.compile_plate(spec_id, "KDX_RECIPE_01", "OBSERVE")
        
        self.assertEqual(m1["deterministic_checksum"], m2["deterministic_checksum"], "Compiler output must be 100% deterministic")

    def test_l6_contract_binding(self):
        spec_id = "spec-2695ce19-9834"
        manifest = self.compiler.compile_plate(spec_id, "KDX_RECIPE_02", "THRESHOLD")
        
        self.assertEqual(len(manifest["slots"]), 5)
        for slot in manifest["slots"]:
            self.assertIn(slot["assigned_element_id"], self.compiler.l6_map)
            self.assertIn("fallback", slot)
            self.assertIn("accessibility_contract", slot)

if __name__ == '__main__':
    unittest.main()
