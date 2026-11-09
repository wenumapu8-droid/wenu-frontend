/* kai-textile.js — living mapuche/andean-textile curtains over every Kai screen.
 *
 * Any [data-kai-textile] element gets a RANDOM woven pattern, a slow LOOPING
 * weave scroll, and an auto-reshuffle every ~10-18s (fades between).
 *   · data-kai-palette="bw"   → only black-and-white patterns (the search)
 *   · default                 → the warm/colour patterns (nav, cart, gracias)
 * Covers with data-kai-cover-reveal need THREE taps to part the curtain and
 * wake Kai (so a stray tap doesn't reveal him).
 *
 * Patterns are Ocin's own seamless textile tiles (public/img/kai/textile-*.jpg)
 * plus a few coded SVG wefts. Honors prefers-reduced-motion.
 */
(function () {
  var P = '%23efe9dd', O = '%230d0d10', E = '%23c9a84c', R = '%237a1f1f';

  function svg(w, h, inner) {
    return "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='" +
      w + "' height='" + h + "' viewBox='0 0 " + w + " " + h + "'%3E" + inner + "%3C/svg%3E\")";
  }

  /* ── PIXEL LOOM ──────────────────────────────────────────────────────────
     Every pattern is woven pixel-by-pixel in code (no photos, no crops). `weave`
     runs a formula over an N×N grid and paints one <rect> per thread. Because
     the formulas are periodic in N, every tile repeats SEAMLESSLY. `pal` maps a
     formula's return value (1,2,3…) to a colour; index 0 = the obsidian ground. */
  var CELL = 4;
  function weave(N, fn, pal) {
    var side = N * CELL;
    var s = "%3Crect width='" + side + "' height='" + side + "' fill='" + O + "'/%3E";
    for (var y = 0; y < N; y++) {
      for (var x = 0; x < N; x++) {
        var c = fn(x, y, N);
        if (c) s += "%3Crect x='" + (x * CELL) + "' y='" + (y * CELL) + "' width='" +
          CELL + "' height='" + CELL + "' fill='" + pal[c] + "'/%3E";
      }
    }
    return { size: side, img: svg(side, side, s) };
  }

  // ── the motifs (periodic → seamless) ──
  function mDiamond(x, y, N) {           // stepped rhombus lattice + ember heart
    var c = (N - 1) / 2, d = Math.abs((x % N) - c) + Math.abs((y % N) - c);
    if (Math.abs(d - c) < 0.6) return 1;
    if (Math.abs(d - (c - 2)) < 0.6) return 1;
    if (d < 0.6) return 2;
    return 0;
  }
  function mHook(x, y, N) {              // interlocking greca hooks (T-fret)
    var mx = x % N, my = y % N, h = Math.floor(N / 2);
    if (my === 0 || mx === 0) return 1;
    if (my === h && mx <= h) return 1;
    if (mx === h && my >= h) return 1;
    if (mx === h && my === h) return 2;
    return 0;
  }
  function mChevron(x, y, N) {           // diagonal weft → diamonds
    var a = (x + y) % N, b = (x - y + 8 * N) % N;
    if (a < 2) return 1;
    if (b < 2) return 3;
    return 0;
  }
  function mCross(x, y, N) {             // chakana cross lattice
    var mx = x % N, my = y % N, c = Math.floor(N / 2);
    if ((mx === c || mx === c - 1) && my >= 1 && my <= N - 2) return 1;
    if ((my === c || my === c - 1) && mx >= 1 && mx <= N - 2) return 1;
    if (mx === c && my === c) return 2;
    if ((mx === 0 && my === 0)) return 3;
    return 0;
  }
  function mZig(x, y, N) {               // horizontal zigzag bands
    var t = Math.abs(((x % N) - N / 2));
    if (y % N === t % N) return 1;
    if ((y % N) === (N - 1 - (t % N))) return 2;
    return 0;
  }

  // palettes: bone thread on obsidian ground; accents are RED or GREY only
  // (Ocin: "blanco negro y a veces con rojo o gris"). idx 0 = ground.
  var GREY = '%23949494', RED2 = '%23a83a3a';
  var PAL_BW   = [O, P, P,    P];
  var PAL_RED  = [O, P, RED2, P];
  var PAL_GREY = [O, P, GREY, P];

  var MOTIFS = [
    { fn: mDiamond, N: 9 },
    { fn: mHook,    N: 8 },
    { fn: mChevron, N: 10 },
    { fn: mCross,   N: 9 },
    { fn: mZig,     N: 8 },
  ];

  function weaveP(N, fn, pal, bw) {
    var w = weave(N, fn, pal);
    return { bw: bw, size: w.size, img: w.img };
  }

  // Build: every motif in pure B&W (bw:true, search-safe) + a red and a grey
  // accented variant (bw:false). Hypnotic on repeat, all coded.
  var PATTERNS = [];
  for (var m = 0; m < MOTIFS.length; m++) {
    PATTERNS.push(weaveP(MOTIFS[m].N, MOTIFS[m].fn, PAL_BW,   true));
    PATTERNS.push(weaveP(MOTIFS[m].N, MOTIFS[m].fn, PAL_RED,  false));
    PATTERNS.push(weaveP(MOTIFS[m].N, MOTIFS[m].fn, PAL_GREY, false));
  }
  // ── the Wenu Mapu mandala itself, woven into the curtain intermittently
  //    (Ocin 2026-07-15): now and then the weave forms the banner logo. ──
  PATTERNS.push({ bw: true, logo: true, img: "url(/img/brand/wenu-mandala-transparent.webp)" });

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!document.getElementById('kai-textile-kf')) {
    var st = document.createElement('style');
    st.id = 'kai-textile-kf';
    st.textContent =
      '@keyframes kaiWeaveX{from{background-position:0 0}to{background-position:var(--kw) 0}}' +
      '@keyframes kaiWeaveY{from{background-position:0 0}to{background-position:0 var(--kw)}}' +
      '@keyframes kaiLogoBreathe{0%,100%{background-size:auto 70%;opacity:.92}50%{background-size:auto 76%;opacity:1}}' +
      '[data-kai-textile]{transition:opacity .4s ease}';
    document.head.appendChild(st);
  }

  function subset(bw) {
    if (!bw) return PATTERNS;                 // colour screens get everything
    var out = [];                             // the search stays strictly B&W
    for (var i = 0; i < PATTERNS.length; i++) if (PATTERNS[i].bw) out.push(PATTERNS[i]);
    return out;
  }

  function dress(el, list, idx) {
    var p = list[idx % list.length];
    el.style.backgroundColor = '#0d0d10';
    el.style.backgroundImage = p.img;
    // ── the Wenu Mapu mandala: one centred emblem, not a tiled weave ──
    if (p.logo) {
      el.style.backgroundRepeat = 'no-repeat';
      el.style.backgroundPosition = 'center';
      el.style.backgroundSize = 'auto 72%';
      el.style.animation = reduce ? 'none' : 'kaiLogoBreathe 4.5s ease-in-out infinite';
      return;
    }
    el.style.backgroundRepeat = 'repeat';
    el.style.backgroundSize = p.band ? p.bg : (p.size + 'px ' + p.size + 'px');
    el.style.setProperty('--kw', p.band ? p.kw : (p.size + 'px'));
    if (!reduce) {
      var dur = (7 + Math.random() * 6).toFixed(1);
      // bands read best scrolling horizontally; tiles pick one axis at random.
      var axis = p.band ? 'X' : (Math.random() < 0.5 ? 'X' : 'Y');
      el.style.animation = 'kaiWeave' + axis + ' ' + dur + 's linear infinite';
      el.style.animationDirection = Math.random() < 0.5 ? 'reverse' : 'normal';
    }
  }

  function wireReveal(el) {
    if (!el.hasAttribute('data-kai-cover-reveal')) return;
    var taps = 0, t = null;
    el.addEventListener('click', function (e) {
      e.stopPropagation();
      taps++;
      if (t) clearTimeout(t);
      if (taps >= 3) {
        taps = 0;
        var niche = el.closest('.kai-niche');
        if (niche) niche.classList.add('is-open');
      } else {
        t = setTimeout(function () { taps = 0; }, 900);
      }
    });
  }

  function initEl(el, i) {
    if (el._kaiTextile) return;
    el._kaiTextile = true;
    var bw = el.getAttribute('data-kai-palette') === 'bw';
    var list = subset(bw);
    if (!list.length) list = PATTERNS;
    var idx = (Math.floor(Math.random() * list.length) + i) % list.length;
    dress(el, list, idx);
    wireReveal(el);
    if (reduce) return;
    (function loop() {
      setTimeout(function () {
        el.style.opacity = '0';
        setTimeout(function () {
          idx = (idx + 1 + Math.floor(Math.random() * (list.length - 1))) % list.length;
          dress(el, list, idx);
          el.style.opacity = '';
          loop();
        }, 400);
      }, 10000 + Math.random() * 8000);
    })();
  }

  function initAll() {
    var els = document.querySelectorAll('[data-kai-textile]');
    for (var i = 0; i < els.length; i++) initEl(els[i], i);
  }

  if (document.readyState !== 'loading') initAll();
  else document.addEventListener('DOMContentLoaded', initAll);
  window.kaiTextileRefresh = initAll;
})();
