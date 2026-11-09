/**
 * Kai — "Hogar de Kai" (sistema tamagotchi).
 * 2026-07-12. Spec/board: ~/wenu-kai/source/kai_04_sistema_tamagotchi.jpg
 *
 * WHAT THIS IS
 *   Kai's home: 5 meters (Energy / Hunger / Happiness / Curiosity / Bond),
 *   5 actions (Pet / Feed / Play / Rest / Explore), 6 rewards (Cookie, Bone,
 *   Amulet, Crystal, Feather, Moon), 4 evolution ranks (Compañero → Explorador
 *   → Guardián → Guardián Cósmico) and a progress flow driven by REAL site
 *   events: visit → product discovery → piece kept → cart → purchase → return.
 *
 * WHY IT LIVES IN public/
 *   Files under public/ are copied verbatim — Astro never compiles them, so
 *   this cannot break `npm run build`. The ONLY touch to compiled source is a
 *   single <script is:inline defer src="/kai/kai-home.js"> in Base.astro.
 *   Everything else (the secret entrance, every event hook) is attached from
 *   here at runtime by querying the existing DOM — Nav.astro, SearchModal.astro,
 *   Cart.astro and the PDP were NOT modified.
 *
 * HOW YOU GET IN (easter egg — owner decision 2026-07-12)
 *   The room is a secret. There is no button and no label anywhere: the old
 *   injected "KAI'S HOME" pill in the nav niche is GONE. A normal click/tap on
 *   Kai only pets him (kai-anim.js owns that). The room opens only if you mean
 *   it — see the "Secret entrance" block below — or if you type /kai directly.
 *
 * THE OTHER SECRET (the runner)
 *   In the SEARCH modal only, a plain tap on Kai starts his mini-game, right
 *   there under the field (lazy — /kai/kai-run.js; see the runner block at the
 *   bottom of this file). Same sprite, two secrets, no collision: a TAP runs,
 *   a HOLD goes home. Nothing on screen mentions either one.
 *
 * COST
 *   Zero until someone actually visits Kai: the stylesheet is injected lazily
 *   on first intent, the sprite engine only mounts while the room is open, and
 *   the room's ticker stops on close / hidden tab. The sprite engine
 *   (kai-anim.js) already caps fps, pauses off-screen and honours
 *   prefers-reduced-motion; we inherit all of that.
 *
 * SPRITES
 *   Reuses the existing engine (window.kaiAnim from /kai/kai-anim.js) and its
 *   registered poses. NOTE: 'caricia' and 'sigue' are never used — both have a
 *   hand/cursor glyph baked into the PNG (see kai-anim.js). So "Pet" plays the
 *   'pet' state ('celebra' + heart particles). When a CLEAN caricia sprite
 *   exists, add it to POSES/STATES in kai-anim.js and change PET_POSE below.
 *
 * EVOLUTION
 *   No evolution art exists yet, so the 4 stages are RANKS: same sprite, with a
 *   different ember aura around the stage (see .kaihome__stage[data-stage]).
 *   Swap-ready: when Ocin delivers the 4 sprite sets, give each STAGES[] entry
 *   a `pose` prefix and teach kai-anim.js to resolve BASE + prefix + name.
 */
(function () {
  'use strict';

  var CSS_HREF = '/kai/kai-home.css';
  var KEY = 'wmKai';
  var VER = 1;

  /* ── Secret entrance ───────────────────────────────────────────────────
     A plain click/tap on Kai does NOT open the room — it only pets him, which
     kai-anim.js already does on its own ('pet' + hearts). We never intercept
     that. The room opens only on a deliberate gesture ON KAI, and it works on
     every surface where he lives (nav drawer, search, cart, /gracias):

       · press and hold him for HOLD_MS  (mouse, pen or finger), or
       · tap him TAPS_NEEDED times in a row, at most TAP_GAP_MS apart, or
       · keyboard (he is focusable): hold Enter/Space for HOLD_MS, or press it
         TAPS_NEEDED times — the same secret for anyone who can't long-press.

     EXCEPTION — the Kai in the SEARCH modal: there a single tap already means
     something else (it starts his runner), so the 5-tap shortcut is OFF on that
     sprite. The long-press to the room still works there, exactly the same.

     Nothing on screen names any of this. The only feedback is a wordless ember
     aura that grows while you hold him. /kai still opens the room directly. */
  var HOLD_MS = 1200;    // long-press — inside the 1–1.5s the owner asked for
  var MOVE_TOL = 12;     // px of drift that cancels a hold (a scroll is not a press)
  var TAPS_NEEDED = 5;
  var TAP_GAP_MS = 600;  // slower than this between taps and the count restarts
  var SPRITE_SEL = '#navkd-kai-canvas, #search-kai-canvas, #wmcart-kai-canvas, #gracias-kai-canvas';

  /* Pet uses 'pet' (celebra + hearts). See SPRITES note above. */
  var PET_POSE = 'pet';

  var HOUR = 3600000;
  var DWELL_MS = 25000;      // time on a PDP before Kai "keeps" the piece
  var RETURN_MS = 12 * HOUR; // gap that counts as "returning to the portal"

  // ── State ───────────────────────────────────────────────────────────────
  function defaults() {
    return {
      v: VER,
      m: { energia: 70, hambre: 60, felicidad: 70, curiosidad: 50, vinculo: 20 },
      xp: 0,
      stage: 0,
      rewards: {},   // id -> timestamp
      seen: [],      // product slugs seen on PDPs
      kept: [],      // [{ slug, name, img, price }]
      find: null,    // last piece Kai found while exploring
      acts: {},      // action id -> timestamp (cooldowns)
      notes: [],     // little log shown in the room
      lastVisit: 0,
      lastTick: 0,
      lastToast: 0
    };
  }

  function load() {
    var s = null;
    try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { s = null; }
    var d = defaults();
    if (!s || typeof s !== 'object' || s.v !== VER) return d;
    var k;
    for (k in d) { if (!(k in s) || s[k] == null) s[k] = d[k]; }
    if (typeof s.m !== 'object' || !s.m) s.m = d.m;
    for (k in d.m) { if (typeof s.m[k] !== 'number' || isNaN(s.m[k])) s.m[k] = d.m[k]; }
    if (!Array.isArray(s.seen)) s.seen = [];
    if (!Array.isArray(s.kept)) s.kept = [];
    if (!Array.isArray(s.notes)) s.notes = [];
    if (typeof s.rewards !== 'object' || !s.rewards) s.rewards = {};
    if (typeof s.acts !== 'object' || !s.acts) s.acts = {};
    return s;
  }

  function save(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* private mode */ }
  }

  function clamp(n) { return Math.max(0, Math.min(100, n)); }

  // Meters decay with time away — gently. Bond decays slowest (it's a bond).
  var DECAY = { energia: 5, hambre: 8, felicidad: 6, curiosidad: 4, vinculo: 1.5 }; // per hour
  function decay(s) {
    var now = Date.now();
    if (!s.lastTick) { s.lastTick = now; return s; }
    var hrs = (now - s.lastTick) / HOUR;
    if (hrs <= 0) { s.lastTick = now; return s; }
    if (hrs > 96) hrs = 96; // a month away shouldn't zero him harder than a week
    for (var k in DECAY) { s.m[k] = clamp(s.m[k] - DECAY[k] * hrs); }
    s.lastTick = now;
    return s;
  }

  // ── Ranks ───────────────────────────────────────────────────────────────
  var STAGES = [
    { id: 'companero',  name: 'Compañero',        gloss: 'Companion',       xp: 0 },
    { id: 'explorador', name: 'Explorador',       gloss: 'Explorer',        xp: 30 },
    { id: 'guardian',   name: 'Guardián',         gloss: 'Guardian',        xp: 90 },
    { id: 'cosmico',    name: 'Guardián Cósmico', gloss: 'Cosmic Guardian', xp: 200 }
  ];
  function stageIndex(xp) {
    var i = 0;
    for (var j = 0; j < STAGES.length; j++) { if (xp >= STAGES[j].xp) i = j; }
    return i;
  }
  function nextStageXp(xp) {
    for (var j = 0; j < STAGES.length; j++) { if (xp < STAGES[j].xp) return STAGES[j].xp; }
    return null; // maxed
  }

  // ── Rewards (6, one per step of the journey) ────────────────────────────
  var REWARDS = [
    { id: 'galleta', name: 'Cookie',  es: 'Galleta', hint: 'For your first visit.' },
    { id: 'hueso',   name: 'Bone',    es: 'Hueso',   hint: 'For discovering 3 pieces.' },
    { id: 'amuleto', name: 'Amulet',  es: 'Amuleto', hint: 'For a piece Kai kept for you.' },
    { id: 'cristal', name: 'Crystal', es: 'Cristal', hint: 'For gathering a piece.' },
    { id: 'pluma',   name: 'Feather', es: 'Pluma',   hint: 'For completing an order.' },
    { id: 'luna',    name: 'Moon',    es: 'Luna',    hint: 'For returning to the portal.' }
  ];

  // ── The 6 progress steps of the board (site event → Kai grows) ──────────
  var JOURNEY = [
    { id: 'visit',    label: 'Visit',     reward: 'galleta' },
    { id: 'discover', label: 'Discovery', reward: 'hueso' },
    { id: 'keep',     label: 'Kept',      reward: 'amuleto' },
    { id: 'cart',     label: 'Cart',      reward: 'cristal' },
    { id: 'purchase', label: 'Purchase',  reward: 'pluma' },
    { id: 'return',   label: 'Return',    reward: 'luna' }
  ];

  // ── Actions ─────────────────────────────────────────────────────────────
  var ACTIONS = [
    { id: 'pet',     label: 'Pet',     es: 'Acariciar', cd: 6000,  xp: 1, pose: PET_POSE,
      gains: { vinculo: 6, felicidad: 4 },
      lines: ['Aww, hi.', '*happy wag*', 'Good to see you.'] },
    { id: 'feed',    label: 'Feed',    es: 'Alimentar', cd: 45000, xp: 2, pose: 'treat',
      gains: { hambre: 24, felicidad: 6, energia: 6 },
      lines: ['Nom nom - thank you!', 'Yum! A cookie!'] },
    { id: 'play',    label: 'Play',    es: 'Jugar',     cd: 20000, xp: 2, pose: 'celebrate',
      gains: { felicidad: 14, vinculo: 4, energia: -8, hambre: -6 },
      lines: ['Again! Again!', '*zoomies*'] },
    { id: 'rest',    label: 'Rest',    es: 'Descansar', cd: 45000, xp: 1, pose: 'sleep',
      gains: { energia: 26, felicidad: -2 },
      lines: ['...zzz...', 'A little nap. Thank you.'] },
    { id: 'explore', label: 'Explore', es: 'Explorar',  cd: 25000, xp: 3, pose: 'walk',
      gains: { curiosidad: 16, vinculo: 2, energia: -6 },
      lines: ['Sniffing around...', 'Let me look for something...'] }
  ];

  var METERS = [
    { id: 'energia',    label: 'Energy',    color: 'var(--kh-energia)' },
    { id: 'hambre',     label: 'Hunger',    color: 'var(--kh-hambre)' },
    { id: 'felicidad',  label: 'Happiness', color: 'var(--kh-felicidad)' },
    { id: 'curiosidad', label: 'Curiosity', color: 'var(--kh-curiosidad)' },
    { id: 'vinculo',    label: 'Bond',      color: 'var(--kh-vinculo)' }
  ];

  // ── Pixel-art icons (inline SVG — no PNGs could be generated for these) ──
  // 16×16 grid, hard pixels, gold/ember on obsidian, same language as the sprite.
  var GOLD = '#c9a84c', DARK = '#3a2a12', BONE = '#f0ede8', SILV = '#b8b4aa',
      VIOL = '#9b8ac9', VIOL2 = '#d6cbf0', BRZ = '#6a4a28', ROSE = '#c96a6a';

  function svg(body, size) {
    return '<svg viewBox="0 0 16 16" width="' + (size || 16) + '" height="' + (size || 16) +
      '" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' + body + '</svg>';
  }
  function r(x, y, w, h, c) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + c + '"/>';
  }

  var ICONS = {
    galleta:
      r(6, 3, 4, 1, GOLD) + r(4, 4, 8, 1, GOLD) + r(3, 5, 10, 1, GOLD) +
      r(2, 6, 12, 3, GOLD) + r(3, 9, 10, 1, GOLD) + r(4, 10, 8, 1, GOLD) + r(6, 11, 4, 1, GOLD) +
      r(5, 5, 2, 2, DARK) + r(9, 7, 2, 2, DARK) + r(6, 9, 2, 1, DARK) + r(10, 5, 1, 1, DARK),
    hueso:
      r(2, 4, 4, 4, BONE) + r(2, 8, 4, 4, BONE) + r(10, 4, 4, 4, BONE) + r(10, 8, 4, 4, BONE) +
      r(5, 6, 6, 4, BONE) + r(6, 7, 4, 1, SILV),
    amuleto:
      r(6, 1, 4, 1, GOLD) + r(4, 2, 2, 1, GOLD) + r(10, 2, 2, 1, GOLD) + r(7, 3, 2, 2, GOLD) +
      r(6, 5, 4, 1, GOLD) + r(5, 6, 6, 1, GOLD) + r(4, 7, 8, 4, GOLD) + r(5, 11, 6, 1, GOLD) +
      r(6, 12, 4, 1, GOLD) +
      r(7, 7, 2, 4, DARK) + r(5, 8, 6, 2, DARK) + r(7, 8, 2, 2, GOLD),
    cristal:
      r(7, 1, 2, 2, VIOL2) + r(6, 3, 4, 2, VIOL) + r(5, 5, 6, 4, VIOL) +
      r(5, 9, 6, 3, VIOL) + r(6, 12, 4, 2, VIOL) +
      r(7, 3, 1, 9, VIOL2) + r(9, 6, 1, 5, '#7a68a8'),
    pluma:
      r(11, 2, 3, 2, BONE) + r(9, 4, 4, 2, BONE) + r(7, 6, 5, 2, BONE) +
      r(5, 8, 5, 2, BONE) + r(4, 10, 4, 2, SILV) + r(3, 12, 3, 1, SILV) +
      r(11, 4, 1, 2, BRZ) + r(9, 6, 1, 2, BRZ) + r(7, 8, 1, 2, BRZ) + r(5, 10, 1, 2, BRZ),
    luna:
      r(5, 3, 2, 1, GOLD) + r(4, 4, 2, 1, GOLD) + r(3, 5, 3, 1, GOLD) +
      r(2, 6, 4, 3, GOLD) + r(2, 9, 4, 1, GOLD) + r(3, 10, 3, 1, GOLD) +
      r(4, 11, 3, 1, GOLD) + r(5, 12, 3, 1, GOLD) + r(6, 13, 3, 1, GOLD) +
      r(12, 3, 1, 1, BONE) + r(13, 5, 1, 1, BONE) + r(11, 11, 1, 1, BONE)
  };

  var MICONS = {
    energia: r(9, 1, 3, 6, GOLD) + r(5, 6, 6, 3, GOLD) + r(4, 8, 3, 7, GOLD),
    hambre:  r(3, 6, 10, 2, '#d8a24a') + r(4, 8, 8, 4, '#d8a24a') + r(6, 12, 4, 1, '#8a6a3a'),
    felicidad:
      r(5, 2, 6, 1, '#7fa8c9') + r(3, 3, 2, 1, '#7fa8c9') + r(11, 3, 2, 1, '#7fa8c9') +
      r(2, 4, 1, 8, '#7fa8c9') + r(13, 4, 1, 8, '#7fa8c9') +
      r(3, 12, 2, 1, '#7fa8c9') + r(11, 12, 2, 1, '#7fa8c9') + r(5, 13, 6, 1, '#7fa8c9') +
      r(5, 6, 1, 2, '#7fa8c9') + r(10, 6, 1, 2, '#7fa8c9') +
      r(5, 9, 6, 1, '#7fa8c9') + r(4, 8, 1, 1, '#7fa8c9') + r(11, 8, 1, 1, '#7fa8c9'),
    curiosidad:
      r(5, 1, 5, 1, VIOL) + r(3, 2, 2, 1, VIOL) + r(10, 2, 2, 1, VIOL) +
      r(2, 3, 1, 5, VIOL) + r(12, 3, 1, 5, VIOL) +
      r(3, 8, 2, 1, VIOL) + r(10, 8, 2, 1, VIOL) + r(5, 9, 5, 1, VIOL) +
      r(9, 10, 2, 2, VIOL) + r(11, 12, 3, 3, VIOL),
    vinculo:
      r(3, 3, 3, 1, ROSE) + r(10, 3, 3, 1, ROSE) +
      r(2, 4, 5, 2, ROSE) + r(9, 4, 5, 2, ROSE) +
      r(2, 6, 12, 2, ROSE) + r(3, 8, 10, 1, ROSE) + r(4, 9, 8, 1, ROSE) +
      r(5, 10, 6, 1, ROSE) + r(6, 11, 4, 1, ROSE) + r(7, 12, 2, 1, ROSE)
  };

  var ACT_ICONS = {
    // Pet — a hand (bone) with a heart above it.
    pet: r(6, 1, 2, 2, ROSE) + r(9, 1, 2, 2, ROSE) + r(6, 3, 5, 1, ROSE) + r(7, 4, 3, 1, ROSE) + r(8, 5, 1, 1, ROSE) +
         r(4, 7, 2, 4, BONE) + r(6, 6, 2, 5, BONE) + r(8, 6, 2, 5, BONE) + r(10, 7, 2, 4, BONE) + r(4, 11, 8, 3, BONE),
    // Feed — a bowl.
    feed: r(3, 5, 10, 1, GOLD) + r(2, 6, 12, 2, GOLD) + r(4, 8, 8, 3, BRZ) + r(6, 11, 4, 1, BRZ),
    // Play — a ball.
    play: r(6, 3, 4, 1, ROSE) + r(4, 4, 8, 1, ROSE) + r(3, 5, 10, 1, ROSE) + r(2, 6, 12, 3, ROSE) +
          r(3, 9, 10, 1, ROSE) + r(4, 10, 8, 1, ROSE) + r(6, 11, 4, 1, ROSE) + r(2, 7, 12, 1, BONE),
    // Rest — a crescent moon.
    rest: ICONS.luna,
    // Explore — a magnifier.
    explore: MICONS.curiosidad
  };

  // ── DOM helpers ─────────────────────────────────────────────────────────
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function reduced() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  // ── Lazy stylesheet ─────────────────────────────────────────────────────
  var cssReady = null;
  function ensureCss() {
    if (cssReady) return cssReady;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = CSS_HREF;
    cssReady = new Promise(function (res) {
      var done = false;
      function fin() { if (!done) { done = true; res(); } }
      link.onload = fin;
      link.onerror = fin;
      setTimeout(fin, 800); // never hang the UI on a slow/failed stylesheet
    });
    document.head.appendChild(link);
    return cssReady;
  }

  // ── Progress engine ─────────────────────────────────────────────────────
  function addXp(s, n) {
    s.xp = Math.max(0, s.xp + n);
    var idx = stageIndex(s.xp);
    if (idx > s.stage) {
      s.stage = idx;
      note(s, 'Kai evolved — ' + STAGES[idx].name + ' (' + STAGES[idx].gloss + ').');
      return true;
    }
    return false;
  }
  function note(s, text) {
    s.notes.unshift({ t: Date.now(), text: text });
    if (s.notes.length > 8) s.notes.length = 8;
  }
  function unlock(s, id) {
    if (s.rewards[id]) return false;
    var rw = null;
    for (var i = 0; i < REWARDS.length; i++) { if (REWARDS[i].id === id) rw = REWARDS[i]; }
    if (!rw) return false;
    s.rewards[id] = Date.now();
    s.m.felicidad = clamp(s.m.felicidad + 6);
    addXp(s, 12);
    note(s, 'Reward unlocked: ' + rw.name + ' (' + rw.es + ').');
    return true;
  }

  // ── Toast ("Kai found something for you" / "Kai missed you") ────────────
  var toastedThisLoad = false;
  function toast(text, face, href, force) {
    if (toastedThisLoad && !force) return;
    var s = load();
    var gap = Date.now() - (s.lastToast || 0);
    if (gap < (force ? 60000 : 600000)) return;
    toastedThisLoad = true;
    s.lastToast = Date.now();
    save(s);

    ensureCss().then(function () {
      var el = document.createElement('div');
      el.className = 'kaitoast';
      el.setAttribute('role', 'status');
      el.innerHTML =
        '<img class="kaitoast__face" src="/kai/' + esc(face || 'e_feliz') + '.png" alt="" width="34" height="34">' +
        '<span class="kaitoast__text">' + esc(text) + '</span>' +
        '<button type="button" class="kaitoast__x" aria-label="Dismiss">×</button>';

      var gone = false;
      function bye() {
        if (gone) return;
        gone = true;
        el.classList.remove('is-in');
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 320);
      }
      el.querySelector('.kaitoast__x').addEventListener('click', function (e) {
        e.stopPropagation();
        bye();
      });
      el.addEventListener('click', function () {
        bye();
        if (href) window.location.href = href;
        else openHome();
      });

      document.body.appendChild(el);
      requestAnimationFrame(function () { el.classList.add('is-in'); });
      setTimeout(bye, 9000);
    });
  }

  // ── Site events (all hooked from here — no component was modified) ──────
  function markVisit() {
    var s = decay(load());
    var now = Date.now();
    var gap = now - (s.lastVisit || 0);
    if (!s.lastVisit) {
      unlock(s, 'galleta'); // welcome cookie
    } else if (gap > RETURN_MS) {
      var fresh = unlock(s, 'luna');
      s.m.felicidad = clamp(s.m.felicidad + 10);
      s.m.vinculo = clamp(s.m.vinculo + 3);
      addXp(s, 3);
      note(s, 'Kai missed you.');
      setTimeout(function () {
        toast('Kai missed you.', fresh ? 'e_feliz' : 'e_curioso', null, false);
      }, 1800);
    }
    s.lastVisit = now;
    save(s);
  }

  function pdpInfo(slug) {
    var btn = document.querySelector('[data-add-cart]');
    var h1 = document.querySelector('h1');
    var name = btn && btn.getAttribute('data-name');
    if (!name && h1) name = (h1.textContent || '').trim();
    if (!name) name = document.title.split('—')[0].trim();
    var img = (btn && btn.getAttribute('data-img')) || '';
    if (!img) {
      var pic = document.querySelector('main img');
      if (pic) img = pic.getAttribute('src') || '';
    }
    var price = (btn && btn.getAttribute('data-price')) || '';
    return { slug: slug, name: name, img: img, price: price ? '$' + price : '' };
  }

  function onPdp(slug) {
    var s = decay(load());
    if (s.seen.indexOf(slug) < 0) {
      s.seen.push(slug);
      if (s.seen.length > 60) s.seen.shift();
      s.m.curiosidad = clamp(s.m.curiosidad + 3);
      addXp(s, 2);
      if (s.seen.length >= 3) unlock(s, 'hueso');
    }
    save(s);

    // Dwell → Kai keeps the piece for you ("producto guardado" on the board).
    // There is no wishlist on the site, so this IS the save: pieces Kai keeps
    // are listed in his home and link straight back to the PDP.
    var t = window.setTimeout(function () {
      var st = decay(load());
      for (var i = 0; i < st.kept.length; i++) { if (st.kept[i].slug === slug) return; }
      st.kept.unshift(pdpInfo(slug));
      if (st.kept.length > 12) st.kept.length = 12;
      st.m.vinculo = clamp(st.m.vinculo + 4);
      addXp(st, 4);
      unlock(st, 'amuleto');
      save(st);
      toast('Kai kept this one for you.', 'e_feliz', null, true);
    }, DWELL_MS);
    window.addEventListener('pagehide', function () { window.clearTimeout(t); });
  }

  function onCartAdd() {
    var s = decay(load());
    s.m.felicidad = clamp(s.m.felicidad + 8);
    s.m.hambre = clamp(s.m.hambre + 6); // the cart already gives him his cookie
    addXp(s, 5);
    unlock(s, 'cristal');
    save(s);
  }

  function onPurchase() {
    var s = decay(load());
    s.m.felicidad = 100;
    s.m.vinculo = clamp(s.m.vinculo + 15);
    addXp(s, 25);
    unlock(s, 'pluma');
    save(s);
  }

  // ── Kai's find (Explore) — a real piece from the live catalogue ─────────
  var indexCache = null;
  function loadIndex() {
    if (indexCache) return indexCache;
    indexCache = fetch('/search-index.json')
      .then(function (r2) { return r2.ok ? r2.json() : []; })
      .catch(function () { return []; });
    return indexCache;
  }
  function findPiece() {
    return loadIndex().then(function (list) {
      if (!list || !list.length) return null;
      var s = load();
      var pool = list.filter(function (p) {
        return p && p.slug && p.image && s.seen.indexOf(p.slug) < 0;
      });
      if (!pool.length) pool = list.filter(function (p) { return p && p.slug && p.image; });
      if (!pool.length) return null;
      return pool[Math.floor(Math.random() * pool.length)];
    });
  }

  // ── The room ────────────────────────────────────────────────────────────
  function buildPanel(inline) {
    var el = document.createElement('div');
    el.className = 'kaihome' + (inline ? ' kaihome--inline' : '');
    if (!inline) {
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-modal', 'true');
    }
    el.setAttribute('aria-labelledby', 'kaihome-title');

    var metersHtml = '';
    for (var i = 0; i < METERS.length; i++) {
      var mt = METERS[i];
      var segs = '';
      for (var j = 0; j < 10; j++) segs += '<span class="kaihome__seg" data-seg="' + mt.id + '"></span>';
      metersHtml +=
        '<li class="kaihome__meter">' +
          '<span class="kaihome__meter-icon">' + svg(MICONS[mt.id], 16) + '</span>' +
          '<span class="kaihome__meter-body">' +
            '<span class="kaihome__meter-label">' +
              '<span>' + esc(mt.label) + '</span>' +
              '<span class="kaihome__meter-val" data-val="' + mt.id + '">0</span>' +
            '</span>' +
            '<span class="kaihome__bar" role="progressbar" aria-label="' + esc(mt.label) + '" ' +
              'aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-bar="' + mt.id + '" ' +
              'style="--kh-mc: ' + mt.color + '">' + segs + '</span>' +
          '</span>' +
        '</li>';
    }

    var actsHtml = '';
    for (var a = 0; a < ACTIONS.length; a++) {
      var ac = ACTIONS[a];
      actsHtml +=
        '<button type="button" class="kaihome__act" data-act="' + ac.id + '">' +
          svg(ACT_ICONS[ac.id], 18) +
          '<span>' + esc(ac.label) + '</span>' +
          '<span class="kaihome__act-es">' + esc(ac.es) + '</span>' +
        '</button>';
    }

    var rwHtml = '';
    for (var w = 0; w < REWARDS.length; w++) {
      var rw = REWARDS[w];
      rwHtml +=
        '<div class="kaihome__reward is-locked" data-reward="' + rw.id + '" title="' + esc(rw.hint) + '">' +
          svg(ICONS[rw.id], 30) +
          '<span class="kaihome__reward-name">' + esc(rw.name) + '</span>' +
          '<span class="kaihome__reward-hint">' + esc(rw.hint) + '</span>' +
        '</div>';
    }

    var jrHtml = '';
    for (var q = 0; q < JOURNEY.length; q++) {
      jrHtml +=
        '<li class="kaihome__step" data-step="' + JOURNEY[q].id + '">' +
          '<span class="kaihome__step-mark" aria-hidden="true">·</span> ' + esc(JOURNEY[q].label) +
        '</li>';
    }

    el.innerHTML =
      '<div class="kaihome__panel">' +
        '<header class="kaihome__head">' +
          '<div>' +
            '<p class="kaihome__eyebrow">KAI</p>' +
            '<h2 class="kaihome__title" id="kaihome-title">Kai&rsquo;s home</h2>' +
            '<p class="kaihome__sub">He lives here between your visits. Look after him — he grows with you, and he brings things back from the shop.</p>' +
          '</div>' +
          '<button type="button" class="kaihome__close" data-kai-close aria-label="Close Kai&rsquo;s home">×</button>' +
        '</header>' +

        '<div class="kaihome__grid">' +
          '<section class="kaihome__room" aria-label="Kai">' +
            '<div class="kaihome__stage" data-stage="1">' +
              '<canvas class="kaihome__sprite" data-kai-canvas width="168" height="168" aria-hidden="true"></canvas>' +
            '</div>' +
            '<span class="kaihome__floor" aria-hidden="true"></span>' +
            '<p class="kaihome__line" data-kai-line aria-live="polite">Hey - I&rsquo;m Kai.</p>' +
            '<p class="kaihome__rank">' +
              '<span data-kai-stage>Compañero</span>' +
              '<span class="kaihome__rank-gloss" data-kai-gloss>Companion</span>' +
            '</p>' +
            '<span class="kaihome__xp"><span class="kaihome__xp-fill" data-kai-xpfill></span></span>' +
            '<p class="kaihome__xp-note" data-kai-xpnote>0 xp</p>' +
          '</section>' +

          '<section class="kaihome__card" aria-label="How Kai is doing">' +
            '<h3 class="kaihome__card-title">How he&rsquo;s doing</h3>' +
            '<ul class="kaihome__meters-list">' + metersHtml + '</ul>' +
          '</section>' +

          '<section class="kaihome__actions" aria-label="Things you can do">' +
            '<div class="kaihome__actions-grid">' + actsHtml + '</div>' +
          '</section>' +
        '</div>' +

        '<section class="kaihome__section" aria-label="Rewards">' +
          '<h3 class="kaihome__card-title">Rewards</h3>' +
          '<div class="kaihome__rewards-grid">' + rwHtml + '</div>' +
        '</section>' +

        '<section class="kaihome__section" data-kai-find-wrap hidden aria-label="What Kai found">' +
          '<h3 class="kaihome__card-title">Kai found something for you</h3>' +
          '<ul class="kaihome__pieces" data-kai-find></ul>' +
        '</section>' +

        '<section class="kaihome__section" aria-label="Pieces Kai kept">' +
          '<h3 class="kaihome__card-title">Pieces Kai kept</h3>' +
          '<ul class="kaihome__pieces" data-kai-kept></ul>' +
          '<p class="kaihome__empty" data-kai-kept-empty>Linger on a piece in the shop and Kai will keep it here for you.</p>' +
        '</section>' +

        '<section class="kaihome__section" aria-label="How Kai grows">' +
          '<h3 class="kaihome__card-title">Kai grows with you</h3>' +
          '<ul class="kaihome__journey">' + jrHtml + '</ul>' +
        '</section>' +

        '<section class="kaihome__section" aria-label="Kai&rsquo;s notes">' +
          '<h3 class="kaihome__card-title">His notes</h3>' +
          '<ul class="kaihome__notes" data-kai-notes></ul>' +
          '<button type="button" class="kaihome__reset" data-kai-reset>Start Kai over</button>' +
        '</section>' +
      '</div>';

    // ── wiring ────────────────────────────────────────────────────────────
    var canvas = el.querySelector('[data-kai-canvas]');
    var stage = el.querySelector('.kaihome__stage');
    var lineEl = el.querySelector('[data-kai-line]');
    var ctl = null;
    var timer = null;
    var lineT = null;
    var poseT = null;

    // 'walk' and 'sleep' are LOOP states in kai-anim.js (no hold/auto-revert) —
    // left alone Kai would walk or sleep forever. Every action that uses one
    // gets a leash back to idle.
    var LOOP_POSES = { walk: 5200, sleep: 7000 };
    function leash(pose) {
      if (poseT) { window.clearTimeout(poseT); poseT = null; }
      if (!LOOP_POSES[pose]) return;
      poseT = window.setTimeout(function () {
        if (ctl) ctl.trigger('idle');
        poseT = null;
      }, LOOP_POSES[pose]);
    }

    function say(text) {
      if (!lineEl) return;
      lineEl.textContent = text;
      if (lineT) window.clearTimeout(lineT);
      lineT = window.setTimeout(function () { if (lineEl) lineEl.textContent = mood(load()); }, 5200);
    }

    function mood(s) {
      if (s.m.energia < 20) return 'Kai is worn out. Let him rest.';
      if (s.m.hambre < 20) return 'Kai is hungry.';
      if (s.m.felicidad < 25) return 'Kai is a little down. Play with him?';
      if (s.m.vinculo > 70) return 'Kai stays close to you.';
      if (s.m.curiosidad > 70) return 'Kai wants to go exploring.';
      return 'Kai is happy you came by.';
    }

    function onAmbient(kind) {
      if (kind === 'pet') {
        // Petting him directly on the canvas counts as the Pet action.
        doAction('pet', true);
      }
    }

    function paintPiece(p) {
      return '<li><a class="kaihome__piece" href="/p/' + esc(p.slug) + '">' +
        (p.img || p.image
          ? '<img class="kaihome__piece-img" src="' + esc(p.img || p.image) + '" alt="" loading="lazy" width="48" height="48">'
          : '<span class="kaihome__piece-img" aria-hidden="true"></span>') +
        '<span class="kaihome__piece-body">' +
          '<span class="kaihome__piece-name">' + esc(p.name) + '</span>' +
          (p.price ? '<span class="kaihome__piece-price">' + esc(p.price) + '</span>' : '') +
        '</span>' +
      '</a></li>';
    }

    function refresh() {
      var s = decay(load());
      save(s);

      // meters
      for (var i = 0; i < METERS.length; i++) {
        var id = METERS[i].id;
        var v = Math.round(s.m[id]);
        var bar = el.querySelector('[data-bar="' + id + '"]');
        var val = el.querySelector('[data-val="' + id + '"]');
        if (val) val.textContent = v;
        if (bar) {
          bar.setAttribute('aria-valuenow', String(v));
          var segs = bar.querySelectorAll('.kaihome__seg');
          var on = Math.round(v / 10);
          for (var j = 0; j < segs.length; j++) {
            if (j < on) segs[j].classList.add('is-on');
            else segs[j].classList.remove('is-on');
          }
        }
      }

      // rank + xp
      var idx = stageIndex(s.xp);
      var st = STAGES[idx];
      var nameEl = el.querySelector('[data-kai-stage]');
      var glossEl = el.querySelector('[data-kai-gloss]');
      var fill = el.querySelector('[data-kai-xpfill]');
      var xpNote = el.querySelector('[data-kai-xpnote]');
      if (nameEl) nameEl.textContent = st.name;
      if (glossEl) glossEl.textContent = st.gloss;
      if (stage) stage.setAttribute('data-stage', String(idx + 1));
      var nx = nextStageXp(s.xp);
      if (fill) {
        var from = st.xp;
        var pct = nx == null ? 100 : Math.max(0, Math.min(100, ((s.xp - from) / (nx - from)) * 100));
        fill.style.width = pct + '%';
      }
      if (xpNote) {
        xpNote.textContent = nx == null
          ? s.xp + ' xp · fully grown'
          : s.xp + ' xp · ' + (nx - s.xp) + ' to ' + STAGES[idx + 1].name;
      }

      // rewards
      for (var w = 0; w < REWARDS.length; w++) {
        var rEl = el.querySelector('[data-reward="' + REWARDS[w].id + '"]');
        if (!rEl) continue;
        if (s.rewards[REWARDS[w].id]) rEl.classList.remove('is-locked');
        else rEl.classList.add('is-locked');
      }

      // journey
      for (var q = 0; q < JOURNEY.length; q++) {
        var sEl = el.querySelector('[data-step="' + JOURNEY[q].id + '"]');
        if (!sEl) continue;
        var done = !!s.rewards[JOURNEY[q].reward];
        if (done) sEl.classList.add('is-done');
        else sEl.classList.remove('is-done');
        var mk = sEl.querySelector('.kaihome__step-mark');
        if (mk) mk.textContent = done ? '✦' : '·';
      }

      // kept pieces
      var keptEl = el.querySelector('[data-kai-kept]');
      var keptEmpty = el.querySelector('[data-kai-kept-empty]');
      if (keptEl) {
        var html = '';
        for (var k = 0; k < s.kept.length && k < 6; k++) html += paintPiece(s.kept[k]);
        keptEl.innerHTML = html;
        if (keptEmpty) keptEmpty.hidden = s.kept.length > 0;
      }

      // last find
      var findWrap = el.querySelector('[data-kai-find-wrap]');
      var findEl = el.querySelector('[data-kai-find]');
      if (findWrap && findEl) {
        if (s.find && s.find.slug) {
          findEl.innerHTML = paintPiece(s.find);
          findWrap.hidden = false;
        } else {
          findWrap.hidden = true;
        }
      }

      // notes
      var notesEl = el.querySelector('[data-kai-notes]');
      if (notesEl) {
        var nh = '';
        for (var n = 0; n < s.notes.length; n++) {
          nh += '<li class="kaihome__note">' + esc(s.notes[n].text) + '</li>';
        }
        if (!nh) nh = '<li class="kaihome__note">Kai is waiting for his first adventure.</li>';
        notesEl.innerHTML = nh;
      }

      // cooldowns — aria-disabled, NOT the `disabled` property: disabling the
      // button you just pressed drops keyboard focus to <body>. doAction()
      // already no-ops while an action is cooling down, so the button stays
      // focusable and merely looks (and announces) unavailable.
      var now = Date.now();
      for (var b = 0; b < ACTIONS.length; b++) {
        var btn = el.querySelector('[data-act="' + ACTIONS[b].id + '"]');
        if (!btn) continue;
        var last = s.acts[ACTIONS[b].id] || 0;
        var cooling = (now - last) < ACTIONS[b].cd;
        btn.setAttribute('aria-disabled', cooling ? 'true' : 'false');
        if (cooling) btn.classList.add('is-cooling');
        else btn.classList.remove('is-cooling');
      }
    }

    function doAction(id, fromCanvas) {
      var act = null;
      for (var i = 0; i < ACTIONS.length; i++) { if (ACTIONS[i].id === id) act = ACTIONS[i]; }
      if (!act) return;
      var s = decay(load());
      var now = Date.now();
      if ((now - (s.acts[id] || 0)) < act.cd) { save(s); return; }
      s.acts[id] = now;

      for (var g in act.gains) { s.m[g] = clamp(s.m[g] + act.gains[g]); }
      addXp(s, act.xp);
      save(s);

      if (ctl && !fromCanvas) { ctl.trigger(act.pose); leash(act.pose); }
      say(act.lines[Math.floor(Math.random() * act.lines.length)]);

      if (id === 'explore') {
        findPiece().then(function (p) {
          if (!p) return;
          var s2 = load();
          s2.find = { slug: p.slug, name: p.name, img: p.image, price: p.price || '' };
          note(s2, 'Kai found ' + p.name + ' for you.');
          save(s2);
          if (ctl) { ctl.trigger('point'); leash('point'); } // cancels the walk leash
          say('I found something for you!');
          refresh();
        });
      }
      refresh();
    }

    el.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-act]') : null;
      if (b) {
        doAction(b.getAttribute('data-act'), false);
        return;
      }
      var rs = e.target.closest ? e.target.closest('[data-kai-reset]') : null;
      if (rs) {
        if (window.confirm('Start Kai over? His meters, rewards and kept pieces in this browser will be cleared.')) {
          save(defaults());
          refresh();
          say('A fresh start.');
        }
      }
    });

    function mount() {
      refresh();
      if (canvas && window.kaiAnim) {
        ctl = window.kaiAnim(canvas, {
          width: 168, height: 168, targetHeight: 118, groundInset: 24,
          initial: 'alert', onAmbient: onAmbient
        });
      } else if (canvas) {
        // Engine missing (script blocked / cached old build) — degrade to a
        // single static frame rather than an empty box.
        var img = document.createElement('img');
        img.src = '/kai/quieto.png';
        img.alt = '';
        img.className = 'kaihome__sprite-fallback';
        canvas.parentNode.replaceChild(img, canvas);
      }
      if (lineEl) lineEl.textContent = mood(load());
      timer = window.setInterval(function () {
        if (document.hidden) return;
        refresh();
      }, 4000);
    }

    function destroy() {
      if (timer) { window.clearInterval(timer); timer = null; }
      if (lineT) { window.clearTimeout(lineT); lineT = null; }
      if (poseT) { window.clearTimeout(poseT); poseT = null; }
      if (ctl) { ctl.destroy(); ctl = null; }
    }

    return { el: el, mount: mount, destroy: destroy, refresh: refresh };
  }

  // ── Overlay lifecycle ───────────────────────────────────────────────────
  var overlay = null;
  var panel = null;
  var lastFocus = null;
  var inlineRoot = null;

  function focusables() {
    if (!panel) return [];
    var list = panel.el.querySelectorAll('button:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])');
    return Array.prototype.slice.call(list);
  }

  function onKey(e) {
    if (!overlay) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      closeHome();
      return;
    }
    if (e.key !== 'Tab') return;
    var f = focusables();
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function openHome() {
    if (overlay) return;
    // On /kai the room is already on the page — just take them to it.
    if (inlineRoot) {
      try { inlineRoot.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' }); }
      catch (e) { inlineRoot.scrollIntoView(); }
      return;
    }
    lastFocus = document.activeElement;
    ensureCss().then(function () {
      if (overlay) return;
      overlay = document.createElement('div');
      overlay.className = 'kaihome-overlay';
      panel = buildPanel(false);
      overlay.appendChild(panel.el);
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(function () { if (overlay) overlay.classList.add('is-open'); });
      panel.mount();

      var close = panel.el.querySelector('[data-kai-close]');
      if (close) {
        close.addEventListener('click', closeHome);
        close.focus();
      }
      overlay.addEventListener('click', function (e) { if (e.target === overlay) closeHome(); });
      document.addEventListener('keydown', onKey, true);

      // The surface we came from (drawer / search dialog / cart) is closing at
      // the same time and restores body scroll on its way out — some do it on a
      // timeout. Re-assert the lock once they're all done.
      window.setTimeout(function () {
        if (overlay) document.body.style.overflow = 'hidden';
      }, 400);
    });
  }

  function closeHome() {
    if (!overlay) return;
    document.removeEventListener('keydown', onKey, true);
    if (panel) { panel.destroy(); panel = null; }
    var ov = overlay;
    overlay = null;
    ov.classList.remove('is-open');
    document.body.style.overflow = '';
    window.setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 240);
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) { /* gone */ } }
  }

  // ── The secret entrance (nothing in src/ was edited) ────────────────────
  // Every Kai on the site gets the same hidden gesture. No button, no label,
  // no tooltip: the room only exists for whoever squeezes him long enough or
  // insists five times.

  /* The one piece of feedback while you hold him: a wordless ember aura that
     grows under your finger. Inline styles ON PURPOSE — kai-home.css is loaded
     lazily, and this has to be right the very first time anyone presses him.
     Created eagerly at hook time so the browser has a resolved starting style
     to transition FROM (built on demand, the first hold would just snap on). */
  function glowFor(canvas) {
    var host = canvas.parentNode;
    if (!host || !host.appendChild || !host.querySelector) return null;
    var g = host.querySelector('[data-kai-glow]');
    if (g) return g;
    if (window.getComputedStyle && window.getComputedStyle(host).position === 'static') {
      host.style.position = 'relative'; // does not move a static box, just anchors the aura
    }
    g = document.createElement('span');
    g.setAttribute('data-kai-glow', '');
    g.setAttribute('aria-hidden', 'true');
    g.style.cssText =
      'position:absolute;left:50%;top:56%;width:150%;height:150%;' +
      'transform:translate(-50%,-50%) scale(0.55);border-radius:50%;' +
      'pointer-events:none;opacity:0;mix-blend-mode:screen;' +
      'background:radial-gradient(circle,rgba(201,168,76,0.55) 0%,' +
      'rgba(201,168,76,0.16) 42%,rgba(201,168,76,0) 70%);';
    host.appendChild(g);
    return g;
  }

  function charge(canvas, on) {
    var g = glowFor(canvas);
    if (!g) return;
    if (reduced()) {
      // No growing animation — just present or not.
      g.style.transition = 'none';
      g.style.opacity = on ? '0.5' : '0';
      g.style.transform = 'translate(-50%,-50%) scale(' + (on ? '1' : '0.55') + ')';
      return;
    }
    if (on) {
      g.style.transition = 'opacity ' + HOLD_MS + 'ms ease-in, transform ' + HOLD_MS + 'ms ease-in';
      g.style.opacity = '1';
      g.style.transform = 'translate(-50%,-50%) scale(1)';
    } else {
      g.style.transition = 'opacity 240ms ease-out, transform 240ms ease-out';
      g.style.opacity = '0';
      g.style.transform = 'translate(-50%,-50%) scale(0.55)';
    }
  }

  function isEnterOrSpace(e) {
    return e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar' || e.key === 'Space';
  }

  function hookSprite(canvas) {
    if (!canvas || canvas.getAttribute('data-kai-secret') !== null) return;
    canvas.setAttribute('data-kai-secret', '');

    /* The Kai in the SEARCH modal carries a second secret: a plain tap on him
       starts the runner (see the runner block at the bottom of this file). So on
       THAT sprite the 5-tap shortcut is switched off — the first tap would already
       have started the game, and the two gestures would fight over the same press.
       He keeps the long-press to the room, exactly like every other Kai. */
    var isSearch = canvas.id === 'search-kai-canvas';

    // Focusable + named, so the secret has a keyboard path at all. The label
    // describes what a NORMAL press does (pet him) — it never names the room.
    // aria-hidden has to go: a focusable element inside aria-hidden is a bug.
    canvas.removeAttribute('aria-hidden');
    canvas.setAttribute('role', 'button');
    canvas.setAttribute('aria-label', 'Pet Kai');
    canvas.setAttribute('tabindex', '0');
    canvas.style.cursor = 'pointer';
    canvas.style.touchAction = 'manipulation';
    canvas.style.userSelect = 'none';
    canvas.style.webkitUserSelect = 'none';
    canvas.style.webkitTouchCallout = 'none';
    glowFor(canvas);

    var holdT = null;
    var taps = 0;
    var lastTap = 0;
    var startX = 0, startY = 0;
    var pid = null;
    var opened = false;
    var moved = false;
    var keyHeld = false;

    function cancelHold() {
      if (holdT) { window.clearTimeout(holdT); holdT = null; }
      charge(canvas, false);
    }

    function fire() {
      opened = true;
      cancelHold();
      taps = 0;
      openFrom(canvas);
    }

    function startHold() {
      ensureCss(); // he's being touched — warm the room's stylesheet now
      if (holdT) window.clearTimeout(holdT);
      opened = false;
      charge(canvas, true);
      holdT = window.setTimeout(function () { holdT = null; fire(); }, HOLD_MS);
    }

    function countTap() {
      var t = Date.now();
      taps = (t - lastTap) > TAP_GAP_MS ? 1 : taps + 1;
      lastTap = t;
      if (taps >= TAPS_NEEDED) fire();
    }

    /* A short, still press on the search Kai = he starts running. It fires on
       RELEASE, never on press: a press that turned into a long-press (the room),
       or that drifted into a scroll, must not also launch a game. */
    function tapped() {
      if (!isSearch) return;
      startRunner();
    }

    // ── pointer: mouse, pen and finger, one path ──
    canvas.addEventListener('pointerdown', function (e) {
      if (typeof e.button === 'number' && e.button > 0) return; // right/middle click isn't a press
      pid = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      moved = false;
      startHold();
      if (!isSearch) countTap();
    });

    function endPointer(e) {
      if (pid !== null && e.pointerId !== pid) return;
      var wasPressed = (pid !== null);
      pid = null;
      var didOpen = opened;
      cancelHold();
      // pointercancel / pointerleave are not taps — only a real release is.
      if (!wasPressed || e.type !== 'pointerup') return;
      if (didOpen || moved) return;
      tapped();
    }
    canvas.addEventListener('pointerup', endPointer);
    canvas.addEventListener('pointercancel', endPointer);
    canvas.addEventListener('pointerleave', endPointer);

    canvas.addEventListener('pointermove', function (e) {
      if (pid !== null && e.pointerId !== pid) return;
      if (pid === null && !holdT) return;
      if (Math.abs(e.clientX - startX) > MOVE_TOL || Math.abs(e.clientY - startY) > MOVE_TOL) {
        moved = true;
        cancelHold(); // they're scrolling/dragging, not holding him
      }
    });

    // A long finger-press on a canvas can raise the OS callout menu mid-hold.
    canvas.addEventListener('contextmenu', function (e) {
      if (holdT) e.preventDefault();
    });

    // ── keyboard: same secret, no pointer needed ──
    canvas.addEventListener('keydown', function (e) {
      if (!isEnterOrSpace(e)) return;
      e.preventDefault(); // Space would scroll the page under him
      if (e.repeat || keyHeld) return; // held keys auto-repeat — one press is one press
      keyHeld = true;
      startHold();
      if (!isSearch) countTap();
    });

    canvas.addEventListener('keyup', function (e) {
      if (!isEnterOrSpace(e)) return;
      keyHeld = false;
      var didOpen = opened;
      cancelHold();
      if (didOpen) return;
      // A short press is just a pet — and kai-anim.js pets on 'click', which a
      // canvas never fires from the keyboard. Hand it one.
      try { canvas.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
      catch (err) { /* ancient browser: no pet, no crash */ }
      // …and on the search Kai a short press is also the way in to the runner,
      // so the secret has a keyboard path too.
      tapped();
    });

    canvas.addEventListener('blur', function () {
      keyHeld = false;
      cancelHold();
    });
  }

  function hookSprites() {
    var list = document.querySelectorAll(SPRITE_SEL);
    for (var i = 0; i < list.length; i++) hookSprite(list[i]);

    // Warm the stylesheet the moment the drawer opens — by the time anyone gets
    // through the gesture it's already there, and pages nobody opens pay nothing.
    var burger = document.querySelector('[data-burger]');
    if (burger) burger.addEventListener('click', function () { ensureCss(); }, { once: true });
  }

  // Close whatever surface Kai was living in before the room opens. We reuse
  // each surface's OWN close control (they restore body scroll themselves), and
  // the search modal is a real <dialog>.showModal() — left open it would sit in
  // the top layer, ON TOP of the room.
  var SURFACE_CLOSE = [
    { host: '[data-drawer]', close: '[data-drawer-close]' },
    { host: '#search-modal', close: '[data-search-close]' },
    { host: '[data-wmcart]', close: '[data-wmcart-close]' }
  ];

  function openFrom(canvas) {
    if (canvas && canvas.closest) {
      for (var i = 0; i < SURFACE_CLOSE.length; i++) {
        if (!canvas.closest(SURFACE_CLOSE[i].host)) continue;
        var btn = document.querySelector(SURFACE_CLOSE[i].close);
        if (btn && btn.click) btn.click();
        break;
      }
    }
    openHome();
  }

  /* ── Kai's runner (lazy — /kai/kai-run.js) ────────────────────────────────
     THE GAME IS A SECRET (owner decision 2026-07-12). It does not appear on its
     own — not on an empty search, not anywhere. The one way in is to TOUCH KAI:
     a plain tap/click on the search sprite (#search-kai-canvas) and he starts
     running, right there under the search field. Nothing on screen says so;
     nothing on screen explains the jump. You press him, he runs, and you work
     the rest out by pressing things — which is the whole point.

     (Long-press on that same Kai still opens his home: the two gestures don't
     collide, because a hold is not a tap. See hookSprite / isSearch above.)

     Wired entirely from here, at runtime — no .astro file was edited — and
     kai-run.js is only ever fetched the first time somebody actually pokes him.
     A visitor who never touches Kai never downloads a single byte of it. */
  var RUN_SRC = '/kai/kai-run.js';
  var runLoad = null;    // Promise<window.kaiRun> — the <script> is injected once
  var runCtl = null;     // live game controller
  var runHost = null;    // the container we own (and remove on the way out)
  var runRestore = null; // inline styles borrowed from the modal, restored verbatim
  var runGen = 0;        // guards against a stale lazy-load mounting into a dead host
  var runFailed = false; // one failed fetch is enough — never flicker the modal again

  function ensureRun() {
    if (runLoad) return runLoad;
    runLoad = new Promise(function (res, rej) {
      if (window.kaiRun) { res(window.kaiRun); return; }
      var s = document.createElement('script');
      s.src = RUN_SRC;
      s.defer = true;
      s.onload = function () {
        if (window.kaiRun) res(window.kaiRun);
        else rej(new Error('kai-run.js loaded but exported nothing'));
      };
      s.onerror = function () { rej(new Error('kai-run.js failed to load')); };
      document.head.appendChild(s);
    });
    return runLoad;
  }

  /* The one entry point: Kai was touched in the search modal. */
  function startRunner() {
    if (runHost || runFailed) return;
    var dlg = document.getElementById('search-modal');
    if (!dlg || !dlg.hasAttribute('open')) return; // only ever inside the search
    openRunner();
  }

  /* The board takes keyboard focus on purpose — that is how the space bar turns
     into the jump. The cost would be that typing does nothing while Kai runs, and
     the search box is the whole reason the modal exists. So: any printable key
     pressed on the board is handed straight back to the field, character and all.
     Type one letter and you're searching again — the game gets out of the way by
     itself (a search with matches closes it). Space and the arrows are the game's;
     everything else belongs to the search. */
  function onRunKey(e) {
    if (e.altKey || e.metaKey || e.ctrlKey) return;
    var k = e.key;
    if (typeof k !== 'string' || k.length !== 1 || k === ' ') return;
    var input = document.getElementById('search-input');
    if (!input) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      input.focus();
      input.value = input.value + k;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    } catch (err) { /* never break the modal over a keystroke */ }
  }

  function openRunner() {
    if (runHost || runFailed) return;
    var anchor = document.querySelector('[data-search-empty]');
    if (!anchor || !anchor.parentNode) return;

    /* Three inline styles borrowed from the modal for exactly as long as the game
       is up — all restored verbatim in closeRunner(), none of them touching a
       stylesheet or a component:
         · the Kai niche is hidden (he's on the board now — two Kais at once
           breaks the spell; and display:none parks the sprite engine for free,
           its IntersectionObserver stops the rAF loop by itself),
         · the results list is hidden and stops flex-growing, so the board sits up
           under the search field with nothing stale stacked above it.
       The instant a search comes back with matches, closeRunner() puts all three
       back — and it runs from a MutationObserver, i.e. before the browser paints,
       so the results never flash. Search always wins over the toy. */
    var niche = document.querySelector('[data-kai-search]');
    var results = document.getElementById('search-results');
    runRestore = {
      niche: niche, nicheDisplay: niche ? niche.style.display : null,
      results: results,
      resultsFlex: results ? results.style.flex : null,
      resultsDisplay: results ? results.style.display : null
    };
    if (niche) niche.style.display = 'none';
    if (results) {
      results.style.flex = '0 0 auto';
      results.style.display = 'none';
    }

    runHost = document.createElement('div');
    runHost.setAttribute('data-kai-run-host', '');
    runHost.addEventListener('keydown', onRunKey);
    anchor.parentNode.insertBefore(runHost, anchor.nextSibling);

    var gen = ++runGen;
    ensureRun().then(function (api) {
      if (gen !== runGen || !runHost || runCtl) return; // it was closed while it loaded
      runCtl = api.mount(runHost);
    }).catch(function (e) {
      runFailed = true;
      if (window.console && console.warn) console.warn('[kai-run]', e);
      closeRunner();
    });
  }

  function closeRunner() {
    runGen++;
    if (runCtl) {
      try { runCtl.destroy(); } catch (e) { /* he's a toy — never a blocker */ }
      runCtl = null;
    }
    if (runHost && runHost.parentNode) runHost.parentNode.removeChild(runHost);
    runHost = null;
    if (runRestore) {
      if (runRestore.niche) runRestore.niche.style.display = runRestore.nicheDisplay || '';
      if (runRestore.results) {
        runRestore.results.style.flex = runRestore.resultsFlex || '';
        runRestore.results.style.display = runRestore.resultsDisplay || '';
      }
      runRestore = null;
    }
  }

  /* Nothing here OPENS the game any more — only startRunner() does, and only a
     touch on Kai calls it. All this does is make sure the board never gets in
     the way of the thing the modal is actually for:

       · the moment a search yields results, the game folds up and leaves (the
         results list going from empty to non-empty is the signal — SearchModal
         clears the list on every keystroke, and an empty list is NOT a result),
       · closing the modal (Esc, backdrop, ×) destroys it: rAF loop, listeners,
         DOM, and every inline style it borrowed. */
  function hookSearchRunner() {
    var dlg = document.getElementById('search-modal');
    var results = document.getElementById('search-results');
    if (!dlg) return;

    if (results && typeof MutationObserver === 'function') {
      var mo = new MutationObserver(function () {
        if (runHost && results.children.length > 0) closeRunner();
      });
      mo.observe(results, { childList: true });
    }

    // Esc, the backdrop and the × button all end in a native dialog close.
    dlg.addEventListener('close', closeRunner);
    dlg.addEventListener('cancel', closeRunner);
  }

  function hookCart() {
    // Cart.astro listens on document for [data-add-cart] and never stops
    // propagation, so this listener rides along without touching it.
    document.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-add-cart]') : null;
      if (!btn) return;
      var st = btn.getAttribute('data-stock');
      if (st === 'sold' || st === 'outofstock') return;
      onCartAdd();
    });
  }

  function hookRoute() {
    var p = window.location.pathname || '/';
    if (p.indexOf('/p/') === 0) {
      var slug = p.slice(3).replace(/\/+$/, '');
      if (slug) onPdp(slug);
    } else if (p.indexOf('/gracias') === 0) {
      onPurchase();
    }
  }

  function mountInline(root) {
    inlineRoot = root;
    ensureCss().then(function () {
      var p = buildPanel(true);
      root.appendChild(p.el);
      p.mount();
    });
  }

  function init() {
    try {
      markVisit();
      hookSprites();
      hookSearchRunner();
      hookCart();
      hookRoute();
      var root = document.querySelector('[data-kai-home-inline]');
      if (root) mountInline(root);
    } catch (e) {
      // Kai is decoration: he must never take the page down with him.
      if (window.console && console.warn) console.warn('[kai-home]', e);
    }
  }

  // Public API — for future hooks (e.g. window.kaiHome.open() from anywhere).
  window.kaiHome = {
    open: openHome,
    close: closeHome,
    state: load,
    reset: function () { save(defaults()); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
