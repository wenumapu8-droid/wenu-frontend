export const GLYPH_SETS = Object.freeze({
  kodex: "  ·:;+=xX#%@◉◎◇◆⊙⊗∞⌁⌬⌾",
  ascii: "  .,:;irsXA253hMHGS#9B&@",
  micro: "   .'·,:;!i1tfLCG08@",
  petscii: "  ·░▒▓█▖▗▘▙▚▛▜▟◆●○◎◉",
  blocks: "  ▁▂▃▄▅▆▇█▏▎▍▌▋▊▉",
});

export function getGlyphSet(name = "kodex") {
  return GLYPH_SETS[name] ?? GLYPH_SETS.kodex;
}
