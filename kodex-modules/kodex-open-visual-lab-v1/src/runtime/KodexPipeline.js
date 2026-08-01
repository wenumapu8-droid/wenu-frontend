const DEFAULT_VERTEX_PATH = "./src/shaders/fullscreen.vert";
const DEFAULT_POST_PATH = "./src/shaders/post-kodex.frag";

function assertWebGL2(canvas) {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: true,
    powerPreference: "high-performance",
  });

  if (!gl) {
    throw new Error("WebGL2 is required for KODEX Open Visual Lab.");
  }

  return gl;
}

async function loadText(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }
  return response.text();
}

function compileShader(gl, type, source, label) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`${label} shader compilation failed:\n${log}`);
  }

  return shader;
}

function createProgram(gl, vertexSource, fragmentSource, label) {
  const vertex = compileShader(
    gl,
    gl.VERTEX_SHADER,
    vertexSource,
    `${label} vertex`,
  );
  const fragment = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentSource,
    `${label} fragment`,
  );

  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);

  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`${label} program link failed:\n${log}`);
  }

  return program;
}

function createTexture(gl, width, height) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA8,
    width,
    height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null,
  );

  return texture;
}

function createTarget(gl, width, height) {
  const texture = createTexture(gl, width, height);
  const framebuffer = gl.createFramebuffer();

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0,
  );

  if (
    gl.checkFramebufferStatus(gl.FRAMEBUFFER)
    !== gl.FRAMEBUFFER_COMPLETE
  ) {
    throw new Error("KODEX framebuffer is incomplete.");
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { texture, framebuffer, width, height };
}

function destroyTarget(gl, target) {
  if (!target) return;
  gl.deleteTexture(target.texture);
  gl.deleteFramebuffer(target.framebuffer);
}

function uniform(gl, program, name) {
  return gl.getUniformLocation(program, name);
}

export class KodexPipeline {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.gl = assertWebGL2(canvas);
    this.sceneProgram = null;
    this.postProgram = null;
    this.vertexSource = "";
    this.postSource = "";
    this.targets = [];
    this.readIndex = 0;
    this.pointer = [0.5, 0.5];
    this.audio = [0.08, 0.04, 0.02];
    this.time = 0;
    this.lastTime = 0;
    this.seed = Math.random() * 1000;
    this.running = false;
    this.frame = 0;
    this.dprCap = options.dprCap ?? 1.5;

    this.parameters = {
      feedback: 0.16,
      intensity: 1.0,
      crt: 0.72,
      ascii: 0.0,
      asciiCell: 12.0,
      dither: 0.16,
      grain: 0.035,
      rgbSplit: 1.2,
      vignette: 0.58,
      accent: [1.0, 0.03, 0.08],
      speed: 1.0,
    };

    this.handlePointer = (event) => {
      const rect = this.canvas.getBoundingClientRect();
      this.pointer[0] = Math.min(
        1,
        Math.max(0, (event.clientX - rect.left) / rect.width),
      );
      this.pointer[1] = Math.min(
        1,
        Math.max(0, 1 - (event.clientY - rect.top) / rect.height),
      );
    };

    this.canvas.addEventListener("pointermove", this.handlePointer);
  }

  async initialize(scenePath) {
    const [vertexSource, postSource] = await Promise.all([
      loadText(DEFAULT_VERTEX_PATH),
      loadText(DEFAULT_POST_PATH),
    ]);

    this.vertexSource = vertexSource;
    this.postSource = postSource;
    this.postProgram = createProgram(
      this.gl,
      vertexSource,
      postSource,
      "KODEX post",
    );

    await this.setScene(scenePath);
    this.resize(true);
  }

  async setScene(scenePath) {
    const source = await loadText(scenePath);
    const program = createProgram(
      this.gl,
      this.vertexSource || await loadText(DEFAULT_VERTEX_PATH),
      source,
      scenePath,
    );

    if (this.sceneProgram) {
      this.gl.deleteProgram(this.sceneProgram);
    }

    this.sceneProgram = program;
    this.clearFeedback();
  }

  setParameter(name, value) {
    if (!(name in this.parameters)) {
      throw new Error(`Unknown KODEX parameter: ${name}`);
    }
    this.parameters[name] = value;
  }

  setAccent(hex) {
    const clean = hex.replace("#", "");
    const value = Number.parseInt(clean, 16);

    this.parameters.accent = [
      ((value >> 16) & 255) / 255,
      ((value >> 8) & 255) / 255,
      (value & 255) / 255,
    ];
  }

  setAudio(low, mid, high) {
    this.audio[0] = low;
    this.audio[1] = mid;
    this.audio[2] = high;
  }

  setQuality(value) {
    this.dprCap = Number(value);
    this.resize(true);
  }

  resize(force = false) {
    const dpr = Math.min(
      window.devicePixelRatio || 1,
      this.dprCap,
    );

    const width = Math.max(
      2,
      Math.floor(this.canvas.clientWidth * dpr),
    );
    const height = Math.max(
      2,
      Math.floor(this.canvas.clientHeight * dpr),
    );

    if (
      !force
      && this.canvas.width === width
      && this.canvas.height === height
    ) {
      return;
    }

    this.canvas.width = width;
    this.canvas.height = height;

    this.targets.forEach((target) => {
      destroyTarget(this.gl, target);
    });

    this.targets = [
      createTarget(this.gl, width, height),
      createTarget(this.gl, width, height),
    ];

    this.readIndex = 0;
    this.clearFeedback();
  }

  clearFeedback() {
    if (!this.targets.length) return;

    const gl = this.gl;
    gl.clearColor(0, 0, 0, 1);

    this.targets.forEach((target) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
      gl.viewport(0, 0, target.width, target.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
    });

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  bindTexture(texture, unit, location) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(location, unit);
  }

  setSceneUniforms(program, delta) {
    const gl = this.gl;
    const p = this.parameters;

    const values = {
      u_time: ["1f", this.time],
      u_delta: ["1f", delta],
      u_resolution: [
        "2f",
        this.canvas.width,
        this.canvas.height,
      ],
      u_pointer: ["2f", this.pointer[0], this.pointer[1]],
      u_audio: [
        "3f",
        this.audio[0],
        this.audio[1],
        this.audio[2],
      ],
      u_seed: ["1f", this.seed],
      u_feedback: ["1f", p.feedback],
      u_intensity: ["1f", p.intensity],
    };

    Object.entries(values).forEach(([name, payload]) => {
      const location = uniform(gl, program, name);
      if (location === null) return;
      const [kind, ...args] = payload;
      gl[`uniform${kind}`](location, ...args);
    });
  }

  setPostUniforms(program) {
    const gl = this.gl;
    const p = this.parameters;

    const values = {
      u_resolution: [
        "2f",
        this.canvas.width,
        this.canvas.height,
      ],
      u_time: ["1f", this.time],
      u_crt: ["1f", p.crt],
      u_ascii: ["1f", p.ascii],
      u_asciiCell: ["1f", p.asciiCell],
      u_dither: ["1f", p.dither],
      u_grain: ["1f", p.grain],
      u_rgbSplit: ["1f", p.rgbSplit],
      u_vignette: ["1f", p.vignette],
      u_accent: [
        "3f",
        p.accent[0],
        p.accent[1],
        p.accent[2],
      ],
    };

    Object.entries(values).forEach(([name, payload]) => {
      const location = uniform(gl, program, name);
      if (location === null) return;
      const [kind, ...args] = payload;
      gl[`uniform${kind}`](location, ...args);
    });
  }

  render(timestamp) {
    if (!this.running) return;

    this.resize();

    const gl = this.gl;
    const seconds = timestamp * 0.001;
    const delta = Math.min(
      0.05,
      this.lastTime ? seconds - this.lastTime : 0.016,
    );

    this.lastTime = seconds;
    this.time += delta * this.parameters.speed;

    const read = this.targets[this.readIndex];
    const write = this.targets[1 - this.readIndex];

    gl.bindVertexArray(null);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);

    gl.bindFramebuffer(gl.FRAMEBUFFER, write.framebuffer);
    gl.viewport(0, 0, write.width, write.height);
    gl.useProgram(this.sceneProgram);
    this.setSceneUniforms(this.sceneProgram, delta);

    const previousLocation = uniform(
      gl,
      this.sceneProgram,
      "u_previousFrame",
    );
    if (previousLocation !== null) {
      this.bindTexture(read.texture, 0, previousLocation);
    }

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(this.postProgram);
    this.setPostUniforms(this.postProgram);

    const sourceLocation = uniform(
      gl,
      this.postProgram,
      "u_source",
    );
    this.bindTexture(write.texture, 0, sourceLocation);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    this.readIndex = 1 - this.readIndex;
    this.frame += 1;

    requestAnimationFrame((time) => this.render(time));
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = 0;
    requestAnimationFrame((time) => this.render(time));
  }

  stop() {
    this.running = false;
  }

  destroy() {
    this.stop();
    this.canvas.removeEventListener(
      "pointermove",
      this.handlePointer,
    );

    this.targets.forEach((target) => {
      destroyTarget(this.gl, target);
    });

    if (this.sceneProgram) {
      this.gl.deleteProgram(this.sceneProgram);
    }

    if (this.postProgram) {
      this.gl.deleteProgram(this.postProgram);
    }
  }
}
