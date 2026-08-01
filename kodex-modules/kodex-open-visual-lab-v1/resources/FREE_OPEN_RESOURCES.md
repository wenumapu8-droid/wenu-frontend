# KODEX — Free/Open Resource Matrix

Checked: **2026-07-30**

> A public GitHub repository is not automatically reusable. Use only code/assets with an explicit compatible license.

| Category | Resource | License / status | KODEX use | Risk |
|---|---|---|---|---|
| Shader editor | [KodeLife](https://hexler.net/kodelife) | Proprietary application | Prototype shaders and export code; do not make the website depend on KodeLife. | LOW for original shaders; not open source. |
| Shader learning | [The Book of Shaders](https://thebookofshaders.com/) | Repository-specific license; read before copying substantial code. | Learning and mechanism research. | MEDIUM if copying; LOW if learning. |
| Shader runtime | [glslCanvas](https://github.com/patriciogonzalezvivo/glslCanvas) | MIT | Fast prototypes and documentation embeds. | LOW |
| Live visuals | [Hydra](https://hydra.ojack.xyz/) | AGPL-3.0 | Explore motion recipes; avoid bundling without deliberate AGPL review. | MEDIUM/HIGH for product embedding; LOW for standalone experimentation. |
| ASCII / textmode | [textmode.js](https://code.textmode.art/) | MIT; bundled default font reported as CC0. | Best external option for advanced ASCII scenes. | LOW |
| ASCII / 3D | [Three.js AsciiEffect](https://threejs.org/docs/pages/AsciiEffect.html) | Three.js project license applies; verify current repository notice. | Useful when KODEX uses actual Three.js geometry. | LOW after license verification. |
| ASCII editor | [Moebius](https://blocktronics.github.io/moebius/) | Apache-2.0 | Author static ANSI panels, sigils and terminal illustrations. | LOW |
| ASCII banner | [FIGlet](https://www.figlet.org/) | BSD-style project license; individual FIGlet fonts may have their own terms. | Generate terminal titles; the included KODEX generator avoids external fonts. | MEDIUM for third-party font packs. |
| Shader examples | [Keijiro ShaderSketches](https://github.com/keijiro/ShaderSketches) | Code Unlicense; GIFs CC BY 4.0. | Study concise mechanisms; rebuild with KODEX composition. | LOW for code; attribution required for GIFs. |
| Fluid simulation | [WebGL Fluid Simulation](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation) | MIT | Advanced liquid mode after the lighter procedural acid shader in this pack. | LOW legal; MEDIUM performance complexity. |
| WebGL helper | [TWGL.js](https://twgljs.org/) | MIT | Alternative to the zero-dependency runtime included here. | LOW |
| WebGL helper | [regl](https://regl-project.github.io/) | MIT | Good for data-driven GPU modules; less ideal if WebGL2-only features dominate. | LOW |
| Creative coding | [p5.js](https://p5js.org/) | Open source; verify current repository license and dependency obligations. | Sketching and workshops; not required for final KODEX runtime. | LOW/MEDIUM depending on distribution model. |
| Audio reactive | [Tone.js](https://github.com/Tonejs/Tone.js) | MIT | Use only if KODEX needs transport/synthesis; raw Web Audio is enough for FFT input. | LOW |
| CRT shader | [CRT-Lottes](https://github.com/libretro/glsl-shaders/blob/master/crt/shaders/crt-lottes.glsl) | Original shader is described as public domain by multiple ports. | Reference for advanced CRT; this pack contains an original lightweight CRT shader. | LOW after verifying the exact source file. |
| Terminal shaders | [windows-terminal-shaders](https://github.com/Hammster/windows-terminal-shaders) | Repository displays CC0-1.0; README documents unresolved provenance around some Retro.hlsl-derived changes. | Study controls and terminology, not blind copy/paste. | MEDIUM |
| Shader community | [Shadertoy](https://www.shadertoy.com/) | Per-shader license; unmarked shaders are not automatically commercially safe. | Inspiration and learning only unless license is explicit. | HIGH for copied shaders. |
| Code playground | [CodePen](https://codepen.io/) | Public Pens are MIT licensed; private Pens have no implicit license. | Search for small UI/Canvas mechanisms, not complete identity systems. | LOW for public code with preserved notice. |
| Textures | [ambientCG](https://ambientcg.com/) | CC0 | Paper, dust, concrete and surface masks—optimize before web use. | LOW |
| Textures / HDRI / models | [Poly Haven](https://polyhaven.com/) | CC0 | Use selectively for 3D artifacts and environmental lighting. | LOW |
| Open media search | [Openverse](https://openverse.org/) | Search engine; each result retains its own license. | Find archival/scientific source material with traceable provenance. | MEDIUM |

## Safest starting pool

- Original code in this ZIP — MIT.
- `glslCanvas` — MIT.
- `textmode.js` — MIT.
- Keijiro ShaderSketches code — Unlicense.
- WebGL Fluid Simulation — MIT.
- Moebius — Apache-2.0.
- ambientCG / Poly Haven — CC0.

## Caution pool

- Shadertoy: verify each shader; do not assume commercial permission.
- Hydra: AGPL-3.0 can affect how a modified/embedded service must publish source.
- Windows terminal shader collections: verify provenance per file.
- FIGlet fonts: the program and individual fonts can have different licenses.
- Openverse results: every asset can carry a different Creative Commons license.