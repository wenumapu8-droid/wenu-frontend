import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ARCHETYPES, validateQuestions, uniformPrior, shannonEntropy, optionLikelihood,
  bayesianUpdate, expectedInformationGain, selectNextQuestion,
  resolveQuestion, probabilityMap, frequencyFor, visualParameters,
  initialState, restoreState, eventsInOrder, topArchetypes,
} from '../src/lib/kodex/archetypes/engine.js';
const questions = JSON.parse(readFileSync(new URL('../src/lib/kodex/archetypes/questions.json', import.meta.url), 'utf8'));
const approx = (x, y, eps = 1e-10) => assert.ok(Math.abs(x - y) < eps, `${x} != ${y}`);
const at = '2026-11-11T20:00:00.000Z';

test('12 well-defined pairs, 12 unique archetypes, all with positive evidence', () => {
  assert.equal(validateQuestions(questions), true);
  assert.equal(ARCHETYPES.length, 12);
  for (const a of ARCHETYPES) assert.ok(questions.some((q) => q.options.some((opt) => (opt.weights[a.id] ?? 0) > 0)), a.id);
  assert.throws(() => validateQuestions([...questions.slice(1), questions[1]]));
});

test('posterior is normalized, posterior shifts toward matching glyph', () => {
  const prior = uniformPrior();
  approx(shannonEntropy(prior), Math.log2(12));
  const q = questions[0];
  for (const a of ARCHETYPES) approx(optionLikelihood(q, a.id, 'a') + optionLikelihood(q, a.id, 'b'), 1);
  const after = bayesianUpdate(prior, q, 'a');
  approx(Object.values(after).reduce((x, y) => x + y, 0), 1);
  assert.ok(after.mago > prior.mago);
  assert.ok(after.gobernante < prior.gobernante);
  assert.ok(shannonEntropy(after) < shannonEntropy(prior));
});

test('selector maximizes actual expected Shannon information gain', () => {
  const prior = uniformPrior();
  const expected = Math.max(...questions.map((q) => expectedInformationGain(prior, q)));
  const selected = selectNextQuestion(initialState(), questions);
  approx(expectedInformationGain(prior, selected), expected);
  assert.ok(expected > 0);
});

test('12 unique interactions terminate at F=0, record timing and rejections', () => {
  let state = initialState();
  assert.equal(state.frequency, -100);
  for (let i = 0; i < 12; i++) {
    const question = selectNextQuestion(state, questions);
    assert.ok(question);
    state = resolveQuestion(state, questions, question.id, i === 2 ? null : i % 2 ? 'b' : 'a', at, at, 1200 + i);
    approx(state.frequency, frequencyFor(i + 1));
  }
  assert.equal(selectNextQuestion(state, questions), null);
  assert.equal(state.frequency, 0);
  assert.equal(state.rejections.length, 1);
  assert.equal(state.rejections[0].durationMs, 1202);
  assert.equal(state.choices.length, 11);
  assert.deepEqual(eventsInOrder(state).map((e) => e.step), Array.from({ length: 12 }, (_, i) => i));
  approx(Object.values(probabilityMap(state, questions)).reduce((x, y) => x + y, 0), 1);
  assert.equal(topArchetypes(state, questions).length, 3);
  assert.deepEqual(restoreState(JSON.parse(JSON.stringify(state)), questions), state);
});

test('rejected question contributes no Bayesian evidence', () => {
  const q = selectNextQuestion(initialState(), questions);
  const state = resolveQuestion(initialState(), questions, q.id, null, at, at, 500);
  assert.deepEqual(probabilityMap(state, questions), uniformPrior());
  assert.ok(!selectNextQuestion(state, questions) || selectNextQuestion(state, questions).id !== q.id);
});

test('storage replay ignores corrupted versions, invalid IDs and duplicate decisions', () => {
  const q = questions[0];
  let state = resolveQuestion(initialState(), questions, q.id, 'a', at, at, 50);
  assert.deepEqual(restoreState({ ...state, schemaVersion: 700 }, questions), initialState());
  assert.deepEqual(restoreState({ ...state, choices: [{ ...state.choices[0], questionId: 'bogus' }] }, questions), initialState());
  assert.deepEqual(restoreState({ ...state, choices: [...state.choices, { ...state.choices[0], step: 1 }] }, questions), initialState());
  assert.throws(() => resolveQuestion(state, questions, q.id, 'a', at, at, 50));
});

test('visual parameters stay bounded and traverse red to violet', () => {
  assert.equal(visualParameters(-100).hue, 0);
  assert.equal(visualParameters(0).hue, 280);
  assert.ok(visualParameters(0).density > visualParameters(-100).density);
  assert.ok(visualParameters(0).speed > visualParameters(-100).speed);
  assert.equal(visualParameters(-200).hue, 0);
  assert.equal(visualParameters(100).hue, 280);
});
