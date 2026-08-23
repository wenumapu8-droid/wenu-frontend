/**
 * KODEX−∞ · MACHINE GENERA DE VERDAD
 *
 * QUÉ HABÍA. La escena MACHINE mostraba esta línea, escrita a mano en el HTML:
 *
 *   KDX-GEN-0000 · SEED A90C-73F1 · SOURCE ACHROMA_006 ·
 *   METHOD MIRROR/DITHER/FLOW · STATUS READY
 *
 * Un número de pieza que no numera nada, una semilla que no siembra nada y un
 * método que nombra tres tratamientos que no corren. Es exactamente lo que el
 * manifiesto prohíbe: «entonces el universo desaparece y aparece el software».
 * Peor todavía, porque ni siquiera es software: es la ficha de un software.
 *
 * QUÉ HAY AHORA. `src/kodex/treatments/chain.ts` son 380 líneas con los ocho
 * tratamientos del pliego maestro de Ocín y los siete modos de mezcla,
 * encadenables, con los parámetros saliendo de `design-system/tanda-02.json`.
 * Estaba escrito, terminado y sin un solo módulo que lo importara. Ésta es la
 * conexión que faltaba: MACHINE toma una obra del banco y la transmuta en
 * pantalla, con la cadena corriendo en la GPU del visitante.
 *
 * LA LÍNEA SIGUE ESTANDO, pero ya no es decorado: dice la obra que entró, la
 * cadena que efectivamente se armó y la semilla que la eligió. Si el texto y
 * la imagen se contradicen, es un error que se ve — antes no había con qué
 * contradecirse.
 *
 * POR QUÉ CAMBIA SEGÚN QUIÉN MIRA. El creador, textual: «la travesía tiene que
 * ser distinta para cada persona según las decisiones y los clicks». La cadena
 * no se sortea: sale de `firmaDeRuta(escena, visitados, retornos)` repartida
 * por el ángulo áureo, la misma función que ya elige las puertas del descenso.
 * Dos visitantes con el mismo recorrido ven lo mismo; con recorridos distintos
 * ven máquinas distintas. Es determinista y es suyo. Regla de canon: la
 * matemática nunca es decorativa (27-DEEP-NAVIGATION §22, «no random route
 * roulette»).
 *
 * LO QUE NO HACE. No mide al visitante ni infiere nada de él: lee el recorrido
 * que él mismo dejó, que es la misma memoria que ya usa el resto del sistema.
 */

import { KodexTreatmentChain, type TreatmentLink, type BlendMode } from '../../kodex/treatments/chain';
import { firmaDeRuta } from './ruta';
import { recorrido, veces } from './memoria';

const PHI = (1 + Math.sqrt(5)) / 2;
const AUREO = 1 / (PHI * PHI);

/** Los ocho del pliego. El orden es el del JSON y no se toca: es la referencia. */
const TRATAMIENTOS = [
  'dither-matrix', 'thermal-map', 'bitmap-noise', 'crt-scan',
  'chromatic-split', 'glitch-break', 'pixel-sort', 'feedback-loop',
] as const;

const MODOS: BlendMode[] = ['NORMAL', 'SCREEN', 'OVERLAY', 'MAX', 'LUMA'];

type Obra = { chica: string; grande: string; titulo?: string; id?: string };

/**
 * La cadena que le toca a este visitante.
 *
 * Se reparten los tratamientos por el ángulo áureo desde la firma de ruta, sin
 * repetir. Dos o tres eslabones y no más: el pliego dice «aplicables en cadena
 * o mezcla», no «todos a la vez», y encadenar los ocho devuelve papilla gris
 * —probado—. La intensidad también sale de la firma, así que dos visitantes no
 * comparten ni la fuerza del tratamiento.
 */
export function cadenaDe(firma: number): TreatmentLink[] {
  const largo = 2 + Math.floor(((firma * AUREO * 7) % 1) * 2); // 2 o 3
  const usados = new Set<number>();
  const out: TreatmentLink[] = [];
  for (let k = 0; k < largo; k++) {
    let i = Math.floor(((firma * AUREO + k * AUREO) % 1) * TRATAMIENTOS.length);
    while (usados.has(i)) i = (i + 1) % TRATAMIENTOS.length;
    usados.add(i);
    const t = ((firma * AUREO + (k + 1) * AUREO) % 1);
    out.push({
      id: TRATAMIENTOS[i],
      blend: MODOS[Math.floor(t * MODOS.length)],
      /* Nunca por debajo de .45: un eslabón al 5% es un eslabón que se nombra
         en la línea y no se ve en la imagen — la contradicción que este módulo
         viene a terminar. */
      intensity: 0.45 + t * 0.5,
    });
  }
  return out;
}

/** Blit de la textura final al lienzo. La cadena devuelve textura, no píxeles. */
const BLIT_V = `#version 300 es
precision highp float;
in vec2 a_position; out vec2 v_uv;
void main(){ v_uv = a_position * 0.5 + 0.5; gl_Position = vec4(a_position,0.,1.); }`;
const BLIT_F = `#version 300 es
precision highp float;
in vec2 v_uv; out vec4 fragColor; uniform sampler2D u_tex;
void main(){ fragColor = vec4(texture(u_tex, v_uv).rgb, 1.0); }`;

function programa(gl: WebGL2RenderingContext, vs: string, fs: string): WebGLProgram {
  const c = (t: number, s: string) => {
    const sh = gl.createShader(t)!; gl.shaderSource(sh, s); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) ?? 'shader');
    return sh;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, c(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, c(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'link');
  return p;
}

let obras: Obra[] | null = null;
let pidiendo: Promise<Obra[]> | null = null;
function banco(): Promise<Obra[]> {
  if (obras) return Promise.resolve(obras);
  pidiendo ||= fetch('/kodex-content/obras.json')
    .then((r) => r.json())
    .then((j) => (obras = j.obras ?? []))
    .catch(() => (obras = []));
  return pidiendo;
}

let vivo: (() => void) | null = null;

export async function montarMaquina(): Promise<void> {
  const caja = document.querySelector<HTMLElement>('[data-machine-output]');
  if (!caja || caja.dataset.kdxMaquina === 'si') return;

  const lista = await banco();
  if (!lista.length) return;   // sin obras no hay máquina: se deja la ficha

  const firma = firmaDeRuta('machine', [...recorrido()], veces('retorno'));
  const obra = lista[Math.floor(((firma * AUREO) % 1) * lista.length)];
  const cadena = cadenaDe(firma);
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;

  caja.dataset.kdxMaquina = 'si';
  caja.textContent = '';

  const lienzo = document.createElement('canvas');
  lienzo.className = 'kx-machine-output__lienzo';
  /* La obra manda sobre la caja: `contain`, nunca recorte. Regla del creador:
     «si no cabe, cambia la cámara, no la obra». */
  lienzo.style.cssText = 'width:100%;display:block;aspect-ratio:1;object-fit:contain;background:#050505';
  const linea = document.createElement('p');
  linea.className = 'kx-machine-output__linea';
  /* MICRODETALLE, NO PIE DE FOTO. Mirada la captura, la línea salía en la
     serif del cuerpo, a tamaño de párrafo y en cuatro renglones: ocupaba un
     tercio del panel y competía con la obra. El manifiesto lo dice con todas
     las letras — la telemetría «puede aparecer ocasionalmente como
     microdetalle estético, como mirar los instrumentos de una nave, pero no
     puede dominar la escena».
     Va en mono, chica, apagada y en un solo renglón que se corta si no cabe.
     Sigue entera en el DOM para el lector de pantalla. */
  linea.style.cssText = [
    'margin:8px 0 0', 'font:10px/1.5 ui-monospace,SFMono-Regular,monospace',
    'letter-spacing:.14em', 'color:rgba(240,237,232,.34)', 'text-transform:none',
    'white-space:nowrap', 'overflow:hidden', 'text-overflow:ellipsis',
  ].join(';');
  caja.append(lienzo, linea);

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.decoding = 'async';
  /* Se pide la chica en teléfono: es una textura para tratar, no una lámina
     para ampliar, y la grande cuesta megabytes que nadie ve. */
  img.src = matchMedia('(max-width:560px)').matches ? obra.chica : obra.grande;
  await img.decode().catch(() => {});
  if (!img.naturalWidth) return;

  const gl = lienzo.getContext('webgl2', { antialias: false, preserveDrawingBuffer: false });
  if (!gl) {
    /* Sin WebGL2 la obra se muestra igual, intacta y sin tratar. No es un
       degradado a nada: es la obra, que es lo que importa. */
    const plano = new Image();
    plano.src = img.src; plano.alt = obra.titulo ?? 'Obra del archivo de Ocín';
    plano.style.cssText = 'width:100%;display:block';
    lienzo.replaceWith(plano);
    linea.textContent = `SOURCE ${obra.id ?? '—'} · METHOD —— · STATUS UNTREATED`;
    return;
  }

  const LADO = Math.min(720, Math.max(360, Math.round(caja.clientWidth || 480)));
  lienzo.width = LADO; lienzo.height = LADO;

  const fuente = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, fuente);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

  let motor: KodexTreatmentChain;
  try {
    motor = new KodexTreatmentChain(gl);
    motor.resize(LADO, LADO);
    await motor.setChain(cadena);
  } catch (e) {
    /* Un shader que no compila no puede llevarse puesta la escena. Se deja la
       obra intacta y se dice que no se trató, en vez de mentir en la línea.
       El motivo se publica en un atributo: un `catch` mudo me escondió durante
       una prueba que una de cada seis cadenas no montaba, y desde afuera se
       veía igual que un navegador sin WebGL2. */
    caja.dataset.kdxMaquinaFalla = String((e as Error)?.message ?? e).slice(0, 160);
    linea.textContent = `SOURCE ${obra.id ?? '—'} · METHOD —— · STATUS UNTREATED`;
    return;
  }

  const blit = programa(gl, BLIT_V, BLIT_F);
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(blit, 'a_position');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);

  const presentar = (tex: WebGLTexture) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, LADO, LADO);
    gl.useProgram(blit);
    gl.bindVertexArray(vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(gl.getUniformLocation(blit, 'u_tex'), 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  };

  /* La línea dice lo que efectivamente corre. Se arma DESPUÉS de que la cadena
     quedó montada, no antes: si un eslabón se hubiera caído, no se nombra. */
  const metodo = cadena.map((l) => `${l.id.split('-')[0].toUpperCase()}·${l.blend}`).join(' → ');
  /* Cuatro dígitos, no doce. `firmaDeRuta` no devuelve un número entre 0 y 1
     —eso lo supuse y salió en pantalla `SEED 44659A4B214F`, que no se lee ni
     se recuerda—. Se pliega al rango con módulo, que además es lo que ya hace
     el resto del motor con esta misma firma. */
  const semilla = (Math.abs(Math.floor(firma)) % 0x10000).toString(16).toUpperCase().padStart(4, '0');
  linea.textContent =
    `SOURCE ${obra.id ?? obra.titulo ?? '—'} · SEED ${semilla} · METHOD ${metodo} · STATUS ${quieto ? 'HELD' : 'RUNNING'}`;

  if (quieto) {
    /* Reduced-motion no apaga la máquina: la congela en un cuadro tratado. El
       visitante ve la transmutación, no una obra sin tocar ni un rectángulo
       negro. Es la misma decisión que ya tomó `estado.ts` con las fases. */
    presentar(motor.render(fuente, 0, 0));
    vivo = () => { motor.dispose(); gl.deleteTexture(fuente); };
    return;
  }

  let id = 0, antes = performance.now();
  const cuadro = (ahora: number) => {
    const delta = Math.min(0.05, (ahora - antes) / 1000);
    antes = ahora;
    presentar(motor.render(fuente, ahora / 1000, delta));
    id = requestAnimationFrame(cuadro);
  };
  id = requestAnimationFrame(cuadro);

  /* Fuera de pantalla no se calcula. La escena MACHINE vive en un cajón que
     puede estar cerrado, y una cadena de tres pasadas corriendo detrás de un
     panel oculto es batería del visitante quemada sin que vea nada. */
  const ojo = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !id) { antes = performance.now(); id = requestAnimationFrame(cuadro); }
    else if (!e.isIntersecting && id) { cancelAnimationFrame(id); id = 0; }
  }, { threshold: 0.02 });
  ojo.observe(lienzo);

  vivo = () => {
    if (id) cancelAnimationFrame(id);
    ojo.disconnect();
    motor.dispose();
    gl.deleteTexture(fuente);
    gl.deleteProgram(blit);
  };
}

export function desmontarMaquina(): void {
  vivo?.();
  vivo = null;
}
