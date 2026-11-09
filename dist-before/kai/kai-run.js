/**
 * Kai — "El corredor" (runner mini-game, Chrome-dino style).
 * 2026-07-12.
 *
 * WHAT THIS IS
 *   A tiny side-scrolling runner: Kai runs, obstacles come in from the right
 *   (araucarias, rocks, crystal shards — pixel-art, gold/bronze on obsidian),
 *   you jump. Speed ramps up, score counts up, best score is remembered.
 *
 * WHERE IT LIVES
 *   In the SEARCH MODAL. It is a SECRET: nothing ever announces it and it never
 *   appears on its own. You have to TOUCH KAI — a plain tap/click on the search
 *   sprite (#search-kai-canvas) and he starts running, right there. The
 *   mount/unmount is owned by kai-home.js (hookSearchRunner), which lazily
 *   <script>-loads THIS file the first time anyone actually pokes him. No .astro
 *   file was touched — the whole thing is attached at runtime from public/.
 *
 * NO INSTRUCTIONS, ON PURPOSE (owner decision 2026-07-12)
 *   There is no overlay, no Play button, no "press space to jump" hint and no
 *   game-over card. Kai simply runs. You discover the jump by trying. The only
 *   thing ever drawn on top of the board is the score — the bare number, no
 *   label. A secret you have to be told how to play is not a secret.
 *
 * WHY IT LIVES IN public/
 *   Files under public/ are copied verbatim; Astro never compiles them, so this
 *   cannot break `npm run build`.
 *
 * SPRITES
 *   Reuses the existing pixel-art frames (public/kai/*.png — the very same PNGs
 *   the sprite engine kai-anim.js uses, so they're already in the browser cache
 *   by the time anyone plays). It does NOT reuse the kai-anim.js engine itself:
 *   that engine owns its own canvas + rAF loop + idle/sleep AI, which is the
 *   opposite of what a game loop needs. Here Kai is composited into the game's
 *   own canvas, one frame per tick. kai-anim.js is untouched.
 *     run cycle → corre / camina   ·  airborne → salta
 *     ready     → quieto           ·  game over → piensa
 *   (+ the matching *_blink frames, used for the occasional blink.)
 *
 * COST
 *   Zero until someone actually touches Kai in the search modal. Then: one rAF
 *   loop capped at 60fps, paused on hidden tab, destroyed the moment the search
 *   has results again or the modal closes.
 *
 * ACCESSIBILITY
 *   · Jump: click/tap anywhere on the board, or Space / ↑. Space is NEVER stolen
 *     from the text field — while focus is in the search input only ↑ jumps;
 *     the game moves focus to the canvas on start, and from there Space works.
 *   · Nothing autoplays without a gesture: the game only exists because someone
 *     deliberately pressed Kai. From that press on, it runs.
 *   · aria-live status (visually hidden) announces the run, every 100 points and
 *     the game over — the screen-reader user is told; the screen says nothing.
 *   · Esc is never swallowed: it bubbles up and closes the search modal.
 *   · prefers-reduced-motion: no parallax (stars/ridge stand still).
 *
 * API
 *   var ctl = window.kaiRun.mount(hostEl);   // builds its UI inside hostEl
 *   ctl.destroy();                           // stops the loop, removes listeners
 */
(function () {
  'use strict';

  if (window.kaiRun) return;

  var BASE = '/kai/';
  var REF_W = 52, REF_H = 47; // all poses are registered on the same 52×47 box
  var FRAMES = [
    'quieto', 'quieto_blink',
    'camina', 'camina_blink',
    'corre', 'corre_blink',
    'salta', 'salta_blink',
    'piensa', 'piensa_blink'
  ];

  // ── Palette (brand tokens, hard-coded here because a <canvas> can't read CSS
  //    custom properties). Dark ritual: gold/ember + bronze on obsidian. ──────
  var C = {
    gold: '#c9a84c',
    goldDim: '#8a6a2f',
    bronze: '#6a4a28',
    dark: '#2a1d0f',
    bone: '#f0ede8',
    violet: '#9b8ac9',
    violetLo: '#6b5a94',
    violetHi: '#d6cbf0'
  };

  // ── Obstacles — hand-drawn pixel maps ('.' = transparent). ────────────────
  // Rendered once into an offscreen canvas per mount (buildSprite) and then
  // blitted, so a full screen of obstacles costs 3 drawImage calls, not 600
  // fillRects.
  var TREE = [ // araucaria — 11 × 20 cells
    '.....g.....',
    '....ggg....',
    '....gdg....',
    '...ggggg...',
    '...gdgdg...',
    '..ggggggg..',
    '..gdgdgdg..',
    '.ggggggggg.',
    '.gdgdgdgdg.',
    '....ggg....',
    '...ggggg...',
    '..ggggggg..',
    '.ggggggggg.',
    'ggggggggggg',
    'gdgdgdgdgdg',
    '....ddd....',
    '....dkd....',
    '....ddd....',
    '...ddddd...',
    '..dd...dd..'
  ];
  var ROCK = [ // 14 × 11 cells
    '.....gggg.....',
    '...ggbbbbgg...',
    '..gbbbbbbbbg..',
    '.gbbbkkbbbbbg.',
    '.gbbkkbbbbbbg.',
    'gbbbbbbbbbbbbg',
    'gbbbbbkbbbbbbg',
    'gbbbbbbbbbbbbg',
    'gbkbbbbbbbkbbg',
    'kbbbbbbbbbbbbk',
    '.kkkkkkkkkkkk.'
  ];
  var XTAL = [ // crystal shard — 8 × 17 cells
    '...ww...',
    '..wwvv..',
    '..wvvv..',
    '.wwvvvp.',
    '.wvvvvp.',
    '.wvvvvp.',
    'wwvvvvpp',
    'wvvvvvpp',
    'wvvvvvpp',
    'wvvvvvpp',
    'wvvvvvpp',
    '.wvvvvp.',
    '.wvvvvp.',
    '.wvvvpp.',
    '..gvvg..',
    '..gggg..',
    '.gg..gg.'
  ];

  var LEG_TREE = { g: C.gold, d: C.bronze, k: C.dark };
  var LEG_ROCK = { g: C.goldDim, b: C.bronze, k: C.dark };
  var LEG_XTAL = { w: C.violetHi, v: C.violet, p: C.violetLo, g: C.gold };

  // hit  = fraction of the drawn WIDTH used as the hitbox (centered) — the
  //        silhouettes are spiky, the collision must be forgiving.
  // hitH = fraction of the drawn HEIGHT used as the hitbox (measured up from
  //        the ground), so the very tip of a tree never kills you.
  var KINDS = [
    { id: 'tree', map: TREE, leg: LEG_TREE, s: 2.0, hit: 0.62, hitH: 0.88, w: 0, h: 0 },
    { id: 'treeBig', map: TREE, leg: LEG_TREE, s: 2.5, hit: 0.62, hitH: 0.88, w: 0, h: 0 },
    { id: 'rock', map: ROCK, leg: LEG_ROCK, s: 1.9, hit: 0.86, hitH: 0.92, w: 0, h: 0 },
    { id: 'crystal', map: XTAL, leg: LEG_XTAL, s: 2.1, hit: 0.66, hitH: 0.90, w: 0, h: 0 }
  ];
  for (var ki = 0; ki < KINDS.length; ki++) {
    KINDS[ki].w = KINDS[ki].map[0].length * KINDS[ki].s;
    KINDS[ki].h = KINDS[ki].map.length * KINDS[ki].s;
  }

  // ── Physics ───────────────────────────────────────────────────────────────
  var GRAV = 2100;       // px/s²
  var SPEED0 = 235;      // px/s at the start
  var SPEED_MAX = 560;   // px/s ceiling
  var RAMP = 0.035;      // px/s of extra speed per px travelled
  var SCORE_DIV = 14;    // px per point
  var BEST_KEY = 'wmKaiRunBest';

  // ── Shared frame cache ────────────────────────────────────────────────────
  var cache = {};
  var loadPromise = null;
  function loadFrames() {
    if (loadPromise) return loadPromise;
    loadPromise = new Promise(function (resolve) {
      var left = FRAMES.length;
      if (!left) { resolve(cache); return; }
      FRAMES.forEach(function (n) {
        var im = new Image();
        // Cache on BOTH load and error: a broken image is still a live Image
        // object, and drawImage() of a 0×0 image is a silent no-op — a missing
        // PNG must never take the game down.
        im.onload = im.onerror = function () {
          cache[n] = im;
          if (--left === 0) resolve(cache);
        };
        im.src = BASE + n + '.png';
      });
    });
    return loadPromise;
  }

  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function buildSprite(kind, dpr) {
    var map = kind.map, s = kind.s;
    var rows = map.length, cols = map[0].length;
    var cv = document.createElement('canvas');
    cv.width = Math.max(1, Math.round(kind.w * dpr));
    cv.height = Math.max(1, Math.round(kind.h * dpr));
    var c = cv.getContext('2d');
    if (!c) return null;
    c.imageSmoothingEnabled = false;
    c.scale(dpr, dpr);
    for (var r = 0; r < rows; r++) {
      var row = map[r];
      for (var i = 0; i < cols; i++) {
        var ch = row.charAt(i);
        if (ch === '.') continue;
        var col = kind.leg[ch];
        if (!col) continue;
        c.fillStyle = col;
        // +0.03 so fractional cell sizes never leave hairline gaps between
        // two neighbouring cells of the same colour.
        c.fillRect(i * s, r * s, s + 0.03, s + 0.03);
      }
    }
    return cv;
  }

  // ── Styles (injected once) ────────────────────────────────────────────────
  // Inline on purpose: the game mounts the instant Kai is touched, and a lazily
  // linked stylesheet would let it paint unstyled for a frame.
  //
  // There is exactly ONE thing layered over the board: the score. No overlay, no
  // button, no hint, no game-over card — see the header.
  var STYLE_ID = 'kai-run-style';
  var CSS = [
    '[data-kai-run-host]{display:flex;flex-direction:column;align-items:center;justify-content:center;',
    'flex:1 1 auto;min-height:0;padding:2px 16px 18px;box-sizing:border-box;}',

    '.kairun{width:100%;max-width:560px;display:flex;flex-direction:column;gap:8px;}',

    '.kairun__frame{position:relative;width:100%;height:172px;overflow:hidden;border-radius:14px;',
    'border:1px solid rgba(201,168,76,.22);transition:border-color .3s ease;',
    'background:radial-gradient(130% 120% at 50% 100%,#181206 0%,#0d0b07 55%,#0a0a0a 100%);}',

    '.kairun__canvas{display:block;width:100%;height:100%;image-rendering:pixelated;',
    'image-rendering:crisp-edges;touch-action:manipulation;cursor:pointer;outline:none;',
    '-webkit-user-select:none;user-select:none;}',
    '.kairun__canvas:focus-visible{box-shadow:inset 0 0 0 2px var(--ember,#c9a84c);}',

    // The score. Just the number — no "SCORE", no "HI", nothing to read.
    '.kairun__hud{position:absolute;top:9px;right:11px;pointer-events:none;',
    'font-family:"Press Start 2P",ui-monospace,SFMono-Regular,monospace;font-size:8px;',
    'letter-spacing:1px;line-height:1;color:var(--sand,#9a948a);',
    'transition:color .3s ease,opacity .3s ease;}',

    // Kai tripped. The only feedback is wordless: the board's edge and the final
    // number warm up to ember. Tap (or Space) and he's off again.
    '.kairun__frame.is-over{border-color:rgba(201,168,76,.42);}',
    '.kairun__frame.is-over .kairun__hud{color:var(--ember,#c9a84c);}',

    '.kairun__sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;',
    'clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0;}',

    '@media (max-width:600px){',
    '.kairun__frame{height:144px;}',
    '}',

    '@media (prefers-reduced-motion:reduce){',
    '.kairun__frame,.kairun__hud{transition:none;}',
    '}'
  ].join('');

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var st = document.createElement('style');
    st.id = STYLE_ID;
    st.appendChild(document.createTextNode(CSS));
    document.head.appendChild(st);
  }

  function pad(n) {
    var s = String(Math.max(0, Math.floor(n)));
    while (s.length < 4) s = '0' + s;
    return s;
  }

  function readBest() {
    var v = 0;
    try { v = parseInt(localStorage.getItem(BEST_KEY) || '0', 10); } catch (e) { v = 0; }
    return isNaN(v) || v < 0 ? 0 : v;
  }
  function writeBest(v) {
    try { localStorage.setItem(BEST_KEY, String(Math.floor(v))); } catch (e) { /* private mode */ }
  }

  // ── The game ──────────────────────────────────────────────────────────────
  function mount(host) {
    var dead = { destroy: function () {} };
    if (!host || !host.appendChild) return dead;

    ensureStyle();

    var reduced = reducedMotion();

    var root = document.createElement('div');
    root.className = 'kairun';
    // The aria-label is the ONE place the controls are ever spelled out — it is
    // read by screen readers and shown to nobody. Everyone else finds the jump
    // the way you find a jump: by pressing something.
    root.innerHTML =
      '<div class="kairun__frame">' +
        '<canvas class="kairun__canvas" tabindex="0" role="application" ' +
          'aria-label="Kai runner mini game. Press Space or Arrow Up to jump."></canvas>' +
        '<div class="kairun__hud" aria-hidden="true"><span data-score>0000</span></div>' +
      '</div>' +
      '<p class="kairun__sr" data-sr role="status" aria-live="polite"></p>';

    host.appendChild(root);

    var frame = root.querySelector('.kairun__frame');
    var canvas = root.querySelector('.kairun__canvas');
    var scoreEl = root.querySelector('[data-score]');
    var srEl = root.querySelector('[data-sr]');

    var ctx = canvas.getContext ? canvas.getContext('2d') : null;
    if (!ctx) {
      if (root.parentNode) root.parentNode.removeChild(root);
      return dead;
    }

    // ── mutable state ───────────────────────────────────────────────────────
    var destroyed = false;
    var paused = false;
    var loaded = false;
    var state = 'ready';       // 'ready' | 'running' | 'over'
    var W = 0, H = 0;          // logical (CSS px) size of the canvas
    var dpr = 1;
    var spriteDpr = 0;         // dpr the obstacle sprites were baked at
    var sprites = {};          // kind.id -> offscreen canvas
    var groundY = 0;
    var kaiX = 46, kaiW = 60, kaiH = 54;
    var jumpV = 560;
    var jumpH = 84;
    var ky = 0, vy = 0;        // vertical offset (≤0 = airborne) + velocity
    var grounded = true;
    var speed = SPEED0;
    var dist = 0;
    var score = 0, shownScore = -1;
    var best = readBest();
    var obstacles = [];
    var nextSpawn = 0;
    var stars = [], speckles = [];
    var ridgeX = 0;
    var t = 0;                 // seconds since mount (blinking, twinkle)
    var blinkAt = 2.4, blinkFor = 0;
    var overAt = 0;
    var milestone = 0;
    var raf = null, lastTs = 0;
    var ro = null;

    var FRAME_MS = 1000 / 61;  // cap the paint at ~60fps (120Hz screens skip)

    // `best` is still kept and still persisted in wmKaiRunBest — it is simply
    // never printed on the board any more (no "HI" label to explain).

    function say(text) {
      if (srEl) srEl.textContent = text;
    }

    // ── layout ──────────────────────────────────────────────────────────────
    function resize() {
      var rect = frame.getBoundingClientRect();
      var w = Math.max(200, Math.round(rect.width));
      var h = Math.max(110, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      W = w; H = h;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = false;

      groundY = Math.round(H - Math.max(20, H * 0.15));
      kaiH = Math.max(38, Math.min(56, Math.round(H * 0.34)));
      kaiW = Math.round(kaiH * (REF_W / REF_H));
      kaiX = Math.round(Math.max(38, W * 0.13));

      // Jump just high enough to clear the tallest thing that can spawn, and
      // never so high that Kai leaves the frame on a short canvas.
      var headroom = Math.max(44, groundY - kaiH - 6);
      jumpH = Math.min(86, headroom);
      jumpV = Math.sqrt(2 * GRAV * jumpH);

      if (spriteDpr !== dpr) {
        sprites = {};
        for (var i = 0; i < KINDS.length; i++) {
          sprites[KINDS[i].id] = buildSprite(KINDS[i], dpr);
        }
        spriteDpr = dpr;
      }

      seedScenery();
      render();
    }

    function seedScenery() {
      stars = [];
      var n = Math.max(8, Math.round(W / 22));
      for (var i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * (groundY - 24),
          r: Math.random() < 0.78 ? 1 : 2,
          f: Math.random() < 0.5 ? 0.12 : 0.3,           // parallax factor
          a: 0.16 + Math.random() * 0.4,
          p: Math.random() * Math.PI * 2                 // twinkle phase
        });
      }
      speckles = [];
      var m = Math.max(6, Math.round(W / 34));
      for (var j = 0; j < m; j++) {
        speckles.push({
          x: Math.random() * W,
          y: 3 + Math.random() * Math.max(4, (H - groundY) - 8),
          len: 2 + Math.round(Math.random() * 6)
        });
      }
    }

    // ── game flow ───────────────────────────────────────────────────────────
    function reset() {
      obstacles = [];
      speed = SPEED0;
      dist = 0;
      score = 0;
      shownScore = -1;
      milestone = 0;
      ky = 0;
      vy = 0;
      grounded = true;
      nextSpawn = 260 + Math.random() * 160;
      ridgeX = 0;
      scoreEl.textContent = pad(0);
    }

    // Called on mount (the touch on Kai IS the start gesture) and on every
    // restart after a fall. Focus moves to the board so that Space — which
    // belongs to the search field until now — becomes the jump key.
    function start() {
      if (destroyed || !loaded) return;
      reset();
      state = 'running';
      frame.classList.remove('is-over');
      try { canvas.focus({ preventScroll: true }); } catch (e) { try { canvas.focus(); } catch (e2) { /* ok */ } }
      say('Kai is running. Press space or arrow up to jump.');
      kick();
    }

    // No card, no words: Kai trips ('piensa' pose), the board's edge warms up and
    // the final number stays on screen. Any tap / Space and he runs again.
    function gameOver() {
      state = 'over';
      overAt = t;
      if (score > best) {
        best = score;
        writeBest(best);
      }
      frame.classList.add('is-over');
      say('Game over. Score ' + score + '. Best ' + best + '. Press space to run again.');
    }

    function jump() {
      if (destroyed || !loaded) return;
      if (state === 'ready') { start(); return; }
      if (state === 'over') {
        // Swallow the very input that crashed him — otherwise the same tap that
        // killed Kai instantly restarts the run.
        if (t - overAt < 0.4) return;
        start();
        return;
      }
      if (state === 'running' && grounded) {
        vy = -jumpV;
        grounded = false;
      }
    }

    function spawn() {
      var pool = [];
      for (var i = 0; i < KINDS.length; i++) {
        // Never spawn something Kai physically cannot jump over on this canvas.
        if (KINDS[i].h * KINDS[i].hitH < jumpH - 8) pool.push(KINDS[i]);
      }
      if (!pool.length) pool = [KINDS[2]]; // the rock is the low one
      var k = pool[Math.floor(Math.random() * pool.length)];
      obstacles.push({ k: k, x: W + 12, w: k.w, h: k.h });
    }

    function hits(o) {
      var kx1 = kaiX - kaiW * 0.20;
      var kx2 = kaiX + kaiW * 0.20;
      var ky1 = groundY + ky - kaiH * 0.82;
      var ky2 = groundY + ky;
      var ow = o.w * o.k.hit;
      var ox1 = o.x + (o.w - ow) / 2;
      var ox2 = ox1 + ow;
      var oy1 = groundY - o.h * o.k.hitH;
      var oy2 = groundY;
      return kx1 < ox2 && kx2 > ox1 && ky1 < oy2 && ky2 > oy1;
    }

    function update(dt) {
      dist += speed * dt;
      speed = Math.min(SPEED_MAX, SPEED0 + dist * RAMP);

      // Kai
      if (!grounded) {
        vy += GRAV * dt;
        ky += vy * dt;
        if (ky >= 0) { ky = 0; vy = 0; grounded = true; }
      }

      // obstacles
      if (dist >= nextSpawn) {
        spawn();
        var minGap = speed * 0.62 + 95;
        var maxGap = speed * 1.45 + 170;
        nextSpawn = dist + minGap + Math.random() * (maxGap - minGap);
      }
      for (var i = obstacles.length - 1; i >= 0; i--) {
        var o = obstacles[i];
        o.x -= speed * dt;
        if (o.x + o.w < -30) { obstacles.splice(i, 1); continue; }
        if (hits(o)) { gameOver(); return; }
      }

      // scenery
      if (!reduced) {
        ridgeX += speed * 0.10 * dt;
        for (var s = 0; s < stars.length; s++) {
          var st = stars[s];
          st.x -= speed * st.f * dt;
          if (st.x < -3) {
            st.x = W + Math.random() * 20;
            st.y = Math.random() * (groundY - 24);
          }
        }
      }
      for (var p = 0; p < speckles.length; p++) {
        var sp = speckles[p];
        sp.x -= speed * dt;
        if (sp.x + sp.len < 0) {
          sp.x = W + Math.random() * 60;
          sp.y = 3 + Math.random() * Math.max(4, (H - groundY) - 8);
          sp.len = 2 + Math.round(Math.random() * 6);
        }
      }

      // score
      score = Math.floor(dist / SCORE_DIV);
      if (score !== shownScore) {
        shownScore = score;
        scoreEl.textContent = pad(score);
      }
      if (score >= milestone + 100) {
        milestone = Math.floor(score / 100) * 100;
        say('Score ' + milestone);
      }
    }

    // ── painting ────────────────────────────────────────────────────────────
    function drawStars() {
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var tw = reduced ? 1 : (0.72 + 0.28 * Math.sin(t * 1.6 + s.p));
        ctx.globalAlpha = Math.max(0, Math.min(1, s.a * tw));
        ctx.fillStyle = s.r > 1 ? C.bone : '#cfc9bd';
        ctx.fillRect(Math.round(s.x), Math.round(s.y), s.r, s.r);
      }
      ctx.globalAlpha = 1;
    }

    function drawRidge() {
      var base = groundY - 4;
      ctx.fillStyle = 'rgba(106,74,40,0.20)';
      for (var x = 0; x < W; x += 3) {
        var wx = x + ridgeX;
        var h = 9 + Math.sin(wx / 47) * 5 + Math.sin(wx / 19 + 1.7) * 3.4 + Math.sin(wx / 7.3) * 1.4;
        ctx.fillRect(x, base - h, 3, h + 8);
      }
    }

    function drawGround() {
      ctx.fillStyle = 'rgba(201,168,76,0.30)';
      ctx.fillRect(0, groundY, W, 1);
      ctx.fillStyle = 'rgba(201,168,76,0.16)';
      for (var i = 0; i < speckles.length; i++) {
        var s = speckles[i];
        ctx.fillRect(Math.round(s.x), Math.round(groundY + s.y), s.len, 1);
      }
    }

    function drawObstacles() {
      for (var i = 0; i < obstacles.length; i++) {
        var o = obstacles[i];
        var sp = sprites[o.k.id];
        if (!sp) continue;
        ctx.drawImage(sp, Math.round(o.x), Math.round(groundY - o.h), Math.round(o.w), Math.round(o.h));
      }
    }

    function kaiFrame() {
      var name;
      if (state === 'over') name = 'piensa';
      else if (state === 'ready') name = 'quieto';
      else if (!grounded) name = 'salta';
      else name = (Math.floor(dist / 26) % 2 === 0) ? 'corre' : 'camina';

      if (blinkFor > 0 && cache[name + '_blink']) name = name + '_blink';
      return cache[name] || cache.quieto;
    }

    function drawKai() {
      // contact shadow — fades out as he rises
      var lift = Math.max(0, Math.min(1, (-ky) / 90));
      ctx.save();
      ctx.globalAlpha = 0.55 * (1 - lift) + 0.08;
      ctx.translate(kaiX, groundY + 2);
      ctx.scale(1, 0.18);
      var g = ctx.createRadialGradient(0, 0, 0, 0, 0, kaiW * 0.44);
      g.addColorStop(0, 'rgba(8,11,22,0.75)');
      g.addColorStop(0.55, 'rgba(8,11,22,0.32)');
      g.addColorStop(1, 'rgba(8,11,22,0)');
      ctx.beginPath();
      ctx.arc(0, 0, kaiW * 0.44, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.restore();

      var im = kaiFrame();
      if (im && im.width) {
        ctx.drawImage(
          im,
          Math.round(kaiX - kaiW / 2),
          Math.round(groundY + ky - kaiH),
          kaiW,
          kaiH
        );
      }
    }

    function render() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H); // transparent — the CSS gradient IS the sky
      drawStars();
      drawRidge();
      drawGround();
      drawObstacles();
      drawKai();
    }

    // ── loop ────────────────────────────────────────────────────────────────
    function loop(ts) {
      if (destroyed || paused) { raf = null; return; }
      raf = window.requestAnimationFrame(loop);

      var now = typeof ts === 'number' ? ts : performance.now();
      if (!lastTs) { lastTs = now; return; }
      var elapsed = now - lastTs;
      if (elapsed < FRAME_MS) return;   // fps cap
      lastTs = now;

      var dt = elapsed / 1000;
      if (dt > 0.05) dt = 0.05;         // a hiccup must not teleport Kai into a tree
      t += dt;

      // blink
      if (blinkFor > 0) {
        blinkFor -= dt;
      } else if (t > blinkAt) {
        blinkFor = 0.15;
        blinkAt = t + 2.4 + Math.random() * 3.2;
      }

      if (state === 'running') update(dt);
      render();

      // Once the game-over scene has settled, stop the loop entirely — a frozen
      // board doesn't need 60 repaints a second. start() calls kick() again.
      if (state === 'over' && t - overAt > 1.5 && raf) {
        window.cancelAnimationFrame(raf);
        raf = null;
      }
    }

    // The ONLY way the loop is ever (re)started. Guarding on `raf` is what keeps
    // a second rAF chain from being spawned on top of a live one — two chains
    // would tick the game twice per frame (Kai at double speed, unwinnable).
    function kick() {
      if (destroyed || paused || raf) return;
      lastTs = 0;
      raf = window.requestAnimationFrame(loop);
    }
    var wasLooping = false;
    function pause() {
      if (paused) return;
      paused = true;
      wasLooping = !!raf;
      if (raf) { window.cancelAnimationFrame(raf); raf = null; }
    }
    function resume() {
      if (destroyed || !paused) return;
      paused = false;
      // Don't let the wall clock that kept running while the tab was hidden
      // arrive as one giant dt — kick() re-bases lastTs.
      if (wasLooping) kick();
    }
    function onVis() {
      if (document.hidden) pause();
      else resume();
    }

    // ── input ───────────────────────────────────────────────────────────────
    function isEditable(el) {
      if (!el) return false;
      var tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable === true;
    }

    function onKey(e) {
      if (destroyed) return;
      if (e.altKey || e.metaKey || e.ctrlKey) return;
      var k = e.key;
      var isSpace = (k === ' ' || k === 'Spacebar' || k === 'Space');
      var isUp = (k === 'ArrowUp' || k === 'Up');
      var isEnter = (k === 'Enter');

      if (!isSpace && !isUp && !isEnter) return;   // Esc & co. bubble on, untouched
      if (isEnter && e.target !== canvas) return;  // never hijack Enter from the input
      if (isSpace && isEditable(e.target)) return; // the space bar always belongs to the text field
      // ↑ also jumps from inside the search input: it does nothing there while the
      // board is up (the modal only uses it to walk the result list, and if there
      // were results the game would already be gone). start() moves focus to the
      // canvas anyway, so from the very first frame Space works like everywhere.

      e.preventDefault();  // no page scroll, no caret jump
      jump();
    }

    // A press anywhere on the board jumps. There is nothing else on the board to
    // press, so there is nothing to disambiguate.
    function onPointer(e) {
      if (destroyed) return;
      e.preventDefault();
      jump();
    }

    frame.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onVis);

    if (typeof ResizeObserver === 'function') {
      ro = new ResizeObserver(function () {
        if (!destroyed) resize();
      });
      ro.observe(frame);
    } else {
      window.addEventListener('resize', resize);
    }

    // ── go ──────────────────────────────────────────────────────────────────
    loadFrames().then(function () {
      if (destroyed) return;
      loaded = true;
      resize();
      // He runs. No Play button, no "shall we run?" — the user already made the
      // gesture that brought him here (they pressed him), and the mount only
      // ever happens because of that gesture. Making them press a second button
      // would be the game explaining itself.
      start();
    });

    // First paint before the sprites land, so the frame is never a black hole.
    resize();

    return {
      destroy: function () {
        if (destroyed) return;
        destroyed = true;
        if (raf) { window.cancelAnimationFrame(raf); raf = null; }
        if (ro) { ro.disconnect(); ro = null; }
        else window.removeEventListener('resize', resize);
        document.removeEventListener('keydown', onKey);
        document.removeEventListener('visibilitychange', onVis);
        frame.removeEventListener('pointerdown', onPointer);
        if (root.parentNode) root.parentNode.removeChild(root);
      },
      isPlaying: function () { return state === 'running'; }
    };
  }

  window.kaiRun = { mount: mount };
})();
