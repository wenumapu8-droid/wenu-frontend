#version 300 es
precision highp float;

// KDX FX SUITE 05 · thermal-map (Mapa Térmico)
//
// EPISTEMIC NOTE — READ BEFORE REUSING THIS PASS.
// This is a false-colour treatment, not an instrument. It maps the *luminance
// of the previous pass* onto an arbitrary colour ladder chosen for looks.
// It measures nothing. It reads no sensor. The output is not temperature,
// not thermography, not radiometry, and carries no units. `u_temperature` is
// a dimensionless bias on where the ladder is sampled — it is not degrees.
// Do not label this output, in UI or copy, as a reading, a measurement,
// a scan or telemetry of any kind.
//
// Canonical params (manifest.json -> tratamientos -> thermal-map):
//   temperature 1.12 -> u_temperature  ladder bias (dimensionless, >0)
//   color_steps 8    -> u_colorSteps   number of discrete bands
//   emissive    1.35 -> u_emissive     output gain (clamped by the RGBA8 target)
//   hue_shift   0.02 -> u_hueShift     rotation about the grey axis, in turns
//   contrast    1.0  -> u_contrast     luma contrast about mid grey, pre-ladder
// Declared blend is ["add"]; blending is a composite-stage decision, not done
// here. This pass returns the treated colour and dry/wet mixes it via
// u_intensity, matching the other passes in this suite.
//
// This treatment does not animate, so it takes no u_time and no
// u_reducedMotion: there is no motion to reduce.

out vec4 fragColor;
in vec2 v_uv;

uniform sampler2D u_tex;
uniform vec2 u_resolution;
uniform float u_temperature;
uniform float u_colorSteps;
uniform float u_emissive;
uniform float u_hueShift;
uniform float u_contrast;
uniform float u_intensity;

const vec3 LUMA_REC709 = vec3(0.2126, 0.7152, 0.0722);

// Arbitrary aesthetic ladder: ink -> violet -> magenta -> ember -> amber -> bone.
// The ordering carries no physical meaning; it is a KODEX palette choice.
vec3 falseColorLadder(float t) {
  const vec3 c0 = vec3(0.020, 0.024, 0.055);
  const vec3 c1 = vec3(0.110, 0.060, 0.290);
  const vec3 c2 = vec3(0.560, 0.100, 0.330);
  const vec3 c3 = vec3(0.910, 0.330, 0.120);
  const vec3 c4 = vec3(0.980, 0.760, 0.240);
  const vec3 c5 = vec3(0.996, 0.972, 0.910);
  float s = clamp(t, 0.0, 1.0) * 5.0;
  vec3 col = c0;
  col = mix(col, c1, clamp(s, 0.0, 1.0));
  col = mix(col, c2, clamp(s - 1.0, 0.0, 1.0));
  col = mix(col, c3, clamp(s - 2.0, 0.0, 1.0));
  col = mix(col, c4, clamp(s - 3.0, 0.0, 1.0));
  col = mix(col, c5, clamp(s - 4.0, 0.0, 1.0));
  return col;
}

// Rotation of the colour vector about the neutral (grey) axis. Greys are fixed
// points, so this shifts hue without dragging the ladder off-brand.
vec3 rotateHue(vec3 col, float turns) {
  float angle = turns * 6.28318530718;
  const vec3 axis = vec3(0.57735026919);
  float c = cos(angle);
  float s = sin(angle);
  return col * c + cross(axis, col) * s + axis * dot(axis, col) * (1.0 - c);
}

void main() {
  vec4 src = texture(u_tex, v_uv);
  float luma = dot(src.rgb, LUMA_REC709);

  // contrast about mid grey
  float shaped = clamp((luma - 0.5) * u_contrast + 0.5, 0.0, 1.0);

  // ladder bias: >1 pushes the sample point up the ladder, <1 pulls it down
  float biased = pow(shaped, 1.0 / max(u_temperature, 0.05));

  // quantise into exactly u_colorSteps discrete bands
  float steps = max(floor(u_colorSteps), 1.0);
  float band = min(floor(biased * steps), steps - 1.0) / max(steps - 1.0, 1.0);

  vec3 col = falseColorLadder(band);
  col = rotateHue(col, u_hueShift);
  col *= u_emissive;

  fragColor = vec4(mix(src.rgb, col, clamp(u_intensity, 0.0, 1.0)), src.a);
}
