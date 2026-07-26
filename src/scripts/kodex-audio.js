// KODEX−∞ · generative frequency engine for the book.
// No samples, no files — pure WebAudio synthesis. Each folio/level has its own
// musical scene matching the journey (owner: "techno, downtempo, forest, dark psy"):
//   UMBRAL ambient pulse · PROLOGUE downtempo · DESCENT dark psy ·
//   ARCHIVE forest psy · MACHINE techno · COSMOLOGY heartbeat downtempo ·
//   RETURN beatless drone that turns to shimmer when the codex goes white.
// Autoplay policy: starts only from the ♪ button; the choice persists across
// folios (sessionStorage) and re-arms on the first click of the next page.
// NOTE: separate from src/kodex/audio/kodexAudio.js (world-session's engine).

const ST = (root, semi) => root * Math.pow(2, semi / 12);

const PRESETS = {
  UMBRAL:    { bpm: 66,  mood: 'ambient',
    kick: [1,1,0,0, 0,0,0,0, 1,1,0,0, 0,0,0,0], hat: [], bassPat: [], bassRoot: 0,
    drone: [55, 82.5, 110, 220], droneG: 0.06, texF: 460, texG: 0.024, bright: 1600 },
  PROLOGUE:  { bpm: 82,  mood: 'downtempo',
    kick: [1,0,0,0, 0,0,1,0, 0,0,1,0, 0,0,0,0], hat: [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
    bassPat: [0,-1,-1,3, -1,-1,3,-1, -1,5,-1,-1, 3,-1,-1,-1], bassRoot: 43.65,
    drone: [58.27, 58.9, 116.5], droneG: 0.040, texF: 400, texG: 0.014, bright: 1100 },
  DESCENT:   { bpm: 138, mood: 'darkpsy',
    kick: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0], hat: [0,1,1,1, 0,1,1,1, 0,1,1,1, 0,1,1,1],
    bassPat: [-1,0,0,0, -1,0,0,0, -1,0,0,3, -1,0,0,0], bassRoot: 36.71,
    drone: [36.71, 37.1, 73.4], droneG: 0.045, texF: 190, texG: 0.020, bright: 750 },
  ARCHIVE:   { bpm: 144, mood: 'forest',
    kick: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0], hat: [0,0,1,0, 0,1,0,1, 0,0,1,0, 0,1,0,0],
    bassPat: [-1,3,0,3, -1,3,0,5, -1,3,0,3, -1,7,0,3], bassRoot: 41.2,
    drone: [41.2, 41.7, 82.4], droneG: 0.040, texF: 900, texG: 0.026, bright: 1500, blip: true },
  MACHINE:   { bpm: 128, mood: 'techno',
    kick: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0], hat: [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,1],
    bassPat: [0,-1,0,-1, 3,-1,0,-1, 0,-1,5,-1, 0,-1,3,7], bassRoot: 46.25,
    drone: [46.25, 46.7], droneG: 0.030, texF: 3200, texG: 0.012, bright: 1300, acid: true },
  COSMOLOGY: { bpm: 92,  mood: 'downtempo',
    kick: [1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0], hat: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    bassPat: [0,-1,-1,-1, -1,-1,5,-1, 3,-1,-1,-1, -1,-1,-1,-1], bassRoot: 38.89,
    drone: [38.89, 39.3, 77.8, 155.6], droneG: 0.050, texF: 500, texG: 0.024, bright: 1000 },
  RETURN:    { bpm: 0,   mood: 'lumen',
    kick: [], hat: [], bassPat: [], bassRoot: 0,
    drone: [49, 49.4, 98, 196], droneG: 0.055, texF: 700, texG: 0.020, bright: 1200 },
};

export function initKxAudio(root) {
  const btn = root.querySelector('[data-sound]');
  if (!btn) return;
  const lab = root.querySelector('[data-sound-label]');
  const stage = root.getAttribute('data-stage-name') || 'UMBRAL';
  const P = PRESETS[stage] || PRESETS.UMBRAL;

  let ctx = null, master = null, noiseBuf = null, timer = 0, step = 0, on = false;
  let bright = null, droneOsc = [], texSrc = null;

  const build = () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0;
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -18; limiter.ratio.value = 12;
    // one shared colour filter — the SIGNAL opens it (gold = brighter world)
    bright = ctx.createBiquadFilter(); bright.type = 'lowpass'; bright.frequency.value = P.bright; bright.Q.value = 0.7;
    master.connect(bright); bright.connect(limiter); limiter.connect(ctx.destination);
    // noise bed
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    // drone — detuned partials, the ground of every scene
    P.drone.forEach((f, k) => {
      const o = ctx.createOscillator(); o.type = k === 0 ? 'sine' : 'triangle'; o.frequency.value = f;
      const g = ctx.createGain(); g.gain.value = P.droneG / (k + 1);
      o.connect(g); g.connect(master); o.start(); droneOsc.push(o);
    });
    // texture — filtered noise breathing slowly (forest floor / machine hiss / wind)
    texSrc = ctx.createBufferSource(); texSrc.buffer = noiseBuf; texSrc.loop = true;
    const tf = ctx.createBiquadFilter(); tf.type = 'bandpass'; tf.frequency.value = P.texF; tf.Q.value = 1.2;
    const tg = ctx.createGain(); tg.gain.value = P.texG;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.09;
    const lg = ctx.createGain(); lg.gain.value = P.texG * 0.6;
    lfo.connect(lg); lg.connect(tg.gain);
    texSrc.connect(tf); tf.connect(tg); tg.connect(master); texSrc.start(); lfo.start();
    return true;
  };

  const kick = (t) => {
    const o = ctx.createOscillator(); o.type = 'sine';
    const g = ctx.createGain();
    o.frequency.setValueAtTime(P.mood === 'techno' ? 160 : 130, t);
    o.frequency.exponentialRampToValueAtTime(38, t + 0.09);
    g.gain.setValueAtTime(P.mood === 'ambient' ? 0.16 : 0.30, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.3);
  };
  const hat = (t, open) => {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 6800;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.055, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + (open ? 0.14 : 0.045));
    s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + 0.16);
  };
  const bass = (t, semi, dur) => {
    const o = ctx.createOscillator(); o.type = P.mood === 'techno' ? 'sawtooth' : 'square';
    o.frequency.value = ST(P.bassRoot, semi);
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = P.acid ? 9 : 3;
    f.frequency.setValueAtTime(P.acid ? 1400 : 420, t);
    f.frequency.exponentialRampToValueAtTime(90, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.11, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(f); f.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
  };
  const blip = (t) => { // forest voices — squelchy pentatonic sparks
    const o = ctx.createOscillator(); o.type = 'sine';
    const base = [329.6, 392, 440, 523.25, 587.33][(Math.random() * 5) | 0];
    o.frequency.setValueAtTime(base, t);
    o.frequency.exponentialRampToValueAtTime(base * (Math.random() < 0.5 ? 0.5 : 2), t + 0.11);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.028, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.15);
  };
  const shimmer = (t) => { // RETURN — the white: high partials like light arriving
    const base = [392, 523.25, 659.25, 783.99][(Math.random() * 4) | 0];
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = base * 2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.03, t + 0.8);
    g.gain.exponentialRampToValueAtTime(0.001, t + 2.6);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 2.8);
  };

  let nextT = 0;
  const tick = () => {
    if (!on) return;
    const spb = P.bpm > 0 ? 60 / P.bpm / 4 : 0.5; // 16th note (or ambient tick)
    while (nextT < ctx.currentTime + 0.12) {
      const i = step % 16;
      if (P.kick.length && P.kick[i]) kick(nextT);
      if (P.hat.length && P.hat[i]) hat(nextT, i % 4 === 2 && P.mood === 'techno');
      if (P.bassPat.length) { const s = P.bassPat[i]; if (s >= 0) bass(nextT, s, spb * (P.mood === 'darkpsy' ? 0.9 : 1.6)); }
      if (P.blip && Math.random() < 0.10) blip(nextT);
      if (P.mood === 'lumen') {
        const white = root.classList.contains('kx--white');
        if (Math.random() < (white ? 0.5 : 0.12)) shimmer(nextT);
      }
      // the SIGNAL opens the light — the whole mix brightens
      bright.frequency.setTargetAtTime(window.__kxSignal ? P.bright * 2.4 : P.bright, nextT, 0.8);
      nextT += spb; step++;
    }
    timer = setTimeout(tick, 40);
  };

  const setOn = (v) => {
    on = v;
    try { sessionStorage.setItem('kx-audio', v ? '1' : '0'); } catch (e) {}
    btn.setAttribute('aria-pressed', String(v));
    if (lab) lab.textContent = v ? 'SOUND · ON' : 'SOUND · OFF';
    if (v) {
      if (!ctx && !build()) return;
      ctx.resume?.();
      master.gain.setTargetAtTime(0.55, ctx.currentTime, 0.6);
      nextT = ctx.currentTime + 0.05; step = 0; tick();
    } else if (ctx) {
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
      clearTimeout(timer);
    }
  };

  btn.addEventListener('click', () => setOn(!on));
  // re-arm across folios: if the listener chose sound, the first gesture
  // on the next page (the NEXT click itself) resumes the music
  let wants = false;
  try { wants = sessionStorage.getItem('kx-audio') === '1'; } catch (e) {}
  if (wants) {
    if (lab) lab.textContent = 'SOUND · TAP';
    const arm = () => { setOn(true); removeEventListener('pointerdown', arm); removeEventListener('keydown', arm); };
    addEventListener('pointerdown', arm, { once: true });
    addEventListener('keydown', arm, { once: true });
  }
}
