import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';

const ROOTS = [
  'src/components/kodex',
  'src/components/KodexChrome.astro',
  'src/lib/kodex',
  'src/pages/kodex',
  'src/kodex/return',
];

const SOURCE_EXTENSIONS = new Set(['.astro', '.js', '.mjs', '.ts', '.tsx', '.jsx']);

const FORBIDDEN = [
  { label: 'camera/microphone capture via getUserMedia', pattern: /\bgetUserMedia\s*\(/g },
  { label: 'camera/microphone device access via navigator.mediaDevices', pattern: /\bnavigator\s*\.\s*mediaDevices\b/g },
  { label: 'microphone recording via MediaRecorder', pattern: /\bMediaRecorder\b/g },
  { label: 'microphone speech capture via SpeechRecognition', pattern: /\b(?:webkit)?SpeechRecognition\b/g },
  { label: 'camera permission request', pattern: /\bname\s*:\s*['"]camera['"]/g },
  { label: 'microphone permission request', pattern: /\bname\s*:\s*['"]microphone['"]/g },
];

async function collect(path) {
  const info = await stat(path);
  if (info.isFile()) return SOURCE_EXTENSIONS.has(extname(path)) ? [path] : [];

  const files = [];
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const child = join(path, entry.name);
    if (entry.isDirectory()) files.push(...await collect(child));
    else if (entry.isFile() && SOURCE_EXTENSIONS.has(extname(entry.name))) files.push(child);
  }
  return files;
}

const files = (await Promise.all(ROOTS.map(collect))).flat().sort();
const violations = [];

for (const file of files) {
  const source = await readFile(file, 'utf8');
  for (const rule of FORBIDDEN) {
    rule.pattern.lastIndex = 0;
    let match;
    while ((match = rule.pattern.exec(source))) {
      const line = source.slice(0, match.index).split('\n').length;
      violations.push(`${file}:${line} — ${rule.label}`);
    }
  }
}

if (violations.length) {
  console.error('KODEX sensor-capture guard failed. KODEX must not require camera or microphone access.');
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log(`KODEX sensor-capture guard passed: ${files.length} runtime source files scanned; no camera/microphone capture or permission APIs found.`);
