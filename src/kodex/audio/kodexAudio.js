// KODEX AUDIO — Phase 1 soundscape. Generated, not an MP3.
// State E00 · EXCAVATION: fundamental ~55 Hz drone + sub + filtered mineral noise,
// low-pass, slow pulses. FFT analyser exposes energy that drives the visuals.
// Frequencies are composition choices, NOT "healing frequencies" — no health claims.
// Never started without a user gesture (browser policy).
export class KodexAudio {
  constructor() { this.ctx = null; this.started = false; this.muted = false; this._energy = 0; }

  async start({ muted = false } = {}) {
    if (this.started) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    await ctx.resume();
    this.ctx = ctx; this.started = true; this.muted = muted;

    const master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.0;
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -6; limiter.ratio.value = 12;
    master.connect(limiter); limiter.connect(ctx.destination);
    this.master = master;

    // fundamental drone (55 Hz) + fifth-ish partial, detuned for slow beating
    const mk = (freq, type, g) => { const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq; const gg = ctx.createGain(); gg.gain.value = g; o.connect(gg); gg.connect(master); o.start(); return { o, gg }; };
    this.sub = mk(55, 'sine', 0.25);
    this.drone = mk(82.5, 'triangle', 0.12);
    this.beat = mk(110.3, 'sine', 0.06);

    // filtered mineral noise
    const nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * 0.5;
    const noise = ctx.createBufferSource(); noise.buffer = nb; noise.loop = true;
    const nf = ctx.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 320; nf.Q.value = 4;
    const ng = ctx.createGain(); ng.gain.value = 0.09;
    noise.connect(nf); nf.connect(ng); ng.connect(master); noise.start();
    this.noiseFilter = nf;

    // slow pulse LFO on master
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.12;
    const lg = ctx.createGain(); lg.gain.value = 0.03;
    lfo.connect(lg); lg.connect(master.gain); lfo.start();

    // analyser
    const an = ctx.createAnalyser(); an.fftSize = 256; master.connect(an);
    this.analyser = an; this._bins = new Uint8Array(an.frequencyBinCount);

    // fade in
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(muted ? 0 : 0.0, now);
    if (!muted) master.gain.linearRampToValueAtTime(0.9, now + 4);
  }

  // pointer Y → filter cutoff; call from the page
  setCutoff(n01) { if (this.noiseFilter && this.ctx) this.noiseFilter.frequency.setTargetAtTime(180 + n01 * 1400, this.ctx.currentTime, 0.2); }

  // STATE soundscapes — E00 excavation · T01 transmutation · M11 manifestation · R10 return.
  // Composition choices, not "healing frequencies". The same state drives the visuals.
  setState(phase) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime, ramp = (p, v) => p && p.setTargetAtTime(v, t, 0.9);
    const S = {
      E00: { sub: 55, drone: 82.5, beat: 110.3, cut: 320 },
      T01: { sub: 55, drone: 110, beat: 165, cut: 720 },
      M11: { sub: 110, drone: 165, beat: 220, cut: 1500 },
      R10: { sub: 55, drone: 82.5, beat: 110, cut: 460 },
    }[phase];
    if (!S) return;
    ramp(this.sub && this.sub.o.frequency, S.sub);
    ramp(this.drone && this.drone.o.frequency, S.drone);
    ramp(this.beat && this.beat.o.frequency, S.beat);
    ramp(this.noiseFilter && this.noiseFilter.frequency, S.cut);
  }

  energy() {
    if (!this.analyser) return 0;
    this.analyser.getByteFrequencyData(this._bins);
    let s = 0; for (let i = 0; i < this._bins.length; i++) s += this._bins[i];
    const e = s / (this._bins.length * 255);
    this._energy += (e - this._energy) * 0.2;
    return this._energy;
  }

  toggleMute() {
    if (!this.ctx) return this.muted;
    this.muted = !this.muted;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.linearRampToValueAtTime(this.muted ? 0 : 0.9, now + 0.4);
    return this.muted;
  }
}
