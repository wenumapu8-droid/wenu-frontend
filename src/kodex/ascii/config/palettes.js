export const PALETTES = Object.freeze({
  observe: ["#07070c", "#221733", "#513071", "#8750bd", "#c48cff", "#f2eaff"],
  descent: ["#070706", "#2b1609", "#743010", "#e4641c", "#ffb04f", "#fff0cf"],
  cosmology: ["#04070c", "#0b2244", "#173f76", "#356bc6", "#7aa5ff", "#e7efff"],
  signal: ["#030909", "#092926", "#0d5f58", "#13a99d", "#5fffe9", "#e9fffb"],
});

export function samplePalette(palette, value) {
  const safe = Math.max(0, Math.min(0.9999, value));
  return palette[Math.floor(safe * palette.length)];
}
