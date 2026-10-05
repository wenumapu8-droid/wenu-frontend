export const MOTION_TYPES = Object.freeze([
  'VOID',
  'SIGNAL',
  'FOCUS',
  'LOCK',
  'GLYPH',
  'FIELD',
  'NODE',
  'ORBIT',
  'MEMBRANE',
  'SCAN',
  'ASSEMBLY',
  'FRACTURE',
  'MUTATION',
  'MEMORY_WRITE',
  'DISSOLUTION',
  'OPEN',
  'RETURN',
]);

export const MOTION_STATES = Object.freeze([
  'DORMANT',
  'AWARE',
  'OPEN',
  'LOCKED',
  'OBSERVING',
  'LATENT',
]);

const isFiniteNumber = (value) => Number.isFinite(value);

export function validateMotionRecipe(recipe) {
  const errors = [];

  if (!recipe || typeof recipe !== 'object') {
    return { valid: false, errors: ['Recipe must be an object.'] };
  }

  if (!recipe.id || typeof recipe.id !== 'string') {
    errors.push('Recipe id is required.');
  }

  if (!isFiniteNumber(recipe.duration) || recipe.duration <= 0) {
    errors.push('Recipe duration must be a positive finite number.');
  }

  if (!MOTION_STATES.includes(recipe.stateIn)) {
    errors.push(`Unknown recipe stateIn: ${recipe.stateIn}`);
  }

  if (!MOTION_STATES.includes(recipe.stateOut)) {
    errors.push(`Unknown recipe stateOut: ${recipe.stateOut}`);
  }

  if (!Array.isArray(recipe.beats) || recipe.beats.length === 0) {
    errors.push('Recipe must contain at least one beat.');
    return { valid: errors.length === 0, errors };
  }

  const ids = new Set();

  recipe.beats.forEach((beat, index) => {
    const prefix = `Beat ${index + 1}`;

    if (!beat || typeof beat !== 'object') {
      errors.push(`${prefix} must be an object.`);
      return;
    }

    if (!beat.id || typeof beat.id !== 'string') {
      errors.push(`${prefix} id is required.`);
    } else if (ids.has(beat.id)) {
      errors.push(`Duplicate beat id: ${beat.id}`);
    } else {
      ids.add(beat.id);
    }

    if (!MOTION_TYPES.includes(beat.type)) {
      errors.push(`${prefix} has unknown type: ${beat.type}`);
    }

    if (!isFiniteNumber(beat.start) || beat.start < 0) {
      errors.push(`${prefix} start must be >= 0.`);
    }

    if (!isFiniteNumber(beat.end) || beat.end <= beat.start) {
      errors.push(`${prefix} end must be greater than start.`);
    }

    if (isFiniteNumber(recipe.duration) && isFiniteNumber(beat.end) && beat.end > recipe.duration) {
      errors.push(`${prefix} exceeds recipe duration.`);
    }

    if (!MOTION_STATES.includes(beat.stateIn)) {
      errors.push(`${prefix} has unknown stateIn: ${beat.stateIn}`);
    }

    if (!MOTION_STATES.includes(beat.stateOut)) {
      errors.push(`${prefix} has unknown stateOut: ${beat.stateOut}`);
    }

    if (!beat.renderer || typeof beat.renderer !== 'string') {
      errors.push(`${prefix} renderer is required.`);
    }

    if (!beat.fallback || typeof beat.fallback !== 'string') {
      errors.push(`${prefix} fallback is required.`);
    }
  });

  return { valid: errors.length === 0, errors };
}

export function beatAtTime(recipe, time) {
  if (!recipe?.beats?.length) return null;
  const t = Math.min(Math.max(0, Number(time) || 0), recipe.duration);
  return recipe.beats.find((beat, index) => {
    const isLast = index === recipe.beats.length - 1;
    return t >= beat.start && (t < beat.end || (isLast && t <= beat.end));
  }) ?? recipe.beats[recipe.beats.length - 1];
}

export function beatProgress(beat, time) {
  if (!beat) return 0;
  const span = beat.end - beat.start;
  if (span <= 0) return 0;
  return Math.min(1, Math.max(0, (time - beat.start) / span));
}
