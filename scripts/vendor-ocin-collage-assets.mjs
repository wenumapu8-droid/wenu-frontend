import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();

const ASSETS = [
  {
    id: 'OCN-TOR-005',
    driveId: '1csEpt4TfisUuax_OVa5gGEfCMdJIxoIK',
    output: 'public/assets/kodex/ocin/originals/OCN-TOR-005.jpg',
    sha256: '79f907e6fe6a64ec1f6f8bff7d7fb7cbf6b2218f74421f97562bc77a47123e3b',
  },
  {
    id: 'OCN-TOR-001',
    driveId: '1zHWSdJ0UoHtLW_Oyj72XQQtCcX-Qi-UY',
    output: 'public/assets/kodex/ocin/originals/OCN-TOR-001.jpg',
    sha256: 'fb6cbb2f89d4846e1fafe08cea16b33d46480d9fb6ebe13d395d900d678791a4',
  },
  {
    id: 'OCN-SQR-001',
    driveId: '1fApkVD7HvwuXmpub6EAJChl9AWEusPqs',
    output: 'public/assets/kodex/ocin/originals/OCN-SQR-001.jpg',
    sha256: '552a23b946106c54d77353e62280e1234dfdf2297ca098ce11d37c0e77a43149',
  },
  {
    id: 'OCN-FRC-002',
    driveId: '1zAeyvWCkNleePJPxXfPmqke8iwjTLSMI',
    output: 'public/assets/kodex/ocin/originals/OCN-FRC-002.jpg',
    sha256: 'ac1153bdd24203a569ebd16f72f80d4fa0f43b8db404b5d3b628e2470d8d5689',
  },
  {
    id: 'OCN-TRI-001',
    driveId: '12j8lSrBZmVMziVVGQoeW6Rhdq9fVBSot',
    output: 'public/assets/kodex/ocin/originals/OCN-TRI-001.jpg',
    sha256: '7df364b4edb7993722b530410723ac3a33d5808cac43bd3295d6788f75e4d087',
  },
  {
    id: 'OCN-MND-GRY-002',
    driveId: '1wG4yYd4dpncRfO25XREUUxuEBtjPPqO8',
    output: 'public/assets/kodex/ocin/originals/OCN-MND-GRY-002.jpg',
    sha256: '53c397f8e9931dc15bf0e6ca1ee6d8c211e775fa84a3f7a3753c8c0477c2b805',
  },
];

function digest(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

async function existingIsValid(output, expected) {
  try {
    const bytes = await readFile(output);
    return digest(bytes) === expected;
  } catch {
    return false;
  }
}

async function downloadDriveFile(driveId) {
  const urls = [
    `https://drive.usercontent.google.com/download?id=${encodeURIComponent(driveId)}&export=download&confirm=t`,
    `https://drive.google.com/uc?export=download&id=${encodeURIComponent(driveId)}&confirm=t`,
  ];

  let lastError;
  for (const url of urls) {
    try {
      const response = await fetch(url, {
        redirect: 'follow',
        headers: { 'User-Agent': 'KODEX-Asset-Vendor/1.0' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const contentType = response.headers.get('content-type') ?? '';
      const bytes = Buffer.from(await response.arrayBuffer());
      if (contentType.includes('text/html')) {
        throw new Error(`Drive returned HTML instead of image bytes (${bytes.length} bytes)`);
      }
      if (bytes.length < 1024) throw new Error(`Unexpectedly small payload (${bytes.length} bytes)`);
      return bytes;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error('Unable to download Drive asset');
}

let wrote = 0;

for (const asset of ASSETS) {
  const output = resolve(ROOT, asset.output);
  if (await existingIsValid(output, asset.sha256)) {
    console.log(`[ocin-vendor] ${asset.id}: already verified`);
    continue;
  }

  const bytes = await downloadDriveFile(asset.driveId);
  const actual = digest(bytes);
  if (actual !== asset.sha256) {
    throw new Error(
      `[ocin-vendor] ${asset.id}: SHA-256 mismatch. expected=${asset.sha256} actual=${actual}. Refusing to publish altered bytes.`,
    );
  }

  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, bytes);
  wrote += 1;
  console.log(`[ocin-vendor] ${asset.id}: verified + wrote ${asset.output} (${bytes.length} bytes)`);
}

console.log(`[ocin-vendor] complete. wrote=${wrote} verified=${ASSETS.length}`);
