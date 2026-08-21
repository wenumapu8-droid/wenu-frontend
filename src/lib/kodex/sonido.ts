/**
 * KODEX−∞ · SONIDO — el cuerpo de la escena
 *
 * El creador: "los sonidos no van acorde a las frecuencias de la geometría
 * sagrada". Y en el manifiesto operativo (2026-08-20, rango CANON):
 * "El sonido da cuerpo."
 *
 * ESTE MOTOR NO ES NUEVO. Es el del prototipo que el creador ya aprobó
 * (`kodex-threshold-live.html`), portado fiel: mismos osciladores, mismas
 * ganancias, mismo filtro, mismo limitador, mismo analizador. Reescribirlo
 * habría sido el motor número trece — y además habría perdido una afinación
 * que él ya escuchó y aceptó.
 *
 * LA AFINACIÓN NO ES DECORATIVA, y vale decir por qué, porque el reclamo del
 * creador era exactamente ese. Las cuatro voces de cada estado están en
 * proporciones justas, no en temperamento igual:
 *
 *     E00   55 · 82.5 · 110.3      55→82.5 es 3:2   ·  55→110 es 2:1
 *     T01   55 · 110  · 165        110→165 es 3:2
 *     M11  110 · 165  · 220        165→220 es 4:3
 *     R10   55 · 82.5 · 110        vuelve al reposo de E00
 *
 * Octava, quinta y cuarta: la serie armónica, que es la misma razón entera con
 * la que un monocordio se divide y con la que `ruta.ts` y `vida/reglas.ts`
 * eligen. No es que el sonido "acompañe" a la geometría: es la misma
 * proporción sonando.
 *
 * NUNCA ARRANCA SOLO. El umbral pregunta —"TAP TO ENTER · ENABLE SOUND" o
 * "CONTINUE IN SILENCE"— y esa elección manda en todo el sitio. Un sitio que
 * suena sin permiso es exactamente lo contrario de "el visitante elige".
 */

export type Estado = 'E00' | 'T01' | 'M11' | 'R10';

/** Las cuatro voces por estado, del prototipo aprobado. `c` es el corte del ruido. */
const ESTADOS: Record<Estado, { a: number; d: number; b: number; c: number }> = {
  E00: { a: 55, d: 82.5, b: 110.3, c: 320 },
  T01: { a: 55, d: 110, b: 165, c: 720 },
  M11: { a: 110, d: 165, b: 220, c: 1500 },
  R10: { a: 55, d: 82.5, b: 110, c: 460 },
};

/** Dónde el visitante dejó dicho si quiere sonido. */
const CLAVE_SONIDO = 'kdx-sonido';

export function sonidoPermitido(): boolean {
  try { return localStorage.getItem(CLAVE_SONIDO) === 'si'; } catch { return false; }
}
export function permitirSonido(si: boolean): void {
  try { localStorage.setItem(CLAVE_SONIDO, si ? 'si' : 'no'); } catch { /* modo privado */ }
}

class Sonido {
  private ctx?: AudioContext;
  private master?: GainNode;
  private sub?: OscillatorNode;
  private drone?: OscillatorNode;
  private beat?: OscillatorNode;
  private nf?: BiquadFilterNode;
  private an?: AnalyserNode;
  private bins?: Uint8Array;
  private energiaV = 0;
  private andando = false;

  async iniciar(): Promise<void> {
    if (this.andando) return;
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    const ctx: AudioContext = new AC();
    await ctx.resume();
    this.ctx = ctx; this.andando = true;

    const master = ctx.createGain(); master.gain.value = 0;
    /* Limitador antes de la salida: cuatro voces sumadas pueden recortar, y un
       recorte en un drone se oye como un defecto, no como intensidad. */
    const lim = ctx.createDynamicsCompressor();
    lim.threshold.value = -6; lim.ratio.value = 12;
    master.connect(lim); lim.connect(ctx.destination);
    this.master = master;

    const voz = (f: number, t: OscillatorType, g: number) => {
      const o = ctx.createOscillator(); o.type = t; o.frequency.value = f;
      const gg = ctx.createGain(); gg.gain.value = g;
      o.connect(gg); gg.connect(master); o.start(); return o;
    };
    this.sub = voz(55, 'sine', 0.25);
    this.drone = voz(82.5, 'triangle', 0.12);
    this.beat = voz(110.3, 'sine', 0.06);

    /* Ruido filtrado: el aire de la sala. Sin él las tres voces suenan a
       sintetizador; con él suenan a lugar. */
    const nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * 0.5;
    const noise = ctx.createBufferSource(); noise.buffer = nb; noise.loop = true;
    const nf = ctx.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 320; nf.Q.value = 4;
    const ng = ctx.createGain(); ng.gain.value = 0.09;
    noise.connect(nf); nf.connect(ng); ng.connect(master); noise.start();
    this.nf = nf;

    /* Respiración: 0.12 Hz son unos ocho segundos por ciclo, cerca del ritmo
       de una respiración lenta. No es una metáfora puesta encima — es el
       período que hace que el drone no se perciba como estático. */
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.12;
    const lg = ctx.createGain(); lg.gain.value = 0.03;
    lfo.connect(lg); lg.connect(master.gain); lfo.start();

    const an = ctx.createAnalyser(); an.fftSize = 256; master.connect(an);
    this.an = an; this.bins = new Uint8Array(an.frequencyBinCount);

    /* Entra en cuatro segundos. Un drone que aparece de golpe asusta. */
    const now = ctx.currentTime;
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(0.9, now + 4);
  }

  /** Cambio de estado: 0.9s de constante de tiempo, sin saltos audibles. */
  estado(s: Estado): void {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const r = (p: AudioParam | undefined, v: number) => p?.setTargetAtTime(v, t, 0.9);
    const S = ESTADOS[s];
    if (!S) return;
    r(this.sub?.frequency, S.a);
    r(this.drone?.frequency, S.d);
    r(this.beat?.frequency, S.b);
    r(this.nf?.frequency, S.c);
  }

  /** Abre o cierra el aire de la sala. 0..1 */
  corte(n: number): void {
    if (this.nf && this.ctx) this.nf.frequency.setTargetAtTime(180 + n * 1400, this.ctx.currentTime, 0.2);
  }

  /** Energía 0..1 — sirve para que lo visual respire con lo que suena. */
  energia(): number {
    if (!this.an || !this.bins) return 0;
    this.an.getByteFrequencyData(this.bins);
    let s = 0;
    for (let i = 0; i < this.bins.length; i++) s += this.bins[i];
    const e = s / (this.bins.length * 255);
    this.energiaV += (e - this.energiaV) * 0.2;
    return this.energiaV;
  }

  silenciar(): void {
    if (!this.ctx || !this.master) return;
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
  }
}

/** Uno solo por documento: dos contextos de audio se suman y saturan. */
export const sonido = new Sonido();

/**
 * El estado que le toca a una superficie, DERIVADO y no inventado.
 *
 * El prototipo nombra cuatro estados y el corredor tiene siete escenas, así
 * que no hay correspondencia uno a uno y no se va a fabricar una: se asigna
 * por la función narrativa que el propio Drive ya le da a cada escena.
 *   E00 excavación   · umbral y prólogo: se está llegando
 *   T01 transmutación· descenso y archivo: se está atravesando
 *   M11 manifestación· máquina y cosmología: se está construyendo
 *   R10 retorno      · retorno: converge
 * Una lámina hereda el estado de su estrato cuando lo tiene, y si no, entra en
 * T01, que es el estado de atravesar — que es lo que se hace en una lámina.
 */
export function estadoDe(superficie: string): Estado {
  const s = superficie.toLowerCase();
  if (/threshold|prologue|umbral|folio\/i\b|^i$/.test(s)) return 'E00';
  if (/return|retorno|folio\/vi|^vi$/.test(s)) return 'R10';
  if (/machine|cosmolog|maquina|folio\/(iv|v)|^(iv|v)$/.test(s)) return 'M11';
  return 'T01';
}
