// KODEX−∞ · KDX.ORACLE audio → visual bridge.
// Audio energy is presentation data only. It never writes journey memory.

export function createAudioReactor(audioElement, { fftSize = 256 } = {}) {
  if (!audioElement || typeof window === 'undefined') return null;
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) return null;

  const shared = window.__KDX_ORACLE_AUDIO__ || (window.__KDX_ORACLE_AUDIO__ = {});
  const context = shared.context || (shared.context = new AudioContextCtor());
  const analyser = context.createAnalyser();
  analyser.fftSize = fftSize;
  analyser.smoothingTimeConstant = 0.78;

  const source = context.createMediaElementSource(audioElement);
  source.connect(analyser);
  analyser.connect(context.destination);

  const bins = new Uint8Array(analyser.frequencyBinCount);

  return {
    context,
    analyser,
    async resume() {
      if (context.state === 'suspended') await context.resume();
    },
    energy() {
      analyser.getByteFrequencyData(bins);
      let sum = 0;
      for (let i = 0; i < bins.length; i += 1) sum += bins[i];
      return bins.length ? Math.min(1, sum / bins.length / 160) : 0;
    },
  };
}
