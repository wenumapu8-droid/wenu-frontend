# KODEX−∞ INGESTION PROTOCOL

Status: `CANONICAL / BOOTSTRAP`

## Purpose

Convert conversations, ZIP packages, images, documents, code, references and research into a traceable knowledge system without publishing private material or collapsing drafts into canon.

## Source classes

- `CONVERSATION_EXPORT`
- `USER_UPLOAD`
- `REPOSITORY_FILE`
- `GENERATED_ARTIFACT`
- `EXTERNAL_REFERENCE`
- `PRIMARY_DATASET`
- `COMMUNITY_CONTRIBUTION`
- `CULTURAL_SOURCE`

## Ingestion pipeline

```text
ACQUIRE
  ↓
HASH + IDENTIFY
  ↓
PRIVATE STAGING
  ↓
EXTRACT
  ↓
DE-DUPLICATE
  ↓
CLASSIFY
  ↓
RIGHTS + CULTURAL REVIEW
  ↓
SUMMARIZE + STRUCTURE
  ↓
HUMAN REVIEW
  ↓
CANON / REFERENCE / ARCHIVE / REJECT
```

## Required source record

```yaml
source_record:
  id: "SRC-"
  source_class: ""
  title: ""
  creator: ""
  original_location: ""
  acquired_at: ""
  checksum: ""
  language: ""
  rights_status: UNKNOWN
  privacy_status: PRIVATE
  cultural_status: STANDARD
  extracted_entities: []
  extracted_claims: []
  decisions: []
  unresolved: []
  related_files: []
  canonical_status: REFERENCE
```

## Conversation exports

Raw conversation exports must enter a private staging environment. Do not commit the raw archive to a public repository.

Extraction targets:

- canonical decisions;
- named concepts;
- visual rules;
- product requirements;
- user preferences;
- rejected directions;
- unresolved questions;
- promised artifacts;
- references and source links;
- code and file provenance.

Generated outputs:

```text
conversation-summary.md
decision-candidates.yaml
reference-index.yaml
asset-manifest.yaml
unresolved-questions.md
privacy-review.yaml
```

A summary is not automatically canon. It becomes canonical only after review and a recorded decision.

## Image and moodboard ingestion

Store:

- source or uploader;
- date discovered;
- creator when known;
- visual features;
- structural lessons;
- rights status;
- prohibited copying boundaries;
- relationship to KODEX.

Do not redistribute third-party commercial images, fonts or artwork inside public asset packs without permission.

## External project references

Record cultural adjacency and creative distance:

```yaml
influence_record:
  source: ""
  discovered_at: ""
  shared_territory: []
  distinctive_expression: []
  permitted_use: analysis_and_attributed_reference
  copied_phrases: 0
  copied_structure: false
  copied_symbol_system: false
  original_kodex_thesis: ""
  independent_sources_used: []
```

## Cultural materials

Before ingestion into a publishable layer, determine:

- community and territory;
- author or knowledge holder;
- public, restricted or authorization-required status;
- preferred attribution;
- language and translation issues;
- potential commercial restrictions;
- whether representation should be blocked.

When uncertain, mark `AUTHORIZATION_REQUIRED` and keep private.

## De-duplication

Duplicate detection uses:

- checksum;
- filename and path;
- semantic similarity;
- visual similarity;
- matching titles and timestamps;
- relationship to superseded files.

Never delete uncertain duplicates automatically. Mark relationships:

- `DUPLICATE_OF`
- `DERIVED_FROM`
- `SUPERSEDES`
- `VARIANT_OF`
- `CONFLICTS_WITH`

## Canon admission

An ingested artifact becomes `CANONICAL` only when:

- its origin is known;
- privacy and rights are cleared;
- its role is defined;
- it does not conflict silently with existing canon;
- it passes cultural review when required;
- it is referenced by a decision or approved pull request.

## Public/private separation

### Public layer

- approved code;
- public documentation;
- rights-cleared assets;
- source citations;
- reusable examples;
- contributor materials.

### Private layer

- raw ChatGPT exports;
- personal conversations;
- strategy and pricing drafts;
- unpublished research;
- rights-unclear materials;
- restricted cultural knowledge;
- personal reflections and biometric information.

## Failure rule

When provenance, privacy or rights cannot be resolved:

```yaml
canonical_status: RIGHTS_UNCLEAR
publication: BLOCKED
next_action: HUMAN_REVIEW
```
