# Dataset changelog

Semantic evolution of the **interaction_pairs** exports, Hugging Face bundle,
diagnostics, and evaluation artefacts. Bump `src/datasetVersion.ts` when
releasing a new dataset version.

## v2.1.0

### Added for v2.1.0

- Canonical row-level provenance fields in exports:
  - `source_refs` (deduplicated source IDs)
  - `source_fingerprint` (deterministic hash over `source_refs`)
- Canonical source registry export at `src/exports/source_registry.json` with
  alias mapping and citation metadata where available
- PostgreSQL migration scaffold under `sql/migrations/` for downstream database
  consumers:
  - `001_core.sql` adds typed enums, canonical pair normalization, updated-at
    automation, export-version referential integrity, and provenance checks
  - `002_eval.sql` adds eval tables, typed status handling, and indexes for
    common read paths
  - `003_views.sql` adds the standard leaderboard view, a materialized
    leaderboard view, refresh helper, and readonly grants
  - `004_apply_notes.sql` adds safe refresh helpers and an eval finalization
    helper for production-style rollout
  - `005_import_upsert.sql` adds manifest and interaction upsert helpers that
    accept any pair order and store canonical ordering
- Static migration verifier at `src/scripts/verifyPgMigrations.ts` with the npm
  script `npm run verify:pg:migrations`
- Migration usage notes in `sql/README.md`, including the order to apply the
  files and the local verification command

### Changed for v2.1.0

- Dataset validation now enforces strict placeholder-source semantics:
  - `source-gap` is only valid on `origin = "unknown"` and
    `interaction_code = "UNK"` rows
  - `n/a` is only valid on `origin = "self"` and
    `interaction_code = "SELF"` rows
- `DATASET_VERSION` advanced to `v2.1.0`
- Repository README updated to point to the new migration verifier and SQL
  migration guide

## v2.0.0

### Added

- `mechanism_category` enum labels on each interaction row
- Provenance-aware `origin` field (`explicit` / `fallback` / `unknown` / `self`)
- Hugging Face–style bundle under `src/hf_dataset/` (JSONL splits +
  `dataset_infos.json`)
- Diagnostics summaries and distribution exports under `src/diagnostics/`
- Pre-cut JSONL slices under `src/slices/` (mechanism, risk, origin)
- Evaluation harness fixtures, adapters, and oracle baseline outputs under
  `src/evals/`
- Canonical `dataset_version` + `schema_version` on export manifest,
  diagnostics summary, and HF metadata (`src/datasetVersion.ts`)
- Published JSON Schema for core row shape: `schemas/interaction_pair.schema.json`
- `npm run validate:schema` for third-party validation without TypeScript

### Changed

- `resolveInteraction()` exposes explicit provenance alongside evidence and
  `pair_key` (consumed by the exporter; rule definitions unchanged in this
  release track)
- Exporter writes `dataset_version`, `generated_at`, and `schema_version` into
  `exports/manifest.json`, `diagnostics/summary.json`, and
  `hf_dataset/dataset_infos.json`, and syncs the **Export bundle** line in
  `hf_dataset/README.md`

### Guidance for future entries

Record any change that affects downstream ML behaviour, including:

- Rule logic updates in `src/data/drugData.ts`
- `mechanism_category` taxonomy or inference changes
- `origin` classification behaviour
- New, removed, or retyped columns in `interaction_pairs` exports
- `SCHEMA_VERSION` or `DATASET_VERSION` bumps in `src/datasetVersion.ts`
