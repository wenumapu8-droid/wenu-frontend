/* ═══════════════════════════════════════════════════════════════════
   WENU MAPU — PORTAL RUN (additive 2026-07-10)
   Starfox-style rail-flight arcade mode + WENU COMMAND cockpit.
   Pure canvas-2D pseudo-3D (pinhole projection) — NO WebGL, NO libs.

   Additive layer: mounted from JS only. Remove the two lines in
   index.html (portal-run.css + portal-run.js) to fully roll back.

   Integration notes (verified against index.html + journey.js):
   · Inline script consts ($, SHOP_URL, IS_TOUCH…) are lexical — NOT on
     window. Everything is recomputed locally, like journey.js does.
   · Language: read <html lang>, re-render via MutationObserver.
   · Site chrome (#cur z:999, #trail-canvas z:998, ripples z:600,
     grain z:500) is covered by rooting the game at z:1100 and hiding
     the cursor pair while open.
   · Loader gate: same loaderGone() test as journey.js.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Environment (recomputed locally — inline consts are lexical) ── */
  var IS_TOUCH = window.matchMedia('(pointer: coarse)').matches;
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SHOP_URL = (typeof window.SHOP_URL === 'string' && window.SHOP_URL) ||
    'https://wenumapuonline.com/shop';
  var COUPON = 'WENU-PORTAL';
  var STORE_KEY = 'wenu-portalrun-v1';

  /* ── i18n ─────────────────────────────────────────────────────────── */
  var T = {
    en: {
      chipMain: 'PORTAL RUN',
      chipSub: 'WENU COMMAND · ARCADE',
      chipAttract: 'PRESS START',
      boot: [
        'WENU COMMAND v2 — ASTROPLANETARY GRID ONLINE',
        'AZ MAPU · WORLD-ORDER SYNCED [ WENU MAPU → NAG MAPU ]',
        'ANTÜ IGNITION <span class="ok">OK</span> · KÜYEN TRACKING <span class="ok">OK</span>',
        'HULL SHIELD CHARGED · RAIL THRUST NOMINAL',
        'FRAGMENT SCANNER LIVE · ATACAMA SIGNATURE DETECTED',
        'PORTAL LOCK · TRAWÜN COORDINATES ACQUIRED',
        'ALL SYSTEMS GO — PILOT, THE GRID IS YOURS',
      ],
      kicker: 'WENU COMMAND · ARCADE MODE',
      title: 'Portal <em>Run</em>',
      sub: 'AN ASTROPLANETARY CROSSING',
      briefing: 'A fragment tore loose on the rail ahead — real Atacama matter, the same we set into sterling silver. Fly the gates clean, sweep every fragment the scanner lights, and keep your shield alive to the far end. Reach the portal at Trawün and the crossing opens.',
      mission: 'FLY THE GATES · CATCH THE FRAGMENTS · REACH THE PORTAL',
      start: 'LAUNCH',
      controlsMouse: 'STEER WITH YOUR POINTER · ESC TO PAUSE',
      controlsTouch: 'DRAG YOUR FINGER TO STEER',
      best: 'BEST RUN',
      reducedNote: 'Reduced motion is on — you can claim the crossing without flying.',
      reducedClaim: 'CLAIM THE CODE',
      reducedFly: 'FLY ANYWAY',
      sectors: ['WÜN — THE DAWN THRESHOLD', 'KÜYEN — THE MOON FIELD', 'WÜÑELFE — THE MORNING-STAR APPROACH'],
      warpLabel: 'TRAWÜN — PORTAL LOCK',
      shields: 'SHIELDS',
      score: 'SCORE',
      fragments: 'FRAGMENTS',
      paused: 'PAUSED',
      resume: 'RESUME',
      quit: 'LEAVE THE COCKPIT',
      overTitle: 'SHIELD DOWN',
      overBody: 'Your shield’s spent and the fragment slipped back into the dark. No harm done, pilot — it always circles back for whoever flies again.',
      again: 'FLY AGAIN',
      shop: 'ENTER THE SHOP',
      rewardKicker: 'CROSSING OPEN',
      rewardTitle: 'You reached <em>the portal</em>',
      rewardBody: 'You flew the whole rail and caught the fragment. It opens into a passage — the same portal the rings come through. Your crossing is covered: free shipping on your order, no minimum. The Atacama rings are waiting, each one carrying real meteorite.',
      rewardBodyNoFrag: 'You flew the whole rail — the fragments slipped past, but the portal opened anyway. Your crossing is covered: free shipping on your order, no minimum. The Atacama rings are waiting, each one carrying real meteorite.',
      rewardBodySkip: 'The crossing is yours, no flight required. Free shipping on your order, no minimum. The Atacama rings are waiting on the other side, each one carrying real meteorite.',
      copyHint: 'CLICK TO COPY · FREE SHIPPING, NO MINIMUM',
      copied: 'COPIED — SEE YOU ON THE OTHER SIDE',
      newBest: 'NEW BEST RUN',
      statScore: 'SCORE',
      statFrags: 'FRAGMENTS',
    },
    es: {
      chipMain: 'PORTAL RUN',
      chipSub: 'WENU COMMAND · ARCADE',
      chipAttract: 'PRESS START',
      boot: [
        'WENU COMMAND v2 — GRILLA ASTROPLANETARIA EN LÍNEA',
        'AZ MAPU · ORDEN DE LOS MUNDOS SINCRONIZADO [ WENU MAPU → NAG MAPU ]',
        'IGNICIÓN DE ANTÜ <span class="ok">OK</span> · RASTREO DE KÜYEN <span class="ok">OK</span>',
        'ESCUDO DE CASCO CARGADO · EMPUJE DE RIEL NOMINAL',
        'ESCÁNER DE FRAGMENTOS ACTIVO · FIRMA ATACAMA DETECTADA',
        'FIJACIÓN DE PORTAL · COORDENADAS TRAWÜN ADQUIRIDAS',
        'TODO LISTO — PILOTO, LA GRILLA ES TUYA',
      ],
      kicker: 'WENU COMMAND · MODO ARCADE',
      title: 'Portal <em>Run</em>',
      sub: 'UN CRUCE ASTROPLANETARIO',
      briefing: 'Un fragmento se soltó en el riel más adelante — materia real de Atacama, la misma que engastamos en plata de ley. Cruza las puertas limpio, recoge cada fragmento que encienda el escáner y mantén tu escudo vivo hasta el final. Llega al portal en Trawün y el cruce se abre.',
      mission: 'CRUZA LAS PUERTAS · ATRAPA LOS FRAGMENTOS · LLEGA AL PORTAL',
      start: 'DESPEGAR',
      controlsMouse: 'PILOTA CON EL PUNTERO · ESC PARA PAUSAR',
      controlsTouch: 'ARRASTRA EL DEDO PARA PILOTAR',
      best: 'MEJOR VUELO',
      reducedNote: 'Tienes el movimiento reducido activado — puedes reclamar el cruce sin volar.',
      reducedClaim: 'RECLAMAR EL CÓDIGO',
      reducedFly: 'VOLAR IGUAL',
      sectors: ['WÜN — EL UMBRAL DEL AMANECER', 'KÜYEN — EL CAMPO DE LA LUNA', 'WÜÑELFE — LA APROXIMACIÓN AL LUCERO'],
      warpLabel: 'TRAWÜN — PORTAL FIJADO',
      shields: 'ESCUDO',
      score: 'PUNTOS',
      fragments: 'FRAGMENTOS',
      paused: 'EN PAUSA',
      resume: 'CONTINUAR',
      quit: 'DEJAR LA CABINA',
      overTitle: 'ESCUDO AGOTADO',
      overBody: 'Tu escudo se agotó y el fragmento se perdió en lo oscuro. No pasa nada, piloto — siempre vuelve para quien vuela de nuevo.',
      again: 'VOLAR DE NUEVO',
      shop: 'ENTRAR A LA TIENDA',
      rewardKicker: 'CRUCE ABIERTO',
      rewardTitle: 'Llegaste <em>al portal</em>',
      rewardBody: 'Cruzaste el riel entero y atrapaste el fragmento. Se abre en un pasaje — el mismo portal por donde llegan los anillos. Tu cruce está cubierto: envío gratis en tu orden, sin mínimo. Los anillos de Atacama esperan, cada uno con meteorito real.',
      rewardBodyNoFrag: 'Cruzaste el riel entero — los fragmentos se escaparon, pero el portal se abrió igual. Tu cruce está cubierto: envío gratis en tu orden, sin mínimo. Los anillos de Atacama esperan, cada uno con meteorito real.',
      rewardBodySkip: 'El cruce es tuyo, sin necesidad de volar. Envío gratis en tu orden, sin mínimo. Los anillos de Atacama esperan del otro lado, cada uno con meteorito real.',
      copyHint: 'CLIC PARA COPIAR · ENVÍO GRATIS, SIN MÍNIMO',
      copied: 'COPIADO — NOS VEMOS DEL OTRO LADO',
      newBest: 'NUEVO MEJOR VUELO',
      statScore: 'PUNTOS',
      statFrags: 'FRAGMENTOS',
    },
  };
  function lang() {
    var l = document.documentElement.getAttribute('lang') || 'en';
    return l.indexOf('es') === 0 ? 'es' : 'en';
  }
  function tx() { return T[lang()]; }

  /* ── Tiny DOM helpers (window.$ is lexical in the inline script) ──── */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function loaderGone() {
    var l = document.getElementById('loading');
    return !l || l.style.display === 'none' || l.classList.contains('is-dismissed');
  }
  function store() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function saveStore(patch) {
    try {
      var s = store();
      for (var k in patch) s[k] = patch[k];
      localStorage.setItem(STORE_KEY, JSON.stringify(s));
    } catch (e) { /* private mode — non-fatal */ }
  }

  /* ══════════════════════════════════════════════════════════════════
     ENGINE CONSTANTS (see research spec — pinhole projection)
     ══════════════════════════════════════════════════════════════════ */
  var FOCAL = 320;
  var Z_NEAR = 12, Z_SPAWN = 900, Z_KILL = 10, Z_FADEIN = 700;
  var HIT_Z = 40;                 // swept-crossing plane (mid of [18,60])
  var RAIL_HW = 154, RAIL_HH = 106;  // wider reach → ship responds harder to input
  var SHIP_R = 26;
  var SHIP_SMOOTH = 0.0011;           // lower = snappier follow (was 0.0025)
  var TOTAL_T = 69, WARP_T = 6;   // 3×23s sectors + 6s warp
  var SECTORS = [
    { speed: 380, gateEvery: 3.5, gateOff: 0,  gateR: 70, fragEvery: 2.0, debrisEvery: 4.0, walls: 1 },
    { speed: 510, gateEvery: 2.6, gateOff: 60, gateR: 60, fragEvery: 1.6, debrisEvery: 1.8, walls: 2 },
    { speed: 660, gateEvery: 1.8, gateOff: 90, gateR: 55, fragEvery: 1.4, debrisEvery: 1.3, walls: 3 },
  ];

  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, CX = 0, CY = 0;
  var bgGrad = null, glowGrad = null;  // cached background depth (rebuilt on resize)

  /* ── Entity pools (fixed — zero allocation inside the loop) ───────── */
  var N_STARS = IS_TOUCH ? 90 : 140;
  var stars = [];
  for (var i = 0; i < 140; i++) stars.push({ x: 0, y: 0, z: 0, pz: 0 });
  function resetStar(s, deep) {
    s.x = (Math.random() * 2 - 1) * 800;
    s.y = (Math.random() * 2 - 1) * 600;
    s.z = deep ? Math.random() * (Z_SPAWN - Z_NEAR) + Z_NEAR : Z_SPAWN;
    s.pz = s.z;
  }
  var gates = [], frags = [], rocks = [], pops = [], sparks = [];
  for (i = 0; i < 6; i++) gates.push({ on: false, x: 0, y: 0, z: 0, pz: 0, r: 70, passed: false, flash: 0 });
  for (i = 0; i < 16; i++) frags.push({ on: false, x: 0, y: 0, z: 0, pz: 0, rot: 0, rs: 0, got: 0 });
  for (i = 0; i < 12; i++) rocks.push({ on: false, x: 0, y: 0, z: 0, pz: 0, r: 34, v: null, kind: 'debris', rot: 0 });
  for (i = 0; i < 10; i++) pops.push({ on: false, x: 0, y: 0, t: 0, txt: '' });
  for (i = 0; i < 40; i++) sparks.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, t: 0 });
  var drawList = new Array(40); // reused each frame

  var ship = { x: 0, y: 0, tx: 0, ty: 0, bank: 0 };
  var keys = { l: false, r: false, u: false, d: false };

  /* ── Run state ────────────────────────────────────────────────────── */
  var state = 'idle';   // idle|boot|title|count|play|warp|pause|over|reward
  var pausedFrom = 'play';
  var rafId = 0, lastTs = 0;
  var t = 0, warpT = 0, countT = 0;
  var speed = 320, score = 0, combo = 1, shields = 3, fragCount = 0;
  var iframes = 0, shake = 0, flashT = 0;
  var sectorIdx = -1;
  var gateTimer = 0, fragTimer = 0, rockTimer = 0, tunnelTimer = 0;
  var safeX = 0, safeDrift = 30;
  var playedThisRun = false;
  var lastRewardSkipped = false; // remembers which reward variant is showing

  /* ── DOM refs (built once, lazily) ────────────────────────────────── */
  var chip, root, canvas, ctx, hud, hudScore, hudCombo, hudFrags, hudGems,
    hudSector, hudFill, scrBoot, bootInner, scrTitle, scrCount, countNum,
    scrPause, scrOver, scrReward, flashEl;
  var hidden = []; // site chrome we hid on open — restored on exit
  var lastScoreShown = -1, lastComboShown = -1;
  var comboTimer = 0; // single owner of the combo-pop timeout

  /* ══════════════════════════════════════════════════════════════════
     LAUNCH CHIP (on the star map)
     ══════════════════════════════════════════════════════════════════ */
  function buildChip() {
    chip = el('button', '', '');
    chip.id = 'pr-chip';
    chip.setAttribute('aria-label', 'Portal Run — arcade mode');
    chip.appendChild(el('span', 'pr-chip-dot'));
    chip.appendChild(el('span', 'pr-chip-main', T.en.chipMain));
    chip.appendChild(el('span', 'pr-chip-sub', T.en.chipSub));
    chip.addEventListener('click', function (e) {
      e.stopPropagation(); // keep the global gold-ripple handler quiet
      openGame();
    });
    document.body.appendChild(chip);
    applyChipText();
  }
  function applyChipText() {
    if (!chip) return;
    chip.children[1].textContent = tx().chipMain;
    chip.children[2].textContent = chip.classList.contains('pr-attract')
      ? tx().chipAttract : tx().chipSub;
    chip.setAttribute('aria-label', lang() === 'es'
      ? 'Portal Run — modo arcade' : 'Portal Run — arcade mode');
    var exitBtn = document.getElementById('pr-exit');
    if (exitBtn) exitBtn.setAttribute('aria-label', lang() === 'es' ? 'Salir' : 'Exit');
  }

  /* Idle attract: pulse the chip after 25s without input on the map */
  var idleTimer = 0;
  function armIdle() {
    clearTimeout(idleTimer);
    if (chip) { chip.classList.remove('pr-attract'); applyChipText(); }
    idleTimer = setTimeout(function () {
      var deep = document.getElementById('deep-portal');
      if (state === 'idle' && chip && loaderGone() &&
          !(deep && deep.classList.contains('open'))) {
        chip.classList.add('pr-attract');
        applyChipText();
      }
    }, 25000);
  }
  ['mousemove', 'pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
    document.addEventListener(ev, armIdle, { passive: true });
  });

  /* ══════════════════════════════════════════════════════════════════
     GAME OVERLAY DOM
     ══════════════════════════════════════════════════════════════════ */
  function buildRoot() {
    if (root) return;
    root = el('div'); root.id = 'pr-root';

    canvas = el('canvas'); canvas.id = 'pr-canvas';
    root.appendChild(canvas);
    ctx = canvas.getContext('2d');

    ['tl', 'tr', 'bl', 'br'].forEach(function (c) {
      root.appendChild(el('div', 'pr-strut ' + c));
    });

    /* HUD */
    hud = el('div'); hud.id = 'pr-hud';
    var sh = el('div'); sh.id = 'pr-shields';
    sh.appendChild(el('span', 'pr-label', ''));
    hudGems = [];
    for (var g = 0; g < 3; g++) { var gem = el('span', 'pr-gem'); hudGems.push(gem); sh.appendChild(gem); }
    hud.appendChild(sh);
    var sb = el('div'); sb.id = 'pr-score-box';
    hudScore = el('div'); hudScore.id = 'pr-score'; hudScore.textContent = '0';
    var sl = el('div'); sl.id = 'pr-score-label';
    hudCombo = el('div'); hudCombo.id = 'pr-combo';
    sb.appendChild(hudScore); sb.appendChild(sl); sb.appendChild(hudCombo);
    hud.appendChild(sb);
    hudFrags = el('div'); hudFrags.id = 'pr-frags-box';
    hud.appendChild(hudFrags);
    var pw = el('div'); pw.id = 'pr-progress-wrap';
    hudSector = el('div'); hudSector.id = 'pr-sector-label';
    var pr = el('div'); pr.id = 'pr-progress';
    hudFill = el('div'); hudFill.id = 'pr-progress-fill';
    pr.appendChild(hudFill);
    pr.appendChild(el('span', 'pr-notch n1'));
    pr.appendChild(el('span', 'pr-notch n2'));
    pw.appendChild(hudSector); pw.appendChild(pr);
    hud.appendChild(pw);
    root.appendChild(hud);

    /* Screens */
    scrBoot = el('div', 'pr-screen'); scrBoot.id = 'pr-boot';
    bootInner = el('div'); bootInner.id = 'pr-boot-inner';
    scrBoot.appendChild(bootInner);
    root.appendChild(scrBoot);

    scrTitle = el('div', 'pr-screen'); scrTitle.id = 'pr-title';
    root.appendChild(scrTitle);

    scrCount = el('div', 'pr-screen'); scrCount.id = 'pr-count';
    countNum = el('div'); countNum.id = 'pr-count-num';
    scrCount.appendChild(countNum);
    root.appendChild(scrCount);

    scrPause = el('div', 'pr-screen'); scrPause.id = 'pr-pause';
    root.appendChild(scrPause);

    scrOver = el('div', 'pr-screen'); scrOver.id = 'pr-over';
    root.appendChild(scrOver);

    scrReward = el('div', 'pr-screen'); scrReward.id = 'pr-reward';
    root.appendChild(scrReward);

    flashEl = el('div'); flashEl.id = 'pr-flash';
    root.appendChild(flashEl);

    var exit = el('button', '', '✕'); exit.id = 'pr-exit';
    exit.setAttribute('aria-label', 'Exit');
    exit.addEventListener('click', function (e) {
      e.stopPropagation();
      /* mid-flight the ✕ pauses instead of destroying the run — the pause
         menu offers LEAVE THE COCKPIT (only touch pause control there is) */
      if (state === 'play' || state === 'warp' || state === 'count') pauseGame();
      else closeGame();
    });
    root.appendChild(exit);

    document.body.appendChild(root);
    bindInput();
  }

  /* ── Screen text renderers (re-run on lang flip) ──────────────────── */
  function renderHudText() {
    var d = tx();
    hud.querySelector('.pr-label').textContent = d.shields;
    document.getElementById('pr-score-label').textContent = d.score;
    hudFrags.textContent = '◆ ' + d.fragments + ' — ' + fragCount;
  }
  function renderTitle() {
    var d = tx(), s = store();
    var html =
      '<div class="pr-kicker">' + d.kicker + '</div>' +
      '<h2 class="pr-title-big">' + d.title + '</h2>' +
      '<div class="pr-sub">' + d.sub + '</div>' +
      '<p class="pr-body">' + d.briefing + '</p>' +
      '<div class="pr-mission">' + d.mission + '</div>';
    if (REDUCED) {
      html += '<p class="pr-hint">' + d.reducedNote + '</p>' +
        '<div class="pr-btn-row">' +
        '<button class="pr-btn" id="pr-claim">' + d.reducedClaim + '</button>' +
        '<button class="pr-btn pr-ghost" id="pr-go">' + d.reducedFly + '</button>' +
        '</div>';
    } else {
      html += '<div class="pr-btn-row">' +
        '<button class="pr-btn" id="pr-go">' + d.start + ' →</button></div>' +
        '<div class="pr-hint">' + (IS_TOUCH ? d.controlsTouch : d.controlsMouse) + '</div>';
    }
    if (s.best) html += '<div class="pr-best">' + d.best + ' — <strong>' + s.best + '</strong></div>';
    scrTitle.innerHTML = html;
    var go = document.getElementById('pr-go');
    if (go) go.addEventListener('click', function (e) { e.stopPropagation(); startCountdown(); });
    var claim = document.getElementById('pr-claim');
    if (claim) claim.addEventListener('click', function (e) { e.stopPropagation(); showReward(true); });
  }
  function renderPause() {
    var d = tx();
    scrPause.innerHTML =
      '<div class="pr-kicker">' + d.paused + '</div>' +
      '<div class="pr-btn-row">' +
      '<button class="pr-btn" id="pr-resume">' + d.resume + '</button>' +
      '<button class="pr-btn pr-ghost" id="pr-quit">' + d.quit + '</button>' +
      '</div>';
    document.getElementById('pr-resume').addEventListener('click', function (e) { e.stopPropagation(); resumeGame(); });
    document.getElementById('pr-quit').addEventListener('click', function (e) { e.stopPropagation(); closeGame(); });
  }
  function renderOver() {
    var d = tx();
    scrOver.innerHTML =
      '<div class="pr-kicker">' + d.overTitle + '</div>' +
      '<p class="pr-body">' + d.overBody + '</p>' +
      '<div class="pr-btn-row">' +
      '<button class="pr-btn" id="pr-retry">' + d.again + '</button>' +
      '<button class="pr-btn pr-ghost" id="pr-shop-o">' + d.shop + ' →</button>' +
      '</div>';
    document.getElementById('pr-retry').addEventListener('click', function (e) { e.stopPropagation(); startCountdown(); });
    document.getElementById('pr-shop-o').addEventListener('click', function (e) { e.stopPropagation(); window.location.href = SHOP_URL; });
  }
  function renderReward(skipped) {
    var d = tx(), s = store();
    var html =
      '<div class="pr-kicker">' + d.rewardKicker + '</div>' +
      '<h2 class="pr-title-big">' + d.rewardTitle + '</h2>';
    if (!skipped && playedThisRun) {
      html += '<div class="pr-stats">' +
        '<div class="pr-stat"><b>' + score + '</b><span>' + d.statScore + '</span></div>' +
        '<div class="pr-stat"><b>' + fragCount + '</b><span>' + d.statFrags + '</span></div>' +
        '</div>' +
        '<div id="pr-newbest"' + (score > (s.best || 0) ? ' class="pr-show"' : '') + '>◆ ' + d.newBest + ' ◆</div>';
    }
    /* pick body copy that matches what actually happened */
    var body = skipped ? d.rewardBodySkip : (fragCount > 0 ? d.rewardBody : d.rewardBodyNoFrag);
    html += '<p class="pr-body">' + body + '</p>' +
      '<div class="pr-coupon" id="pr-coupon" role="button" tabindex="0">' +
      '<span class="pr-code">' + COUPON + '</span>' +
      '<span class="pr-copy-hint">' + d.copyHint + '</span>' +
      '</div>' +
      '<div class="pr-btn-row">' +
      '<button class="pr-btn" id="pr-shop-r">' + d.shop + ' →</button>' +
      '<button class="pr-btn pr-ghost" id="pr-again">' + d.again + '</button>' +
      '</div>';
    scrReward.innerHTML = html;
    document.getElementById('pr-shop-r').addEventListener('click', function (e) { e.stopPropagation(); window.location.href = SHOP_URL; });
    document.getElementById('pr-again').addEventListener('click', function (e) { e.stopPropagation(); startCountdown(); });
    var coup = document.getElementById('pr-coupon');
    coup.addEventListener('click', function (e) {
      e.stopPropagation();
      copyCode(coup);
    });
    coup.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); copyCode(coup); }
    });
  }
  function copyCode(coup) {
    var hint = coup.querySelector('.pr-copy-hint');
    var done = function () { hint.textContent = tx().copied; };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(COUPON).then(done).catch(function () { fallbackCopy(done); });
    } else fallbackCopy(done);
  }
  function fallbackCopy(done) {
    try {
      var ta = document.createElement('textarea');
      ta.value = COUPON;
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      done();
    } catch (e) { /* leave hint as-is */ }
  }

  /* ══════════════════════════════════════════════════════════════════
     OPEN / CLOSE — cover the site, hide its cursor pair, restore later
     ══════════════════════════════════════════════════════════════════ */
  function openGame() {
    if (root && root.classList.contains('pr-open')) return; // reentrancy guard
    buildRoot();
    resize();
    /* Hide site cursor + trail + battery-hungry bg canvases (restored on exit) */
    hidden = [];
    ['cur', 'trail-canvas', 'cosmos', 'glyphs'].forEach(function (id) {
      var n = document.getElementById(id);
      if (n && n.style.display !== 'none') { hidden.push(n); n.style.display = 'none'; }
    });
    var dust = document.querySelector('canvas#dust');
    if (dust && dust.style.display !== 'none') { hidden.push(dust); dust.style.display = 'none'; }
    /* display:none does NOT stop the site's rAF raster work — shrink the
       hidden canvases' backing stores to 1×1 so raster cost → ~0 while the
       game runs. On exit a synthetic window resize restores them. */
    hidden.forEach(function (n) {
      if (n.tagName === 'CANVAS') { n.width = 1; n.height = 1; }
    });
    root.classList.add('pr-open');
    // seed the starfield mid-depth so the first frame isn't empty
    for (var i = 0; i < N_STARS; i++) resetStar(stars[i], true);
    startBoot();
  }
  function closeGame() {
    stopLoop();
    state = 'idle';
    root.classList.remove('pr-open', 'pr-playing');
    hideAllScreens();
    hidden.forEach(function (n) { n.style.display = ''; });
    hidden = [];
    /* the site's own resize handlers restore every canvas backing store */
    try { window.dispatchEvent(new Event('resize')); } catch (e) { /* old WebKit */ }
    armIdle();
  }
  function hideAllScreens() {
    [scrBoot, scrTitle, scrCount, scrPause, scrOver, scrReward].forEach(function (s) {
      if (s) s.classList.remove('pr-show');
    });
    if (hud) hud.classList.remove('pr-show');
  }
  function show(scr) { hideAllScreens(); scr.classList.add('pr-show'); }

  /* ── Boot sequence — terminal lines, skippable ────────────────────── */
  var bootTimers = [];
  function startBoot() {
    state = 'boot';
    show(scrBoot);
    bootInner.innerHTML = '';
    bootTimers.forEach(clearTimeout); bootTimers = [];
    var lines = tx().boot;
    var delay = REDUCED ? 60 : 340;
    for (var i = 0; i < lines.length; i++) {
      (function (i) {
        var ln = el('div', 'pr-boot-line', '&gt; ' + lines[i]);
        bootInner.appendChild(ln);
        bootTimers.push(setTimeout(function () { ln.classList.add('pr-lit'); }, 200 + i * delay));
      })(i);
    }
    var caret = el('span', 'pr-boot-caret');
    bootInner.appendChild(caret);
    bootTimers.push(setTimeout(showTitle, 500 + lines.length * delay + 500));
    /* click / key skips to title */
    scrBoot.onclick = function (e) { e.stopPropagation(); showTitle(); };
  }
  function showTitle() {
    if (state !== 'boot' && state !== 'over' && state !== 'reward') return;
    bootTimers.forEach(clearTimeout); bootTimers = [];
    state = 'title';
    renderTitle();
    show(scrTitle);
    startLoop(); // slow idle starfield behind the title
  }

  /* ── Countdown → play ─────────────────────────────────────────────── */
  function startCountdown() {
    resetRun();
    state = 'count';
    countT = 0;
    show(scrCount);
    countNum.textContent = '3';
    startLoop();
  }
  function resetRun() {
    t = 0; warpT = 0; score = 0; combo = 1; shields = 3; fragCount = 0;
    iframes = 0; shake = 0; flashT = 0; sectorIdx = -1;
    gateTimer = 1.2; fragTimer = 0.6; rockTimer = 3; tunnelTimer = 0;
    safeX = 0; playedThisRun = true;
    ship.x = 0; ship.y = 0; ship.tx = 0; ship.ty = 0; ship.bank = 0;
    lastScoreShown = -1; lastComboShown = -1;
    var i;
    for (i = 0; i < gates.length; i++) gates[i].on = false;
    for (i = 0; i < frags.length; i++) frags[i].on = false;
    for (i = 0; i < rocks.length; i++) rocks[i].on = false;
    for (i = 0; i < pops.length; i++) pops[i].on = false;
    for (i = 0; i < sparks.length; i++) sparks[i].on = false;
    for (i = 0; i < N_STARS; i++) resetStar(stars[i], true);
    speed = SECTORS[0].speed;
    for (i = 0; i < hudGems.length; i++) hudGems[i].classList.remove('pr-lost');
    hudFill.style.transform = 'scaleX(0)';
    renderHudText();
  }
  function beginPlay() {
    state = 'play';
    root.classList.add('pr-playing');
    hideAllScreens();
    hud.classList.add('pr-show');
    renderHudText();
  }

  /* ── Pause / resume ───────────────────────────────────────────────── */
  function pauseGame() {
    if (state !== 'play' && state !== 'count' && state !== 'warp') return;
    pausedFrom = state;
    state = 'pause';
    keys.l = keys.r = keys.u = keys.d = false; // held keys don't survive pause
    stopLoop();
    renderPause();
    scrPause.classList.add('pr-show');
  }
  function resumeGame() {
    if (state !== 'pause') return;
    scrPause.classList.remove('pr-show');
    state = pausedFrom;
    lastTs = 0; // fresh dt on resume
    startLoop();
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) pauseGame();
  });
  window.addEventListener('blur', function () { pauseGame(); });

  /* ── Endings ──────────────────────────────────────────────────────── */
  function gameOver() {
    state = 'over';
    root.classList.remove('pr-playing');
    stopLoop();
    saveStore({ runs: (store().runs || 0) + 1, best: Math.max(store().best || 0, score) });
    renderOver();
    show(scrOver);
  }
  function showReward(skipped) {
    state = 'reward';
    lastRewardSkipped = skipped; // so a lang flip re-renders the SAME variant
    root.classList.remove('pr-playing');
    stopLoop();
    /* render BEFORE saving so "new best" compares against the old record */
    renderReward(skipped);
    show(scrReward);
    if (!skipped) {
      saveStore({
        runs: (store().runs || 0) + 1,
        completed: true,
        best: Math.max(store().best || 0, score),
      });
    } else {
      saveStore({ completed: true });
    }
  }

  /* ══════════════════════════════════════════════════════════════════
     INPUT
     ══════════════════════════════════════════════════════════════════ */
  function bindInput() {
    root.addEventListener('pointermove', function (e) {
      if (state !== 'play' && state !== 'warp' && state !== 'count') return;
      if (!W || !H) return;                 // pre-resize guard (0/0 → NaN)
      if (e.isPrimary === false) return;    // ignore second finger
      var nx = (e.clientX / W) * 2 - 1;
      var ny = (e.clientY / H) * 2 - 1;
      /* touch: finger sits below the ship; rescale so the whole rail
         stays reachable despite the offset */
      if (IS_TOUCH) ny = ny * 1.35 - 0.24;
      ship.tx = Math.max(-1, Math.min(1, nx)) * RAIL_HW;
      ship.ty = Math.max(-1, Math.min(1, ny)) * RAIL_HH;
    }, { passive: true });
    root.addEventListener('touchmove', function (e) {
      if (state === 'play' || state === 'warp' || state === 'count') e.preventDefault();
    }, { passive: false });

    /* CAPTURE phase: the star map's own document-level keydown handlers
       (registered first, bubble phase) otherwise fire underneath — Enter
       with no focused star clicks #skip-intro and leaves for the shop. */
    document.addEventListener('keydown', function (e) {
      if (state === 'idle') return;
      var k = e.key;
      /* swallow everything the map might interpret while the cockpit is open */
      if (k === 'Enter' || k === ' ' || k === 'Tab' || k === 'Escape' ||
          k.indexOf('Arrow') === 0 || 'wasdWASD'.indexOf(k) !== -1) {
        e.stopPropagation();
      }
      if (k === 'Escape') {
        if (state === 'play' || state === 'warp' || state === 'count') { pauseGame(); }
        else if (state === 'pause') { resumeGame(); }
        e.preventDefault();
        return;
      }
      if (state === 'boot' && (k === ' ' || k === 'Enter')) { showTitle(); e.preventDefault(); return; }
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') keys.l = true;
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') keys.r = true;
      else if (k === 'ArrowUp' || k === 'w' || k === 'W') keys.u = true;
      else if (k === 'ArrowDown' || k === 's' || k === 'S') keys.d = true;
      else return;
      e.preventDefault();
    }, true); /* capture: runs before the map's bubble-phase handlers */
    document.addEventListener('keyup', function (e) {
      var k = e.key;
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') keys.l = false;
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') keys.r = false;
      else if (k === 'ArrowUp' || k === 'w' || k === 'W') keys.u = false;
      else if (k === 'ArrowDown' || k === 's' || k === 'S') keys.d = false;
    });
  }

  /* ══════════════════════════════════════════════════════════════════
     SPAWNERS
     ══════════════════════════════════════════════════════════════════ */
  function firstFree(pool) {
    for (var i = 0; i < pool.length; i++) if (!pool[i].on) return pool[i];
    return null;
  }
  function spawnGate(cfg) {
    var g = firstFree(gates);
    if (!g) return;
    g.on = true; g.passed = false; g.flash = 0;
    g.r = cfg.gateR;
    g.x = (Math.random() * 2 - 1) * cfg.gateOff;
    g.y = (Math.random() * 2 - 1) * cfg.gateOff * 0.6;
    g.z = Z_SPAWN; g.pz = Z_SPAWN;
  }
  function spawnFragCluster() {
    var n = 3 + Math.floor(Math.random() * 3);
    var cx0 = (Math.random() * 2 - 1) * 90;
    var cy0 = (Math.random() * 2 - 1) * 60;
    for (var i = 0; i < n; i++) {
      var f = firstFree(frags);
      if (!f) return;
      f.on = true; f.got = 0;
      var a = (i / n) * Math.PI * 2;
      f.x = cx0 + Math.cos(a) * 26;
      f.y = cy0 + Math.sin(a) * 18;
      f.z = Z_SPAWN + i * 40; f.pz = f.z;
      f.rot = Math.random() * Math.PI;
      f.rs = 0.6 + Math.random() * 1.2;
    }
  }
  var LANES = [-104, -52, 0, 52, 104];
  function spawnRockWall(cfg) {
    /* fairness: never block the lane closest to safeX (random-walked) */
    safeX += (Math.random() * 2 - 1) * safeDrift;
    safeX = Math.max(-104, Math.min(104, safeX));
    var safeLane = 0, bd = 1e9;
    for (var i = 0; i < LANES.length; i++) {
      var d = Math.abs(LANES[i] - safeX);
      if (d < bd) { bd = d; safeLane = i; }
    }
    var placed = 0, want = Math.min(cfg.walls, 3);
    var order = [0, 1, 2, 3, 4].sort(function () { return Math.random() - 0.5; });
    for (i = 0; i < order.length && placed < want; i++) {
      var li = order[i];
      /* leave the safe lane AND its neighbours clear — rocks are wide */
      if (Math.abs(li - safeLane) <= 1) continue;
      var r = firstFree(rocks);
      if (!r) break;
      r.on = true;
      /* ~40% of hazards are crystal shards (silver-blue) vs dark debris */
      r.kind = Math.random() < 0.42 ? 'crystal' : 'debris';
      r.rot = (Math.random() * 2 - 1) * 0.45;
      r.x = LANES[li] + (Math.random() * 2 - 1) * 14;
      r.y = (Math.random() * 2 - 1) * 55;
      r.z = Z_SPAWN; r.pz = Z_SPAWN;
      if (!r.v) r.v = [];
      r.v.length = 0;
      var verts = 7;
      for (var v = 0; v < verts; v++) {
        var ang = (v / verts) * Math.PI * 2;
        var rad = 0.72 + Math.random() * 0.4;
        r.v.push(Math.cos(ang) * rad, Math.sin(ang) * rad);
      }
      placed++;
    }
  }
  function spawnPop(sx, sy, txt) {
    var p = firstFree(pops);
    if (!p) return;
    p.on = true; p.t = 0; p.txt = txt;
    p.x = Math.max(40, Math.min(W - 40, sx));
    p.y = Math.max(50, Math.min(H - 50, sy));
  }
  function spawnSparks(sx, sy, n) {
    for (var i = 0; i < n; i++) {
      var s = firstFree(sparks);
      if (!s) return;
      s.on = true; s.t = 0;
      s.x = sx; s.y = sy;
      var a = Math.random() * Math.PI * 2, sp = 40 + Math.random() * 140;
      s.vx = Math.cos(a) * sp; s.vy = Math.sin(a) * sp;
    }
  }

  /* ══════════════════════════════════════════════════════════════════
     UPDATE
     ══════════════════════════════════════════════════════════════════ */
  function update(dt) {
    /* ship follow — framerate-independent lerp + keyboard */
    var kv = 340 * dt;
    if (keys.l) ship.tx -= kv;
    if (keys.r) ship.tx += kv;
    if (keys.u) ship.ty -= kv;
    if (keys.d) ship.ty += kv;
    ship.tx = Math.max(-RAIL_HW, Math.min(RAIL_HW, ship.tx));
    ship.ty = Math.max(-RAIL_HH, Math.min(RAIL_HH, ship.ty));
    var k = 1 - Math.pow(SHIP_SMOOTH, dt);
    var dx = ship.tx - ship.x, dy = ship.ty - ship.y;
    if (Math.abs(dx) > 1) ship.x += dx * k;
    if (Math.abs(dy) > 1) ship.y += dy * k;
    ship.bank += ((dx * 0.004) - ship.bank) * Math.min(1, dt * 10);
    ship.bank = Math.max(-0.35, Math.min(0.35, ship.bank));

    if (iframes > 0) iframes -= dt;
    if (shake > 0) shake = Math.max(0, shake - dt * 22);
    if (flashT > 0) flashT -= dt;

    var i, e;

    if (state === 'title') {
      /* idle drift behind the title — starfield only, slow */
      for (i = 0; i < N_STARS; i++) {
        e = stars[i]; e.pz = e.z; e.z -= 60 * dt;
        if (e.z < Z_KILL) resetStar(e, false);
      }
      return;
    }

    if (state === 'count') {
      countT += dt;
      var n = 3 - Math.floor(countT / 0.6);
      if (n >= 1 && String(n) !== countNum.textContent) {
        countNum.textContent = String(n);
        /* retrigger pop animation */
        countNum.style.animation = 'none';
        void countNum.offsetWidth;
        countNum.style.animation = '';
      }
      if (countT >= 1.8) beginPlay();
      /* stars keep streaming during countdown */
      for (i = 0; i < N_STARS; i++) {
        e = stars[i]; e.pz = e.z; e.z -= speed * dt;
        if (e.z < Z_KILL) resetStar(e, false);
      }
      return;
    }

    /* ── PLAY / WARP ── */
    if (state === 'play') {
      t += dt;
      var si = Math.min(2, Math.floor(t / 23));
      if (si !== sectorIdx) {
        sectorIdx = si;
        hudSector.textContent = tx().sectors[si];
      }
      var cfg = SECTORS[sectorIdx];
      speed += (cfg.speed - speed) * Math.min(1, dt * 1.6);

      /* spawn timers */
      gateTimer -= dt;
      if (gateTimer <= 0) { spawnGate(cfg); gateTimer = cfg.gateEvery * (0.85 + Math.random() * 0.3); }
      fragTimer -= dt;
      if (fragTimer <= 0) { spawnFragCluster(); fragTimer = cfg.fragEvery * (0.85 + Math.random() * 0.3); }
      rockTimer -= dt;
      if (rockTimer <= 0) { spawnRockWall(cfg); rockTimer = cfg.debrisEvery * (0.85 + Math.random() * 0.3); }

      if (t >= TOTAL_T) {
        state = 'warp';
        hudSector.textContent = tx().warpLabel;
      }
    } else if (state === 'warp') {
      warpT += dt;
      speed += (1050 - speed) * Math.min(1, dt * 1.2);
      tunnelTimer -= dt;
      if (tunnelTimer <= 0) {
        var g = firstFree(gates);
        if (g) {
          g.on = true; g.passed = true; g.flash = 0; /* passed → no scoring */
          g.r = 60 + Math.random() * 30;
          g.x = 0; g.y = 0;
          g.z = Z_SPAWN; g.pz = Z_SPAWN;
        }
        tunnelTimer = 0.22;
      }
      if (warpT >= WARP_T) {
        flashEl.classList.add('pr-lit');
        setTimeout(function () { flashEl.classList.remove('pr-lit'); }, 700);
        showReward(false);
        return;
      }
    }

    hudFill.style.transform = 'scaleX(' + Math.min(1, t / TOTAL_T) + ')';

    /* stars */
    for (i = 0; i < N_STARS; i++) {
      e = stars[i]; e.pz = e.z; e.z -= speed * dt;
      if (e.z < Z_KILL) resetStar(e, false);
    }

    var inPlay = state === 'play';

    /* gates */
    for (i = 0; i < gates.length; i++) {
      e = gates[i];
      if (!e.on) continue;
      e.pz = e.z; e.z -= speed * dt;
      if (e.flash > 0) e.flash -= dt;
      if (inPlay && !e.passed && e.pz > HIT_Z && e.z <= HIT_Z) {
        e.passed = true;
        var gdx = ship.x - e.x, gdy = ship.y - e.y;
        if (Math.sqrt(gdx * gdx + gdy * gdy) < e.r * 0.82) {
          var pts = 150 * combo;
          score += pts;
          combo = Math.min(9, combo + 1);
          e.flash = 0.25;
          var pj = project(e.x - ship.x, e.y - ship.y, HIT_Z);
          spawnPop(pj.x, pj.y, '+' + pts);
          spawnSparks(pj.x, pj.y, 4);
        } else {
          combo = 1;
        }
      }
      if (e.z < Z_KILL) e.on = false;
    }

    /* fragments */
    for (i = 0; i < frags.length; i++) {
      e = frags[i];
      if (!e.on) continue;
      e.pz = e.z; e.z -= speed * dt;
      e.rot += e.rs * dt;
      if (e.got > 0) {
        e.got += dt;
        if (e.got > 0.25) e.on = false;
        continue;
      }
      if (inPlay && e.pz > HIT_Z && e.z <= HIT_Z) {
        var fdx = ship.x - e.x, fdy = ship.y - e.y;
        if (Math.sqrt(fdx * fdx + fdy * fdy) < 22 + SHIP_R) {
          e.got = 0.01;
          var fpts = 50 * combo;
          score += fpts;
          fragCount++;
          hudFrags.textContent = '◆ ' + tx().fragments + ' — ' + fragCount;
          var pjf = project(e.x - ship.x, e.y - ship.y, HIT_Z);
          spawnPop(pjf.x, pjf.y, '+' + fpts);
          spawnSparks(pjf.x, pjf.y, 6);
        }
      }
      if (e.z < Z_KILL) e.on = false;
    }

    /* debris */
    for (i = 0; i < rocks.length; i++) {
      e = rocks[i];
      if (!e.on) continue;
      e.pz = e.z; e.z -= speed * dt;
      if (inPlay && e.pz > HIT_Z && e.z <= HIT_Z && iframes <= 0) {
        var rdx = ship.x - e.x, rdy = ship.y - e.y;
        if (Math.sqrt(rdx * rdx + rdy * rdy) < e.r + SHIP_R * 0.8) {
          shields--;
          combo = 1;
          iframes = 0.9;
          shake = 9;
          flashT = 0.18;
          if (hudGems[shields]) hudGems[shields].classList.add('pr-lost');
          if (typeof window.triggerGlitch === 'function') {
            try { window.triggerGlitch(); } catch (err) { /* cosmetic */ }
          }
          if (shields <= 0) { gameOver(); return; }
        }
      }
      if (e.z < Z_KILL) e.on = false;
    }

    /* popups & sparks (screen space) */
    for (i = 0; i < pops.length; i++) {
      e = pops[i];
      if (!e.on) continue;
      e.t += dt; e.y -= 34 * dt;
      if (e.t > 0.6) e.on = false;
    }
    for (i = 0; i < sparks.length; i++) {
      e = sparks[i];
      if (!e.on) continue;
      e.t += dt;
      e.x += e.vx * dt; e.y += e.vy * dt;
      e.vx *= (1 - 2.4 * dt); e.vy *= (1 - 2.4 * dt);
      if (e.t > 0.5) e.on = false;
    }

    /* HUD numbers — only touch the DOM when the value changed */
    if (score !== lastScoreShown) { hudScore.textContent = String(score); lastScoreShown = score; }
    if (combo !== lastComboShown) {
      hudCombo.textContent = combo > 1 ? '×' + combo : '';
      hudCombo.classList.add('pr-pop');
      clearTimeout(comboTimer);
      comboTimer = setTimeout(function () { hudCombo.classList.remove('pr-pop'); }, 160);
      lastComboShown = combo;
    }
  }

  /* ══════════════════════════════════════════════════════════════════
     RENDER — camera laterally follows the ship (Starfox convergence)
     ══════════════════════════════════════════════════════════════════ */
  function project(rx, ry, z) {
    var s = FOCAL / z;
    return { x: CX + rx * s, y: CY + ry * s, s: s };
  }

  function draw() {
    /* immersive depth background (cached gradients) instead of a flat fill */
    ctx.fillStyle = bgGrad || '#0a0a0a';
    ctx.fillRect(0, 0, W, H);
    if (glowGrad) {
      /* glow breathes with speed — brighter the faster you fly */
      ctx.globalAlpha = 0.6 + Math.min(0.4, speed / 1400);
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }

    var shx = 0, shy = 0;
    if (shake > 0.2) {
      shx = (Math.random() * 2 - 1) * shake;
      shy = (Math.random() * 2 - 1) * shake;
      ctx.save();
      ctx.translate(shx, shy);
    }

    var camX = ship.x, camY = ship.y;
    var i, e, p, s2;
    var warping = state === 'warp';

    /* starfield — batched into 3 alpha bands, single path each */
    var band, bandAlpha = [0.25, 0.55, 0.95];
    for (band = 0; band < 3; band++) {
      ctx.globalAlpha = bandAlpha[band];
      ctx.fillStyle = '#f0ede8';
      if (warping) { ctx.strokeStyle = '#f0c060'; ctx.lineWidth = 1; ctx.beginPath(); }
      else ctx.beginPath();
      for (i = 0; i < N_STARS; i++) {
        e = stars[i];
        if (i % 3 !== band) continue;
        if (e.z < Z_NEAR) continue;
        var sr = FOCAL / e.z;
        var sx = CX + (e.x - camX * 0.5) * sr;
        var sy = CY + (e.y - camY * 0.5) * sr;
        if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) continue;
        if (warping) {
          var pr2 = FOCAL / Math.max(Z_NEAR, e.pz);
          ctx.moveTo(CX + (e.x - camX * 0.5) * pr2, CY + (e.y - camY * 0.5) * pr2);
          ctx.lineTo(sx, sy);
        } else {
          var rad = Math.min(2.2, Math.max(0.4, 0.4 * sr));
          ctx.rect(sx, sy, rad, rad);
        }
      }
      if (warping) ctx.stroke(); else ctx.fill();
    }
    ctx.globalAlpha = 1;

    /* gather + z-sort entities (far → near painter order) */
    var dn = 0;
    for (i = 0; i < gates.length; i++) if (gates[i].on) drawList[dn++] = gates[i];
    for (i = 0; i < frags.length; i++) if (frags[i].on) drawList[dn++] = frags[i];
    for (i = 0; i < rocks.length; i++) if (rocks[i].on) drawList[dn++] = rocks[i];
    /* insertion sort by z desc — list is small and near-sorted */
    for (i = 1; i < dn; i++) {
      var it = drawList[i], j = i - 1;
      while (j >= 0 && drawList[j].z < it.z) { drawList[j + 1] = drawList[j]; j--; }
      drawList[j + 1] = it;
    }
    for (i = 0; i < dn; i++) {
      e = drawList[i];
      if (e.z < Z_NEAR) continue;
      var alpha = e.z > Z_FADEIN ? (Z_SPAWN - e.z) / (Z_SPAWN - Z_FADEIN) : 1;
      if (alpha <= 0) continue;
      p = project(e.x - camX, e.y - camY, e.z);
      if (e.r && e.v) drawRock(e, p, alpha);
      else if (e.r) drawGate(e, p, alpha);
      else drawFrag(e, p, alpha);
    }

    /* warp portal disc */
    if (warping) drawWarp();

    /* ship (blinks during i-frames) + reticle */
    if (state === 'play' || state === 'warp' || state === 'count') {
      var blink = iframes > 0 && (Math.floor(iframes * 10) % 2 === 0);
      if (!blink) drawShip();
    }

    /* sparks */
    ctx.fillStyle = '#f0c060';
    for (i = 0; i < sparks.length; i++) {
      e = sparks[i];
      if (!e.on) continue;
      ctx.globalAlpha = 1 - e.t * 2;
      ctx.fillRect(e.x, e.y, 2, 2);
    }
    ctx.globalAlpha = 1;

    /* score popups */
    ctx.font = "13px 'Share Tech Mono', Menlo, monospace";
    ctx.textAlign = 'center';
    for (i = 0; i < pops.length; i++) {
      e = pops[i];
      if (!e.on) continue;
      ctx.globalAlpha = 1 - (e.t / 0.6);
      ctx.fillStyle = '#f0c060';
      ctx.fillText(e.txt, e.x, e.y);
    }
    ctx.globalAlpha = 1;

    /* red-shift hit flash */
    if (flashT > 0) {
      ctx.fillStyle = 'rgba(180, 60, 40, ' + (flashT * 0.9) + ')';
      ctx.fillRect(0, 0, W, H);
    }

    if (shake > 0.2) ctx.restore();
  }

  function drawGate(g, p, alpha) {
    var rr = g.r * p.s;
    if (rr < 2 || rr > Math.max(W, H) * 1.6) return;
    ctx.globalAlpha = alpha * (g.z > 60 ? 1 : Math.max(0.15, g.z / 60));
    ctx.lineWidth = Math.max(1, 2.2 * p.s);
    /* pass flash */
    if (g.flash > 0) {
      ctx.fillStyle = 'rgba(240, 192, 96, 0.25)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, rr, rr * 0.92, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#f0ede8';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, rr, rr * 0.92, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#c9a84c';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, rr * 0.88, rr * 0.81, 0, 0, Math.PI * 2);
    ctx.stroke();
    /* 8 radial spokes — the SNES wireframe read */
    ctx.lineWidth = Math.max(1, 1.1 * p.s);
    ctx.beginPath();
    for (var k = 0; k < 8; k++) {
      var a = (k / 8) * Math.PI * 2;
      var ca = Math.cos(a), sa = Math.sin(a) * 0.92;
      ctx.moveTo(p.x + ca * rr * 0.88, p.y + sa * rr * 0.88);
      ctx.lineTo(p.x + ca * rr, p.y + sa * rr);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  var FRAG_POLY = [1, 0, 0.5, 0.87, -0.44, 0.9, -1, 0.1, -0.6, -0.8, 0.5, -0.87];
  function drawFrag(f, p, alpha) {
    var size = 22 * p.s;
    if (size < 1.5) return;
    ctx.globalAlpha = alpha * (f.got > 0 ? 1 - f.got * 4 : 1);
    var sc = f.got > 0 ? size * (1 + f.got * 1.6) : size;
    var c = Math.cos(f.rot), s = Math.sin(f.rot);
    ctx.fillStyle = '#c9a84c';
    ctx.beginPath();
    for (var v = 0; v < FRAG_POLY.length; v += 2) {
      var vx = FRAG_POLY[v] * sc, vy = FRAG_POLY[v + 1] * sc;
      var rx = p.x + vx * c - vy * s, ry = p.y + vx * s + vy * c;
      if (v === 0) ctx.moveTo(rx, ry); else ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.fill();
    /* facet highlight */
    ctx.fillStyle = '#f0c060';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + sc * 0.5 * c, p.y + sc * 0.5 * s);
    ctx.lineTo(p.x - sc * 0.3 * s, p.y + sc * 0.3 * c);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(240, 237, 232, 0.7)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawRock(r, p, alpha) {
    if (r.kind === 'crystal') { drawCrystal(r, p, alpha); return; }
    var size = r.r * p.s;
    if (size < 2) return;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#1a1712';
    ctx.strokeStyle = 'rgba(240, 237, 232, 0.6)';
    ctx.lineWidth = Math.max(1, 1.4 * p.s);
    ctx.beginPath();
    for (var v = 0; v < r.v.length; v += 2) {
      var rx = p.x + r.v[v] * size, ry = p.y + r.v[v + 1] * size;
      if (v === 0) ctx.moveTo(rx, ry); else ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    /* interior crease */
    ctx.beginPath();
    ctx.moveTo(p.x + r.v[0] * size, p.y + r.v[1] * size);
    ctx.lineTo(p.x + r.v[6] * size, p.y + r.v[7] * size);
    ctx.moveTo(p.x + r.v[4] * size, p.y + r.v[5] * size);
    ctx.lineTo(p.x + r.v[10] * size, p.y + r.v[11] * size);
    ctx.globalAlpha = alpha * 0.4;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  /* faceted silver-blue crystal shard — a hazard, distinct from the
     gold collectible fragments. Bipyramidal gem, two-tone facets. */
  var CRYSTAL = [0, -1.5, -0.62, -0.35, -0.5, 0.9, 0, 1.5, 0.5, 0.9, 0.62, -0.35];
  function drawCrystal(r, p, alpha) {
    var size = r.r * p.s;
    if (size < 2) return;
    var c = Math.cos(r.rot), s = Math.sin(r.rot);
    function P(i) {
      var vx = CRYSTAL[i] * size, vy = CRYSTAL[i + 1] * size;
      return [p.x + vx * c - vy * s, p.y + vx * s + vy * c];
    }
    var top = P(0), ul = P(2), ll = P(4), bot = P(6), lr = P(8), ur = P(10);
    ctx.globalAlpha = alpha;
    /* left facet (dim) */
    ctx.fillStyle = '#7f9298';
    ctx.beginPath();
    ctx.moveTo(top[0], top[1]); ctx.lineTo(ul[0], ul[1]);
    ctx.lineTo(ll[0], ll[1]); ctx.lineTo(bot[0], bot[1]);
    ctx.closePath(); ctx.fill();
    /* right facet (bright) */
    ctx.fillStyle = '#cdd8dc';
    ctx.beginPath();
    ctx.moveTo(top[0], top[1]); ctx.lineTo(ur[0], ur[1]);
    ctx.lineTo(lr[0], lr[1]); ctx.lineTo(bot[0], bot[1]);
    ctx.closePath(); ctx.fill();
    /* edges + center ridge */
    ctx.strokeStyle = 'rgba(240, 237, 232, 0.85)';
    ctx.lineWidth = Math.max(1, 1.2 * p.s);
    ctx.beginPath();
    ctx.moveTo(top[0], top[1]); ctx.lineTo(ul[0], ul[1]); ctx.lineTo(ll[0], ll[1]);
    ctx.lineTo(bot[0], bot[1]); ctx.lineTo(lr[0], lr[1]); ctx.lineTo(ur[0], ur[1]);
    ctx.closePath();
    ctx.moveTo(top[0], top[1]); ctx.lineTo(bot[0], bot[1]);
    ctx.stroke();
    /* ember glint at the tip */
    ctx.globalAlpha = alpha * 0.9;
    ctx.fillStyle = '#f0c060';
    ctx.fillRect(top[0] - Math.max(1, p.s), top[1] - Math.max(1, p.s), Math.max(2, 2 * p.s), Math.max(2, 2 * p.s));
    ctx.globalAlpha = 1;
  }

  /* 8-bit chakana (Andean stepped cross) — GameBoy-style pixel sprite.
     B = bone hull · E = ember ring · '.' = empty · center hole glows. */
  var CHAKANA = [
    '...BBB...',
    '...BBB...',
    '.BBBBBBB.',
    '.BBEEEBB.',
    'BBEE.EEBB',
    '.BBEEEBB.',
    '.BBBBBBB.',
    '...BBB...',
    '...BBB...'
  ];
  function drawShip() {
    /* camera follows laterally — ship drifts only a little from center */
    var sx = Math.round(CX + ship.x * 0.5);
    var sy = Math.round(CY + ship.y * 0.5 + 60);
    var px = 2.7;                 // chunky pixel size — kept crisp (no rotation)
    var cols = 9, rows = 9;
    var ox = Math.round(sx - cols * px / 2);
    var oy = Math.round(sy - rows * px / 2);
    var pxi = Math.ceil(px);
    /* pixel thruster — flickering ember blocks below the cross */
    var trail = 2 + (Math.random() < 0.5 ? 1 : 0) + Math.min(2, Math.floor(speed / 260));
    ctx.fillStyle = 'rgba(240, 192, 96, 0.8)';
    for (var tp = 0; tp < trail; tp++) {
      var w = (3 - Math.min(2, tp)) * px;
      ctx.fillRect(Math.round(sx - w / 2), Math.round(oy + rows * px + tp * px), Math.round(w), pxi);
    }
    /* chakana body — pixel by pixel */
    for (var ry = 0; ry < rows; ry++) {
      var rowStr = CHAKANA[ry];
      for (var cxp = 0; cxp < cols; cxp++) {
        var ch = rowStr.charAt(cxp);
        if (ch === '.') continue;
        ctx.fillStyle = ch === 'E' ? '#c9a84c' : '#f0ede8';
        ctx.fillRect(Math.round(ox + cxp * px), Math.round(oy + ry * px), pxi, pxi);
      }
    }
    /* glowing core through the central hole */
    ctx.fillStyle = '#f0c060';
    ctx.fillRect(Math.round(sx - px / 2), Math.round(sy - px / 2), pxi, pxi);
    /* reticle — ahead of the ship */
    var rx2 = CX + ship.x * 0.5, ry2 = CY + ship.y * 0.5 - 40;
    ctx.strokeStyle = 'rgba(240, 237, 232, 0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rx2 - 9, ry2); ctx.lineTo(rx2 - 3, ry2);
    ctx.moveTo(rx2 + 3, ry2); ctx.lineTo(rx2 + 9, ry2);
    ctx.moveTo(rx2, ry2 - 9); ctx.lineTo(rx2, ry2 - 3);
    ctx.moveTo(rx2, ry2 + 3); ctx.lineTo(rx2, ry2 + 9);
    ctx.stroke();
    ctx.fillStyle = '#c9a84c';
    ctx.fillRect(rx2 - 1, ry2 - 1, 2, 2);
  }

  function drawWarp() {
    var prog = warpT / WARP_T;
    var maxR = Math.sqrt(CX * CX + CY * CY);
    /* growing portal disc at the vanishing point */
    var discR = Math.pow(prog, 2.4) * maxR * 1.15;
    if (discR > 2) {
      ctx.globalAlpha = Math.min(1, prog * 1.4);
      ctx.fillStyle = '#c9a84c';
      ctx.beginPath();
      ctx.arc(CX, CY, discR, 0, Math.PI * 2);
      ctx.fill();
      if (discR > 12) {
        ctx.fillStyle = '#f0c060';
        ctx.beginPath();
        ctx.arc(CX, CY, discR * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fdf8ec';
        ctx.beginPath();
        ctx.arc(CX, CY, discR * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    /* rotating halo rings */
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = 1.5;
    for (var k = 1; k <= 3; k++) {
      var rr = discR + k * 26 + Math.sin(warpT * 3 + k) * 6;
      if (rr < maxR * 1.4) {
        ctx.beginPath();
        ctx.arc(CX, CY, rr, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  /* ══════════════════════════════════════════════════════════════════
     LOOP
     ══════════════════════════════════════════════════════════════════ */
  function frame(ts) {
    rafId = 0;
    if (state !== 'title' && state !== 'count' && state !== 'play' && state !== 'warp') return;
    if (!lastTs) lastTs = ts;
    var dt = Math.min(1 / 30, (ts - lastTs) / 1000);
    lastTs = ts;
    update(dt);
    /* update() may have ended the run (gameOver/showReward stop the loop) */
    if (state === 'title' || state === 'count' || state === 'play' || state === 'warp') {
      draw();
      rafId = requestAnimationFrame(frame);
    }
  }
  function startLoop() {
    if (rafId) return;
    lastTs = 0;
    rafId = requestAnimationFrame(frame);
  }
  function stopLoop() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    lastTs = 0;
  }

  /* ── Resize (DPR-capped raster; math stays in CSS px) ─────────────── */
  var resizeT = 0;
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    CX = W / 2; CY = H * 0.52;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    /* total-pixel budget: a 5K iMac at DPR 2 would raster 14.7M px/frame —
       cap the backing store at ~3.2M px (integrated-GPU-safe), floor at 1 */
    var budget = 3200000;
    if (W * H * DPR * DPR > budget) DPR = Math.max(1, Math.sqrt(budget / (W * H)));
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    /* depth background — built once per resize, not per frame.
       vertical wash (obsidian → faint indigo → obsidian) + a glow at the
       vanishing point so you feel you're flying INTO something, not a flat void. */
    /* warm obsidian sky (matches the map's warm cosmos — no cold purple) */
    bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#0a0a0a');
    bgGrad.addColorStop(0.5, '#0e0b08');
    bgGrad.addColorStop(1, '#080706');
    glowGrad = ctx.createRadialGradient(CX, CY, 0, CX, CY, Math.max(W, H) * 0.62);
    glowGrad.addColorStop(0, 'rgba(201,168,76,0.13)');
    glowGrad.addColorStop(0.35, 'rgba(150,96,44,0.06)');
    glowGrad.addColorStop(1, 'rgba(10,10,10,0)');
  }
  window.addEventListener('resize', function () {
    if (!root || !root.classList.contains('pr-open')) return;
    clearTimeout(resizeT);
    resizeT = setTimeout(resize, 150);
  });

  /* ── Language flips re-render whatever is on screen ───────────────── */
  new MutationObserver(function () {
    applyChipText();
    if (!root) return;
    if (state === 'title') renderTitle();
    else if (state === 'pause') renderPause();
    else if (state === 'over') renderOver();
    else if (state === 'reward') renderReward(lastRewardSkipped);
    if (hud && hud.classList.contains('pr-show')) {
      renderHudText();
      if (sectorIdx >= 0) {
        hudSector.textContent = state === 'warp' ? tx().warpLabel : tx().sectors[sectorIdx];
      }
    }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  /* ── Boot gate: wait for the portal's own loading ceremony ────────── */
  var tries = 0;
  var bootPoll = setInterval(function () {
    tries++;
    if (loaderGone()) {
      clearInterval(bootPoll);
      setTimeout(function () {
        buildChip();
        chip.classList.add('pr-on');
        armIdle();
      }, 1400);
    } else if (tries > 60) {
      clearInterval(bootPoll); // give up quietly — chip just never shows
    }
  }, 500);
})();
