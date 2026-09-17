#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {
  validateWorkOrder,
  validateStationResultAgainstWorkOrder,
} from '../src/lib/kodex/grammar/work-order-contract.js';

function loadJson(file) {
  const full = path.resolve(file);
  if (!fs.existsSync(full)) throw new Error(`Missing JSON file: ${full}`);
  return { full, value: JSON.parse(fs.readFileSync(full, 'utf8')) };
}

function printValidation(label, file, validation) {
  const payload = {
    label,
    file,
    valid: validation.valid,
    errors: [...validation.errors],
  };
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
  if (!validation.valid) process.exitCode = 1;
}

const [mode = '', orderFile = '', resultFile = ''] = process.argv.slice(2);

try {
  if (mode === 'validate-order') {
    if (!orderFile) throw new Error('Usage: kdx-rae-work-order.mjs validate-order <work-order.json>');
    const order = loadJson(orderFile);
    printValidation('WorkOrder', order.full, validateWorkOrder(order.value));
  } else if (mode === 'validate-result') {
    if (!orderFile || !resultFile) throw new Error('Usage: kdx-rae-work-order.mjs validate-result <work-order.json> <station-result.json>');
    const order = loadJson(orderFile);
    const result = loadJson(resultFile);
    printValidation('StationResult', result.full, validateStationResultAgainstWorkOrder(order.value, result.value));
  } else {
    throw new Error('Modes: validate-order | validate-result');
  }
} catch (error) {
  console.error(JSON.stringify({ valid: false, error: String(error?.message || error) }, null, 2));
  process.exitCode = 1;
}
