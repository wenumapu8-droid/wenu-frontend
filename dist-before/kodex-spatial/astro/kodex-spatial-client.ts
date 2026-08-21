type SpatialUniforms = Record<string, WebGLUniformLocation | null>;

const VERTEX_SHADER = `#version 300 es
precision highp float;
layout(location=0) in vec2 a_position;
out vec2 v_uv;
void main(){v_uv=a_position*.5+.5;gl_Position=vec4(a_position,0.,1.);}`;

async function loadShader(): Promise<string> {
  const response = await fetch('/assets/kodex/shaders/spatial.frag.glsl');
  if (!response.ok) throw new Error(`Unable to load spatial shader: ${response.status}`);
  return response.text();
}

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Unable to allocate WebGL shader.');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? 'Shader compilation failed.');
  }
  return shader;
}

async function mount(root: HTMLElement): Promise<void> {
  if (root.dataset.kdxMounted === 'true') return;
  root.dataset.kdxMounted = 'true';

  const canvas = root.querySelector<HTMLCanvasElement>('[data-kdx-canvas]');
  if (!canvas) return;
  const gl = canvas.getContext('webgl2', { antialias: false, powerPreference: 'high-performance' });
  if (!gl) throw new Error('KODEX Spatial Engine requires WebGL2.');

  const fragmentSource = await loadShader();
  const program = gl.createProgram();
  if (!program) throw new Error('Unable to allocate WebGL program.');
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? 'Program link failed.');
  }
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const names = ['u_time','u_delta','u_resolution','u_pointer','u_audio','u_mode','u_progress','u_intensity','u_reducedMotion','u_seed'];
  const uniform: SpatialUniforms = Object.fromEntries(names.map((name) => [name, gl.getUniformLocation(program, name)]));

  let mode = Number(root.dataset.initialMode ?? 0);
  let progress = mode === 2 ? .9 : .25;
  let targetProgress = progress;
  let pointerX = .5;
  let pointerY = .5;
  let targetX = .5;
  let targetY = .5;
  let last = performance.now();
  let elapsed = 0;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.querySelectorAll<HTMLButtonElement>('[data-kdx-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      mode = Number(button.dataset.kdxMode ?? 0);
      targetProgress = mode === 2 ? .9 : .25;
    });
  });
  root.querySelector<HTMLButtonElement>('[data-kdx-activate]')?.addEventListener('click', () => {
    targetProgress = targetProgress > .8 ? .2 : 1;
    root.dispatchEvent(new CustomEvent('kodex:spatial-activate', { bubbles: true, detail: { mode } }));
  });
  root.addEventListener('pointermove', (event) => {
    const rect = root.getBoundingClientRect();
    targetX = (event.clientX - rect.left) / rect.width;
    targetY = 1 - (event.clientY - rect.top) / rect.height;
  }, { passive: true });

  const frame = (now: number): void => {
    const delta = Math.min(.05, (now - last) / 1000);
    last = now;
    if (!reducedMotion) elapsed += delta;
    pointerX += (targetX - pointerX) * .07;
    pointerY += (targetY - pointerY) * .07;
    progress += (targetProgress - progress) * .055;

    const dpr = Math.min(devicePixelRatio || 1, innerWidth < 760 ? 1.35 : 1.75);
    const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }

    gl.uniform1f(uniform.u_time, elapsed);
    gl.uniform1f(uniform.u_delta, delta);
    gl.uniform2f(uniform.u_resolution, width, height);
    gl.uniform2f(uniform.u_pointer, pointerX, pointerY);
    gl.uniform3f(uniform.u_audio, .17, .10, .06);
    gl.uniform1f(uniform.u_mode, mode);
    gl.uniform1f(uniform.u_progress, progress);
    gl.uniform1f(uniform.u_intensity, .82);
    gl.uniform1f(uniform.u_reducedMotion, reducedMotion ? 1 : 0);
    gl.uniform1f(uniform.u_seed, .731);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);
}

export function mountKodexSpatialScenes(): void {
  document.querySelectorAll<HTMLElement>('[data-kdx-spatial]').forEach((root) => {
    void mount(root).catch((error) => console.error('[KODEX Spatial Engine]', error));
  });
}
