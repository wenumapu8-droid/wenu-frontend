import { createAudioReactor } from './audio-reactor.js';

/**
 * Provider-agnostic/offline-first voice adapter.
 * V0 consumes pre-generated same-origin audio. Failure is fail-soft: captions
 * and visual state continue without audio.
 */
export function createOracleVoice(audioElement, { onEnergy, onStatus } = {}) {
  if (!audioElement) return null;
  let muted = false;
  let raf = 0;
  let reactor = null;

  const status = (value) => onStatus?.(value);

  const stopMeter = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    onEnergy?.(0);
  };

  const meter = () => {
    onEnergy?.(reactor?.energy?.() || 0);
    if (!audioElement.paused && !audioElement.ended) raf = requestAnimationFrame(meter);
    else stopMeter();
  };

  audioElement.addEventListener('ended', () => {
    status('ENDED');
    stopMeter();
  });
  audioElement.addEventListener('error', () => {
    status('SILENT_FALLBACK');
    stopMeter();
  });

  return {
    get muted() { return muted; },
    setMuted(value) {
      muted = Boolean(value);
      audioElement.muted = muted;
      status(muted ? 'MUTED' : 'READY');
    },
    async play(cue) {
      if (!cue?.audio) {
        status('SILENT_FALLBACK');
        return false;
      }
      try {
        if (!reactor) reactor = createAudioReactor(audioElement);
        await reactor?.resume?.();
        audioElement.src = cue.audio;
        audioElement.currentTime = 0;
        audioElement.muted = muted;
        await audioElement.play();
        status(muted ? 'MUTED' : 'PLAYING');
        stopMeter();
        raf = requestAnimationFrame(meter);
        return true;
      } catch {
        status('SILENT_FALLBACK');
        stopMeter();
        return false;
      }
    },
    stop() {
      audioElement.pause();
      audioElement.currentTime = 0;
      stopMeter();
      status('READY');
    },
  };
}
