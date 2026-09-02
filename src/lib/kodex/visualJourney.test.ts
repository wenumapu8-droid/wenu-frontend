/**
 * Tests de VISUAL_JOURNEY · el ruteo autoral que llego el 2026-09-01.
 *
 * Lo que se protege aca no es el codigo: es que la transcripcion no se
 * degrade. La hoja tiene autoria manual de Ocin y es la unica fuente que
 * dice QUE ESTA PROHIBIDO hacer con cada imagen. Si una fila pierde su
 * `do_not_use_as` o su `preserve`, la regla deja de ser exigible y volvemos
 * a "es de KODEX, usala donde sea" -- que es el error que este mapa corrige.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  recorridoVisual,
  tramosDe,
  alrededorDe,
  referenciasBKS,
  conCompuerta,
  puedeMontarse,
  coberturaDelRecorrido,
} from './visualJourney.ts';

describe('VISUAL_JOURNEY · transcripcion fiel del atlas', () => {
  it('tiene las 119 entradas que declaro el autor', () => {
    assert.equal(recorridoVisual().length, 119);
  });

  it('los cinco corpus estan y suman 119', () => {
    const c = coberturaDelRecorrido().porCorpus;
    assert.equal(c.MCK, 89);
    assert.equal(c.HIFI, 10);
    assert.equal(c.OCIN_COLLAGE, 10);
    assert.equal(c['KDX-CAN_FAMILY'], 7);
    assert.equal(c.USER_RUNTIME_CAPTURE, 3);
    assert.equal(Object.values(c).reduce((a, b) => a + b, 0), 119);
  });

  it('cada entrada declara asset, rol y fase: sin eso no es ruteo', () => {
    for (const e of recorridoVisual()) {
      assert.ok(e.asset, `entrada ${e.pos} sin asset`);
      assert.ok(e.role, `entrada ${e.pos} sin rol`);
      assert.ok(e.phase, `entrada ${e.pos} sin fase`);
    }
  });

  it('cada entrada dice que preservar Y que no hacer con ella', () => {
    for (const e of recorridoVisual()) {
      assert.ok(e.preserve, `${e.pos} (${e.asset}) no dice que preservar`);
      assert.ok(e.do_not_use_as, `${e.pos} (${e.asset}) no dice que esta prohibido`);
    }
  });
});

describe('VISUAL_JOURNEY · las tres referencias de no-regresion', () => {
  it('hay 3 capturas de runtime confirmadas por el creador', () => {
    const u = referenciasBKS().filter((e) => e.visual_status === 'USER_BKS_REFERENCE');
    assert.equal(u.length, 3);
    assert.deepEqual(u.map((e) => e.pos).sort(), ['00.BKS', '01.BKS', '01.BKS2']);
  });

  it('las tres apuntan a un renderer y a movil', () => {
    for (const e of referenciasBKS().filter((x) => x.visual_status === 'USER_BKS_REFERENCE')) {
      assert.match(e.wiring_target, /RENDERER/);
      assert.match(e.wiring_target, /MOBILE/);
    }
  });

  it('ninguna BKS se declara mandato de composicion final', () => {
    for (const e of referenciasBKS().filter((x) => x.visual_status === 'USER_BKS_REFERENCE')) {
      assert.match(e.do_not_use_as, /no-regression|Exact final composition/i);
    }
  });
});

describe('VISUAL_JOURNEY · el umbral abre y el tramo entre umbrales existe', () => {
  it('THRESHOLD y PROLOGUE tienen tramos declarados', () => {
    assert.ok(tramosDe('THRESHOLD').length > 0);
    assert.ok(tramosDe('PROLOGUE').length > 0);
  });

  it('hay tramos ENTRE umbrales, no solo umbrales', () => {
    const entre = recorridoVisual().filter((e) => e.from && e.to && e.from !== e.to);
    assert.ok(entre.length > 0, 'el espacio entre los umbrales quedo vacio');
  });

  it('alrededorDe recoge entradas y salidas de un umbral', () => {
    const a = alrededorDe('PROLOGUE');
    assert.ok(a.some((e) => e.to.toUpperCase() === 'PROLOGUE'));
  });
});

describe('VISUAL_JOURNEY · la regla dura contra elegir por CANON_ASSET', () => {
  it('un asset que no esta en el mapa no se monta', () => {
    const r = puedeMontarse('cualquier-cosa-linda.png', 'ARCHIVE_RENDERER');
    assert.equal(r.ok, false);
    assert.match(r.razon, /no esta en VISUAL_JOURNEY/);
  });

  it('un asset no se monta en un destino que no es el suyo', () => {
    const specimen = recorridoVisual().find((e) => e.role === 'SPECIMEN');
    assert.ok(specimen, 'no hay ninguna entrada SPECIMEN');
    const r = puedeMontarse(specimen!.asset, 'THRESHOLD_RENDERER');
    assert.equal(r.ok, false);
  });

  it('las entradas con compuerta de procedencia quedan bloqueadas', () => {
    for (const e of conCompuerta()) {
      const r = puedeMontarse(e.asset, e.wiring_target);
      assert.equal(r.ok, false, `${e.asset} deberia estar bloqueada por ${e.provenance_gate}`);
      assert.match(r.razon, /compuerta de procedencia/);
    }
  });

  it('el permiso devuelve el criterio de preservacion, no solo un si', () => {
    const libre = recorridoVisual().find(
      (e) => (!e.provenance_gate || e.provenance_gate.toUpperCase() === 'NONE') && e.wiring_target,
    );
    const r = puedeMontarse(libre!.asset, libre!.wiring_target);
    assert.equal(r.ok, true);
    assert.match(r.razon, /preservar:/);
  });
});
