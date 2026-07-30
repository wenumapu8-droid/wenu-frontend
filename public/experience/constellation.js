/* ============================================================================
   WENU MAPU · CONSTELLATION LAYER
   ---------------------------------------------------------------------------
   Purely ADDITIVE overlay for the starmap portal. Draws living constellation
   lines between the existing .star DOM nodes.

   ROLLBACK: delete the two <link>/<script> lines for constellation.css/js in
   index.html. Nothing else in the portal is touched — this file reads the DOM,
   never mutates it, and paints on its own canvas beneath the stars.

   WHY THESE LINES AND NOT OTHERS
   The portal already carries the structure the manifesto publishes:
   eight directions (n, ne, e, se, s, sw, w, nw) plus Wüñelfe (Venus, the
   eight-pointed star of Mapuche platería) and Treng (Treng Treng).
   So the figure drawn is not decorative — it is:
     · the CARDINAL CROSS  — Meli Witran Mapu, the four places
     · the SKY RING        — the outer circle joining all eight
     · two RADIALS         — Wüñelfe and Treng tied to the centre
   No invented iconography. See CLAUDE.md / the manifesto for the source.
   ========================================================================= */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Palette lifted from the portal's own star SVGs, so nothing clashes.
  var GOLD = '240,192,96';
  var WARM = '255,235,180';

  // ── Figure definition ────────────────────────────────────────────────────
  var CARDINAL = [['star-n', 'star-s'], ['star-e', 'star-w']];
  var RING = ['star-n', 'star-ne', 'star-e', 'star-se',
              'star-s', 'star-sw', 'star-w', 'star-nw'];
  var RADIAL = ['star-wunelfe', 'star-treng'];

  var canvas, ctx, dpr = 1;
  var nodes = {};          // id -> { el, x, y }
  var edges = [];          // { a, b, kind, phase, grown }
  var centre = { x: 0, y: 0 };
  var hovered = null;
  var raf = null;
  var t0 = 0;
  var needsMeasure = true;

  function init() {
    var stars = document.querySelectorAll('.star[data-star]');
    if (!stars.length) return;               // portal not on this page — bail silently

    canvas = document.createElement('canvas');
    canvas.className = 'wm-constellation';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');

    for (var i = 0; i < stars.length; i++) {
      var el = stars[i];
      nodes[el.getAttribute('data-star')] = { el: el, x: 0, y: 0 };
      el.addEventListener('pointerenter', onEnter);
      el.addEventListener('pointerleave', onLeave);
      el.addEventListener('focus', onEnter, true);
      el.addEventListener('blur', onLeave, true);
    }

    buildEdges();
    measure();

    window.addEventListener('resize', invalidate, { passive: true });
    window.addEventListener('scroll', invalidate, { passive: true });

    t0 = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function buildEdges() {
    var k = 0;
    CARDINAL.forEach(function (pair) {
      edges.push({ a: pair[0], b: pair[1], kind: 'cardinal', phase: k++ * 0.18 });
    });
    for (var i = 0; i < RING.length; i++) {
      edges.push({
        a: RING[i], b: RING[(i + 1) % RING.length],
        kind: 'ring', phase: 0.5 + i * 0.09,
      });
    }
    RADIAL.forEach(function (id, i) {
      edges.push({ a: id, b: null, kind: 'radial', phase: 1.3 + i * 0.15 });
    });
  }

  function invalidate() { needsMeasure = true; }

  function measure() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var sx = 0, sy = 0, n = 0;
    for (var id in nodes) {
      var r = nodes[id].el.getBoundingClientRect();
      // Skip nodes that are not laid out (hidden stage, display:none, etc.)
      if (!r.width && !r.height) { nodes[id].x = null; continue; }
      nodes[id].x = r.left + r.width / 2;
      nodes[id].y = r.top + r.height / 2;
      sx += nodes[id].x; sy += nodes[id].y; n++;
    }
    centre.x = n ? sx / n : window.innerWidth / 2;
    centre.y = n ? sy / n : window.innerHeight / 2;
    needsMeasure = false;
  }

  function onEnter(e) {
    var el = e.currentTarget || e.target;
    hovered = el.getAttribute && el.getAttribute('data-star');
  }
  function onLeave() { hovered = null; }

  function isLit(id) {
    var nd = nodes[id];
    return !!(nd && nd.el.classList.contains('lit'));
  }

  function pointOf(id) {
    if (id === null) return centre;
    var nd = nodes[id];
    if (!nd || nd.x === null) return null;
    return nd;
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (needsMeasure) measure();

    var t = (now - t0) / 1000;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // Global reveal: the figure draws itself in over ~2.6s, staggered.
    for (var i = 0; i < edges.length; i++) {
      var e = edges[i];
      var A = pointOf(e.a);
      var B = pointOf(e.b);
      if (!A || !B) continue;

      var grow = REDUCED ? 1 : clamp((t - e.phase) / 1.1, 0, 1);
      if (grow <= 0) continue;
      grow = easeOut(grow);

      // Base presence per kind. The cardinal cross carries the most weight.
      var base = e.kind === 'cardinal' ? 0.26 : e.kind === 'ring' ? 0.15 : 0.11;

      // Slow breathing so the figure never looks like a static diagram.
      var breath = REDUCED ? 1 : 0.82 + Math.sin(t * 0.5 + e.phase * 2) * 0.18;

      // A lit (visited) endpoint strengthens its edges — rewards progress.
      var litBoost = (isLit(e.a) ? 0.18 : 0) + (e.b && isLit(e.b) ? 0.18 : 0);

      // Hovering a star brightens only the edges that touch it.
      var touched = hovered && (e.a === hovered || e.b === hovered);
      var hoverBoost = touched ? 0.42 : 0;

      var alpha = clamp((base + litBoost + hoverBoost) * breath * grow, 0, 0.92);
      var colour = touched || litBoost > 0 ? WARM : GOLD;

      drawEdge(A, B, alpha, colour, grow, e.kind === 'cardinal' ? 1.15 : 0.7);
    }
  }

  function drawEdge(A, B, alpha, colour, grow, width) {
    // The line grows from A toward B rather than fading in as a whole —
    // it reads as something being traced, not switched on.
    var x2 = A.x + (B.x - A.x) * grow;
    var y2 = A.y + (B.y - A.y) * grow;

    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = 'rgba(' + colour + ',' + alpha.toFixed(3) + ')';
    ctx.lineWidth = width;
    ctx.stroke();
  }

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function easeOut(x) { return 1 - Math.pow(1 - x, 3); }

  // The portal builds its stage progressively; wait for a paint before measuring.
  if (document.readyState === 'complete') {
    setTimeout(init, 400);
  } else {
    window.addEventListener('load', function () { setTimeout(init, 400); });
  }

  // Re-measure when the portal changes stage (stars can move or appear).
  document.addEventListener('visibilitychange', invalidate);
})();
