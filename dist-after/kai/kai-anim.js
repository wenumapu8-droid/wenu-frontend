/**
 * Kai — frame-animation engine (canvas, pixel-art poses).
 *
 * Replaces the old raster <img> + procedural stretch/squash engine
 * (kai-idle.js, retired 2026-07-11). Kai is a real pixel-art sprite with 12
 * poses (public/kai/*.png), all REGISTERED on the same 52×47 canvas (paws on
 * the baseline, centered by mass) — frames are switched, never stretched, and
 * the draw box is computed ONCE per mount (not per-pose), so swapping poses
 * never jitters. Ported + extended from the reference engine
 * (~/wenu-kai/demo/kai_anim_template.html, kept in sync through the
 * 2026-07-11 revisions: facing, then blink + grounded breathing).
 *
 * Mounted once per surface (menu / search / cart), only while that surface
 * is open — same lifecycle discipline as the old engine.
 *
 * API:
 *   const ctl = window.kaiAnim(canvasEl, {
 *     width, height,       // working size in CSS px == canvas HTML attrs
 *     targetHeight,        // rendered height (px) of the sprite on the ground
 *     groundInset,         // px reserved below the paws for the contact shadow
 *     initial,             // starting state name (default 'idle')
 *     onAmbient(kind),     // 'pet' | 'glance' | 'sleep' | 'wake' — host updates
 *                          // its own caption text; engine only decides WHEN,
 *                          // not WHAT to say
 *     onState(name),       // fired on every state change (optional)
 *   });
 *   ctl.trigger('celebrate');  // force a state (site events: add-to-cart, etc.)
 *   ctl.poke();                // just marks activity (resets the sleep timer)
 *   ctl.destroy();             // stop the rAF loop + remove listeners
 *
 * Facing + breathing (single transform, pivoted at (cx, groundY) — the exact
 * point where Kai's paws touch the ground):
 *   ctx.translate(cx, groundY); ctx.scale(facing*sqX, sqY);
 *   ctx.drawImage(im, -W/2, -H+bob, W, H);
 * facing (±1) turns Kai to face the cursor (tracked GLOBALLY — any page
 * mousemove — so he looks over even from a corner where the pointer isn't
 * hovering him). sqX/sqY are a ~1% volumetric breathing squash-and-stretch in
 * idle/alert (widens slightly while it compresses in height, and vice versa)
 * — anchored at the feet, so it reads as a chest rising, never as a float or
 * bob (that was tried first and read as floating — see history below).
 *
 * Blink: every ~2.4–5.6s, for ~150ms, swaps the current pose for its
 * "<pose>_blink" frame if one exists (public/kai/*_blink.png).
 *
 * Respects prefers-reduced-motion: draws a single static 'quieto' frame,
 * never animates, never flips/breathes/blinks, and ctl.trigger()/poke()
 * become no-ops.
 */
(function () {
  var BASE = '/kai/';
  // NOTE 2026-07-11 (owner design pass): 'sigue' and 'caricia' each have a
  // little cursor/hand UI glyph baked into the sprite itself that can't be
  // cleaned up algorithmically — so the engine never references them. The
  // PNGs stay in public/kai/ (harmless, just unused) in case they get
  // re-drawn later.
  var POSES = ['quieto', 'camina', 'corre', 'salta', 'galleta', 'celebra', 'piensa', 'senala', 'espera', 'duerme'];
  var ALL_FRAMES = POSES.concat(POSES.map(function (n) { return n + '_blink'; }));

  // Sequences of poses per state — Kai "acts" by walking this list at `fps`,
  // not by deforming one picture. `hold` + `next` = how long to stay before
  // auto-returning (e.g. celebrate plays out, then settles back to idle).
  //
  // 'alert' uses 'senala' (gesturing/attentive) and 'pet' uses 'celebra'
  // (happy, arms up) — never 'sigue'/'caricia' (see NOTE above).
  //
  // 'treat' (2026-07-11 cookie-reward pass, add-to-cart) — eats the cookie
  // (~800ms @ 2 frames) then 4 happy hops (salta/celebra alternating) before
  // settling back to idle. setState() below also bursts 'cookie' particles
  // the moment this state starts (see NOTE there).
  //
  // 'bigCelebrate' (order-complete page, e.g. /gracias) — a continuous happy
  // jump loop, no hold/auto-revert: the host page IS the celebration, there's
  // no "idle" to settle back into. Paired with a repeating gold confetti
  // burst (see draw()).
  var STATES = {
    idle: { seq: ['quieto'], fps: 1, loop: true },
    alert: { seq: ['senala'], fps: 1, loop: true },
    walk: { seq: ['camina', 'corre'], fps: 5, loop: true },
    // 'pet' kept for API back-compat (nothing else in the codebase calls it
    // anymore) — the corner-canvas click no longer triggers this directly.
    // 2026-07-17 (owner: "TRUCOS de Kai"): a click/tap now runs a random
    // trick from TRICKS below (a full reward moment — pose sequence + its
    // own cosmic phrase + optional particles), replacing the old single
    // "celebra + hearts + generic pet line" interaction. See 'trick' stub
    // state + startTrick()/reducedTrick() further down: real playback is
    // driven by a per-step timer (variable step durations, not fps), not by
    // this seq/fps machine, so 'trick' here is just a guard-satisfying stub.
    pet: { seq: ['celebra'], fps: 1, hold: 1300, next: 'auto' },
    trick: { seq: ['quieto'], fps: 1, loop: true },
    treat: {
      seq: ['galleta', 'galleta', 'salta', 'celebra', 'salta', 'celebra', 'salta', 'celebra', 'salta', 'celebra'],
      fps: 2.5, hold: 4000, next: 'idle',
    },
    celebrate: { seq: ['salta', 'celebra', 'salta', 'celebra', 'celebra'], fps: 6, hold: 1400, next: 'idle' },
    bigCelebrate: { seq: ['salta', 'celebra'], fps: 3, loop: true },
    think: { seq: ['piensa'], fps: 1, hold: 2600, next: 'idle' },
    point: { seq: ['senala'], fps: 1, hold: 2600, next: 'idle' },
    wait: { seq: ['espera'], fps: 1, loop: true },
    sleep: { seq: ['duerme'], fps: 1, loop: true },
  };

  // Trick repertoire (2026-07-17, owner: "TRUCOS de Kai") — clicking/tapping
  // Kai in a corner (menu/search/cart) runs one of these at random (never the
  // same one twice in a row). Each trick is its own tiny performance: a list
  // of {pose, dur, move} steps (variable per-step duration, walked by a timer
  // in startTrick()/reducedTrick() — NOT the STATES fps machine above, which
  // assumes uniform frame length) + one fixed English phrase (the caption
  // *is* the reward line — hosts no longer pick from their own KAI_PET_LINES
  // bank for this) + an optional particle effect fired once at trick start.
  // `move` flags are read by draw()'s trick branch to offset the sprite
  // (jump/settle/reach/paw → vertical bob; spin → alternates facing instead
  // of squashing, "flicker" style; holdStar → paints a small star over the
  // snout for that step's duration). Pose names are existing POSES entries —
  // no new art required.
  var TRICKS = {
    sit: {
      steps: [{ pose: 'quieto', dur: 1100, move: 'settle' }],
      phrase: '*sits like a good cosmic boy*',
    },
    hop: {
      steps: [
        { pose: 'salta', dur: 300, move: 'jump' },
        { pose: 'quieto', dur: 110 },
        { pose: 'salta', dur: 300, move: 'jump' },
        { pose: 'quieto', dur: 260 },
      ],
      phrase: 'Hup! Almost touched a star.',
      fx: 'sparkTop',
    },
    spin: {
      steps: [
        { pose: 'celebra', dur: 640, move: 'spin' },
        { pose: 'quieto', dur: 240 },
      ],
      phrase: '*orbits* wheee.',
      fx: 'ring',
    },
    playDead: {
      steps: [
        { pose: 'duerme', dur: 1150 },
        { pose: 'salta', dur: 220, move: 'jump' },
        { pose: 'quieto', dur: 220 },
      ],
      phrase: '*plays dead... boop, alive.*',
    },
    fetchStar: {
      steps: [
        { pose: 'senala', dur: 820, move: 'reach' },
        { pose: 'celebra', dur: 620, move: 'holdStar' },
      ],
      phrase: 'Fetched you a star. Still warm.',
      fx: 'fallStar',
    },
    pawShake: {
      steps: [
        { pose: 'senala', dur: 520, move: 'paw' },
        { pose: 'senala', dur: 420, move: 'paw' },
        { pose: 'quieto', dur: 200 },
      ],
      phrase: 'Paw-shake? Deal, friend.',
    },
    howl: {
      steps: [
        { pose: 'piensa', dur: 1000 },
        { pose: 'quieto', dur: 220 },
      ],
      phrase: 'Awoo. That is cosmic for hello.',
      fx: 'moon',
    },
  };
  var TRICK_NAMES = Object.keys(TRICKS);

  // Star (8-point) + crescent-moon primitives, shared by the 'fallStar' /
  // 'holdStar' / 'howl' particle effects below. Plain canvas paths, no image
  // assets — kept tiny and self-contained.
  function drawStar(ctx, x, y, r, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.beginPath();
    var spikes = 8, outer = r, inner = r * 0.42;
    for (var i = 0; i < spikes * 2; i++) {
      var rad = (i % 2 === 0) ? outer : inner;
      var ang = (Math.PI / spikes) * i - Math.PI / 2;
      var px = Math.cos(ang) * rad, py = Math.sin(ang) * rad;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  function drawMoon(ctx, x, y, r, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#e8dcb0';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x + r * 0.55, y - r * 0.15, r * 0.92, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  // Shared image cache — the 3 surfaces (menu/search/cart) draw the same
  // sprites, so we decode each pose (+ its blink frame) once regardless of
  // how many canvases mount.
  var cache = {};
  var loading = null;
  function loadAll(cb) {
    var names = ALL_FRAMES;
    if (loading) { loading.then(cb); return; }
    loading = new Promise(function (resolve) {
      var left = names.length;
      if (!left) { resolve(); return; }
      names.forEach(function (n) {
        if (cache[n]) { if (--left === 0) resolve(); return; }
        var im = new Image();
        im.onload = im.onerror = function () { cache[n] = im; if (--left === 0) resolve(); };
        im.src = BASE + n + '.png';
      });
    });
    loading.then(cb);
  }

  // Global cursor tracker — shared across every mounted Kai instance, so each
  // one can turn to look at the pointer even while it's nowhere near that
  // particular canvas (site header/cart/search all live on the same page).
  //
  // REF-COUNTED (not attached at load): this engine ships on every page, but
  // Kai only actually mounts inside the open menu/search/cart overlays and on
  // /gracias. Attaching at load meant every mousemove on every page — the whole
  // catalog, every PDP — ran this handler for a mascot that wasn't even on
  // screen. Now the listeners exist only while at least one Kai is mounted.
  var mouseX = null, mouseAt = 0;
  var mounted = 0;
  function trackMouse(e) {
    var p = (e.touches && e.touches[0]) || e;
    mouseX = p.clientX; mouseAt = performance.now();
  }
  function retainMouse() {
    if (mounted++ > 0) return;
    document.addEventListener('mousemove', trackMouse, { passive: true });
    document.addEventListener('touchmove', trackMouse, { passive: true });
  }
  function releaseMouse() {
    if (--mounted > 0) return;
    mounted = 0;
    mouseX = null;
    document.removeEventListener('mousemove', trackMouse);
    document.removeEventListener('touchmove', trackMouse);
  }

  window.kaiAnim = function mount(canvas, opts) {
    opts = opts || {};
    var noop = { trigger: function () {}, poke: function () {}, destroy: function () {} };
    if (!canvas || !canvas.getContext) return noop;

    var reduced = reducedMotion();
    var cssW = opts.width || canvas.width || 64;
    var cssH = opts.height || canvas.height || 64;
    var targetH = opts.targetHeight || Math.round(cssH * 0.72);
    var groundInset = opts.groundInset != null ? opts.groundInset : Math.round(cssH * 0.14);
    var onAmbient = typeof opts.onAmbient === 'function' ? opts.onAmbient : function () {};
    var onState = typeof opts.onState === 'function' ? opts.onState : function () {};

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.scale(dpr, dpr);

    var destroyed = false;
    var retained = false;
    var st = opts.initial || 'idle';
    var stStart = 0, lastAct = 0, glanceAt = 0, leanNear = false;
    var facing = 1;
    var blinkAt = 0, blinking = -1;
    var confettiAt = 0;
    var hearts = [];
    // Trick playback (see TRICKS above). `trick` drives the non-reduced-motion
    // path inside draw() (a per-step timer, not the STATES fps machine);
    // `reducedTrickPlaying`/`reducedTrickTimer` drive the separate static
    // step-through used under prefers-reduced-motion (no rAF loop at all).
    // `lastTrickKey` is per-instance (each mounted Kai — menu/search/cart —
    // has its own memory), so "no repeats" only avoids repeating within the
    // same corner, not across all three.
    var trick = null;
    var lastTrickKey = null;
    var reducedTrickPlaying = false;
    var reducedTrickTimer = null;
    var raf = null;
    var t0 = performance.now();
    function now() { return performance.now(); }
    function rnd(a, b) { return a + Math.random() * (b - a); }

    // ── Cost control ──────────────────────────────────────────────────────
    // Kai is decoration: he must never cost the page anything he isn't
    // actively earning. Three guards, all cheap:
    //
    // 1. Frame budget. Pixel art gains nothing from 60fps (the pose sequences
    //    run at 1–6fps; only the breathing/particles are continuous), so we
    //    paint at 30fps — 24fps on low-end devices. The rAF loop still ticks at
    //    display rate; we just skip the paint, which roughly halves the CPU.
    // 2. Off-screen. An IntersectionObserver stops the loop when the canvas
    //    scrolls out of view (matters on /gracias, the one surface where Kai
    //    lives on a scrollable page instead of inside an open overlay).
    // 3. Hidden tab. visibilitychange stops it when the tab is backgrounded —
    //    browsers already throttle rAF there, but this drops it to exactly zero.
    var lowEnd = (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
                 (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
    var FRAME_MS = 1000 / (lowEnd ? 24 : 30);
    var lastFrame = 0;
    var paused = false;
    var onScreen = true;
    var io = null;

    function pause() {
      if (paused) return;
      paused = true;
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    }
    function resume() {
      if (destroyed || reduced || !paused) return;
      paused = false;
      // Re-base the timers. The clock kept running while we were paused, so
      // without this Kai would come back from a hidden tab already asleep (the
      // 13s idle→sleep threshold), and would instantly fire every hold/glance/
      // blink that "expired" while nobody was looking.
      var n = now();
      stStart = n; lastAct = n;
      glanceAt = n + rnd(6000, 12000);
      blinkAt = n + 2200;
      if (st === 'bigCelebrate') confettiAt = n;
      lastFrame = 0;
      raf = requestAnimationFrame(draw);
    }
    function onVis() {
      if (document.hidden) pause();
      else if (onScreen) resume();
    }

    // Draw box computed ONCE (all poses share the same registered canvas —
    // 52×47, paws on the baseline, no more baked-in shadow-puddle row at the
    // bottom of the frame (2026-07-11 final art pass: any dead-straight dark
    // line ≥10px wide at the bottom was a false floor, removed — real paws/
    // belly are never a straight 10px line, so nothing was cropped off the
    // dog) — so there is nothing to recompute per pose; recomputing per-frame
    // from each pose's own size is exactly what used to cause jitter when
    // swapping between poses).
    var W = 0, H = 0, groundY = 0, cx = 0;
    function computeBox() {
      var ref = cache.quieto;
      // Fall back to the sprite's authored size (52×47) if the reference frame
      // failed to decode — loadAll() caches on BOTH onload and onerror, so a
      // 404'd/broken image is still a live Image object, just with width 0.
      // Dividing by that zero used to make `scale` Infinity and every
      // drawImage() a silent no-op (Kai simply never appeared).
      var rw = (ref && ref.width) || 52;
      var rh = (ref && ref.height) || 47;
      var scale = targetH / rh;
      W = rw * scale; H = targetH;
      groundY = cssH - groundInset; cx = cssW / 2;
    }

    // Particle bursts — 'heart' (pet/click), 'cookie' (treat reward), 'confetti'
    // (big page-level celebrate). All share the same aging/fade lifecycle in
    // paint() below; only position + shape differ per kind.
    function spawnHearts(n) {
      for (var i = 0; i < n; i++) hearts.push({ x: 0.5 + (i - (n - 1) / 2) * 0.14, y: 0.1, t: now(), d: i * 130, k: 'heart' });
    }
    function spawnCookieBurst() {
      for (var i = 0; i < 6; i++) hearts.push({ x: 0.5 + (i - 2.5) * 0.12, y: 0.02, t: now(), d: i * 90, k: 'cookie' });
    }
    var CONFETTI_COLORS = ['#C9A84C', '#f0ede8', '#e0763a', '#8a6a3a'];
    // Fade duration (seconds) per trick-FX particle kind — looked up once per
    // particle in paint()'s loop, not recreated per frame.
    var TRICK_FX_LIFE = { sparktop: 0.9, ring: 0.64, fallstar: 0.82, moon: 1.2, wave: 0.6 };
    function spawnConfetti(n) {
      for (var i = 0; i < n; i++) {
        hearts.push({
          x: Math.random(), y: -0.05 - Math.random() * 0.25, t: now(), d: Math.random() * 260,
          k: 'confetti', seed: Math.random() * Math.PI * 2,
          col: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        });
      }
    }

    // Trick particle FX — 'sparkTop' (hop), 'ring' (spin), 'fallStar'
    // (fetchStar; falls onto the snout then bursts into sparkTop sparks — see
    // the 'fallstar' branch in paint() below), 'moon' + 3 staggered 'wave'
    // arcs (howl). Fired once, at trick start, from spawnTrickFx() — only in
    // the non-reduced-motion path (reducedTrick() never calls this, so
    // reduced-motion sees pose changes + the phrase, no moving particles).
    function spawnSparkTop(n) {
      for (var i = 0; i < n; i++) {
        hearts.push({ x: 0.5 + rnd(-0.16, 0.16), y: 0.03 + rnd(0, 0.08), t: now(), d: i * 45, k: 'sparktop' });
      }
    }
    function spawnRing() {
      hearts.push({ x: 0.5, y: 1, t: now(), d: 0, k: 'ring' });
    }
    function spawnFallStar() {
      hearts.push({ x: 0.5, y: 0, t: now(), d: 0, k: 'fallstar', burst: false });
    }
    function spawnMoonHowl() {
      hearts.push({ x: 0.82, y: 0.05, t: now(), d: 0, k: 'moon' });
      for (var i = 0; i < 3; i++) hearts.push({ x: 0.5, y: 0.12, t: now(), d: i * 260, k: 'wave' });
    }
    function spawnTrickFx(key) {
      var fx = TRICKS[key] && TRICKS[key].fx;
      if (fx === 'sparkTop') spawnSparkTop(7);
      else if (fx === 'ring') spawnRing();
      else if (fx === 'fallStar') spawnFallStar();
      else if (fx === 'moon') spawnMoonHowl();
    }

    // Pick a random trick, never repeating the one just played on THIS
    // instance (each mounted Kai — menu/search/cart — has its own memory).
    function pickTrick() {
      var choices = lastTrickKey
        ? TRICK_NAMES.filter(function (k) { return k !== lastTrickKey; })
        : TRICK_NAMES;
      var key = choices[Math.floor(Math.random() * choices.length)];
      lastTrickKey = key;
      return key;
    }

    // Full (non-reduced-motion) trick: routes through setState('trick') (the
    // STATES.trick stub just satisfies its guard — real stepping lives in
    // draw()'s trick branch below), fires the particle FX once, and hands the
    // trick's own phrase straight to the host via onAmbient('trick', text) —
    // the trick IS the reward line, no separate host-side pet-phrase bank.
    function startTrick() {
      if (destroyed || trick) return;
      if (st === 'bigCelebrate' || st === 'treat') return;
      var key = pickTrick();
      var def = TRICKS[key];
      trick = { key: key, def: def, idx: 0, stepAt: now() };
      setState('trick');
      spawnTrickFx(key);
      onAmbient('trick', def.phrase);
    }

    // prefers-reduced-motion trick: no rAF loop involved (the engine never
    // starts one in reduced mode — see start() below), so this walks the
    // trick's steps with plain setTimeout, painting ONE static frame per pose
    // change (no jump/spin/reach offsets, no particle FX) — satisfies "allow
    // the pose change + the phrase, skip moving particles + the spin-flicker"
    // while staying accessible (still a real interaction, not a dead click).
    function reducedTrick() {
      if (destroyed || reducedTrickPlaying) return;
      if (st === 'bigCelebrate' || st === 'treat') return;
      reducedTrickPlaying = true;
      var key = pickTrick();
      var def = TRICKS[key];
      onAmbient('trick', def.phrase);
      var idx = 0;
      function step() {
        if (destroyed) { reducedTrickPlaying = false; return; }
        var s = def.steps[idx];
        paint(s.pose, 0, 1, 1, null, { holdStar: s.move === 'holdStar' });
        idx++;
        if (idx < def.steps.length) {
          reducedTrickTimer = setTimeout(step, s.dur);
        } else {
          reducedTrickTimer = setTimeout(function () {
            reducedTrickPlaying = false;
            reducedTrickTimer = null;
            if (!destroyed) paint('quieto', 0, 1, 1, null);
          }, s.dur);
        }
      }
      step();
    }

    function setState(s) {
      if (destroyed || !STATES[s]) return;
      var wasSleeping = st === 'sleep';
      st = s; stStart = now(); lastAct = now();
      // Reward bursts fire the instant these states start — the host just
      // triggers the state, the engine owns the particle choreography.
      if (s === 'treat') spawnCookieBurst();
      else if (s === 'bigCelebrate') { spawnConfetti(10); confettiAt = now() + 1100; }
      // Waking — fires once whenever we leave 'sleep' for anything else,
      // whatever woke him (hover, a host trigger() call, reopening a modal).
      // 'sleep' itself is reported separately, straight from draw() below.
      if (wasSleeping && s !== 'sleep') onAmbient('wake');
      onState(s);
    }

    function poseName() {
      var S = STATES[st] || STATES.idle;
      var el = now() - stStart;
      var idx = Math.floor((el / 1000) * S.fps) % S.seq.length;
      return S.seq[idx];
    }

    // Facing — Kai turns toward the cursor (flip pivots on the canvas' own
    // center, never re-anchors the sprite). Falls back to an occasional random
    // glance when the cursor hasn't moved in a while (ambient, "at rest").
    var FACE_DEADZONE = Math.max(6, cssW * 0.06);
    var FACE_STALE_MS = 6000;
    function updateFacing() {
      var recent = mouseX != null && (now() - mouseAt) < FACE_STALE_MS;
      if (recent) {
        var rect = canvas.getBoundingClientRect();
        var canvasCx = rect.left + rect.width / 2;
        var d = mouseX - canvasCx;
        if (d < -FACE_DEADZONE) facing = -1;
        else if (d > FACE_DEADZONE) facing = 1;
        leanNear = Math.abs(d) < rect.width * 1.4;
      } else {
        leanNear = false;
      }
      return recent;
    }

    function paint(name, bob, sqX, sqY, T, opts) {
      opts = opts || {};
      // faceOverride — used only by the 'spin' trick step, which alternates
      // the effective facing every ~90ms to read as a spin/flicker instead of
      // turning smoothly. Never mutates the real `facing` var (the one the
      // cursor-tracking logic owns), so the moment the trick ends Kai just
      // resumes looking wherever the pointer actually is.
      var faceUse = (opts.faceOverride != null) ? opts.faceOverride : facing;
      var im = cache[name] || cache.quieto;
      ctx.clearRect(0, 0, cssW, cssH);

      // Contact shadow — soft, blurred, wide/flat, sitting BELOW the paws
      // (separated, not a solid oval glued to them — a solid dark ellipse
      // read as a blob merging with the paws on a dark background). Never
      // scales with the breathing/facing transform — drawn in plain space.
      ctx.save();
      ctx.translate(cx, groundY + 3);
      ctx.scale(1, 0.20);
      var sg = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.42);
      sg.addColorStop(0, 'rgba(8,11,22,0.62)');
      sg.addColorStop(0.55, 'rgba(8,11,22,0.30)');
      sg.addColorStop(1, 'rgba(8,11,22,0)');
      ctx.beginPath();
      ctx.arc(0, 0, W * 0.42, 0, Math.PI * 2);
      ctx.fillStyle = sg;
      ctx.fill();
      ctx.restore();

      // The sprite itself — single transform pivoted at the paws (cx, groundY):
      // scale(facing*sqX, sqY) both turns him to face the cursor AND does the
      // volumetric breathing (widen a hair while compressing in height, and
      // vice versa). Anchored at the same point, so he never drifts or
      // floats — only turns/breathes in place.
      if (im) {
        ctx.save();
        ctx.translate(cx, groundY);
        ctx.scale(faceUse * sqX, sqY);
        ctx.drawImage(im, Math.round(-W / 2), Math.round(-H + bob), Math.round(W), Math.round(H));
        ctx.restore();
      }

      // holdStar (fetchStar trick, 2nd step) — a small star held over the
      // snout for as long as that step lasts. Static (no fall/physics), so it
      // stays on even under prefers-reduced-motion's step-through.
      if (opts.holdStar) {
        drawStar(ctx, cx + faceUse * W * 0.30, groundY - H * 0.86, 5, '#f0d478');
      }

      // Particle overlays — always upright, never mirrored/squashed by the
      // sprite's own facing/breathing transform. 'heart' (pet/click, legacy —
      // no longer spawned by the click handler but kept for API back-compat)
      // and 'cookie' (treat reward) rise + fade near his head; 'confetti'
      // (big page-level celebrate) falls + tumbles across the whole canvas.
      // Trick FX (2026-07-17): 'sparktop' (hop) reuses the heart/cookie
      // rise-and-fade near the head; 'ring' (spin) expands from the paws;
      // 'fallstar' (fetchStar) drops from off-canvas to the snout, then
      // bursts into 'sparktop' sparks on arrival; 'moon' + 'wave' (howl) sit
      // near the head, mostly static/expanding, no fall.
      for (var i = hearts.length - 1; i >= 0; i--) {
        var p = hearts[i];
        var life = p.k === 'confetti' ? 1.8 : (TRICK_FX_LIFE[p.k] != null ? TRICK_FX_LIFE[p.k] : 1.2);
        var pr = (now() - p.t - p.d) / 1000;
        if (pr < 0) continue;
        var a = Math.max(0, 1 - pr / life);
        ctx.globalAlpha = a;
        if (p.k === 'confetti') {
          var fx = p.x * cssW + Math.sin(pr * 6 + p.seed) * 7;
          var fy = p.y * cssH + pr * 55;
          ctx.save();
          ctx.translate(fx, fy);
          ctx.rotate(pr * 4 + p.seed);
          ctx.fillStyle = p.col || '#C9A84C';
          ctx.fillRect(-2.2, -1.5, 4.4, 3);
          ctx.restore();
        } else if (p.k === 'ring') {
          var rp = Math.min(1, pr / life);
          ctx.save();
          ctx.translate(cx, groundY);
          ctx.scale(1, 0.42);
          ctx.beginPath();
          ctx.arc(0, 0, rp * W * 0.62, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(201,168,76,' + (0.55 * (1 - rp)).toFixed(3) + ')';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        } else if (p.k === 'fallstar') {
          var fprog = Math.min(1, pr / life);
          var fsx = cx;
          var fsy = -20 + ((groundY - H * 0.62) - (-20)) * fprog;
          if (!p.burst) {
            drawStar(ctx, fsx, fsy, 6, '#f0d478');
            if (fprog >= 0.96) {
              p.burst = true;
              for (var k = 0; k < 6; k++) {
                hearts.push({ x: 0.5 + rnd(-0.14, 0.14), y: 0.10, t: now(), d: k * 30, k: 'sparktop' });
              }
            }
          }
        } else if (p.k === 'moon') {
          drawMoon(ctx, p.x * cssW, p.y * cssH, 10, a);
        } else if (p.k === 'wave') {
          var wp = Math.min(1, pr / life);
          ctx.save();
          ctx.translate(cx, groundY - H * 0.9);
          ctx.beginPath();
          ctx.arc(0, 0, 8 + wp * 22, -0.7, 0.7);
          ctx.strokeStyle = 'rgba(201,168,76,' + (0.5 * (1 - wp)).toFixed(3) + ')';
          ctx.lineWidth = 1.6;
          ctx.stroke();
          ctx.restore();
        } else {
          var yy = (groundY - H) + p.y * H - pr * 38;
          var xx = cx + (p.x - 0.5) * W;
          if (p.k === 'heart') {
            ctx.fillStyle = '#E888A0';
            ctx.beginPath();
            ctx.arc(xx - 3, yy, 3, 0, Math.PI * 2);
            ctx.arc(xx + 3, yy, 3, 0, Math.PI * 2);
            ctx.moveTo(xx - 6, yy + 1); ctx.lineTo(xx, yy + 8); ctx.lineTo(xx + 6, yy + 1);
            ctx.fill();
          } else if (p.k === 'cookie') {
            // A tiny cookie: gold circle + a few chip dots.
            ctx.fillStyle = '#C9A84C';
            ctx.beginPath(); ctx.arc(xx, yy, 3.4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#6b4a2b';
            ctx.fillRect(xx - 1.6, yy - 1.6, 1.1, 1.1);
            ctx.fillRect(xx + 0.5, yy - 0.3, 1.1, 1.1);
            ctx.fillRect(xx - 0.5, yy + 1.0, 1.1, 1.1);
            ctx.fillRect(xx + 1.3, yy + 1.2, 1.1, 1.1);
          } else if (p.k === 'sparktop') {
            // Trick spark (hop, + fallstar's arrival burst) — small gold cross,
            // #e8be60 (slightly brighter than the default gold below, to read
            // as its own "star dust" cue).
            ctx.fillStyle = '#e8be60';
            ctx.fillRect(xx - 1.3, yy - 4, 2.6, 8);
            ctx.fillRect(xx - 4, yy - 1.3, 8, 2.6);
          } else {
            // spark (default) — small gold cross
            ctx.fillStyle = '#C9A84C';
            ctx.fillRect(xx - 1.3, yy - 4, 2.6, 8);
            ctx.fillRect(xx - 4, yy - 1.3, 8, 2.6);
          }
        }
        ctx.globalAlpha = 1;
        if (pr > life) hearts.splice(i, 1);
      }

      // Sleep — 3 z's drawn on the canvas that float up + grow + fade out near
      // the head. This is the ONLY "zzz" — the caption line no longer gets a
      // static "z z" text override (2026-07-11 owner pass).
      if (st === 'sleep' && T != null) {
        for (var z = 0; z < 3; z++) {
          var zz = (T * 0.6 - z * 0.7) % 2.6;
          if (zz < 0 || zz > 2.1) continue;
          ctx.globalAlpha = Math.max(0, Math.min(1, 1.15 - zz / 2.1));
          ctx.fillStyle = '#d6d0c2';
          ctx.font = (9 + z * 3) + 'px monospace';
          ctx.fillText('z', cx + W * 0.20 + zz * 7, groundY - H * 0.58 - zz * 22);
          ctx.globalAlpha = 1;
        }
      }
    }

    function draw() {
      if (destroyed || paused) { raf = null; return; }
      raf = requestAnimationFrame(draw);
      // Frame budget (see "Cost control" above) — keep the rAF loop alive but
      // skip the paint until the next 30/24fps slot is due.
      var nf = now();
      if (nf - lastFrame < FRAME_MS) return;
      lastFrame = nf;

      var T = (now() - t0) / 1000;
      var mouseRecent = updateFacing();

      // Trick playback — variable-duration steps (not the fps/seq machine
      // the rest of STATES uses), so it's handled entirely here, before the
      // STATES-based block below, and returns early. See TRICKS + startTrick()
      // above for the step data + how a trick gets started.
      if (st === 'trick' && trick) {
        var td = trick.def;
        var ts = td.steps[trick.idx];
        var tel = now() - trick.stepAt;
        if (tel >= ts.dur) {
          trick.idx++;
          if (trick.idx >= td.steps.length) {
            var wasNear = leanNear;
            trick = null;
            setState(wasNear ? 'alert' : 'idle');
            return; // next rAF frame paints idle/alert normally
          }
          trick.stepAt = now();
          ts = td.steps[trick.idx];
          tel = 0;
        }
        var tprog = ts.dur ? Math.min(1, tel / ts.dur) : 1;
        var tbob = 0, tface = null, tholdStar = false;
        switch (ts.move) {
          case 'jump': tbob = -Math.sin(tprog * Math.PI) * 30; break;
          case 'settle': tbob = Math.max(0, 6 - tprog * 6); break;
          case 'reach': tbob = -Math.sin(tprog * Math.PI) * 8; break;
          case 'paw': tbob = -Math.abs(Math.sin(tel / 120)) * 4; break;
          case 'holdStar': tholdStar = true; break;
          case 'spin': tface = (Math.floor(tel / 90) % 2 === 0) ? facing : -facing; break;
        }
        paint(ts.pose, tbob, 1, 1, T, { faceOverride: tface, holdStar: tholdStar });
        return;
      }

      var S = STATES[st] || STATES.idle;

      if (S.hold && now() - stStart > S.hold) {
        if (S.next === 'auto') setState(leanNear ? 'alert' : 'idle');
        else setState(S.next);
      }
      if ((st === 'idle' || st === 'alert') && now() - lastAct > 13000) {
        setState('sleep');
        onAmbient('sleep');
      }
      // Keep the gold confetti raining for as long as the big celebration
      // loop runs (a single burst would fade out in ~1.5s and leave a long
      // silent loop after) — re-seed a fresh burst every ~1.1s.
      if (st === 'bigCelebrate' && now() > confettiAt) {
        spawnConfetti(8);
        confettiAt = now() + 1100;
      }
      if (st === 'idle' && now() > glanceAt) {
        setState('alert');
        if (!mouseRecent) facing = Math.random() < 0.5 ? -1 : 1; // ambient glance, no cursor to follow
        onAmbient('glance');
        glanceAt = now() + rnd(9000, 15000);
        setTimeout(function () { if (!destroyed && st === 'alert' && !leanNear) setState('idle'); }, 1200);
      }

      // Blink — every ~2.4–5.6s, hold the "_blink" frame of the current pose
      // for ~150ms (falls back to the normal frame if that pose has no blink).
      if (now() > blinkAt && blinking < 0) blinking = now();
      var blk = false;
      if (blinking > 0) {
        if (now() - blinking > 150) { blinking = -1; blinkAt = now() + 2400 + Math.random() * 3200; }
        else blk = true;
      }
      var nm = poseName();
      if (blk && cache[nm + '_blink']) nm = nm + '_blink';

      // Volumetric breathing — idle/alert only. Widens a hair (sqX) while it
      // compresses in height (sqY), anchored at the feet (paint() pivots the
      // transform at groundY) — reads as a chest rising, NOT a float/hover
      // (plain vertical squash without the width companion read as floating
      // in the 2026-07-11 owner review). No translateY here, ever. Sleep
      // keeps its own separate 1px rise/fall (he's lying down, not breathing
      // standing up).
      var isBreathing = (st === 'idle' || st === 'alert');
      var bph = isBreathing ? (0.5 + 0.5 * Math.sin(T * 1.8)) : 0;
      var sqY = 1 - 0.010 * bph;
      var sqX = 1 + 0.009 * bph;
      var bob = (st === 'sleep') ? Math.round(Math.sin(T * 1.4) * 1) : 0;

      paint(nm, bob, sqX, sqY, T);
    }

    function onPointerEnter() { lastAct = now(); leanNear = true; if (st === 'sleep') setState('idle'); if (st === 'idle') setState('alert'); }
    function onPointerLeave() { leanNear = false; if (st === 'alert') setState('idle'); }
    // Click/tap on Kai (2026-07-17, owner: "TRUCOS de Kai") — runs a random
    // trick from TRICKS (pose sequence + its own phrase + optional particle
    // FX), replacing the old single "celebra + hearts + generic pet line".
    // No-op (silently ignored, discovery stays organic — no "click me" UI):
    // - while a reward/finale state owns the moment (add-to-cart 'treat',
    //   the order-complete page's 'bigCelebrate' loop);
    // - while a trick is already playing (no stacking/interrupting mid-trick).
    function onClick() {
      if (destroyed) return;
      if (st === 'bigCelebrate' || st === 'treat') return;
      if (trick || reducedTrickPlaying) return;
      lastAct = now();
      if (reduced) { reducedTrick(); return; }
      startTrick();
    }
    canvas.addEventListener('mouseenter', onPointerEnter);
    canvas.addEventListener('mouseleave', onPointerLeave);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('touchstart', onClick, { passive: true });

    function start() {
      if (destroyed) return;
      computeBox();
      // prefers-reduced-motion — one static frame, no loop, no observers, no
      // timers. Kai is present but perfectly still.
      if (reduced) { paint('quieto', 0, 1, 1, null); return; }
      setState(opts.initial || 'idle');
      glanceAt = now() + rnd(4000, 7000);
      blinkAt = now() + 2200;

      retainMouse();
      retained = true;
      document.addEventListener('visibilitychange', onVis);
      if (typeof IntersectionObserver === 'function') {
        io = new IntersectionObserver(function (entries) {
          onScreen = entries[entries.length - 1].isIntersecting;
          if (!onScreen) pause();
          else if (!document.hidden) resume();
        }, { threshold: 0 });
        io.observe(canvas);
      }

      draw();
    }
    loadAll(start);

    return {
      trigger: function (name) {
        if (reduced) return;
        lastAct = now();
        setState(name);
      },
      poke: function () { lastAct = now(); },
      destroy: function () {
        if (destroyed) return;
        destroyed = true;
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        if (io) { io.disconnect(); io = null; }
        if (retained) { releaseMouse(); retained = false; }
        if (reducedTrickTimer) { clearTimeout(reducedTrickTimer); reducedTrickTimer = null; }
        document.removeEventListener('visibilitychange', onVis);
        canvas.removeEventListener('mouseenter', onPointerEnter);
        canvas.removeEventListener('mouseleave', onPointerLeave);
        canvas.removeEventListener('click', onClick);
        canvas.removeEventListener('touchstart', onClick);
      },
    };
  };
})();
