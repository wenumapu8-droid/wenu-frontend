/** THRESHOLD-only interface adapter. Engine is pure; state never leaves localStorage. */
import questions from '../lib/kodex/archetypes/questions.json';
import {
  STORAGE_KEY, validateQuestions, initialState, restoreState, eventsInOrder,
  resolveQuestion, selectNextQuestion, topArchetypes, visualParameters,
} from '../lib/kodex/archetypes/engine.js';

const NS = 'http://www.w3.org/2000/svg';
const RAIN_GLYPHS = ['◇', '◌', '△', '↝', '✧', '⬡', '≈'];

function createGlyphRain(canvas, getFrequency) {
  const ctx = canvas?.getContext('2d', { alpha: true });
  if (!ctx) return { start() {}, stop() {}, resize() {} };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let particles = [];
  let running = false;
  let frameId = 0;
  let last = 0;
  let width = 0;
  let height = 0;

  function resize() {
    const box = canvas.getBoundingClientRect();
    width = Math.max(1, box.width);
    height = Math.max(1, box.height);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    particles = [];
    if (reduced.matches && running) drawStatic();
  }
  function makeParticle(randomY = false) {
    return {
      x: Math.random() * width,
      y: randomY ? Math.random() * height : -30,
      size: 9 + Math.random() * 13,
      speed: 22 + Math.random() * 40,
      glyph: RAIN_GLYPHS[Math.floor(Math.random() * RAIN_GLYPHS.length)],
      opacity: 0.25 + Math.random() * 0.5,
    };
  }
  function paint(stepSeconds) {
    const p = visualParameters(getFrequency());
    while (particles.length < p.density) particles.push(makeParticle(true));
    particles.length = p.density;
    ctx.clearRect(0, 0, width, height);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const particle of particles) {
      particle.y += particle.speed * p.speed * stepSeconds;
      if (particle.y > height + particle.size) Object.assign(particle, makeParticle(false));
      ctx.font = `${particle.size}px 'DejaVu Sans', sans-serif`;
      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = p.color;
      ctx.fillText(particle.glyph, particle.x, particle.y);
    }
    ctx.globalAlpha = 1;
  }
  function drawStatic() {
    particles = [];
    paint(0);
  }
  function animate(timestamp) {
    if (!running || reduced.matches || document.hidden) return;
    const elapsed = Math.min((timestamp - (last || timestamp)) / 1000, 0.06);
    if (timestamp - last > 33 || !last) { paint(elapsed); last = timestamp; }
    frameId = requestAnimationFrame(animate);
  }
  return {
    start() {
      running = true;
      resize();
      if (reduced.matches || document.hidden) drawStatic();
      else { last = 0; frameId = requestAnimationFrame(animate); }
    },
    stop() { running = false; cancelAnimationFrame(frameId); last = 0; },
    resize,
    onVisibility() { if (!running) return; cancelAnimationFrame(frameId); if (!document.hidden) { last = 0; frameId = requestAnimationFrame(animate); } },
  };
}

function drawConstellation(svg, events, questionsById) {
  svg.replaceChildren();
  if (!events.length) return;
  const points = events.map((event, i) => ({
    x: 35 + (i / Math.max(1, questionsById.size - 1)) * 530,
    y: 95 + Math.sin(i * 2.15) * 48 + (event.optionId === 'a' ? -14 : event.optionId === 'b' ? 14 : 0),
    event,
  }));
  const line = document.createElementNS(NS, 'polyline');
  line.setAttribute('points', points.map(({ x, y }) => `${x},${y}`).join(' '));
  line.setAttribute('fill', 'none'); line.setAttribute('stroke', 'var(--kodex-color)');
  line.setAttribute('stroke-opacity', '.72'); line.setAttribute('stroke-width', '1.5');
  svg.append(line);
  for (const p of points) {
    const circle = document.createElementNS(NS, 'circle');
    circle.setAttribute('cx', p.x); circle.setAttribute('cy', p.y);
    circle.setAttribute('r', p.event.optionId === null ? '3' : '5');
    circle.setAttribute('fill', p.event.optionId === null ? '#888' : 'var(--kodex-color)');
    const title = document.createElementNS(NS, 'title');
    const q = questionsById.get(p.event.questionId);
    title.textContent = `${p.event.step + 1}. ${q.prompt}: ${p.event.optionId === null ? 'Omitida' : q.options.find((o) => o.id === p.event.optionId).label}`;
    circle.append(title);
    svg.append(circle);
  }
}

export function mountArchetypeThreshold() {
  const modal = document.querySelector('[data-kdx-archetypes]');
  const trigger = document.querySelector('[data-kdx-archetype-open]');
  if (!modal || !trigger || modal.dataset.mounted === 'true') return;
  validateQuestions(questions);
  modal.dataset.mounted = 'true';
  const root = document.querySelector('[data-kx]');
  const find = (selector) => modal.querySelector(selector);
  const view = find('[data-kdx-question-view]');
  const map = find('[data-kdx-map-view]');
  const announcer = find('[data-kdx-announcement]');
  const rain = createGlyphRain(find('[data-kdx-rain]'), () => state.frequency);
  const byId = new Map(questions.map((q) => [q.id, q]));
  let state = initialState();
  let previousOverflow = '';
  let storageEnabled = true;
  let restoredFocus = trigger;
  let previouslyInert = [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    try { state = restoreState(stored ? JSON.parse(stored) : null, questions); }
    catch { state = initialState(); }
  } catch { storageEnabled = false; }

  function save() {
    if (!storageEnabled) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch { storageEnabled = false; }
  }
  function ensureActive() {
    if (eventsInOrder(state).length >= questions.length || state.active) return;
    const question = selectNextQuestion(state, questions);
    if (question) { state = { ...state, active: { questionId: question.id, startedAt: new Date().toISOString() } }; save(); }
  }
  function setSignalColor() {
    const parameters = visualParameters(state.frequency);
    modal.style.setProperty('--kodex-color', parameters.color);
    root?.style.setProperty('--kodex-color', parameters.color);
  }
  function renderMap() {
    const top = find('[data-kdx-top]');
    top.replaceChildren();
    for (const [rank, item] of topArchetypes(state, questions).entries()) {
      const el = document.createElement('div'); el.className = 'kdx-archetypes__rank';
      const name = document.createElement('b'); name.textContent = item.label;
      const meta = document.createElement('small'); meta.textContent = `${String(rank + 1).padStart(2, '0')} · ${(item.probability * 100).toFixed(1)}%`;
      el.append(name, meta); top.append(el);
    }
    const events = eventsInOrder(state);
    drawConstellation(find('[data-kdx-constellation]'), events, byId);
    const journey = find('[data-kdx-journey]'); journey.replaceChildren();
    for (const event of events) {
      const q = byId.get(event.questionId);
      const li = document.createElement('li');
      li.textContent = event.optionId === null ? `Omitida · ${q.id.toUpperCase()}` : `${q.options.find((o) => o.id === event.optionId).label} · ${q.id.toUpperCase()}`;
      journey.append(li);
    }
  }
  function render() {
    ensureActive();
    const done = eventsInOrder(state).length;
    const complete = done === questions.length;
    find('[data-kdx-progress]').textContent = `${String(done).padStart(2, '0')} / 12`;
    find('[data-kdx-progress-bar]').style.width = `${(done / questions.length) * 100}%`;
    find('[data-kdx-frequency]').textContent = `F ${state.frequency.toFixed(2)}`;
    find('[data-kdx-save-status]').textContent = storageEnabled ? 'MEMORIA SOLO EN ESTE NAVEGADOR' : 'ALMACENAMIENTO NO DISPONIBLE';
    view.hidden = complete;
    map.hidden = !complete;
    setSignalColor();
    if (complete) {
      renderMap();
      announcer.textContent = 'Tu mapa de patrones está listo.';
      return;
    }
    const q = byId.get(state.active.questionId);
    find('[data-kdx-question-prompt]').textContent = q.prompt;
    for (const option of q.options) {
      find(`[data-kdx-glyph-${option.id}]`).textContent = option.glyph;
      find(`[data-kdx-label-${option.id}]`).textContent = option.label;
      find(`[data-kdx-answer="${option.id}"]`).setAttribute('aria-label', `Elegir ${option.label}`);
    }
    announcer.textContent = `Elección ${done + 1} de 12. ${q.prompt}`;
  }
  function decide(optionId) {
    if (modal.hidden || !state.active || eventsInOrder(state).length >= questions.length) return;
    const at = new Date().toISOString();
    const durationMs = Math.max(0, Date.parse(at) - Date.parse(state.active.startedAt));
    state = resolveQuestion(state, questions, state.active.questionId, optionId, state.active.startedAt, at, durationMs);
    save(); render();
  }
  function clearMemory() {
    try { localStorage.removeItem(STORAGE_KEY); storageEnabled = true; }
    catch { storageEnabled = false; }
    state = initialState();
    // The delete action leaves storage empty. It will be written only after the next choice.
    const next = selectNextQuestion(state, questions);
    state.active = { questionId: next.id, startedAt: new Date().toISOString() };
    render();
    announcer.textContent = 'Memoria local borrada. Nuevo recorrido preparado.';
    find('[data-kdx-answer="a"]').focus();
  }
  function open() {
    if (!modal.hidden) return;
    restoredFocus = document.activeElement instanceof HTMLElement ? document.activeElement : trigger;
    previousOverflow = document.body.style.overflow;
    previouslyInert = [root?.querySelector('[data-deck]'), root?.querySelector('.kx-deckbar'), root?.querySelector('.kx-status')]
      .filter(Boolean).map((element) => ({ element, inert: element.inert }));
    previouslyInert.forEach(({ element }) => { element.inert = true; });
    document.body.style.overflow = 'hidden';
    modal.hidden = false;
    render(); rain.start();
    find('[data-kdx-archetype-close]').focus();
  }
  function close() {
    if (modal.hidden) return;
    rain.stop(); modal.hidden = true;
    previouslyInert.forEach(({ element, inert }) => { element.inert = inert; });
    document.body.style.overflow = previousOverflow;
    restoredFocus?.focus?.();
  }
  function modalKeydown(event) {
    if (modal.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); close(); return; }
    if (event.key === '1' || event.key === '2') {
      if (!map.hidden || event.ctrlKey || event.metaKey || event.altKey) return;
      event.preventDefault(); event.stopImmediatePropagation(); decide(event.key === '1' ? 'a' : 'b'); return;
    }
    if (['ArrowLeft', 'ArrowRight', 'PageDown', 'PageUp'].includes(event.key)) {
      event.preventDefault(); event.stopImmediatePropagation(); return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...modal.querySelectorAll('button:not([disabled])')].filter((el) => el.offsetParent !== null && !el.closest('[hidden]'));
    if (!focusable.length) return;
    const first = focusable[0]; const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  trigger.addEventListener('click', open);
  find('[data-kdx-archetype-close]').addEventListener('click', close);
  modal.querySelectorAll('[data-kdx-answer]').forEach((button) => button.addEventListener('click', () => decide(button.dataset.kdxAnswer)));
  find('[data-kdx-reject]').addEventListener('click', () => decide(null));
  find('[data-kdx-delete]').addEventListener('click', clearMemory);
  find('[data-kdx-restart]').addEventListener('click', clearMemory);
  window.addEventListener('keydown', modalKeydown, true);
  window.addEventListener('resize', () => { if (!modal.hidden) rain.resize(); }, { passive: true });
  document.addEventListener('visibilitychange', () => rain.onVisibility?.());
  // No telemetry, cookie, API request or fingerprinting from this module.
  setSignalColor();
}
