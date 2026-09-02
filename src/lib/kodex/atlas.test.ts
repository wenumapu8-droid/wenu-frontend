/**
 * Tests del reporte de cobertura del atlas.
 *
 * El atlas es la fuente de verdad de los 40 conceptos KODEX. `coberturaDelAtlas`
 * es el reporte que se muestra en pantalla, asi que tiene que ser HONESTO
 * -- si dice "36 poblados" no puede colar 4 placeholders vacios (017-020).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import atlas from '../../data/kodex-atlas.json' with { type: 'json' };

interface RawNode {
  id: string;
  titulo: string;
  concepto?: string;
  interaccion?: string;
  zonas?: string[];
  escenas?: string[];
  geometria?: string;
  copy?: string;
}

const NODOS: RawNode[] = (atlas as { nodos: RawNode[] }).nodos;

const PLACEHOLDERS_ESPERADOS = [
  'KDX-IMG-017', 'KDX-IMG-018', 'KDX-IMG-019', 'KDX-IMG-020',
];

function estaPoblado(n: RawNode): boolean {
  return Boolean(
    n.concepto ||
    n.interaccion ||
    (n.zonas && n.zonas.length > 0) ||
    (n.escenas && n.escenas.length > 0) ||
    n.geometria ||
    n.copy,
  );
}

describe('Atlas · cobertura honesta', () => {
  it('el JSON declara 36 nodos', () => {
    assert.equal(NODOS.length, 36);
  });

  it('faltan exactamente los 4 nodos 021-024 (no en 07A ni 07B)', () => {
    const ids = new Set(NODOS.map((n) => n.id));
    for (const faltante of ['KDX-IMG-021', 'KDX-IMG-022', 'KDX-IMG-023', 'KDX-IMG-024']) {
      assert.ok(!ids.has(faltante), `${faltante} deberia estar ausente del JSON`);
    }
  });

  it('los 4 placeholders declarados son exactamente 017-020', () => {
    const placeholders = NODOS.filter((n) => !estaPoblado(n)).map((n) => n.id);
    assert.deepEqual(placeholders.sort(), PLACEHOLDERS_ESPERADOS.sort());
  });

  it('todo nodo poblado tiene al menos ZONAS o ESCENAS declaradas', () => {
    const poblados = NODOS.filter(estaPoblado);
    for (const n of poblados) {
      const tieneUbicacion = (n.zonas && n.zonas.length > 0) ||
                             (n.escenas && n.escenas.length > 0);
      assert.ok(
        tieneUbicacion,
        `${n.id} esta poblado pero no declara zonas ni escenas`,
      );
    }
  });

  it('todos los ids siguen el patron KDX-IMG-NNN', () => {
    for (const n of NODOS) {
      assert.match(n.id, /^KDX-IMG-\d{3}$/, `${n.id} rompe el patron canonico`);
    }
  });

  it('ningun titulo vacio (los placeholders al menos tienen titulo)', () => {
    for (const n of NODOS) {
      assert.ok(n.titulo && n.titulo.length > 0, `${n.id} sin titulo`);
    }
  });

  it('placeholders NO tienen escenas asignadas (no inventar)', () => {
    for (const id of PLACEHOLDERS_ESPERADOS) {
      const n = NODOS.find((x) => x.id === id);
      assert.ok(n, `${id} deberia existir`);
      assert.ok(
        !n!.escenas || n!.escenas.length === 0,
        `placeholder ${id} tiene escenas: inferencia prohibida`,
      );
    }
  });
});

describe('Atlas · funciones de consulta', async () => {
  // Import dinamico porque atlas.ts tiene efectos globales de modulo.
  const {
    nodoPorId,
    nodosDeEscena,
    nodosDeZona,
    vecinosDe,
    zonasDelAtlas,
    nodosDelAtlas,
  } = await import('./atlas.ts');

  const CORREDOR = ['THRESHOLD', 'PROLOGUE', 'DESCENT', 'ARCHIVE',
                    'MACHINE', 'COSMOLOGY', 'RETURN'] as const;

  it('nodoPorId encuentra por id canonico', () => {
    const n = nodoPorId('KDX-IMG-001');
    assert.ok(n);
    assert.equal(n!.titulo.includes('Wenu Mapu'), true);
  });

  it('nodoPorId devuelve undefined para ids ausentes', () => {
    assert.equal(nodoPorId('KDX-IMG-999'), undefined);
    assert.equal(nodoPorId('KDX-IMG-021'), undefined); // faltante declarado
  });

  it('nodosDelAtlas devuelve los 36 nodos', () => {
    assert.equal(nodosDelAtlas().length, 36);
  });

  it('cada escena del corredor tiene al menos 1 nodo cableado', () => {
    for (const escena of CORREDOR) {
      const n = nodosDeEscena(escena);
      assert.ok(
        n.length >= 1,
        `escena ${escena} sin nodos cableados: gap del cableado`,
      );
    }
  });

  it('nodosDeEscena es case-insensitive', () => {
    assert.deepEqual(
      nodosDeEscena('PROLOGUE').map((n) => n.id),
      nodosDeEscena('prologue').map((n) => n.id),
    );
  });

  it('nodosDeEscena devuelve solo nodos que declaran esa escena', () => {
    for (const n of nodosDeEscena('COSMOLOGY')) {
      assert.ok(
        n.escenas.includes('COSMOLOGY'),
        `${n.id} devuelto para COSMOLOGY pero su escenas es ${n.escenas.join(',')}`,
      );
    }
  });

  it('vecinosDe excluye al propio nodo', () => {
    const vs = vecinosDe('KDX-IMG-001');
    assert.ok(!vs.find((v) => v.id === 'KDX-IMG-001'));
  });

  it('vecinosDe comparte al menos una zona con el pivote', () => {
    const pivote = nodoPorId('KDX-IMG-001');
    assert.ok(pivote);
    for (const v of vecinosDe('KDX-IMG-001')) {
      const compartida = v.zonas.some((z) => pivote!.zonas.includes(z));
      assert.ok(
        compartida,
        `${v.id} declarado vecino sin compartir zona con KDX-IMG-001`,
      );
    }
  });

  it('vecinosDe devuelve [] para id inexistente', () => {
    assert.deepEqual(vecinosDe('KDX-IMG-999'), []);
  });

  it('nodosDeZona es case-insensitive y filtra correctamente', () => {
    const rets = nodosDeZona('RETORNO');
    const retsLower = nodosDeZona('retorno');
    assert.equal(rets.length, retsLower.length);
    for (const n of rets) {
      assert.ok(
        n.zonas.includes('RETORNO'),
        `${n.id} devuelto para RETORNO sin declararla`,
      );
    }
  });

  it('zonasDelAtlas devuelve las zonas unicas ordenadas', () => {
    const zs = zonasDelAtlas();
    // Todas unicas
    assert.equal(new Set(zs).size, zs.length);
    // Ordenadas
    assert.deepEqual([...zs].sort(), zs);
    // Tiene las zonas del corredor esperadas
    for (const z of ['UMBRAL', 'DESCENSO', 'RETORNO', 'COSMOS']) {
      assert.ok(zs.includes(z), `zona canonica ${z} ausente`);
    }
  });
});
