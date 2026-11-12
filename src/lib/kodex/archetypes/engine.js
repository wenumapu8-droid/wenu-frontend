/**
 * KODEX−∞ · THRESHOLD archetype prototype.
 * Pure, deterministic inference; no browser globals, network, user identity, or storage.
 * This is an artistic pattern model, not a validated psychological instrument.
 */
export const ARCHETYPES = Object.freeze([
  { id: 'explorador', label: 'Explorador' },
  { id: 'mago', label: 'Mago' },
  { id: 'sabio', label: 'Sabio' },
  { id: 'creador', label: 'Creador' },
  { id: 'rebelde', label: 'Rebelde' },
  { id: 'amante', label: 'Amante' },
  { id: 'inocente', label: 'Inocente' },
  { id: 'heroe', label: 'Héroe' },
  { id: 'cuidador', label: 'Cuidador' },
  { id: 'gobernante', label: 'Gobernante' },
  { id: 'bufon', label: 'Bufón' },
  { id: 'huerfano', label: 'Huérfano' },
]);

export const SCHEMA_VERSION = 1;
export const STORAGE_KEY = 'kodex.arquetipos.prototype.v1';
const LIKELIHOOD_STRENGTH = 1.25;
const ARCHETYPE_IDS = new Set(ARCHETYPES.map((a) => a.id));
const bounded = (n, low, high) => Math.max(low, Math.min(high, n));

export function validateQuestions(questions) {
  if (!Array.isArray(questions) || questions.length !== 12) throw new Error('Se requieren exactamente 12 preguntas.');
  const ids = new Set();
  for (const question of questions) {
    if (!question || typeof question.id !== 'string' || !/^[a-z0-9-]+$/.test(question.id) || ids.has(question.id)) {
      throw new Error('Identificador de pregunta inválido o duplicado.');
    }
    ids.add(question.id);
    if (typeof question.prompt !== 'string' || !question.prompt.trim()) throw new Error('Cada pregunta necesita un texto.');
    if (!Array.isArray(question.options) || question.options.length !== 2 || question.options[0]?.id !== 'a' || question.options[1]?.id !== 'b') {
      throw new Error('Cada pregunta requiere dos opciones a/b.');
    }
    for (const option of question.options) {
      if (typeof option.label !== 'string' || !option.label.trim() || typeof option.glyph !== 'string' || !option.glyph.trim()) {
        throw new Error('Cada opción requiere un nombre y un glifo.');
      }
      if (!option.weights || typeof option.weights !== 'object' || Array.isArray(option.weights)) {
        throw new Error('Cada opción necesita pesos de arquetipos.');
      }
      for (const [key, weight] of Object.entries(option.weights)) {
        if (!ARCHETYPE_IDS.has(key) || typeof weight !== 'number' || !Number.isFinite(weight) || weight < -4 || weight > 4) {
          throw new Error(`Peso inválido en ${question.id}/${option.id}/${key}.`);
        }
      }
    }
  }
  return true;
}

export function uniformPrior() {
  return Object.fromEntries(ARCHETYPES.map((a) => [a.id, 1 / ARCHETYPES.length]));
}

/** Shannon entropy, measured in bits; zero probabilities are valid. */
export function shannonEntropy(distribution) {
  return Object.values(distribution).reduce((sum, p) => sum - (p > 0 ? p * Math.log2(p) : 0), 0);
}

/** P(option | archetype) from editable JSON weights through a 2-way softmax. */
export function optionLikelihood(question, archetypeId, optionId) {
  const [a, b] = question.options;
  const wa = a.weights[archetypeId] ?? 0;
  const wb = b.weights[archetypeId] ?? 0;
  const pa = 1 / (1 + Math.exp(-LIKELIHOOD_STRENGTH * (wa - wb)));
  return optionId === 'a' ? pa : optionId === 'b' ? 1 - pa : 0;
}

/** Exact Bayes update on a discrete hypothesis space of 12 archetypes. */
export function bayesianUpdate(prior, question, optionId) {
  if (optionId !== 'a' && optionId !== 'b') throw new Error('Opción inválida.');
  let evidence = 0;
  const joint = {};
  for (const archetype of ARCHETYPES) {
    joint[archetype.id] = (prior[archetype.id] ?? 0) * optionLikelihood(question, archetype.id, optionId);
    evidence += joint[archetype.id];
  }
  if (evidence <= 0) throw new Error('Evidencia de probabilidad nula.');
  return Object.fromEntries(ARCHETYPES.map((a) => [a.id, joint[a.id] / evidence]));
}

/** Expected reduction in Shannon entropy (mutual information in bits). */
export function expectedInformationGain(prior, question) {
  const before = shannonEntropy(prior);
  let expectedAfter = 0;
  for (const option of question.options) {
    const pOption = ARCHETYPES.reduce((sum, a) => sum + prior[a.id] * optionLikelihood(question, a.id, option.id), 0);
    if (pOption > 0) expectedAfter += pOption * shannonEntropy(bayesianUpdate(prior, question, option.id));
  }
  return Math.max(0, before - expectedAfter);
}

export function eventsInOrder(state) {
  return [...state.choices, ...state.rejections].sort((a, b) => a.step - b.step);
}

export function probabilityMap(state, questions) {
  const byId = new Map(questions.map((q) => [q.id, q]));
  return eventsInOrder(state).reduce((prior, event) =>
    event.optionId === null ? prior : bayesianUpdate(prior, byId.get(event.questionId), event.optionId), uniformPrior());
}

export function selectNextQuestion(state, questions) {
  const seen = new Set(eventsInOrder(state).map((e) => e.questionId));
  const prior = probabilityMap(state, questions);
  let best = null;
  let maxGain = -Infinity;
  for (const question of questions) {
    if (seen.has(question.id)) continue;
    const gain = expectedInformationGain(prior, question);
    if (gain > maxGain + 1e-12) {
      maxGain = gain;
      best = question;
    }
  }
  return best;
}

export function frequencyFor(stepCount, total = 12) {
  return Number((-100 + 100 * bounded(stepCount / total, 0, 1)).toFixed(2));
}

export function visualParameters(frequency) {
  const progress = bounded((frequency + 100) / 100, 0, 1);
  return {
    hue: Math.round(progress * 280),
    color: `hsl(${Math.round(progress * 280)} 90% 62%)`,
    density: Math.round(8 + 28 * progress),
    speed: Number((0.22 + 1.28 * progress).toFixed(2)),
  };
}

export function initialState() {
  return { schemaVersion: SCHEMA_VERSION, choices: [], rejections: [], frequency: -100, active: null };
}

/** Returns a fresh state. A rejection is recorded without changing posterior. */
export function resolveQuestion(state, questions, questionId, optionId, startedAt, at, durationMs) {
  const question = questions.find((q) => q.id === questionId);
  const seen = new Set(eventsInOrder(state).map((e) => e.questionId));
  if (!question || seen.has(questionId) || (optionId !== null && optionId !== 'a' && optionId !== 'b')) {
    throw new Error('Decisión inválida o duplicada.');
  }
  const event = {
    step: state.choices.length + state.rejections.length,
    questionId,
    optionId,
    startedAt: String(startedAt),
    at: String(at),
    durationMs: Math.round(bounded(Number(durationMs) || 0, 0, 3_600_000)),
  };
  const choices = optionId === null ? state.choices : [...state.choices, event];
  const rejections = optionId === null ? [...state.rejections, event] : state.rejections;
  return {
    schemaVersion: SCHEMA_VERSION,
    choices,
    rejections,
    frequency: frequencyFor(choices.length + rejections.length, questions.length),
    active: null,
  };
}

/** Treat localStorage as untrusted: replay only valid known questions/events. */
export function restoreState(raw, questions) {
  const empty = initialState();
  if (!raw || raw.schemaVersion !== SCHEMA_VERSION || !Array.isArray(raw.choices) || !Array.isArray(raw.rejections)) return empty;
  const events = [...raw.choices, ...raw.rejections].sort((a, b) => (a?.step ?? Infinity) - (b?.step ?? Infinity));
  let state = empty;
  for (const [index, event] of events.entries()) {
    if (!event || event.step !== index || typeof event.questionId !== 'string' ||
        (event.optionId !== null && event.optionId !== 'a' && event.optionId !== 'b') ||
        typeof event.startedAt !== 'string' || typeof event.at !== 'string' ||
        !Number.isFinite(Date.parse(event.startedAt)) || !Number.isFinite(Date.parse(event.at)) ||
        !Number.isFinite(event.durationMs) || event.durationMs < 0 || event.durationMs > 3_600_000) {
      return empty;
    }
    try { state = resolveQuestion(state, questions, event.questionId, event.optionId, event.startedAt, event.at, event.durationMs); }
    catch { return empty; }
  }
  if (raw.active && typeof raw.active.questionId === 'string' && typeof raw.active.startedAt === 'string' &&
      Number.isFinite(Date.parse(raw.active.startedAt)) &&
      selectNextQuestion(state, questions)?.id === raw.active.questionId) {
    state = { ...state, active: { questionId: raw.active.questionId, startedAt: raw.active.startedAt } };
  }
  return state;
}

export function topArchetypes(state, questions, limit = 3) {
  const probabilities = probabilityMap(state, questions);
  return ARCHETYPES.map((a) => ({ ...a, probability: probabilities[a.id] }))
    .sort((a, b) => b.probability - a.probability || ARCHETYPES.findIndex((x) => x.id === a.id) - ARCHETYPES.findIndex((x) => x.id === b.id))
    .slice(0, limit);
}
