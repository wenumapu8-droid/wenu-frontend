export const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
export const mix = (a, b, t) => a + (b - a) * t;
export const fract = value => value - Math.floor(value);
export const smoothstep = (edge0, edge1, x) => {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};
export const hash21 = (x, y) => fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123);
export const length2 = (x, y) => Math.hypot(x, y);
export const rotate2 = (x, y, angle) => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [c * x - s * y, s * x + c * y];
};
