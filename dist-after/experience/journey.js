/* ═══════════════════════════════════════════════════════════════════
   WENU MAPU — JOURNEY LAYER (additive · redesigned 2026-07-10)
   A guided constellation walk over the existing starmap portal:
   EACH STAR IS ONE STAGE. Ten stars, chained into a cosmological arc
   from dawn to the gathering. Light one → the next is pointed to →
   all ten lit → the central portal opens (free crossing + code).

   Stage order (star · concept):
     1  Wün        (star-ne)      first light / threshold
     2  Antü       (star-n)       the sun · Wenu Mapu above
     3  Wüñelfe    (star-wunelfe) Venus · the eight-pointed silver star
     4  Küyen      (star-s)       the moon · real lunar phase · silver
     5  Az Mapu    (star-e)       the way · the order that names things
     6  Pewma      (star-nw)      the dream · the channel
     7  Treng Treng(star-treng)   the origin · the mountain that rose
     8  Lafken     (star-w)       the sea · the west · the flood water
     9  Nag Mapu   (star-se)      the middle world · the workshop
                                  → the Atacama FRAGMENT: 1st catch FAILS,
                                    it returns slower, 2nd catch succeeds
     10 Trawün     (star-sw)      the gathering → WENU-PORTAL + email + shop

   Hooks into the inline script globals: enterDeepPortal, getVisited,
   triggerGlitch, SHOP_URL. All additive — no rewrites of index.html
   beyond the two journey <link>+<script> lines (remove them to roll
   back). Reaching all ten stars also trips the map's own
   checkConstellationComplete, which reveals the hidden 11th star.
   Exclusions honored: no Three.js, no UFOs, no percentage discounts.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var COUPON = 'WENU-PORTAL';
  var EMAIL_ENDPOINT = 'https://email-agent.wenumapuonline.com/constellation/submit';
  var STATE_KEY = 'wenu-journey-v1';
  var TOTAL = 10;

  var IS_TOUCH = window.matchMedia('(pointer: coarse)').matches;
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function lang() {
    var l = document.documentElement.getAttribute('lang') || 'en';
    return l.indexOf('es') === 0 ? 'es' : 'en';
  }

  /* ─── STAGE META — the walk order + which star each stage targets.
     MOON stage renders the live lunar phase; FRAG stage runs the
     Atacama meteorite event. Positions are the map's own placements. ─── */
  var STAGES = [
    { star: 'star-ne',      name: 'Wün' },
    { star: 'star-n',       name: 'Antü' },
    { star: 'star-wunelfe', name: 'Wüñelfe' },
    { star: 'star-s',       name: 'Küyen', moon: true },
    { star: 'star-e',       name: 'Az Mapu' },
    { star: 'star-nw',      name: 'Pewma' },
    { star: 'star-treng',   name: 'Treng Treng' },
    { star: 'star-w',       name: 'Lafken' },
    { star: 'star-se',      name: 'Nag Mapu', frag: true },
    { star: 'star-sw',      name: 'Trawün', last: true }
  ];
  var FRAG_STAGE = 9;   // 1-based index of Nag Mapu
  var LAST_STAGE = 10;  // Trawün
  function meta(n) { return STAGES[n - 1]; }

  /* ─── COPY — ten stages, EN/ES. Cultural fidelity: documented terms
     only, arc framed as an editorial walk; jewelry facts stay real
     (silver ↔ moon; the eight-pointed Wüñelfe in Mapuche silverwork;
     Atacama meteorite set in sterling silver). ─── */
  var COPY = {
    en: {
      inviteBtn: 'Begin the journey',
      inviteSub: 'Ten stars · one fragment · free crossing',
      hudLabel: 'THE JOURNEY',
      cont: 'Continue',
      minimize: 'Hide',
      stageWord: 'Star',
      stages: [
        { sub: 'First light', story: '<p>Wün is the dawn — the first light, the threshold between night and day. Every great ceremony begins here, facing the coming sun.</p><p>So does this walk: ten stars, one crossing. Start at the edge of the light.</p>',
          task: 'Enter Wün — the dawn (northeast)', taskDone: 'You stepped through first light' },
        { sub: 'The sun · the land above', story: '<p>Antü is the Sun — and the word for a day itself. It keeps the day in Wenu Mapu, the land above, highest of the stacked worlds.</p><p>Everything we make is named after that order. Begin where the day begins.</p>',
          task: 'Light Antü — the sun (north)', taskDone: 'Antü is lit' },
        { sub: 'Venus · the morning star', story: '<p>Wüñelfe is Venus — the morning star, the brightest light after sun and moon. Its eight points are among the oldest shapes hammered into Mapuche silver.</p><p>You wear this star before you learn its name.</p>',
          task: 'Find Wüñelfe — the morning star', taskDone: 'The eight-pointed star answered' },
        { sub: 'The moon · silver', story: '<p>Silver belongs to the moon. The rütrafe smiths beat Küyen’s light into pectorals and earrings — Antü’s counterpart, keeper of the months.</p><p>Above your head, right now, Küyen looks exactly like this:</p>',
          task: 'Enter Küyen — the moon (south)', taskDone: 'You stood in the moon’s light' },
        { sub: 'The way', story: '<p>Az Mapu is the way — the unwritten order that binds a person to family, community, the ngen spirits, and the land. It is the ethics under everything.</p><p>A ring made well carries a little of it.</p>',
          task: 'Enter Az Mapu — the way (east)', taskDone: 'You touched the order of things' },
        { sub: 'The dream', story: '<p>Pewma is the dream — a real channel, not an idle one. Through it the ancestors speak, the ngen warn, and what is coming leaves a footprint.</p><p>Some pieces are a Pewma before they are ever drawn.</p>',
          task: 'Enter Pewma — the dream (northwest)', taskDone: 'The dream left a footprint' },
        { sub: 'The origin', story: '<p>Treng Treng Vilu is the serpent of the mountain. When Kai Kai, serpent of the sea, brought the flood, Treng Treng raised the land and saved the people.</p><p>Every mountain here remembers rising.</p>',
          task: 'Enter Treng Treng — the origin (inner ring)', taskDone: 'The mountain rose for you' },
        { sub: 'The sea · the west', story: '<p>Lafken is the sea, the lake, any great water — and the western direction. It is the flood Kai Kai raised, and the horizon the day falls into.</p><p>Salt and silver, both left behind by water.</p>',
          task: 'Enter Lafken — the sea (west)', taskDone: 'You reached the water’s edge' },
        { sub: 'The middle world · the workshop', story: '<p>Nag Mapu is the middle world — the one with hands in it. Here the Atacama meteorite is cut, set into sterling silver, and returned to the sky as a ring.</p><p>A fragment is crossing the map right now. Try to catch it.</p>',
          task: 'Enter Nag Mapu — the workshop (southeast)',
          taskFirst: 'Catch the fragment',
          taskReturn: 'It came back — slower now. Catch it.',
          taskDone: 'Fragment captured' },
        { sub: 'The gathering', story: '<p>Trawün is the gathering — where a journey ends and people meet, through dialogue, not decree.</p><p>The fragment you caught opens into a passage. Enter Trawün and the crossing opens.</p>',
          task: 'Enter Trawün — the gathering (southwest)', taskDone: '' }
      ],
      rewardIntro: '<p>Ten stars lit, one fragment caught. The portal covers your crossing: <strong>shipping is free</strong> on your order, no minimum. The Atacama rings are waiting — each one carries real meteorite.</p>',
      toastFail: '◈ IT SLIPPED BACK · THE IRON ALWAYS CIRCLES AROUND',
      toastCatch: '◈ FRAGMENT CAPTURED',
      toastCopied: 'CODE COPIED',
      toastLit: '◈ STAR LIT',
      codeNote: 'Free shipping · no minimum · first 100 travelers',
      copyBtn: 'Copy',
      emailPh: 'your@email.com',
      sendBtn: 'Send',
      emailNote: 'Want it in your inbox? We write once — the code travels with you either way.',
      emailSent: 'Sent. Check your inbox ✓',
      emailErr: 'Could not send — the code above is yours anyway.',
      shopBtn: 'Enter the shop → Atacama rings',
      exploreNote: 'The eleventh star may now be hiding on the map. Keep walking if you wish.'
    },
    es: {
      inviteBtn: 'Iniciar el viaje',
      inviteSub: 'Diez estrellas · un fragmento · cruce gratis',
      hudLabel: 'EL VIAJE',
      cont: 'Continuar',
      minimize: 'Ocultar',
      stageWord: 'Estrella',
      stages: [
        { sub: 'Primera luz', story: '<p>Wün es el amanecer — la primera luz, el umbral entre la noche y el día. Toda gran ceremonia empieza aquí, de cara al sol que viene.</p><p>Este viaje también: diez estrellas, un cruce. Empieza en el borde de la luz.</p>',
          task: 'Entra a Wün — el amanecer (noreste)', taskDone: 'Cruzaste la primera luz' },
        { sub: 'El sol · la tierra de arriba', story: '<p>Antü es el Sol — y también la palabra para un día. Sostiene el día en Wenu Mapu, la tierra de arriba, la más alta de los mundos apilados.</p><p>Todo lo que hacemos lleva el nombre de ese orden. Empieza donde empieza el día.</p>',
          task: 'Enciende Antü — el sol (norte)', taskDone: 'Antü encendido' },
        { sub: 'Venus · el lucero del alba', story: '<p>Wüñelfe es Venus — el lucero del alba, la luz más brillante después del sol y la luna. Sus ocho puntas están entre las formas más antiguas martilladas en la plata Mapuche.</p><p>Llevas esta estrella antes de saber su nombre.</p>',
          task: 'Encuentra a Wüñelfe — el lucero', taskDone: 'La estrella de ocho puntas respondió' },
        { sub: 'La luna · la plata', story: '<p>La plata pertenece a la luna. Los rütrafe martillaban la luz de Küyen en pectorales y aros — la contraparte de Antü, guardiana de los meses.</p><p>Sobre tu cabeza, ahora mismo, Küyen está exactamente así:</p>',
          task: 'Entra a Küyen — la luna (sur)', taskDone: 'Estuviste en la luz de la luna' },
        { sub: 'El camino', story: '<p>Az Mapu es el camino — el orden no escrito que ata a una persona a la familia, la comunidad, los ngen y la tierra. Es la ética debajo de todo.</p><p>Un anillo bien hecho lleva un poco de él.</p>',
          task: 'Entra a Az Mapu — el camino (este)', taskDone: 'Tocaste el orden de las cosas' },
        { sub: 'El sueño', story: '<p>Pewma es el sueño — un canal real, no ocioso. Por él hablan los antepasados, avisan los ngen, y lo que viene deja una huella.</p><p>Algunas piezas son un Pewma antes de dibujarse.</p>',
          task: 'Entra a Pewma — el sueño (noroeste)', taskDone: 'El sueño dejó una huella' },
        { sub: 'El origen', story: '<p>Treng Treng Vilu es la serpiente de la montaña. Cuando Kai Kai, serpiente del mar, trajo el diluvio, Treng Treng levantó la tierra y salvó a la gente.</p><p>Cada montaña aquí recuerda haber subido.</p>',
          task: 'Entra a Treng Treng — el origen (anillo interior)', taskDone: 'La montaña subió por ti' },
        { sub: 'El mar · el oeste', story: '<p>Lafken es el mar, el lago, toda agua grande — y la dirección oeste. Es el diluvio que levantó Kai Kai, y el horizonte donde cae el día.</p><p>Sal y plata, las dos dejadas por el agua.</p>',
          task: 'Entra a Lafken — el mar (oeste)', taskDone: 'Llegaste al borde del agua' },
        { sub: 'El mundo del medio · el taller', story: '<p>Nag Mapu es el mundo del medio — el que tiene manos. Aquí el meteorito de Atacama se corta, se engasta en plata de ley y vuelve al cielo hecho anillo.</p><p>Un fragmento cruza el mapa ahora mismo. Intenta atraparlo.</p>',
          task: 'Entra a Nag Mapu — el taller (sureste)',
          taskFirst: 'Atrapa el fragmento',
          taskReturn: 'Volvió — más lento ahora. Atrápalo.',
          taskDone: 'Fragmento capturado' },
        { sub: 'El encuentro', story: '<p>Trawün es la reunión — donde un viaje termina y la gente se encuentra, por diálogo, no por decreto.</p><p>El fragmento que atrapaste se abre en un pasaje. Entra a Trawün y el cruce se abre.</p>',
          task: 'Entra a Trawün — la reunión (suroeste)', taskDone: '' }
      ],
      rewardIntro: '<p>Diez estrellas encendidas, un fragmento atrapado. El portal cubre tu cruce: <strong>envío gratis</strong> en tu orden, sin mínimo. Los anillos de Atacama esperan — cada uno lleva meteorito real.</p>',
      toastFail: '◈ SE ESCAPÓ · EL HIERRO SIEMPRE VUELVE',
      toastCatch: '◈ FRAGMENTO CAPTURADO',
      toastCopied: 'CÓDIGO COPIADO',
      toastLit: '◈ ESTRELLA ENCENDIDA',
      codeNote: 'Envío gratis · sin mínimo · primeros 100 viajeros',
      copyBtn: 'Copiar',
      emailPh: 'tu@correo.com',
      sendBtn: 'Enviar',
      emailNote: '¿Lo quieres en tu correo? Escribimos una sola vez — el código viaja contigo igual.',
      emailSent: 'Enviado. Revisa tu correo ✓',
      emailErr: 'No se pudo enviar — el código de arriba es tuyo igual.',
      shopBtn: 'Entrar a la tienda → anillos Atacama',
      exploreNote: 'La estrella once puede estar escondiéndose ahora en el mapa. Sigue caminando si quieres.'
    }
  };

  /* ─── STATE ─── */
  function loadState() {
    try { return JSON.parse(localStorage.getItem(STATE_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveState() {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(S)); } catch (e) {}
  }
  var S = loadState();
  // S: { started, stage (1..10), step (0..3 within a stage), done, emailSent }
  // migrate old six-chapter saves: keep completion, else restart the walk
  if (S.started && !S.done && !S.stage) S.stage = 1;
  if (S.ch) { delete S.ch; }

  /* ─── REAL LUNAR PHASE (no libraries) ─── */
  function moonPhase(date) {
    var SYNODIC = 29.53058867;
    var ref = Date.UTC(2000, 0, 6, 18, 14, 0); // documented new moon
    var days = (date.getTime() - ref) / 86400000;
    var f = ((days % SYNODIC) + SYNODIC) % SYNODIC / SYNODIC; // 0 new → 0.5 full → 1 new
    var illum = (1 - Math.cos(2 * Math.PI * f)) / 2;
    return { f: f, illum: illum };
  }
  function moonPhaseName(f, l) {
    var names = {
      en: ['New moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'],
      es: ['Luna nueva', 'Creciente', 'Cuarto creciente', 'Gibosa creciente', 'Luna llena', 'Gibosa menguante', 'Cuarto menguante', 'Menguante']
    };
    var idx = Math.round(f * 8) % 8;
    return names[l][idx];
  }
  function renderMoon(container, f) {
    var r = 45, cx = 50, cy = 50;
    var t = Math.cos(2 * Math.PI * f);
    var rx = Math.max(0.5, Math.abs(r * t));
    var waxing = f < 0.5;
    var sweepOuter = waxing ? 1 : 0;
    var sweepInner = (t > 0) === waxing ? 0 : 1;
    var d = 'M ' + cx + ' ' + (cy - r) +
      ' A ' + r + ' ' + r + ' 0 1 ' + sweepOuter + ' ' + cx + ' ' + (cy + r) +
      ' A ' + rx + ' ' + r + ' 0 1 ' + sweepInner + ' ' + cx + ' ' + (cy - r) + ' Z';
    container.innerHTML =
      '<svg viewBox="0 0 100 100" role="img" aria-label="moon phase">' +
      '<circle cx="50" cy="50" r="45" fill="#171512" stroke="rgba(240,237,232,0.25)" stroke-width="1"/>' +
      '<path d="' + d + '" fill="#e8e2d6"/>' +
      '</svg>';
  }

  /* ─── DOM SCAFFOLD ─── */
  function el(tag, id, cls, html) {
    var e = document.createElement(tag);
    if (id) e.id = id;
    if (cls) e.className = cls;
    if (html) e.innerHTML = html;
    return e;
  }
  var hud, invite, card, frag, toastEl;

  function buildDom() {
    hud = el('div', 'journey-hud');
    invite = el('div', 'journey-invite');
    card = el('div', 'journey-card');
    frag = el('div', 'j-fragment', null, '<div class="j-trail"></div><div class="j-px"></div>');
    toastEl = el('div', 'j-toast');
    document.body.appendChild(hud);
    document.body.appendChild(invite);
    document.body.appendChild(card);
    document.body.appendChild(frag);
    document.body.appendChild(toastEl);

    hud.addEventListener('click', function () { openCard(); });
    frag.addEventListener('pointerdown', onFragmentHit);
  }

  /* ─── HUD — ten constellation pips + counter ─── */
  function renderHud() {
    var c = COPY[lang()];
    var cur = S.done ? TOTAL : (S.stage || 1);
    var html = '<span class="j-label">' + c.hudLabel + '</span>';
    for (var i = 0; i < TOTAL; i++) {
      var done = (i + 1 < cur) || S.done;
      var now = (i + 1 === S.stage) && !S.done;
      html += '<span class="j-pip' + (done ? ' done' : '') + (now ? ' now' : '') + '"></span>';
    }
    html += '<span class="j-count">' + cur + '/' + TOTAL + '</span>';
    hud.innerHTML = html;
    hud.classList.toggle('on', !!S.started);
  }

  /* ─── TARGET STAR HIGHLIGHT on the map ─── */
  function highlightTarget() {
    var stars = document.querySelectorAll('.star');
    for (var i = 0; i < stars.length; i++) stars[i].classList.remove('j-target');
    if (!S.started || S.done) return;
    var n = S.stage;
    if (taskIsDone(n)) return; // already satisfied — no need to point
    var tEl = document.getElementById(meta(n).star);
    if (tEl) tEl.classList.add('j-target');
  }

  /* ─── TOAST ─── */
  var toastTimer = null;
  function toast(msg, isErr) {
    toastEl.textContent = msg;
    toastEl.classList.toggle('j-err', !!isErr);
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, 3400);
  }

  /* ─── STAGE CARD ─── */
  function chapterTaskLabel(n) {
    var st = COPY[lang()].stages[n - 1];
    if (n === FRAG_STAGE) {
      if (S.step >= 2) return st.taskReturn;
      if (S.step >= 1) return st.taskFirst;
    }
    return st.task;
  }
  function taskIsDone(n) {
    if (n === FRAG_STAGE) return S.step >= 3;
    return S.step >= 1;
  }
  function renderCard() {
    var l = lang();
    var c = COPY[l];
    var n = S.stage;
    var st = c.stages[n - 1];
    var m = meta(n);
    var atReward = (n === LAST_STAGE && S.done);
    var done = taskIsDone(n);

    var html =
      '<div class="j-kicker">' + c.stageWord + ' ' + n + ' / ' + TOTAL + '</div>' +
      '<div class="j-title">' + m.name + '</div>' +
      '<div class="j-sub-title">' + st.sub + '</div>' +
      '<div class="j-story">' + st.story + '</div>';

    if (m.moon) html += '<div id="journey-moon" class="on"></div>';

    if (atReward) {
      html += buildReward(c);
      html += '<div class="j-actions"><button class="j-min">' + c.minimize + '</button></div>';
    } else {
      html += '<div class="j-task' + (done ? ' done' : '') + '">' +
        (done ? st.taskDone : chapterTaskLabel(n)) + '</div>';
      html += '<div class="j-actions">' +
        '<button class="j-min">' + c.minimize + '</button>' +
        '<button class="j-next' + (done && n < LAST_STAGE ? ' ready' : '') + '">' + c.cont + ' →</button>' +
        '</div>';
    }
    card.innerHTML = html;

    if (m.moon) {
      var mp = moonPhase(new Date());
      var moonBox = card.querySelector('#journey-moon');
      renderMoon(moonBox, mp.f);
      moonBox.insertAdjacentHTML('beforeend',
        '<div class="j-moon-name">' + moonPhaseName(mp.f, l) + '</div>' +
        '<div class="j-moon-pct">Küyen · ' + Math.round(mp.illum * 100) + '% ' +
        (l === 'es' ? 'iluminada esta noche' : 'illuminated tonight') + '</div>');
    }

    var minBtn = card.querySelector('.j-min');
    if (minBtn) minBtn.addEventListener('click', closeCard);
    var nextBtn = card.querySelector('.j-next');
    if (nextBtn) nextBtn.addEventListener('click', advance);
    if (atReward) wireReward();
  }
  function openCard() { renderCard(); card.classList.add('on'); }
  function closeCard() { card.classList.remove('on'); }

  /* ─── REWARD (Trawün) ─── */
  function buildReward(c) {
    return '<div id="j-reward" class="on">' +
      '<div class="j-story">' + c.rewardIntro + '</div>' +
      '<div class="j-code-row">' +
      '<div class="j-code">' + COUPON + '</div>' +
      '<button class="j-copy">' + c.copyBtn + '</button>' +
      '</div>' +
      '<div class="j-code-note">' + c.codeNote + '</div>' +
      '<div class="j-email-row">' +
      '<input type="email" placeholder="' + c.emailPh + '" ' + (S.emailSent ? 'disabled' : '') + '/>' +
      '<button class="j-send" ' + (S.emailSent ? 'disabled' : '') + '>' + c.sendBtn + '</button>' +
      '</div>' +
      '<div class="j-email-note">' + (S.emailSent ? c.emailSent : c.emailNote) + '</div>' +
      '<a class="j-shop" href="' + shopUrl() + '">' + c.shopBtn + '</a>' +
      '<div class="j-email-note">' + c.exploreNote + '</div>' +
      '</div>';
  }
  function shopUrl() {
    return (typeof window.SHOP_URL === 'string' && window.SHOP_URL) || 'https://wenumapuonline.com/shop';
  }
  function wireReward() {
    var c = COPY[lang()];
    var copyBtn = card.querySelector('.j-copy');
    if (copyBtn) copyBtn.addEventListener('click', function () {
      var codeEl = card.querySelector('.j-code');
      var doneCopy = function () { toast(c.toastCopied); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(COUPON).then(doneCopy, doneCopy);
      } else {
        var range = document.createRange();
        range.selectNodeContents(codeEl);
        var sel = window.getSelection();
        sel.removeAllRanges(); sel.addRange(range);
        try { document.execCommand('copy'); } catch (e) {}
        doneCopy();
      }
    });
    var sendBtn = card.querySelector('.j-send');
    var emailInput = card.querySelector('input[type=email]');
    var note = card.querySelectorAll('.j-email-note')[0];
    if (sendBtn) sendBtn.addEventListener('click', function () {
      var em = (emailInput.value || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { emailInput.focus(); return; }
      sendBtn.disabled = true;
      fetch(EMAIL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: em,
          title: 'Portal fragment',
          summary: 'Atacama fragment captured in the Wenu Mapu portal journey. Visitor lit all ten stars and asked to receive the ' + COUPON + ' free-shipping code by email.',
          locale: lang(),
          notes: 'source: portal-journey'
        })
      }).then(function (r) {
        if (!r.ok) throw new Error('bad status');
        S.emailSent = true; saveState();
        emailInput.disabled = true;
        note.textContent = c.emailSent;
      }).catch(function () {
        sendBtn.disabled = false;
        note.textContent = c.emailErr;
      });
    });
  }

  /* ─── THE FRAGMENT — Atacama event (Nag Mapu stage) ───
     First capture ALWAYS fails (signal lost); it returns slower and
     the second capture succeeds, advancing to Trawün. Misses re-cross
     on a timer while the stage is live. ─── */
  var fragMode = null;       // 'first' | 'return' | null
  var fragAnim = null;
  var fragRespawn = null;

  function spawnFragment(mode) {
    fragMode = mode;
    frag.classList.toggle('j-return', mode === 'return');
    frag.classList.add('on');
    clearTimeout(fragRespawn);

    if (REDUCED) {
      frag.style.left = '62%';
      frag.style.top = '38%';
      frag.style.transform = 'none';
      return;
    }
    var W = window.innerWidth, H = window.innerHeight;
    var fromLeft = Math.random() < 0.5;
    var y0 = H * (0.15 + Math.random() * 0.35);
    var y1 = H * (0.25 + Math.random() * 0.4);
    var x0 = fromLeft ? -80 : W + 80;
    var x1 = fromLeft ? W + 80 : -80;
    frag.style.left = '0px';
    frag.style.top = '0px';
    var dur = mode === 'return' ? 11000 : 6500;
    var flip = fromLeft ? 1 : -1;
    fragAnim = frag.animate([
      { transform: 'translate(' + x0 + 'px,' + y0 + 'px) scaleX(' + flip + ')' },
      { transform: 'translate(' + ((x0 + x1) / 2) + 'px,' + (Math.min(y0, y1) - H * 0.08) + 'px) scaleX(' + flip + ')' },
      { transform: 'translate(' + x1 + 'px,' + y1 + 'px) scaleX(' + flip + ')' }
    ], { duration: dur, easing: 'linear' });
    fragAnim.onfinish = function () {
      frag.classList.remove('on');
      fragRespawn = setTimeout(function () {
        if (fragMode) spawnFragment(fragMode);
      }, 9000 + Math.random() * 8000);
    };
  }
  function hideFragment() {
    fragMode = null;
    clearTimeout(fragRespawn);
    if (fragAnim) { fragAnim.cancel(); fragAnim = null; }
    frag.classList.remove('on', 'j-return');
  }
  function fragmentScreenPos() {
    var r = frag.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  function shatter(x, y, gold) {
    var colors = gold
      ? ['#f0c060', '#e8e2d6', '#f0c060', '#b8934a']
      : ['#b8b4aa', '#8a867e', '#d8d4cc', '#6a665e'];
    for (var i = 0; i < 14; i++) {
      var s = el('div', null, 'j-shard');
      s.style.background = colors[i % colors.length];
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      document.body.appendChild(s);
      var ang = Math.random() * Math.PI * 2;
      var dist = 40 + Math.random() * 90;
      var anim = s.animate([
        { transform: 'translate(0,0)', opacity: 1 },
        { transform: 'translate(' + Math.cos(ang) * dist + 'px,' + (Math.sin(ang) * dist + 30) + 'px)', opacity: 0 }
      ], { duration: 700 + Math.random() * 500, easing: 'cubic-bezier(0.2,0.6,0.4,1)' });
      anim.onfinish = (function (node) { return function () { node.remove(); }; })(s);
    }
  }
  function onFragmentHit(e) {
    e.stopPropagation();
    if (!fragMode) return;
    var pos = fragmentScreenPos();
    var c = COPY[lang()];
    if (fragMode === 'first') {
      // THE FAIL — scripted, always.
      hideFragment();
      if (typeof window.triggerGlitch === 'function') window.triggerGlitch();
      shatter(pos.x, pos.y, false);
      toast(c.toastFail); /* not an error — it's designed to slip back */
      S.step = 2; saveState();
      renderCard(); renderHud();
      if (!card.classList.contains('on')) openCard();
      setTimeout(function () { if (S.stage === FRAG_STAGE && S.step === 2) spawnFragment('return'); }, 2200);
    } else if (fragMode === 'return') {
      hideFragment();
      shatter(pos.x, pos.y, true);
      toast(c.toastCatch);
      S.step = 3; saveState();
      renderCard(); renderHud();
      setTimeout(function () { advance(); }, 1400);
    }
  }

  /* ─── PROGRESSION ─── */
  function visitedHas(starId) {
    try {
      if (typeof window.getVisited === 'function') return window.getVisited().indexOf(starId) !== -1;
    } catch (e) {}
    return false;
  }
  function activateStage(n, resume) {
    hideFragment();
    S.stage = n;
    if (!resume) S.step = 0;
    // auto-credit a normal stage whose star was already visited this session
    if (n !== FRAG_STAGE && n !== LAST_STAGE && S.step === 0 && visitedHas(meta(n).star)) S.step = 1;
    saveState();
    renderHud();
    highlightTarget();
    openCard();
  }
  function advance() {
    if (S.stage >= LAST_STAGE) return;
    closeCard();
    setTimeout(function () { activateStage(S.stage + 1); }, 450);
  }

  // star-visit events drive each stage
  function onPortalOpen(starId) {
    card.classList.remove('on'); // keep the deep portal clean
    if (!S.started || S.done) return;
    var n = S.stage;
    var target = meta(n).star;
    if (starId !== target) return; // only the pointed-to star advances the walk
    if (n === FRAG_STAGE) {
      if (S.step === 0) { S.step = 1; saveState(); spawnFragment('first'); renderHud(); highlightTarget(); }
      return;
    }
    if (S.step === 0) {
      S.step = 1;
      if (n === LAST_STAGE) S.done = true;
      saveState(); renderHud(); highlightTarget();
      toast(COPY[lang()].toastLit);
    }
  }
  function onPortalClose() {
    if (!S.started) return;
    if (!S.done || S.stage === LAST_STAGE) openCard();
  }

  /* ─── HOOK THE MAIN SCRIPT (additive wraps) ─── */
  function hookPortalFns() {
    var _enter = window.enterDeepPortal;
    if (typeof _enter === 'function') {
      window.enterDeepPortal = function (starId) {
        _enter(starId);
        try { onPortalOpen(starId); } catch (e) {}
      };
    }
    var _exit = window.exitDeepPortal;
    if (typeof _exit === 'function') {
      window.exitDeepPortal = function () {
        _exit();
        try { onPortalClose(); } catch (e) {}
      };
    }
  }

  /* ─── INVITE ─── */
  function renderInvite() {
    var c = COPY[lang()];
    invite.innerHTML =
      '<button>' + c.inviteBtn + '</button>' +
      '<div class="j-sub">' + c.inviteSub + '</div>';
    invite.querySelector('button').addEventListener('click', function () {
      invite.classList.remove('on');
      S.started = true;
      saveState();
      activateStage(1);
    });
  }
  function maybeShowInvite() {
    if (S.done || S.started) return;
    renderInvite();
    invite.classList.add('on');
  }

  /* ─── LANGUAGE — re-render on <html lang> changes ─── */
  function watchLang() {
    new MutationObserver(function () {
      renderHud();
      if (invite.classList.contains('on')) { renderInvite(); invite.classList.add('on'); }
      if (card.classList.contains('on')) renderCard();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  /* ─── BOOT — wait for the loader ceremony to end ─── */
  function loaderGone() {
    var l = document.getElementById('loading');
    if (!l) return true;
    return l.style.display === 'none' || l.classList.contains('is-dismissed');
  }
  function boot() {
    buildDom();
    hookPortalFns();
    watchLang();
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      if (loaderGone() || tries > 30) {
        clearInterval(iv);
        setTimeout(function () {
          if (S.started && !S.done) {
            renderHud();
            activateStage(S.stage || 1, true);
          } else if (S.done) {
            renderHud();
          } else {
            maybeShowInvite();
          }
        }, 900);
      }
    }, 500);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
