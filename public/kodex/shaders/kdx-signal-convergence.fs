/*{
  "DESCRIPTION": "KDX.SIGNAL.01 — synthetic barcode fields converge only when convergence is explicitly adjusted. Artistic signal; not measured telemetry.",
  "CREDIT": "Ocín / KODEX−∞, 2026",
  "ISFVSN": "2.0",
  "CATEGORIES": ["Generator", "KODEX", "Experimental"],
  "INPUTS": [
    {"NAME":"convergence","LABEL":"Convergencia manual","TYPE":"float","DEFAULT":0.0,"MIN":0.0,"MAX":1.0},
    {"NAME":"energy","LABEL":"Intensidad visual (manual)","TYPE":"float","DEFAULT":0.45,"MIN":0.0,"MAX":1.0},
    {"NAME":"density","LABEL":"Densidad","TYPE":"float","DEFAULT":0.55,"MIN":0.0,"MAX":1.0},
    {"NAME":"speed","LABEL":"Velocidad","TYPE":"float","DEFAULT":0.25,"MIN":0.0,"MAX":2.0}
  ]
}*/

// Original ISF generator. Host controls are explicit; no microphone/sensors.
// A DOM layer in KODEX owns any readable message and source attribution.
#ifdef GL_ES
precision mediump float;
#endif

float kdxHash(float x) {
  return fract(sin(x * 127.1 + 78.233) * 43758.5453);
}

float kdxField(vec2 p, float origin, float direction, float timeValue, float densityValue, float seed) {
  float lane = (p.x - origin) * direction / 0.31;
  float active = step(0.0, lane) * (1.0 - step(1.0, lane));
  float samples = mix(26.0, 66.0, densityValue);
  float slot = lane * samples;
  float index = floor(slot);
  float width = mix(0.035, 0.26, kdxHash(index + seed * 14.7));
  float stroke = 1.0 - smoothstep(width, width + 0.045, abs(fract(slot) - 0.5));
  float halfHeight = mix(0.045, 0.28, kdxHash(index * 2.13 + seed * 7.9));
  float breathe = 0.92 + 0.08 * sin(timeValue + index * 0.27 + seed);
  float heightMask = 1.0 - smoothstep(halfHeight * breathe, halfHeight * breathe + 0.012, abs(p.y));
  return active * stroke * heightMask;
}

void main() {
  vec2 uv = isf_FragNormCoord.xy;
  vec2 p = uv - vec2(0.5);
  float t = TIME * speed;
  float c = clamp(convergence, 0.0, 1.0);

  float leftOrigin = -0.43 + 0.19 * c;
  float rightOrigin = 0.43 - 0.19 * c;
  float left = kdxField(p, leftOrigin, 1.0, t, density, 1.0);
  float right = kdxField(p, rightOrigin, -1.0, t, density, 2.0);

  vec3 background = vec3(0.028, 0.032, 0.052);
  float horizon = exp(-105.0 * p.y * p.y) * 0.023;
  float centerLight = exp(-64.0 * dot(p, p)) * (0.025 + 0.11 * c);
  float grid = (1.0 - smoothstep(0.0, 0.003, abs(p.x))) * 0.055;

  vec3 color = background
    + vec3(0.15, 0.18, 0.31) * horizon
    + vec3(0.22, 0.28, 0.51) * (centerLight + grid)
    + vec3(0.52, 0.61, 0.97) * left * (0.35 + 0.65 * energy)
    + vec3(0.95, 0.62, 0.38) * right * (0.35 + 0.65 * energy);

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
