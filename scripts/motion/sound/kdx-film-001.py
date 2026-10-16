#!/usr/bin/env python3
"""Banda sonora de KDX-FILM-001, sintetizada. Determinista, sin samples.

    python3 scripts/motion/sound/kdx-film-001.py dist-motion/kdx-film-001.wav

Las tres capas de la biblia de producción §9:
  ATMOSPHERE  sub-bajo, aire
  SIGNAL      ticks, chirps, latido del observador
  (MUSIC)     el batimiento hace de música — ver abajo

El núcleo es el BATIMIENTO. Dos senos a f y f+Δ suenan como uno solo que
pulsa Δ veces por segundo: es interferencia, la misma física que el video
dibuja con dos fuentes puntuales. Δ baja de 7 Hz a 0 mientras la geometría
condensa, así que lo que se oye es la simetría estabilizándose. Cuando Δ
llega a cero las dos ondas quedan en fase y el pulso desaparece: el umbral
está listo para abrirse.

Los tiempos son los de la escena (kdx-film-001.html). Si se mueven allá,
se mueven acá.
"""
import sys
import numpy as np

SR = 48000
DUR = 15.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(20261016)

# ── utilidades ────────────────────────────────────────────────────────────
def span(a, b):
    return np.clip((t - a) / (b - a), 0, 1)

def ease(x):                       # easeInOutCubic
    return np.where(x < .5, 4 * x**3, 1 - (-2 * x + 2)**3 / 2)

def band(sig, lo, hi):
    """Filtro pasabanda por FFT. Vectorizado: sin bucles por muestra."""
    F = np.fft.rfft(sig)
    f = np.fft.rfftfreq(len(sig), 1 / SR)
    # flancos suaves: un corte rectangular suena a campana metálica
    m = (1 / (1 + (lo / np.maximum(f, 1))**4)) * (1 / (1 + (f / hi)**4))
    return np.fft.irfft(F * m, len(sig))

def noise():
    return rng.standard_normal(N)

def hit(at, length, f0, f1=None, decay=8.0):
    """Seno con barrido de f0 a f1 y decaimiento exponencial, desde `at`."""
    out = np.zeros(N)
    i0 = int(at * SR); n = min(int(length * SR), N - i0)
    tt = np.arange(n) / SR
    f = f0 if f1 is None else f0 * (f1 / f0) ** (tt / length)
    ph = 2 * np.pi * np.cumsum(f) / SR          # fase integrada: sin clicks
    out[i0:i0 + n] = np.sin(ph) * np.exp(-tt * decay)
    return out

def reverb(sig, seconds=3.2, decay=2.2, seed=7):
    """Convolución con una respuesta al impulso sintética (ruido que decae)."""
    r = np.random.default_rng(seed)
    n = int(seconds * SR)
    ir = r.standard_normal(n) * np.exp(-np.arange(n) / SR * decay)
    ir = band(np.pad(ir, (0, N - n)), 120, 9000)[:n]
    ir /= np.sqrt(np.sum(ir**2))
    L = len(sig) + n
    nfft = 1 << (L - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(sig, nfft) * np.fft.rfft(ir, nfft), nfft)[:len(sig)]

# ── estados de la escena ──────────────────────────────────────────────────
detect   = ease(span(1.60, 4.40))
condense = ease(span(4.40, 8.20))
observer = ease(span(8.20, 10.80))
stable   = ease(span(10.80, 12.60))
opened   = t >= 12.60
tail     = 1 - ease(span(13.70, 15.0))

# ── ATMOSPHERE ────────────────────────────────────────────────────────────
# El sub arranca en CERO: el acto es el vacío. Y va bajo — un reel se escucha
# en un teléfono, cuyo parlante no reproduce 41 Hz; ahí el sub solo come
# headroom y empuja la saturación. Lo que el oído percibe como grave en un
# teléfono son los ARMÓNICOS (fundamental ausente): por eso se suman 2× y 3×.
sub_env = detect * (1 - opened * 0.6) * tail
fund = 2 * np.pi * 41.2 * t
sub = (np.sin(fund) * 0.20 + np.sin(2 * np.pi * 61.7 * t) * 0.10
       + np.sin(2 * fund) * 0.07 + np.sin(3 * fund) * 0.045) * sub_env
air = band(noise(), 300, 2600) * 0.018 * (0.4 + 0.6 * detect) * tail

# ── BATIMIENTO: la interferencia que se oye ──────────────────────────────
delta = 7.0 * (1 - condense) + 0.0
delta = np.where(t > 8.2, 1.5 * (1 - observer) + 0.6 * observer, delta)
delta = np.where(t > 10.8, 0.6 * (1 - stable), delta)
f0 = 164.8                                       # E3
ph1 = 2 * np.pi * np.cumsum(np.full(N, f0)) / SR
ph2 = 2 * np.pi * np.cumsum(f0 + delta) / SR     # fase integrada
beat_env = ease(span(4.0, 5.6)) * (1 - span(12.55, 12.62)) * (0.55 + 0.45 * observer)
beat = (np.sin(ph1) + np.sin(ph2)) * 0.5
beat += (np.sin(2 * ph1) + np.sin(2 * ph2)) * 0.12          # octava, brillo
beat *= beat_env * 0.30

# ── SIGNAL ───────────────────────────────────────────────────────────────
sig = np.zeros(N)
for at in (1.10, 6.50, 11.10):                  # líneas del guion: tick
    sig += band(hit(at, 0.05, 2400, decay=90) + hit(at, 0.03, 4800, decay=140) * 0.5, 800, 9000) * 0.30
for at in (3.90, 9.00):                         # detecciones: chirp FM
    sig += hit(at, 0.22, 900, 3200, decay=14) * 0.16
    sig += hit(at + 0.11, 0.18, 1400, 4100, decay=18) * 0.10
for at in np.arange(8.40, 12.55, 0.86):         # latido del observador
    w = float(np.interp(at, t, observer))
    sig += hit(at, 0.35, 62, 44, decay=11) * 0.55 * w
    sig += hit(at + 0.16, 0.30, 58, 42, decay=13) * 0.32 * w

# ── RISER hacia la apertura: ruido que sube por bandas ───────────────────
nz = noise()
riser = np.zeros(N)
rise = ease(span(10.9, 12.6)) * (1 - span(12.58, 12.62))
for k, (lo, hi) in enumerate([(200, 800), (600, 2000), (1500, 5000), (4000, 12000)]):
    w = np.clip(rise * 4 - k, 0, 1)            # cada banda entra después
    riser += band(nz, lo, hi) * w
riser *= 0.06 * rise
riser += hit(10.9, 1.7, 110, 880, decay=0.15) * 0.05 * rise

# ── EL EVENTO: el umbral se abre ─────────────────────────────────────────
impact = hit(12.60, 2.4, 92, 26, decay=1.9) * 0.95
impact += band(noise(), 40, 6000) * np.exp(-np.clip(t - 12.60, 0, None) * 9) * opened * 0.35

# ── RESOLUCIÓN: la marca ─────────────────────────────────────────────────
bell = sum(hit(14.05, 3.0, 880 * r, decay=d) * g
           for r, g, d in [(1, .26, 1.6), (2.76, .12, 2.6), (5.40, .06, 3.8), (8.93, .03, 5.0)])

# ── mezcla ───────────────────────────────────────────────────────────────
dry = sub + air + beat + sig + riser + impact + bell
wet = reverb(beat * 0.5 + sig * 0.8 + riser * 0.6 + impact * 0.9 + bell * 1.2)

# ancho estéreo: el húmedo se decorrelaciona entre canales
wet_r = reverb(beat * 0.5 + sig * 0.8 + riser * 0.6 + impact * 0.9 + bell * 1.2, seed=11)
L = dry + wet * 0.55
R = dry + wet_r * 0.55
mix = np.stack([L, R], axis=1)

# master: saturación suave y normalización a -1 dBFS
# saturación apenas: con más drive el sub intermodula (se veía como un peine)
mix = np.tanh(mix * 0.9) / np.tanh(0.9)
mix *= 10 ** (-1 / 20) / np.max(np.abs(mix))
# fundidos de 20 ms: un corte seco al borde del archivo hace click
fade = int(0.02 * SR)
mix[:fade] *= np.linspace(0, 1, fade)[:, None]
mix[-fade:] *= np.linspace(1, 0, fade)[:, None]

pcm = (mix * 32767).astype('<i2')
out = sys.argv[1] if len(sys.argv) > 1 else 'kdx-film-001.wav'
import wave
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(pcm.tobytes())
peak = 20 * np.log10(np.max(np.abs(mix)))
rms = 20 * np.log10(np.sqrt(np.mean(mix**2)))
print(f"  {out}  {DUR:.0f}s  {SR} Hz estéreo  pico {peak:.1f} dBFS  RMS {rms:.1f} dBFS")
print("  (el loudness final se fija al mezclar con el video: loudnorm a -14 LUFS)")
