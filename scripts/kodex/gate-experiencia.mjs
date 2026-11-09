/**
 * GATE DE EXPERIENCIA · KODEX−∞
 *
 * El canon existe desde hace meses. Los motores existen. Las referencias
 * existen. Lo que faltaba es que el canon pudiera RECHAZAR una escena.
 *
 * Este script es esa ley ejecutable. No opina sobre gusto: verifica que lo
 * que la escena DECLARA ser sea verdad en la pantalla.
 *
 *   node scripts/kodex/gate-experiencia.mjs [--base=http://127.0.0.1:4342] [--escena=PROLOGUE]
 *
 * Salida: 0 si todas las escenas evaluadas pasan · 1 si alguna falla.
 *
 * ── CÓMO UNA ESCENA DECLARA SU CONTRATO ──────────────────────────────────
 *
 * En la raíz de la escena, atributos de datos:
 *
 *   <section data-kdx-contrato="PROLOGUE"
 *            data-kdx-verbo="observar"
 *            data-kdx-organismo=".kdx-ojo"      ← selector del organismo dominante
 *            data-kdx-titulo=".kdx-titulo"      ← opcional: el título cinético
 *            data-kdx-estado="dormant">          ← lo escribe la máquina de estados
 *
 * Y cada lectura numérica en pantalla:
 *
 *   <span data-kdx-readout data-fuente="manifiesto:volumenes.json#count">118</span>
 *
 * Sin declaración no hay evaluación posible, y eso ES la primera falla: una
 * escena que no puede decir qué es, no está terminada.
 *
 * ── LO QUE ESTE GATE NO PUEDE HACER ──────────────────────────────────────
 *
 * No sabe si una escena "se siente KODEX". Detecta las fallas que tienen
 * firma mecánica —póster, escala móvil, dato inventado, plantilla repetida,
 * ausencia de causalidad— y nada más. El juicio autoral sigue siendo del
 * creador, a propósito: automatizarlo sería volver a "build verde = listo"
 * con más pasos.
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const AQUI = dirname(fileURLToPath(import.meta.url));
const CONTRATOS = JSON.parse(readFileSync(join(AQUI, 'contratos-escena.json'), 'utf8'));
const R = CONTRATOS.reglas_globales;

const arg = (n, d) => (process.argv.find(a => a.startsWith(`--${n}=`)) || `=${d}`).split('=').slice(1).join('=');
const BASE = arg('base', process.env.KDX_BASE || 'http://127.0.0.1:4342');
const SOLO = arg('escena', '');

/** Fracción de píxeles que difieren entre dos capturas del mismo tamaño. */
async function delta(a, b) {
  const [x, y] = await Promise.all([
    sharp(a).resize(320, 200, { fit: 'fill' }).greyscale().raw().toBuffer(),
    sharp(b).resize(320, 200, { fit: 'fill' }).greyscale().raw().toBuffer(),
  ]);
  let n = 0;
  for (let i = 0; i < x.length; i++) if (Math.abs(x[i] - y[i]) > 6) n++;
  return n / x.length;
}

/** Firma estructural de una escena: qué bloques la componen y en qué proporción. */
function similitud(a, b) {
  const claves = new Set([...Object.keys(a), ...Object.keys(b)]);
  let comun = 0, total = 0;
  for (const k of claves) {
    comun += Math.min(a[k] || 0, b[k] || 0);
    total += Math.max(a[k] || 0, b[k] || 0);
  }
  return total ? comun / total : 1;
}

const nav = await chromium.launch();
const informe = [];

for (const E of CONTRATOS.escenas) {
  if (SOLO && E.id !== SOLO) continue;

  const fallas = [];
  const notas = [];
  const falla = (codigo, detalle) => fallas.push(`${codigo} — ${detalle}`);

  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  /* 2026-08-28: timeout de captura subido de los 30s por defecto a 60s.
   *
   * POR QUE: dos corridas consecutivas sobre EL MISMO build dieron
   * resultados distintos --
   *   corrida 1: THRESHOLD PASS, MACHINE FAIL (screenshot timeout 30s)
   *   corrida 2: THRESHOLD FAIL, MACHINE PASS, RETURN FAIL
   * Cruzando ambas, las 7 escenas pasaron al menos una vez. Ninguna
   * fallaba por defecto: fallaban por timeout tomando la captura,
   * esperando que carguen las fuentes, bajo carga del Mini.
   *
   * El CI encontro lo mismo por su lado (33/35 PASS, los 2 fallos eran
   * timeout de screenshot) y aplico el mismo remedio.
   *
   * Un gate que da un resultado distinto cada vez no mide: adivina. */
  p.setDefaultTimeout(60000);

  try {
    /* `domcontentloaded` y no `load`: algunas escenas cargan láminas pesadas y
       `load` espera hasta el último byte de imagen. Lo que este gate mide es la
       escena viva, no la barra de progreso del navegador. */
    const res = await p.goto(BASE + E.ruta, { waitUntil: 'domcontentloaded', timeout: 45000 });
    if (!res || res.status() >= 400) {
      falla('RUTA MUERTA', `${E.ruta} → ${res ? res.status() : 'sin respuesta'}`);
      throw new Error('ruta');
    }
    await p.waitForTimeout(2500);   // dejar que el organismo arranque

    // ── 0 · ¿LA ESCENA DICE QUÉ ES? ─────────────────────────────────────
    const decl = await p.evaluate(() => {
      const n = document.querySelector('[data-kdx-contrato]');
      if (!n) return null;
      return {
        escena: n.dataset.kdxContrato,
        verbo: n.dataset.kdxVerbo || '',
        organismo: n.dataset.kdxOrganismo || '',
        titulo: n.dataset.kdxTitulo || '',
        estado: n.dataset.kdxEstado || '',
      };
    });

    /* Una escena sin declarar falla — pero el gate NO se detiene ahí. Detenerse
       lo volvía inútil justo cuando más falta hace: al principio, cuando nada
       está declarado todavía. Lo que no depende del contrato —vida en reposo,
       desborde móvil, escala, datos sin fuente, firma estructural— se mide
       igual, para que haya una línea base contra la cual mejorar. */
    const D = decl ?? { escena: '', verbo: '', organismo: '', titulo: '', estado: '' };

    if (!decl) {
      falla('SIN CONTRATO DECLARADO',
        'ningún nodo lleva data-kdx-contrato. La escena no dice qué es, así que ' +
        'organismo y causalidad no son verificables. Lo demás sí se midió.');
    } else {
      if (D.escena !== E.id) falla('CONTRATO EQUIVOCADO', `declara "${D.escena}", la ruta es ${E.id}`);
      if (!D.verbo) falla('SIN VERBO', 'una escena sin verbo central se vuelve póster (§4)');
      if (!D.organismo) falla('SIN ORGANISMO DECLARADO', 'no dice cuál es su organismo dominante');
    }

    // ── 1 · EL ORGANISMO EXISTE Y DOMINA ────────────────────────────────
    let cajaOrg = null;
    if (D.organismo) {
      cajaOrg = await p.evaluate(sel => {
        const n = document.querySelector(sel);
        if (!n) return null;
        const r = n.getBoundingClientRect();
        const v = getComputedStyle(n);
        return {
          area: (r.width * r.height) / (innerWidth * innerHeight),
          visible: v.display !== 'none' && v.visibility !== 'hidden' && +v.opacity > 0.05,
        };
      }, D.organismo);

      if (!cajaOrg) {
        falla('ORGANISMO AUSENTE', `el selector declarado "${D.organismo}" no resuelve en el DOM`);
      } else if (!cajaOrg.visible) {
        falla('ORGANISMO INVISIBLE', `"${D.organismo}" existe pero no se ve`);
      } else if (cajaOrg.area < R.organismo_dominante_min_area) {
        falla('ORGANISMO NO DOMINANTE',
          `ocupa ${(cajaOrg.area * 100).toFixed(1)}% del viewport (mínimo ${R.organismo_dominante_min_area * 100}%). ` +
          'La interfaz manda sobre la obra.');
      } else {
        notas.push(`organismo ${(cajaOrg.area * 100).toFixed(0)}% del viewport`);
      }
    }

    // ── 2 · EL TEST DEL PNG · ¿un PNG estático reproduce la escena? ──────
    /* TRES MUESTRAS, NO UNA.
     *
     * Con una sola pareja de capturas no se puede distinguir "la escena se
     * mueve" de "la escena se movió justo ahí". Y sobre todo: sin saber cuánto
     * VARÍA su movimiento propio, es imposible decir después si un cambio vino
     * del visitante o del ruido de la escena. Acá se mide el ruido en vez de
     * suponerlo con un multiplicador. */
    const muestras = [];
    let previa = await p.screenshot();
    for (let i = 0; i < 3; i++) {
      await p.waitForTimeout(1300);
      const actual = await p.screenshot();
      muestras.push(await delta(previa, actual));
      previa = actual;
    }
    const dQuieto = muestras.reduce((a, b) => a + b, 0) / muestras.length;
    const ruidoTecho = Math.max(...muestras);

    if (dQuieto < R.png_test_delta_min) {
      falla('PÓSTER',
        `sin tocar nada, la escena cambió ${(dQuieto * 100).toFixed(2)}% en 2.6s ` +
        `(mínimo ${(R.png_test_delta_min * 100).toFixed(1)}%). Un PNG la reproduce entera.`);
    } else {
      notas.push(`vida en reposo ${(dQuieto * 100).toFixed(1)}% (techo de ruido ${(ruidoTecho * 100).toFixed(1)}%)`);
    }

    // ── 3 · CAUSALIDAD · INPUT → ESTADO → CONSECUENCIA VISIBLE ──────────
    const estadoAntes = D.estado;
    const antes = await p.screenshot();

    const centro = D.organismo
      ? await p.evaluate(sel => {
          const n = document.querySelector(sel);
          if (!n) return null;
          const r = n.getBoundingClientRect();
          return [r.x + r.width / 2, r.y + r.height / 2];
        }, D.organismo)
      : null;

    if (centro) {
      await p.mouse.move(centro[0] - 120, centro[1] - 80, { steps: 12 });
      await p.mouse.move(centro[0], centro[1], { steps: 12 });
      await p.waitForTimeout(900);
    }

    const estadoDespues = await p.evaluate(() =>
      document.querySelector('[data-kdx-contrato]')?.dataset.kdxEstado || '');
    const despues = await p.screenshot();
    const dInput = await delta(antes, despues);

    const cambioEstado = estadoAntes !== estadoDespues && !!estadoDespues;
    /* CALIBRACIÓN CORREGIDA · 2026-08-26
     *
     * La regla original era `dInput > dQuieto * 1.6`. Está mal y se demostró
     * midiendo: COSMOLOGY llegó a 33.5% de vida propia, así que exigía un
     * cambio del 53% al pasar el puntero. Eso no es causalidad, es una
     * transición de escena entera. Una escena MÁS viva quedaba MÁS castigada,
     * que es exactamente al revés de lo que el canon premia.
     *
     * Ahora: la respuesta al gesto tiene que destacar sobre el ruido propio de
     * la escena, con un margen relativo acotado y un piso absoluto. Detecta
     * señal sobre ruido sin volverse imposible cuando el ruido es alto.
     *
     * ⚠ Esta regla la ajustó el mismo agente cuyo trabajo evalúa. Queda
     * anotado a propósito: si alguna vez el gate empieza a aprobar escenas que
     * el creador rechaza a ojo, sospechar PRIMERO de este número. */
    /* El techo del ruido sale de las tres muestras reales de arriba, no de una
     * fórmula. Antes se usaba `dQuieto * 1.6` y COSMOLOGY —con 33% de vida
     * propia— necesitaba un 53% de cambio para que su respuesta contara: una
     * escena más viva quedaba más castigada, al revés de lo que premia el
     * canon. Ahora la pregunta es la correcta: ¿este cambio sale de lo que la
     * escena hace sola?
     *
     * ⚠ Esta calibración la ajustó el agente cuyo trabajo evalúa el gate.
     * Queda anotado: si el gate empieza a aprobar escenas que el creador
     * rechaza a ojo, sospechar PRIMERO de este número. */
    const umbralCausal = ruidoTecho + R.causalidad_delta_min;
    const cambioVisible = dInput > umbralCausal;

    if (!centro) {
      notas.push('causalidad no evaluada: sin organismo que apuntar');
    } else if (!cambioEstado && !cambioVisible) {
      falla('SIN CAUSALIDAD VISIBLE',
        `el puntero entró al organismo y ni el estado cambió (${estadoAntes || '∅'}) ` +
        `ni la pantalla respondió más que en reposo (${(dInput * 100).toFixed(2)}% vs ${(dQuieto * 100).toFixed(2)}%)`);
    } else if (cambioEstado && !cambioVisible) {
      falla('ESTADO SIN CONSECUENCIA',
        `${estadoAntes || '∅'} → ${estadoDespues} pero la pantalla no lo muestra. ` +
        'Un estado que no se ve no existe para el visitante.');
    } else {
      notas.push(`causalidad ${estadoAntes || '∅'}→${estadoDespues || '∅'} · Δ${(dInput * 100).toFixed(1)}%`);
    }

    // ── 4 · MICROGRAFÍA VERAZ · ningún número sin fuente ────────────────
    const sinFuente = await p.evaluate(() =>
      [...document.querySelectorAll('[data-kdx-readout]')]
        .filter(n => !n.dataset.fuente)
        .map(n => (n.textContent || '').trim().slice(0, 24)));

    if (sinFuente.length) {
      falla('DATO FALSO',
        `${sinFuente.length} readout(s) sin data-fuente: ${JSON.stringify(sinFuente.slice(0, 5))}`);
    }

    // ── 5 · FIRMA ESTRUCTURAL · ¿es esta escena o es la plantilla? ──────
    /* La firma se toma DENTRO de la escena, no de la página entera.
     *
     * La versión anterior contaba todas las clases del documento — encabezado,
     * cajón, velo, descenso, navegación. Pero §4 del canon dice que eso es
     * "UNA GRAMÁTICA, SIETE MUNDOS": el shell DEBE ser idéntico en las siete
     * escenas. Medirlo como si fuera igualdad indeseada era medir mal: penaliza
     * justo lo que el canon manda compartir, y diluye lo que sí distingue a un
     * mundo de otro (organismo, composición, capas de ambiente, mundo material).
     *
     * Ahora se mide el subárbol de la escena. Si dos mundos siguen pareciéndose
     * acá, se parecen de verdad.
     *
     * ⚠ Otro ajuste del agente cuyo trabajo evalúa el gate. Anotado a propósito.
     * El contraste sigue disponible: si el creador ve dos escenas gemelas que
     * este número aprueba, el número está mal, no la escena. */
    const firma = await p.evaluate(() => {
      const raiz = document.querySelector('[data-kdx-contrato]') || document.body;
      const f = {};
      for (const n of raiz.querySelectorAll('[class]')) {
        for (const c of n.classList) {
          if (!/^(kdx|kx|kodex)-/.test(c)) continue;
          f[c] = (f[c] || 0) + 1;
        }
      }
      return f;
    });

    // ── 6 · MOBILE · ¿coreografía propia o desktop encogido? ────────────
    await p.setViewportSize({ width: 390, height: 844 });
    await p.waitForTimeout(1800);

    const encogido = await p.evaluate(bajo => {
      for (const n of document.querySelectorAll('*')) {
        const t = getComputedStyle(n).transform;
        const m = t && t.startsWith('matrix') ? parseFloat(t.slice(7).split(',')[0]) : 1;
        if (!(m < bajo)) continue;
        const hijo = n.firstElementChild;
        const ancho = hijo ? hijo.getBoundingClientRect().width / m : 0;
        if (ancho > 1200) return { escala: +m.toFixed(3), ancho: Math.round(ancho), sel: n.className.toString().slice(0, 60) };
      }
      return null;
    }, R.escala_movil_prohibida_bajo);

    if (encogido) {
      falla('DESKTOP ENCOGIDO',
        `.${encogido.sel} escala a ${encogido.escala} un contenido de ${encogido.ancho}px. ` +
        'scale() no es diseño móvil: es la lámina metida a la fuerza en el teléfono.');
    }

    const desborde = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (desborde > 4) falla('DESBORDE MÓVIL', `${desborde}px de scroll horizontal a 390px`);

    informe.push({ escena: E.id, ruta: E.ruta, fallas, notas, firma, golden: !!E.golden });
  } catch (e) {
    if (!fallas.length) falla('ERROR DE EVALUACIÓN', e.message);
    informe.push({ escena: E.id, ruta: E.ruta, fallas, notas, firma: {}, golden: !!E.golden });
  } finally {
    await ctx.close();
  }
}

await nav.close();

// ── 7 · ¿SIETE MUNDOS O UNA PLANTILLA SIETE VECES? ────────────────────────
for (let i = 0; i < informe.length; i++) {
  for (let j = i + 1; j < informe.length; j++) {
    const a = informe[i], b = informe[j];
    if (!Object.keys(a.firma).length || !Object.keys(b.firma).length) continue;
    const s = similitud(a.firma, b.firma);
    if (s > R.firma_escenas_max_similitud) {
      const d = `firma estructural ${(s * 100).toFixed(0)}% idéntica a ${b.escena}. Son la misma plantilla con otro contenido.`;
      a.fallas.push(`MISMA PLANTILLA — ${d}`);
      b.fallas.push(`MISMA PLANTILLA — firma estructural ${(s * 100).toFixed(0)}% idéntica a ${a.escena}.`);
    }
  }
}

// ── INFORME ───────────────────────────────────────────────────────────────
console.log('\nGATE DE EXPERIENCIA · KODEX−∞');
console.log(`base ${BASE}\n`);

let fallan = 0;
for (const r of informe) {
  const ok = r.fallas.length === 0;
  if (!ok) fallan++;
  console.log(`${ok ? '✅ PASA' : '❌ FALLA'}  ${r.escena.padEnd(10)} ${r.ruta}${r.golden ? '   ← escena maestra' : ''}`);
  for (const n of r.notas) console.log(`          · ${n}`);
  for (const f of r.fallas) console.log(`          ✗ ${f}`);
  console.log('');
}

console.log(`${informe.length - fallan}/${informe.length} pasan · ${fallan} fallan`);

/* VECTOR POR ESCENA · para el trinquete de no-regresión.
 *
 * El 27-08 el conteo total escondió una regresión real: ayer pasaban
 * DESCENT/ARCHIVE/COSMOLOGY/RETURN (4/7). Hoy pasan PROLOGUE/COSMOLOGY/RETURN
 * (3/7) -- MENOS en total, pero además DESCENT y ARCHIVE retrocedieron de PASS
 * a FAIL mientras PROLOGUE avanzaba de FAIL a PASS. Un trinquete que sólo mira
 * "cuántas fallan" nunca lo habría visto: 4 y 3 son números distintos, pero
 * ni siquiera hacía falta que coincidieran para esconder el problema -- pudo
 * pasar con el MISMO conteo total y una escena buena reemplazando a una mala.
 *
 * Esta línea es la que el trinquete debe leer: identidad, no cantidad. */
console.log("VECTOR:" + informe.map(f => `${f.escena}=${f.fallas.length === 0 ? "PASS" : "FAIL"}`).join(","));


const maestra = informe.find(r => r.golden);
if (maestra && maestra.fallas.length) {
  console.log('\nLa escena maestra no pasa. Nada se replica hasta que pase.');
}

console.log('\nEste gate no juzga si una escena SE SIENTE KODEX.');
console.log('Eso sigue siendo del creador, a propósito.');

process.exit(fallan ? 1 : 0);
