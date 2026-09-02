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
  tipoDeFuente,
  arteFuente,
  guiaVisualDe,
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

  /* 2026-09-01 · matizado. Todas siguen bloqueadas, pero desde que existe el
     eje REFERENCE/SOURCE_ART el motivo puede ser el otro: una referencia se
     rechaza por ser referencia ANTES de mirarle la compuerta. Las dos razones
     son correctas; lo que no puede pasar es que alguna pase. */
  it('las entradas con compuerta de procedencia quedan bloqueadas', () => {
    for (const e of conCompuerta()) {
      const r = puedeMontarse(e.asset, e.wiring_target);
      assert.equal(r.ok, false, `${e.asset} deberia estar bloqueada por ${e.provenance_gate}`);
      assert.match(r.razon, /compuerta de procedencia|REFERENCIA de lenguaje visual/);
    }
  });

  it('una pieza fuente con compuerta se bloquea POR la compuerta', () => {
    const gated = arteFuente().filter(
      (e) => e.provenance_gate && e.provenance_gate.toUpperCase() !== 'NONE',
    );
    for (const e of gated) {
      assert.match(puedeMontarse(e.asset, e.wiring_target).razon, /compuerta de procedencia/);
    }
  });

  /* 2026-09-01 · este test decia otra cosa y estaba mal.
     Tomaba "la primera entrada sin compuerta con destino declarado" y
     esperaba ok:true -- pero esa primera entrada es un MOCKUP. El test
     afirmaba que un mockup se puede montar, que es exactamente el error
     que Ocin senalo. Ahora pide una pieza fuente, que es lo unico que
     de verdad se monta. */
  it('el permiso devuelve el criterio de preservacion, no solo un si', () => {
    const libre = arteFuente().find(
      (e) => (!e.provenance_gate || e.provenance_gate.toUpperCase() === 'NONE') && e.wiring_target,
    );
    assert.ok(libre, 'no hay pieza fuente montable');
    const r = puedeMontarse(libre!.asset, libre!.wiring_target);
    assert.equal(r.ok, true, r.razon);
    assert.match(r.razon, /preservar:/);
  });
});

describe('VISUAL_JOURNEY · referencia no es obra (2026-09-01)', () => {
  it('los 10 collages de Ocin son las unicas piezas fuente', () => {
    const a = arteFuente();
    assert.equal(a.length, 10);
    for (const e of a) assert.equal(e.corpus, 'OCIN_COLLAGE');
  });

  it('el eje reparte las 119 sin dejar ninguna afuera', () => {
    const t = coberturaDelRecorrido().porTipoDeFuente;
    assert.equal(t.SOURCE_ART, 10);
    assert.equal(t.REFERENCE, 102);
    assert.equal(t.ALREADY_WIRED, 7);
    assert.equal(Object.values(t).reduce((a, b) => a + b, 0), 119);
  });

  it('toda pieza fuente esta aprobada para mostrarse; ninguna referencia lo esta', () => {
    for (const e of recorridoVisual()) {
      const esCandidata = /^APPROVED_/.test(e.visual_status);
      if (esCandidata) assert.equal(tipoDeFuente(e), 'SOURCE_ART', `${e.asset} aprobada pero no es SOURCE_ART`);
    }
  });

  it('UN MOCKUP NO SE MONTA COMO ESCENA — el agujero que tenia puedeMontarse', () => {
    const mck = recorridoVisual().find(
      (e) => e.corpus === 'MCK' && e.wiring_target.includes('THRESHOLD_RENDERER'),
    );
    assert.ok(mck, 'no hay mockup apuntando a THRESHOLD_RENDERER');
    const r = puedeMontarse(mck!.asset, 'THRESHOLD_RENDERER');
    assert.equal(r.ok, false, 'un mockup volvio a pasar como si fuera obra');
    assert.match(r.razon, /REFERENCIA de lenguaje visual/);
  });

  it('ningun mockup ni target HIFI pasa contra su propio destino declarado', () => {
    const refs = recorridoVisual().filter((e) => tipoDeFuente(e) === 'REFERENCE' && e.wiring_target);
    assert.ok(refs.length > 90);
    for (const e of refs) {
      assert.equal(puedeMontarse(e.asset, e.wiring_target).ok, false, `${e.asset} paso y no debia`);
    }
  });

  it('la obra real si pasa a su destino', () => {
    const obra = arteFuente()[0];
    const r = puedeMontarse(obra.asset, obra.wiring_target);
    assert.equal(r.ok, true, r.razon);
  });

  it('el rechazo ensena que preservar al construir, no solo dice que no', () => {
    const mck = recorridoVisual().find((e) => e.corpus === 'MCK' && e.wiring_target)!;
    const r = puedeMontarse(mck.asset, mck.wiring_target);
    assert.match(r.razon, /Preservar al construir:/);
  });

  it('guiaVisualDe devuelve la biblioteca de lenguaje de un renderer', () => {
    const g = guiaVisualDe('ARCHIVE_RENDERER');
    assert.ok(g.length > 0);
    for (const e of g) assert.equal(tipoDeFuente(e), 'REFERENCE');
  });
});
