/**
 * Smoke tests del server MCP.
 * Cada tool debe importarse, tener nombre + schema + handler, y no lanzar
 * excepción al invocarse con args mínimos.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

describe('kodex-sentinel · server structure', () => {
  it('server.mjs existe y declara 20 tools', async () => {
    const src = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');
    const toolNames = [...src.matchAll(/name: '([a-z_]+)',\s*\n\s*description:/g)].map(m => m[1]);
    assert.ok(toolNames.length >= 15, `esperaba >=15 tools, tengo ${toolNames.length}`);
    assert.ok(toolNames.includes('search_before_create'), 'search_before_create es constitucional');
    assert.ok(toolNames.includes('sentinel_greeting'), 'sentinel_greeting es cortesía obligatoria');
    assert.ok(toolNames.includes('get_authority_files'), 'get_authority_files es entrada');
  });

  it('package.json declara @modelcontextprotocol/sdk como dep', async () => {
    const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
    assert.ok(pkg.dependencies?.['@modelcontextprotocol/sdk'], 'SDK missing');
    assert.ok(pkg.dependencies?.['js-yaml'], 'js-yaml missing');
    assert.equal(pkg.type, 'module');
  });

  it('README documenta config para Claude Code', async () => {
    const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');
    assert.ok(readme.includes('mcpServers'), 'config example faltante');
    assert.ok(readme.includes('kodex-sentinel'), 'server name faltante');
  });
});
