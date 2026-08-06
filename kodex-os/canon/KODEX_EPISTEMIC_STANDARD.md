# KODEX−∞ EPISTEMIC STANDARD

Status: `CANONICAL / BOOTSTRAP`

## Purpose

KODEX must be capable of holding empirical data, testimony, cultural memory, interpretation, speculative futures and mythopoetic material without collapsing them into one undifferentiated truth claim.

## Claim classes

| Class | Meaning | Canonical display |
|---|---|---|
| `OBSERVED` | Directly measured or documented | factual layer with source |
| `DERIVED` | Calculated from observed fields | formula and source fields |
| `ESTIMATED` | Model or statistical estimate | uncertainty and method |
| `PROXY` | Indirect indicator | limitations always visible |
| `INTERPRETATION` | Editorial or analytical reading | attributed to KODEX or author |
| `TESTIMONY` | Attributed account | speaker, context and date |
| `SPECULATION` | Possible scenario or hypothesis | visibly marked as speculative |
| `MYTHOPOETIC` | Symbolic or cosmological expression | preserved as symbolic discourse |
| `SYNTHETIC` | Generated for test or simulation | never presented as observed |
| `UNKNOWN` | Unresolved or unsupported | visible absence, never silently filled |

## Evidence object

Every factual or quantitative element must be able to produce an evidence record:

```yaml
evidence:
  claim_id: ""
  claim_class: OBSERVED
  statement: ""
  source_title: ""
  source_author: ""
  source_url: ""
  source_date: ""
  accessed_at: ""
  scope:
    geography: ""
    start: ""
    end: ""
    population: ""
  method: ""
  unit: ""
  denominator: ""
  uncertainty: ""
  contradictions: []
  limitations: []
  rights_status: ""
```

## Metric admission

A metric is blocked unless it provides:

- definition;
- unit;
- denominator when applicable;
- time scope;
- geographic or population scope;
- source fields;
- formula for derived values;
- uncertainty or limitations;
- intended visual channel;
- rationale for that channel.

## Prohibited pseudo-metrics

Unless derived from real, declared inputs, canonical interfaces must not show values such as:

```text
CONSCIOUSNESS 700
COSMIC COHERENCE 94%
ARCHIVE ENERGY 87.3%
RETURN SIGNAL 8.42 Hz
EMOTIONAL FREQUENCY 540
```

The Hawkins scale and similar systems may be stored as attributed spiritual taxonomies or historical references. Their numbers must not be presented as validated physical frequencies or objective measurements of a person.

## Qualitative concepts

Concepts such as importance, resonance, sacredness, memory, influence, identity and transformation do not automatically receive numeric scores.

Use one of:

1. qualitative states;
2. separate observable indicators;
3. a declared proxy with limitations;
4. an unresolved state.

Example:

```yaml
concept: archival_visibility
claim_class: PROXY
observable: independent_catalogues_containing_record
value: 7
limitations:
  - measures documentary visibility
  - does not measure cultural importance
  - does not establish truth
```

## Source hierarchy

Prefer sources in this order when the question permits:

1. primary records, datasets, official documentation and direct testimony;
2. peer-reviewed research and authoritative institutional archives;
3. high-quality secondary analysis;
4. attributed artistic, philosophical or spiritual works;
5. community discussion and informal commentary;
6. synthetic examples.

Lower-ranked sources are not automatically invalid. Their status must be visible.

## Contradiction protocol

When sources disagree:

- preserve both claims;
- record source quality and scope;
- do not average incompatible claims;
- expose the contradiction as information;
- allow the visual system to represent disagreement;
- mark unresolved conclusions as `UNKNOWN` or `CONTESTED`.

## Cultural and mythopoetic sources

A symbolic work may be analyzed through:

- themes;
- structure;
- language;
- relations to other works;
- historical context;
- attributed propositions;
- influence and reception.

Do not convert its cosmological claims into scientific facts. Do not reduce it to error merely because it is symbolic.

## Visual truthfulness

- Area must correspond to area-based quantities.
- Position and length should be preferred for precise comparison.
- Perspective distortion cannot imply false magnitude.
- Animation cannot manufacture a trend.
- Particle density cannot imply a count unless particles encode units.
- A map cannot suggest geography without coordinates or declared abstraction.
- A waveform cannot imply measured sound, pulse or brain activity without a real signal.

## Provenance interaction

Every canonical visualization must provide at least one route to:

- inspect sources;
- inspect definitions;
- reveal uncertainty;
- understand transformations;
- distinguish generated atmosphere from data.

## Failure behavior

When evidence is unavailable:

```yaml
status: UNKNOWN
reason: insufficient_evidence
visual_behavior: preserve_empty_or_unresolved_state
next_action: identify_primary_source_or_human_review
```

Absence is a valid informational state. It must not be filled for aesthetic balance.
